import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../redux/store';
import { useIdleTimer, EventsType } from 'react-idle-timer';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  selectBuyStatus,
  selectCartProducts,
  selectCartTotalSum,
  selectFilter,
  selectNotify,
} from '../redux/selectors/selectors';
import { addToCart, clearCart } from '../redux/features/cartSlice';
import { clearFilter } from '../redux/features/filterSlice';
import { io } from 'socket.io-client';
import {
  setNavigate,
  storeApi,
  useCancelBuyProductsMutation,
  useGetMerchantDataQuery,
  useLazyGetSingleProductQuery,
} from '../api/storeApi';
import { NoProduct } from '../components/NoProduct';
import { TerminalStatusBadge } from '../components/TerminalStatusBadge';
import { IdleWindow } from '../components/IdleWindow';
import { NotifyWindow } from '../components/NotifyWindow';
import { AddProductConfirm } from '../components/AddProductConfirm';
import { SearchResultsPopup } from '../components/SearchResultsPopup';
import { Footer } from '../components/Footer';
import {
  calculateDaysLeft,
  calculateDiscount,
  calculateNewPrice,
} from '../helper/salesDiscountCounter';
import { setTerminalState } from '../redux/features/terminalSlice';
import { setMerchantsData } from '../redux/features/merchantsSlice';
import { setMaintenanceMode } from '../redux/features/maintenanceSlice';
import { updateFiscal } from '../redux/features/recieptSlice';
import { clearBuyStatus } from '../redux/features/buyStatus';
import { setShowAddProductsConfirm } from '../redux/features/showAddConfirmSlice';
import {
  setIdleOpenChecking,
  setIsIdleOpen,
  setIsNotifyOpen,
  setNoProdError,
} from '../redux/features/notifySlice';
import { BuyError } from '../components/BuyError';
import { PaymentCancelled } from '../components/PaymentCancelled';
import { CartProduct, Product } from '../types';

const auth_id = 998877;

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:6006/api';

// Scanning this barcode opens the config screen (still password-gated by SetupAuthGate).
// 14 digits — deliberately doesn't collide with real product barcodes (EAN-13 = 13 digits,
// UPC-A = 12); a barcode scanner is just a keyboard-wedge, so there's no length limit on
// its side beyond what the symbology on the label encodes.
const CONFIG_BARCODE = import.meta.env.VITE_CONFIG_BARCODE ?? '';

const IDLE_EVENTS: EventsType[] = [
  'mousemove', 'keydown', 'keypress', 'wheel', 'DOMMouseScroll',
  'mousewheel', 'mousedown', 'touchstart', 'touchmove',
  'MSPointerDown', 'MSPointerMove', 'visibilitychange',
] as EventsType[];

// Empty VITE_SOCKET_URL → connect to current page's origin (works via nginx proxy from any IP).
// Non-empty → use the explicit URL (dev: http://localhost:6006).
export const socket = io(import.meta.env.VITE_SOCKET_URL || undefined, {
  reconnectionDelayMax: 5000,
  auth: { auth_id },
});

socket.on('connect', () => {
  socket.emit('check-status');
});

socket.on('product-updated', () => {
  store.dispatch(storeApi.util.invalidateTags(['Products']));
});

socket.on('store-sale-updated', () => {
  store.dispatch(storeApi.util.invalidateTags(['StoreSale']));
});

socket.on('terminal-status', (data: { status: string }) => {
  store.dispatch(setTerminalState(data.status));
});

socket.on('receipt-ready', (data: Record<string, unknown>) => {
  store.dispatch(updateFiscal(data));
});

socket.on('maintenance-mode', (data: { enabled: boolean }) => {
  store.dispatch(setMaintenanceMode(data.enabled));
});

