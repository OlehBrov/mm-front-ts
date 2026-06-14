import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectBuyStatus,
  selectCart,
  selectCartTotalSum,
} from '../redux/selectors/selectors';
import { Link, useNavigate } from 'react-router-dom';
import { useBuyProductsMutation } from '../api/storeApi';
import { setReciept } from '../redux/features/recieptSlice';
import { setBuyStatus } from '../redux/features/buyStatus';

interface Props {
  timerPause: () => void;
  timerReset: () => void;
}

export const FooterCartCountSection = ({ timerPause, timerReset }: Props) => {
  const [buyFunction, buyingData] = useBuyProductsMutation();
  const cart = useSelector(selectCart);
  const totalSum = useSelector(selectCartTotalSum);
  const buyStatus = useSelector(selectBuyStatus);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      Number(totalSum) === 0 ||
      buyStatus.status === 'fetching' ||
      buyStatus.status === 'loading' ||
      buyStatus.status === 'error' ||
      buyStatus.status === 'cancelled'
    ) {
      setButtonDisabled(true);
    } else {
      setButtonDisabled(false);
    }
  }, [buyStatus, totalSum]);

  useEffect(() => {
    if (buyingData.isLoading) dispatch(setBuyStatus({ status: 'loading', message: '' }));
    if (buyingData.isError) {
      const errData = (buyingData.error as { data?: { errorDescription?: string } })?.data;
      dispatch(setBuyStatus({ status: 'error', message: errData?.errorDescription ?? '' }));
    }
    if (buyingData.isSuccess) {
      const data = buyingData.data as { status?: string };
      if (data?.status === 'cancelled') {
        dispatch(setBuyStatus({ status: 'cancelled', message: 'Оплату скасовано' }));
      } else {
        dispatch(setBuyStatus({ status: 'success', message: '' }));
      }
    }
  }, [buyingData]);

  const handleBuy = async (prods: typeof cart) => {
    timerPause();
    const cartProducts = prods.cartProducts.map((p) => ({
      id: p.id,
      product_code: p.product_code,
      barcode: p.barcode,
      mark: p.mark,
      product_name: p.product_name,
      inCartQuantity: p.inCartQuantity,
      product_price: Number(p.product_price),
      priceDecrement: Number(p.priceDecrement) || 0,
      product_lot: p.product_lot,
      sale_id: p.sale_id,
      merchant: p.merchant ?? undefined,
      is_VAT_Excise: p.is_VAT_Excise,
      excise_product: p.excise_product,
    }));

    try {
      const result = await buyFunction({ cartProducts }).unwrap();
      const data = result as { status?: string };
      if (result && data?.status !== 'cancelled') {
        dispatch(setReciept(result as Record<string, unknown>));
      }
      timerReset();
    } catch (error) {
      timerReset();
      const errData = (error as { data?: { errorDescription?: string } })?.data;
      if (errData?.errorDescription) console.log('ERROR', errData.errorDescription);
    }
  };

  return (
    <div className="footer-cart-count-wrapper">
      <div />
      <div className="counter-wrap">
        <p>
          Загальна вартість покупки: <span>{totalSum} грн.</span>
        </p>
      </div>
      <div className="footer-counter-btn-wrap footer-counter-back-btn-wrap">
        <Link
          to="/products"
          className={`footer-counter-btn footer-counter-outlined-btn ${buttonDisabled ? 'disabled-btn' : ''}`}
        >
          Повернутися до покупок
        </Link>
      </div>
      <div className="footer-counter-btn-wrap footer-counter-buy-btn-wrap">
        <Link
          to="#"
          onClick={() => handleBuy(cart)}
          className={`footer-counter-btn footer-counter-filled-btn ${buttonDisabled ? 'disabled-btn' : ''}`}
        >
          Завершити покупку і оплатити
        </Link>
      </div>
    </div>
  );
};
