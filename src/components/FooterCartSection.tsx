import SlotCounter from 'react-slot-counter';
import { CartLink } from './CartLink';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartTotalSum, selectTerminalState } from '../redux/selectors/selectors';
import { Link } from 'react-router-dom';
import { clearCart } from '../redux/features/cartSlice';

export const FooterCartSection = () => {
  const totalSum = useSelector(selectCartTotalSum);
  const { status: terminalStatus } = useSelector(selectTerminalState);
  const isTerminalOffline = terminalStatus === 'offline';
  const dispatch = useDispatch();

  const clearCartHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(clearCart());
    document.getElementById('barcode-dummy')?.focus();
  };

  return (
    <div className="footer-cart-wrapper">
      <div className="footer-cart-counter-wrap">
        <CartLink />
        <div className="total-text">
          <SlotCounter
            value={totalSum}
            sequentialAnimationMode={true}
            useMonospaceWidth={true}
          />{' '}
          <span>грн.</span>
        </div>
      </div>
      <div className="footer-cart-links-wrapper">
        <Link
          to="#"
          onClick={clearCartHandler}
          className={`footer-cart-link footer-cancel-link ${Number(totalSum) !== 0 ? '' : 'link-disabled'}`}
        >
          Скасувати
        </Link>
        <Link
          to="/cart"
          className={`footer-cart-link footer-buy-link ${Number(totalSum) !== 0 && !isTerminalOffline ? '' : 'link-disabled'}`}
          title={isTerminalOffline ? 'Термінал недоступний' : undefined}
        >
          {isTerminalOffline ? 'Термінал недоступний' : 'Переглянути замовлення і оплатити'}
        </Link>
      </div>
    </div>
  );
};
