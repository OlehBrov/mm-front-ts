import {
  decrementComboProductsCount,
  decrementProductsCount,
  incrementComboProductsCount,
  incrementProductsCount,
  removeComboFromCart,
  removeFromCart,
} from '../redux/features/cartSlice';
import { useDispatch } from 'react-redux';
import { MinusIcon } from './icons/MinusIcon';
import { PlusIcon } from './icons/PlusIcon';
import { BinIcon } from './icons/BinIcon';
import { CartProduct, PricedCartLine } from '../types';

interface Props {
  product: CartProduct;
  /** Live server-side quote for this line (POST /api/cart/price) — authoritative for
   * quantity-dependent promos (дубль/комбо/поріг чека). Undefined until the first
   * quote comes back; the price captured at add-to-cart time is shown meanwhile. */
  livePrice?: PricedCartLine;
  liveChildPrice?: PricedCartLine;
}

export const CartProductItem = ({ product, livePrice, liveChildPrice }: Props) => {
  const dispatch = useDispatch();
  const comboProduct = product.productsChildProduct ?? null;

  const regularPrice = parseFloat(String(product.product_price));
  const unitPrice = livePrice?.priceAfterDiscount ?? (parseFloat(String(product.priceAfterDiscount)) || regularPrice);
  const hasLowerPrice = livePrice ? livePrice.hasLowerPrice : !!product.hasLowerPrice;
  const lineTotal = livePrice?.lineTotal ?? unitPrice * product.inCartQuantity;

  const childRegularPrice = comboProduct ? parseFloat(String(comboProduct.product_price)) : 0;
  const childUnitPrice = comboProduct
    ? (liveChildPrice?.priceAfterDiscount ?? (parseFloat(String(comboProduct.priceAfterDiscount)) || childRegularPrice))
    : 0;
  const childHasLowerPrice = liveChildPrice ? liveChildPrice.hasLowerPrice : !!comboProduct?.hasLowerPrice;
  const pairTotal = comboProduct ? lineTotal + (liveChildPrice?.lineTotal ?? childUnitPrice * product.inCartQuantity) : 0;

  return (
    <div className="cart-list-item">
      {comboProduct ? (
        <>
          <div className="cart-item-descr-wrapper">
            <div className="combo-cart-item-img-wrap">
              <div className="cart-item-img-wrap">
                <img className="cart-product-item-img" src={product.product_image} alt="" />
              </div>
              <div className="cart-item-img-wrap">
                <img className="cart-product-item-img" src={comboProduct.product_image} alt="" />
              </div>
            </div>
            <div className="cart-product-details">
              <div className="combo-cart-item-text-wrap">
                <div className="product-name-wrap">
                  <p className="cart-product-text cart-product-bold-text">{product.product_name}</p>
                  <p className={`cart-product-text cart-product-light-text ${hasLowerPrice ? 'crossed' : ''}`}>{regularPrice} грн.</p>
                  {hasLowerPrice && <p className="product-card-light-text">{unitPrice.toFixed(2)} грн.</p>}
                </div>
                <div className="product-name-wrap">
                  <p className="cart-product-text cart-product-bold-text">{comboProduct.product_name}</p>
                  <p className={`cart-product-text cart-product-light-text ${childHasLowerPrice ? 'crossed' : ''}`}>{childRegularPrice} грн.</p>
                  {childHasLowerPrice && <p className="product-card-light-text">{childUnitPrice.toFixed(2)} грн.</p>}
                </div>
              </div>
            </div>
          </div>
          <div className="cart-item-controls">
            <div className="buttons-wrapper">
              <button className="custom-product-button decrease-button" disabled={product.inCartQuantity < 2} onClick={() => dispatch(decrementComboProductsCount(product.id))}>
                <MinusIcon />
              </button>
              <span className="custom-counter">{product.inCartQuantity}</span>
              <button className="custom-product-button increase-button" onClick={() => dispatch(incrementComboProductsCount(product.id))} disabled={product.inCartQuantity >= parseInt(String(product.product_left))}>
                <PlusIcon />
              </button>
            </div>
          </div>
          <div className="cart-item-total">
            <p className="cart-product-text cart-product-light-text">{pairTotal.toFixed(2)} грн.</p>
            <button type="button" onClick={() => dispatch(removeComboFromCart(product.id))} className="custom-product-button cart-item-delete-button">
              <BinIcon />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="cart-item-descr-wrapper">
            <div className="cart-item-img-wrap">
              <img className="cart-product-item-img" src={product.product_image} alt="" />
            </div>
            <div className="cart-product-details">
              <p className="cart-product-text cart-product-bold-text">{product.product_name}</p>
              <p className={`cart-product-text cart-product-light-text ${hasLowerPrice ? 'crossed' : ''}`}>{regularPrice} грн.</p>
              {hasLowerPrice && <p className="product-card-light-text">{unitPrice.toFixed(2)} грн.</p>}
            </div>
          </div>
          <div className="cart-item-controls">
            <div className="buttons-wrapper">
              <button className="custom-product-button decrease-button" disabled={product.inCartQuantity < 2} onClick={() => dispatch(decrementProductsCount(product.id))}>
                <MinusIcon />
              </button>
              <span className="custom-counter">{product.inCartQuantity}</span>
              <button className="custom-product-button increase-button" onClick={() => dispatch(incrementProductsCount(product.id))} disabled={product.inCartQuantity >= parseInt(String(product.product_left))}>
                <PlusIcon />
              </button>
            </div>
          </div>
          <div className="cart-item-total">
            <p className="cart-product-text cart-product-light-text">{lineTotal.toFixed(2)} грн.</p>
            <button type="button" onClick={() => dispatch(removeFromCart(product.id))} className="custom-product-button cart-item-delete-button">
              <BinIcon />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
