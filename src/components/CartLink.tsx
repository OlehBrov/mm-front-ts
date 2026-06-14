import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectCartProducts } from '../redux/selectors/selectors';

export const CartLink = () => {
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const cartProducts = useSelector(selectCartProducts);

  useEffect(() => {
    if (cartProducts.length > 0) {
      const total = cartProducts.reduce((acc, p) => acc + p.inCartQuantity, 0);
      setTotalProductsCount(total);
    } else {
      setTotalProductsCount(0);
    }
  }, [cartProducts]);

  return (
    <div className="cart-link-wrapper">
      <Link to="/cart" className="cart-button">
        <div className="cart-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27" fill="none">
            <g clipPath="url(#clip0_2_1814)">
              <path d="M4.83337 21.375C4.83337 21.9717 5.06165 22.544 5.46798 22.966C5.8743 23.3879 6.4254 23.625 7.00004 23.625C7.57468 23.625 8.12578 23.3879 8.53211 22.966C8.93843 22.544 9.16671 21.9717 9.16671 21.375C9.16671 20.7783 8.93843 20.206 8.53211 19.784C8.12578 19.3621 7.57468 19.125 7.00004 19.125C6.4254 19.125 5.8743 19.3621 5.46798 19.784C5.06165 20.206 4.83337 20.7783 4.83337 21.375Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16.75 21.375C16.75 21.9717 16.9783 22.544 17.3846 22.966C17.7909 23.3879 18.342 23.625 18.9167 23.625C19.4913 23.625 20.0424 23.3879 20.4487 22.966C20.8551 22.544 21.0833 21.9717 21.0833 21.375C21.0833 20.7783 20.8551 20.206 20.4487 19.784C20.0424 19.3621 19.4913 19.125 18.9167 19.125C18.342 19.125 17.7909 19.3621 17.3846 19.784C16.9783 20.206 16.75 20.7783 16.75 21.375Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.9167 19.125H7.00004V3.375H4.83337" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 5.625L22.1667 6.75L21.0833 14.625H7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
              <clipPath id="clip0_2_1814">
                <rect width="26" height="27" fill="white" transform="translate(0.5)" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <span className="cart-link-counter">{totalProductsCount}</span>
      </Link>
    </div>
  );
};
