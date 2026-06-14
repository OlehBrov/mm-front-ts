import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearCart } from '../redux/features/cartSlice';
import { clearBuyStatus } from '../redux/features/buyStatus';
import { clearFilter } from '../redux/features/filterSlice';

const TIMEOUT_SECONDS = 30;

export const PaymentCancelled = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_SECONDS);

  const cancelPurchaseHandler = (e?: React.MouseEvent) => {
    e?.preventDefault();
    dispatch(clearCart());
    dispatch(clearBuyStatus());
    dispatch(clearFilter());
    navigate('/products');
  };

  const continuePurchaseHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(clearBuyStatus());
    navigate('/products');
  };

  useEffect(() => {
    if (secondsLeft <= 0) {
      cancelPurchaseHandler();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return (
    <div className="epmty-cart-wrapper">
      <div className="empty-cart-notification-outer-wrapper">
        <div className="empty-cart-notification-wrapper">
          <h1>Оплата скасована покупцем</h1>
          <p className="notification-light-text">Автоматичне скасування через {secondsLeft} сек.</p>
          <Link to="#" onClick={cancelPurchaseHandler} className="footer-counter-btn footer-counter-outlined-btn">
            Відмовитись від покупок
          </Link>
          <Link to="#" onClick={continuePurchaseHandler} className="footer-counter-btn footer-counter-outlined-btn">
            Продовжити покупки
          </Link>
        </div>
      </div>
    </div>
  );
};
