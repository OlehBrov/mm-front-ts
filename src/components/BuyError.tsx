import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearCart } from '../redux/features/cartSlice';
import { clearBuyStatus } from '../redux/features/buyStatus';
import { setFilter } from '../redux/features/filterSlice';

export const BuyError = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cancelHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(clearCart());
    dispatch(clearBuyStatus());
    dispatch(setFilter({ name: 'all', category: 0, subcategory: 0, categoryName: '' }));
    navigate('/products');
  };

  const retryHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(clearBuyStatus());
    navigate('/cart');
  };

  return (
    <div className="epmty-cart-wrapper">
      <div className="empty-cart-notification-outer-wrapper">
        <div className="empty-cart-notification-wrapper">
          <h1>Неможливо оплатити покупку</h1>
          <Link to="#" onClick={cancelHandler} className="footer-counter-btn footer-counter-outlined-btn">
            Відмовитися
          </Link>
          <Link to="#" onClick={retryHandler} className="footer-counter-btn footer-counter-outlined-btn">
            Спробувати ще раз
          </Link>
        </div>
      </div>
    </div>
  );
};
