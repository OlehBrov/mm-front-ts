import { useDispatch, useSelector } from 'react-redux';
import { selectSearch } from '../redux/selectors/selectors';
import { addToCart } from '../redux/features/cartSlice';
import { useState } from 'react';
import { CartProduct } from '../types';

export const SearchResultsPage = () => {
  const { searchResults } = useSelector(selectSearch);
  const dispatch = useDispatch();

  const buyButtonHandler = (productToBuy: CartProduct) => {
    dispatch(addToCart({ product: productToBuy, taxData: { useVATbyDefault: false, isSingleMerchant: false } }));
  };

  return (
    <div>
      <h1>Сторінка результатів пошуку</h1>
      <div className="products-grid">
        {searchResults.map((el) => (
          <div key={el.id} className="product-card">
            <div className="product-image-wrapper">
              <img className="product-image" src={el.product_image} alt="" />
            </div>
            <div className="product-card-footer">
              <h3>{el.product_name}</h3>
              <p>Price: {el.product_price}</p>
              <button type="button" onClick={() => buyButtonHandler({ ...el, inCartQuantity: 1, priceDecrement: 0, priceAfterDiscount: null, hasLowerPrice: false, merchant: null, discountValue: 0 })}>
                Додати в корзину
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
