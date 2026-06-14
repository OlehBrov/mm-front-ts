import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSearch } from '../redux/selectors/selectors';
import { addToCart } from '../redux/features/cartSlice';
import { clearSearchResults, setSearch } from '../redux/features/searchSlice';
import { useNavigate } from 'react-router-dom';
import { ButtonCartIcon } from './icons/ButtonCartIcon';
import { CartProduct, Product } from '../types';

export const SearchResultsPopup = () => {
  const [isOpenResults, setIsOpenResult] = useState(true);
  const { searchResults } = useSelector(selectSearch);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setIsOpenResult(searchResults.length > 0);
  }, [searchResults]);

  const toCartHandler = (product: Product) => {
    dispatch(addToCart({ product: { ...product, inCartQuantity: 1 } as CartProduct, taxData: { useVATbyDefault: false, isSingleMerchant: false } }));
  };

  const allResultsClickHandler = () => {
    setIsOpenResult(false);
    navigate('/results');
  };

  const closeHandler = () => {
    dispatch(setSearch(''));
    setIsOpenResult(false);
  };

  if (!isOpenResults) return null;

  return (
    <div className="search-popup-wrapper">
      <div className="search-list-container">
        <ul className="search-list">
          {searchResults.map((prod) => (
            <li key={prod.id} className="search-list-item">
              <div className="search-list-item-img">
                <img src={prod.product_image} alt="" />
              </div>
              <div className="search-list-product-data">
                <p className="search-list-product-text search-list-product-name">{prod.product_name}</p>
                <p className="search-list-product-text search-list-product-price">{prod.product_price} грн.</p>
              </div>
              <div className="search-list-cart-button-wrapper">
                <button type="button" className="filled-button" onClick={() => toCartHandler(prod)}>
                  <ButtonCartIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="product-card-buttons-wrapper search-list-buttins-wrapper">
          <button type="button" className="filled-text-button" onClick={allResultsClickHandler}>
            Показати всі
          </button>
          <button type="button" className="outlined-btn" onClick={closeHandler}>
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
};
