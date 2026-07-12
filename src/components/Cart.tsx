import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectBuyStatus, selectCart, selectCartProducts, selectCartTotalSum } from '../redux/selectors/selectors';
import { Link, useNavigate } from 'react-router-dom';
import { useCancelBuyProductsMutation } from '../api/storeApi';
import { RiseLoader } from 'react-spinners';
import { CartProductItem } from './CartProductItem';
import ScrollbarsLib from 'react-custom-scrollbars-2';
const Scrollbars = (ScrollbarsLib as any).default ?? ScrollbarsLib;
import { setBuyStatus } from '../redux/features/buyStatus';
import { socket } from '../routes/root';
import { CartTimer } from './CartTimer';

// Мінімальний час показу бекдропу скасування — щоб не "блимав", навіть якщо
// термінал (напр. PrivatBank, без GetStatus-polling) підтверджує скасування миттєво,
// поки фізичний термінал ще кілька секунд доопрацьовує операцію.
const MIN_CANCEL_OVERLAY_MS = 1500;

export const Cart = () => {
  const cart = useSelector(selectCart);
  const [cancelFunction] = useCancelBuyProductsMutation();
  const buyStatus = useSelector(selectBuyStatus);
  const cartProducts = useSelector(selectCartProducts);
  const totalSum = useSelector(selectCartTotalSum);
  const [showPaymentWaiting, setShowPaymentWaiting] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [currentPaymentCount, setCurrentPaymentCount] = useState(1);
  const cancelStartedAtRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    socket.once('secondPayment', () => setCurrentPaymentCount(2));
    return () => {
      socket.off('secondPayment');
      setCurrentPaymentCount(1);
    };
  }, []);

  useEffect(() => {
    dispatch(setBuyStatus({ status: null, message: '' }));
    setShowLoader(false);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (buyStatus.status === 'fetching' || buyStatus.status === 'loading') {
      setShowPaymentWaiting(true);
    }
    if (buyStatus.status === 'error' || buyStatus.status === 'cancelled') {
      setShowPaymentWaiting(false);

      const elapsed = cancelStartedAtRef.current !== null ? Date.now() - cancelStartedAtRef.current : Infinity;
      if (elapsed >= MIN_CANCEL_OVERLAY_MS) {
        setShowLoader(false);
      } else {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => setShowLoader(false), MIN_CANCEL_OVERLAY_MS - elapsed);
      }
      cancelStartedAtRef.current = null;
    }
    if (buyStatus.status === 'success') navigate('/success');
  }, [buyStatus]);

  const cancelBuyButtonHandler = () => {
    cancelStartedAtRef.current = Date.now();
    cancelFunction(undefined);
    setShowLoader(true);
  };

  return (
    <div className="cart-container">
      {showLoader && (
        <div className="cancel-overlay">
          <RiseLoader color="#ffffff" />
          <p className="cancel-overlay-text">Скасування платежу...</p>
        </div>
      )}
      {showPaymentWaiting && (
        <div className="payment-wait-container">
          <CartTimer
            start={showPaymentWaiting}
            currentPaymentCount={currentPaymentCount}
          />
          <div className="empty-cart-notification-outer-wrapper">
            <div className="empty-cart-notification-wrapper">
              {cart.separatePayment && (
                <>
                  <p className="notification-light-text">Буде проведено 2 оплати</p>
                  {currentPaymentCount === 1 && <p className="notification-light-text">Проведіть першу оплату в терміналі</p>}
                  {currentPaymentCount === 2 && <p className="notification-light-text">Проведіть другу оплату в терміналі</p>}
                </>
              )}
              {!cart.separatePayment && <p className="notification-light-text">Для оплати скористайтесь терміналом</p>}
              <p className="notification-light-text">Сума до сплати: {totalSum} грн.</p>
              <div className="cart-paymnent-icon">
                <img src="img/icons/mobile.png" alt="" />
              </div>
              <button className="cancel-buy-button" onClick={cancelBuyButtonHandler} disabled={showLoader}>
                Відміна
              </button>
            </div>
          </div>
        </div>
      )}

      {cartProducts.length > 0 ? (
        <div className="cartlist-wrapper">
          <div className="cartlist-head">
            <div className="cartlist-head-item"><p>Продукт</p></div>
            <div className="cartlist-head-item"><p>Кількість</p></div>
            <div className="cartlist-head-item"><p>Вартість</p></div>
          </div>
          <div className="cart-list-scroll-wrapper">
            <Scrollbars
              renderTrackVertical={(props: React.HTMLProps<HTMLDivElement>) => <div {...props} className="track-vertical" />}
              renderThumbVertical={(props: React.HTMLProps<HTMLDivElement>) => <div {...props} className="thumb-vertical" />}
              style={{ width: '100%', height: '90%' }}
              thumbSize={190}
              hideTracksWhenNotNeeded={true}
            >
              <div className="cart-list">
                {cartProducts.map((el) => {
                  if (el.isComboChild) return null;
                  return <CartProductItem key={el.isComboParent ? 'parent' + el.id : el.id} product={el} />;
                })}
              </div>
            </Scrollbars>
          </div>
        </div>
      ) : (
        <div className="epmty-cart-wrapper">
          <div className="empty-cart-notification-outer-wrapper">
            <div className="empty-cart-notification-wrapper">
              <h1>Ой, товари відсутні</h1>
              <Link to="/products" className="footer-counter-btn footer-counter-outlined-btn">
                Повернутися до покупок
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