export const Root = () => {
  const [pageHeading, setPageHeading] = useState('Каталог продуктів');
  const [idleEvent, setIdleEvent] = useState<EventsType[]>(IDLE_EVENTS);
  const [merchant, setMerchant] = useState<string | null>(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const cartProducts = useSelector(selectCartProducts);
  const currentFilter = useSelector(selectFilter);
  const buyStatus = useSelector(selectBuyStatus);
  const totalPrice = useSelector(selectCartTotalSum);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { isNotifyOpen, isIdleOpen, idleOpenChecking } = useSelector(selectNotify);

  // Scenario 1: cart has items — show "Ви ще тут?" after 30s, then idle at 60s
  // Scenario 2: catalog mode (empty cart) — go idle after 60s directly, no prompt
  const IDLE_TIMEOUT = 60000;
  const promptBeforeIdle = cartProducts.length > 0 ? 30000 : 0;

  const barcodeRef = useRef('');

  const [triggerGetSingleProduct] = useLazyGetSingleProductQuery();

  const [cancelFunction] = useCancelBuyProductsMutation();
  const merchantData = useGetMerchantDataQuery();

  const { getRemainingTime, reset, pause, resume } = useIdleTimer({
    timeout: IDLE_TIMEOUT,
    promptBeforeIdle,
    events: idleEvent,
    onPrompt: () => {
      // Only show notify when cart has items (scenario 1)
      if (cartProducts.length > 0) dispatch(setIsNotifyOpen(true));
    },
    onIdle: () => {
      dispatch(clearCart());
      dispatch(clearBuyStatus());
      dispatch(setIsNotifyOpen(false));
      dispatch(setIsIdleOpen(true));
      navigate('/products');
      pause();
    },
    onActive: () => {
      const wasIdle = store.getState().notify.isIdleOpen;
      dispatch(setIsIdleOpen(false));
      dispatch(setIsNotifyOpen(false));
      resume();
      if (wasIdle) navigate('/products');
    },
    debounce: 500,
  });

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  // On first mount: check that all required config exists in DB.
  // If anything is missing — redirect to setup screen before the kiosk starts.
  useEffect(() => {
    fetch(`${API}/setup/ready`)
      .then((r) => r.json())
      .then(({ ready }: { ready: boolean }) => {
        if (!ready) navigate('/setup');
      })
      .catch(() => {
        // If the check itself fails (server down etc.) — let kiosk proceed,
        // it will show its own connection errors as usual.
      });
  }, []);

  // When screen becomes active (idle closed or app mounted) — check terminal immediately,
  // then keep polling every 30s. Stops polling while screensaver is showing.
  useEffect(() => {
    if (isIdleOpen) return;
    socket.emit('check-status');
    const interval = setInterval(() => socket.emit('check-status'), 30_000);
    return () => clearInterval(interval);
  }, [isIdleOpen]);

  useEffect(() => {
    if (merchantData.isSuccess) {
      dispatch(setMerchantsData(merchantData.data));
    }
  }, [merchantData]);

  useEffect(() => {
    if (location.pathname === '/cart') {
      setPageHeading('Корзина');
    } else if (currentFilter.category === 0) {
      setPageHeading('Каталог продуктів');
    } else {
      setPageHeading(currentFilter.categoryName);
    }
  }, [currentFilter.category, location]);

  useEffect(() => {
    if (
      Number(totalPrice) === 0 ||
      buyStatus.status === 'fetching' ||
      buyStatus.status === 'loading' ||
      buyStatus.status === 'cancelled'
    ) {
      setButtonDisabled(true);
    } else {
      setButtonDisabled(false);
    }
  }, [buyStatus, totalPrice]);

  useEffect(() => {
    // Proactively notify backend whenever idle state changes
    socket.emit('idle-status', { isIdleOpen });

    const handleScreenStatus = () => {
      socket.emit('idle-status', { isIdleOpen });
      if (!isIdleOpen) dispatch(setIdleOpenChecking(true));
    };

    socket.on('screen-status', handleScreenStatus);

    if (idleOpenChecking && isIdleOpen) {
      socket.emit('idle-status', { isIdleOpen });
      dispatch(setIdleOpenChecking(false));
    }

    return () => {
      socket.off('screen-status', handleScreenStatus);
    };
  }, [isIdleOpen]);

  useEffect(() => {
    if (!merchantData.data) return;
    const { isSingleMerchant, useVATbyDefault } = merchantData.data;
    if (!isSingleMerchant && !useVATbyDefault) setMerchant('both');
    else if (isSingleMerchant && !useVATbyDefault) setMerchant('nonVAT');
    else if (isSingleMerchant && useVATbyDefault) setMerchant('VAT');
  }, [merchantData.data]);

  const barCodeHandler = useCallback(
    async (code: string) => {
      console.log(`[SCAN] barCodeHandler called with code=${JSON.stringify(code)} (length=${code.length})`);

      if (CONFIG_BARCODE && code === CONFIG_BARCODE) {
        console.log('[SCAN] Matches CONFIG_BARCODE — opening /setup');
        if (store.getState().notify.isIdleOpen) handleIdleClose();
        navigate('/setup');
        return;
      }

      if (store.getState().notify.isIdleOpen) handleIdleClose();

      const latestIsIdleOpen = store.getState().notify.isIdleOpen;
      const latestIsNotify = store.getState().notify.isNotifyOpen;
      if (latestIsNotify) dispatch(setIsNotifyOpen(false));
      if (latestIsIdleOpen) dispatch(setIsIdleOpen(false));

      document.getElementById('barcode-dummy')?.focus();
      setIdleEvent(IDLE_EVENTS);

      console.log(`[SCAN] Requesting product for barcode=${JSON.stringify(code)}`);
      try {
        const result = await triggerGetSingleProduct({ barcode: code }).unwrap();
        const product = result.product;
        console.log(
          `[SCAN] Response for barcode=${JSON.stringify(code)}: id=${product?.id} name=${product?.product_name} barcode=${product?.barcode}`
        );
        if (!product) return;

        const productCanBeAdded = checkIfScannedProductToAdd(product);
        if (!productCanBeAdded) {
          dispatch(setShowAddProductsConfirm({ show: true, product, isSuccess: false, message: 'закінчились' }));
          setTimeout(() => dispatch(setShowAddProductsConfirm({ show: false, product: null, isSuccess: false, message: '' })), 1000);
          return;
        }

        console.log(`[SCAN] Adding to cart: id=${product.id} name=${product.product_name} barcode=${product.barcode}`);
        dispatch(setShowAddProductsConfirm({ show: true, product, isSuccess: true, message: 'додано' }));
        addScannedProductToCart(product);
        setTimeout(() => dispatch(setShowAddProductsConfirm({ show: false, product: null, isSuccess: false, message: '' })), 1000);
      } catch (err) {
        console.log(`[SCAN] No product found for barcode=${JSON.stringify(code)}`, err);
        dispatch(setNoProdError(true));
        setTimeout(() => dispatch(setNoProdError(false)), 2000);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cartProducts, merchant, dispatch, navigate, triggerGetSingleProduct]
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      console.log(
        `[SCAN] keyEvent type=${event.type} key=${JSON.stringify(event.key)} bufferBeforeThisKey=${JSON.stringify(barcodeRef.current)}`
      );
      if (event.key === 'Enter') {
        const code = barcodeRef.current;
        barcodeRef.current = '';
        console.log(`[SCAN] Enter pressed — dispatching barCodeHandler with buffer=${JSON.stringify(code)}`);
        barCodeHandler(code);
        return;
      }
      if (event.type === 'keypress' || event.type === 'keydown') {
        barcodeRef.current += event.key;
      }
    },
    [barCodeHandler]
  );

  useEffect(() => {
    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, [handleKeyPress]);

  const addScannedProductToCart = (scannedProduct: Product) => {
    let discount = 0;
    let priceDecrement: number | string = 0;
    let newPrice: number | string | null = null;
    let hasLowerPrice = false;
    const regularPrice = parseFloat(String(scannedProduct.product_price)).toFixed(2);

    if (scannedProduct.sale_id === 1 || scannedProduct.sale_id === 2) {
      const daysLeft = calculateDaysLeft(scannedProduct);
      if (daysLeft <= 3) discount = calculateDiscount(scannedProduct, daysLeft);
    } else if ([3, 4, 6].includes(scannedProduct.sale_id ?? -1)) {
      discount = calculateDiscount(scannedProduct);
    }

    if (discount > 0) {
      const calculatedNewPrice = calculateNewPrice(scannedProduct, discount);
      priceDecrement = (Number(regularPrice) - Number(calculatedNewPrice)).toFixed(2);
      newPrice = calculatedNewPrice;
      hasLowerPrice = true;
    }

    const merchantData = store.getState().merchant;

    dispatch(
      addToCart({
        product: {
          ...scannedProduct,
          inCartQuantity: 1,
          priceDecrement,
          priceAfterDiscount: newPrice,
          hasLowerPrice,
          merchant,
          discountValue: discount,
        } as CartProduct,
        taxData: {
          useVATbyDefault: merchantData.useVATbyDefault,
          isSingleMerchant: merchantData.isSingleMerchant,
        },
      })
    );
  };

  const checkIfScannedProductToAdd = (scannedProduct: Product): boolean => {
    if (cartProducts.length === 0) return true;
    const inCartProduct = cartProducts.find((p) => p.barcode === scannedProduct.barcode);
    if (!inCartProduct) return true;
    return Number(inCartProduct.inCartQuantity) < Number(scannedProduct.product_left);
  };

  const handleIdleClose = () => {
    reset();
    dispatch(setIsIdleOpen(false));
    setIdleEvent(IDLE_EVENTS);
    dispatch(clearBuyStatus());
    dispatch(clearFilter());
    navigate('/products');
  };

  const handleNewUser = () => {
    reset();
    dispatch(clearCart());
    dispatch(clearFilter());
    dispatch(setIsNotifyOpen(false));
    cancelFunction(undefined);
    navigate('/products');
    setIdleEvent(IDLE_EVENTS);
  };

  const handlePreviousUser = () => {
    reset();
    dispatch(setIsNotifyOpen(false));
    setIdleEvent(IDLE_EVENTS);
  };

  const handeNotifyClose = () => {
    reset();
    dispatch(setIsNotifyOpen(false));
    setIdleEvent(IDLE_EVENTS);
  };

  const clearCartHandler = () => dispatch(clearCart());

  const handleTimerEnd = () => {
    dispatch(setIsNotifyOpen(false));
    dispatch(clearCart());
    dispatch(clearFilter());
    cancelFunction(undefined);
    dispatch(setIsIdleOpen(true));
  };

  return (
    <div className="clicker">
      <header>
        <div className="header-wrapper">
          <Link to={'/'} className={`logo ${isIdleOpen ? 'centered' : ''}`}>
            <span className="highlight-logo">NEXT</span>RETAIL
          </Link>
          {!isIdleOpen && <h1 className="page-heading">{pageHeading}</h1>}
          {!isIdleOpen && (
            <div className="header-actions">
              {!isNotifyOpen && location.pathname === '/cart' && (
                <Link
                  to="#"
                  onClick={clearCartHandler}
                  className={`footer-cart-link on-header-cart-link footer-cancel-link ${buttonDisabled ? 'link-disabled' : ''}`}
                >
                  Скасувати
                </Link>
              )}
              <TerminalStatusBadge />
            </div>
          )}
        </div>
      </header>
      <div className="container">
        <input
          id="barcode-dummy"
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
          autoFocus
        />
        <NoProduct />
        <AddProductConfirm />
        <SearchResultsPopup />
        <IdleWindow onClose={handleIdleClose} />
        <NotifyWindow
          isOpen={isNotifyOpen}
          onClose={handeNotifyClose}
          onTimerEnd={handleTimerEnd}
          onNewUser={handleNewUser}
          onPreviousUser={handlePreviousUser}
          getRemainingTime={getRemainingTime}
          promptBeforeIdle={promptBeforeIdle}
          timeout={IDLE_TIMEOUT}
        />
        {buyStatus.status === 'error' && <BuyError />}
        {buyStatus.status === 'cancelled' && <PaymentCancelled />}
        <Outlet />
      </div>
      <Footer timerReset={reset} timerPause={pause} />
    </div>
  );
};
