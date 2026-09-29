import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/features/cartSlice';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SaleDiscountMarker } from './icons/SaleDiscountMarker';
import { DetailsIcon } from './icons/DetailsIcon';
import { ProductPlaceholderIcon } from './icons/ProductPlaceholderIcon';
import { addDetailedProduct } from '../redux/features/detailedProductSlice';
import { selectCartProducts, selectCartTotalSum } from '../redux/selectors/selectors';
import { setShowAddProductsConfirm } from '../redux/features/showAddConfirmSlice';
import { CartProduct, Product } from '../types';

interface Props {
  product: Product;
  useVATbyDefault?: boolean;
  isSingleMerchant?: boolean;
  onIdle?: boolean;
}

// Price, discount and badge eligibility all come from the backend (PricingService) —
// this component only displays what GET /api/products already computed.
export const ProductCard = ({ product, useVATbyDefault = false, isSingleMerchant = false, onIdle = false }: Props) => {
  const [productQtyAvailable, setProductQtyAvailable] = useState(1);
  const [productAvailable, setProductAvailable] = useState(true);
  const [merchant, setMerchant] = useState<string | null>(null);
  const cartTotal = useSelector(selectCartTotalSum);
  const prodsInCart = useSelector(selectCartProducts);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const regularPrice = parseFloat(String(product.product_price)).toFixed(2);
  const hasLowerPrice = !!product.hasLowerPrice;
  const newPrice = product.priceAfterDiscount != null ? parseFloat(String(product.priceAfterDiscount)).toFixed(2) : null;
  // badgeType is already 0 when nothing should show (day-window not reached, combo
  // pair out of stock, etc.) — see PricingService.priceProduct on the backend.
  const showMarker = !!product.badgeType;

  useEffect(() => {
    const inCartProduct = prodsInCart.find((p) => p.id === product.id);
    if (Number(cartTotal) === 0) {
      setProductQtyAvailable(Number(product.product_left));
      setProductAvailable(true);
    }
    if (inCartProduct) {
      const updatedQtyAvailable = Number(product.product_left) - Number(inCartProduct.inCartQuantity);
      setProductQtyAvailable(updatedQtyAvailable);
      if (updatedQtyAvailable <= 0) setProductAvailable(false);
    } else {
      setProductQtyAvailable(Number(product.product_left));
    }
  }, [prodsInCart, product, cartTotal]);

  useEffect(() => {
    if (!isSingleMerchant && !useVATbyDefault) setMerchant('both');
    else if (isSingleMerchant && !useVATbyDefault) setMerchant('nonVAT');
    else if (isSingleMerchant && useVATbyDefault) setMerchant('VAT');
  }, [useVATbyDefault, isSingleMerchant]);

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (productQtyAvailable > 0) {
      dispatch(setShowAddProductsConfirm({ show: true, product, isSuccess: true, message: 'додано' }));
      setTimeout(() => dispatch(setShowAddProductsConfirm({ show: false, product: null, isSuccess: false, message: '' })), 1000);

      dispatch(
        addToCart({
          product: {
            ...product,
            inCartQuantity: 1,
            priceDecrement: product.priceDecrement ?? 0,
            priceAfterDiscount: product.priceAfterDiscount ?? null,
            hasLowerPrice,
            merchant,
            discountValue: product.discountValue ?? 0,
          } as CartProduct,
          taxData: { useVATbyDefault, isSingleMerchant },
        })
      );

      const updatedQtyAvailable = productQtyAvailable - 1;
      setProductQtyAvailable(updatedQtyAvailable);
      if (updatedQtyAvailable <= 0) setProductAvailable(false);
    }
  };

  const detailsClickHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addDetailedProduct({
        ...product,
        inCartQuantity: 1,
        priceDecrement: product.priceDecrement ?? 0,
        priceAfterDiscount: product.priceAfterDiscount ?? null,
        hasLowerPrice,
        merchant,
        discountValue: product.discountValue ?? 0,
        taxData: { useVATbyDefault, isSingleMerchant },
      } as CartProduct)
    );
    navigate('/productDetails', { state: { from: { location } } });
  };

  return (
    <Link to="#" className={`product-card ${productAvailable ? '' : 'no-product'}`} onClick={handleProductClick}>
      {showMarker && (
        <SaleDiscountMarker
          badgeType={product.badgeType ?? 0}
          saleName={product.saleName}
          discountValue={product.discountValue}
        />
      )}
      <div className="product-image-wrapper">
        {product.product_image
          ? <img className="product-image" src={product.product_image} alt="" />
          : <ProductPlaceholderIcon />}
      </div>
      <div className="product-card-footer">
        <div className="product-card-text-wrapper">
          <p className="product-card-name">{product.product_name}</p>
          <p className={`product-card-light-text ${hasLowerPrice ? 'crossed' : ''}`}>{regularPrice} грн.</p>
          {hasLowerPrice && <p className="product-card-light-text">{newPrice} грн.</p>}
        </div>
        {!onIdle && (
          <button type="button" onClick={detailsClickHandler} className="product-card-details-button">
            <DetailsIcon />
          </button>
        )}
      </div>
    </Link>
  );
};
