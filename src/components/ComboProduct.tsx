import { useEffect, useState } from 'react';
import { MinusIcon } from './icons/MinusIcon';
import { PlusIcon } from './icons/PlusIcon';
import { useDispatch, useSelector } from 'react-redux';
import { addComboProductsToCart } from '../redux/features/cartSlice';
import { useGetProductByIdQuery } from '../api/storeApi';
import {
  incrementChildSelected,
  decrementChildSelected,
} from '../redux/features/selectedQuantitySlice';
import {
  selectTotalSelected,
  selectMaxAvailable,
  selectTotalRemain,
  selectChildSelected,
} from '../redux/selectors/selectors';
import { useNavigate } from 'react-router-dom';
import { CartProduct, Product } from '../types';

interface ComboPrice {
  priceAfterDiscount: number;
  priceDecrement: number;
}

interface Props {
  parentProduct: CartProduct;
  productQtyAvailable: number;
  setProductQtyAvailable: (n: number) => void;
  merchant: string | null;
  state: { from: { location: string } };
}

export const ComboProduct = ({ parentProduct, productQtyAvailable, merchant, state }: Props) => {
  const totalSelected = useSelector(selectTotalSelected);
  const maxAvailableMainProduct = useSelector(selectMaxAvailable);
  const totalRemain = useSelector(selectTotalRemain);
  const totalChildSelected = useSelector(selectChildSelected);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [comboDiscount, setComboDiscount] = useState(0);
  const [parentPrice, setParentPrice] = useState<ComboPrice>({ priceAfterDiscount: 0, priceDecrement: 0 });
  const [childPrice, setChildPrice] = useState<ComboPrice>({ priceAfterDiscount: 0, priceDecrement: 0 });
  const [totalPairPrice, setTotalPairPrice] = useState(0);
  const [maxPairsAvailable, setMaxPairsAvailable] = useState(1);
  const [disableIncrease, setDisableIncrease] = useState(false);
  const [disableDecrease, setDisableDecrease] = useState(true);

  const { currentData: childProduct, isSuccess } = useGetProductByIdQuery({ comboId: parentProduct.combo_id });

  const comboPriceCounter = (price: number | string, discount: number | string): ComboPrice => {
    const intPrice = parseFloat(String(price));
    const intDiscount = parseFloat(String(discount));
    const priceDecrement = parseFloat((intPrice * intDiscount).toFixed(2));
    const newPrice = parseFloat((intPrice - priceDecrement).toFixed(2));
    return { priceAfterDiscount: newPrice, priceDecrement };
  };

  useEffect(() => {
    if (isSuccess && childProduct && parentProduct.Sales) {
      const availableChildQty = Number(childProduct.childProduct.product_left);
      const maxAvailablePairs = Math.min(maxAvailableMainProduct, availableChildQty);
      setMaxPairsAvailable(maxAvailablePairs);
      setComboDiscount(Number(parentProduct.Sales.sale_discount_1) * 100);

      setParentPrice(comboPriceCounter(parentProduct.product_price, parentProduct.Sales.sale_discount_1));
      setChildPrice(comboPriceCounter(childProduct.childProduct.product_price, parentProduct.Sales.sale_discount_1));
    }
  }, [parentProduct, childProduct, productQtyAvailable, isSuccess]);

  useEffect(() => {
    if (parentPrice.priceAfterDiscount && childPrice.priceAfterDiscount) {
      setTotalPairPrice(parseFloat((parentPrice.priceAfterDiscount + childPrice.priceAfterDiscount).toFixed(2)));
    }
  }, [parentPrice, childPrice]);

  useEffect(() => {
    setDisableIncrease(totalChildSelected >= maxPairsAvailable || totalSelected >= maxAvailableMainProduct);
    setDisableDecrease(totalChildSelected <= 0);
  }, [maxPairsAvailable, totalSelected, maxAvailableMainProduct, totalRemain]);

  const modifierHandler = () => {
    if (!childProduct || !isSuccess) return;
    dispatch(
      addComboProductsToCart({
        parent: {
          ...parentProduct,
          inCartQuantity: totalChildSelected,
          priceAfterDiscount: parentPrice.priceAfterDiscount,
          priceDecrement: parentPrice.priceDecrement,
          isComboParent: true,
          hasLowerPrice: true,
          merchant,
          productsChildProduct: {
            ...childProduct.childProduct,
            inCartQuantity: totalChildSelected,
            priceAfterDiscount: childPrice.priceAfterDiscount,
            priceDecrement: childPrice.priceDecrement,
          } as CartProduct,
        } as CartProduct,
        child: {
          ...childProduct.childProduct,
          inCartQuantity: totalChildSelected,
          priceAfterDiscount: childPrice.priceAfterDiscount,
          priceDecrement: childPrice.priceDecrement,
          isComboChild: true,
          hasLowerPrice: true,
          merchant,
        } as CartProduct,
      })
    );
    navigate(state.from.location);
  };

  const handleProductIncrease = () => {
    if (totalChildSelected < maxPairsAvailable && totalSelected < maxAvailableMainProduct) {
      dispatch(incrementChildSelected(1));
    }
  };

  const handleProductDecrease = () => {
    if (totalChildSelected > 0) dispatch(decrementChildSelected(1));
  };

  if (!isSuccess || !childProduct) return null;

  return (
    <div className="combo-products-wrapper">
      <div className="combo-products-grid">
        <div className="combo-products-details-wrapper">
          <div className="combo-product-card">
            <div className="combo-product-image-wrap">
              <img src={parentProduct.product_image} alt="" />
            </div>
            <p className="combo-product-name">{parentProduct.product_name}</p>
            <div className="combo-prices-wrapper">
              <p className="product-card-light-text combo-price crossed">
                {parentProduct.product_price} грн.
                <span className="combo-discount-popup">{`-${comboDiscount}%`}</span>
              </p>
              <p className="product-card-light-text combo-price">{parentPrice.priceAfterDiscount} грн.</p>
            </div>
          </div>
          <div className="combo-product-card">
            <div className="combo-product-image-wrap">
              <img src={childProduct.childProduct.product_image} alt="" />
            </div>
            <p className="combo-product-name">{childProduct.childProduct.product_name}</p>
            <div className="combo-prices-wrapper">
              <p className="product-card-light-text combo-price crossed">
                {childProduct.childProduct.product_price} грн.
                <span className="combo-discount-popup">{`-${comboDiscount}%`}</span>
              </p>
              <p className="product-card-light-text combo-price">{childPrice.priceAfterDiscount} грн.</p>
            </div>
          </div>
        </div>
        <div className="combo-products-controls">
          <p className="sales-name">{`АКЦІЯ ${(parentProduct.Sales?.sale_name ?? '').toUpperCase()}`}</p>
          <p className="product-card-light-text">{totalPairPrice} грн.</p>
          <div className="details-custom-controls">
            <div className="buttons-wrapper">
              <button className="custom-product-button decrease-button" disabled={disableDecrease} onClick={handleProductDecrease}>
                <MinusIcon />
              </button>
              <span className="custom-counter">{totalChildSelected}</span>
              <button className="custom-product-button increase-button" disabled={disableIncrease} onClick={handleProductIncrease}>
                <PlusIcon />
              </button>
            </div>
          </div>
          <button type="button" className="filled-text-button wide-button" onClick={modifierHandler}>
            Додати в корзину
          </button>
        </div>
      </div>
    </div>
  );
};
