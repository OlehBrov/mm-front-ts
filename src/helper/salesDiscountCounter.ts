import moment from 'moment';
import { Product } from '../types';

export const shouldShowMarker = (product: Product): boolean => {
  const { sale_id } = product;
  if (sale_id === 1 || sale_id === 2) {
    const expDays = calculateDaysLeft(product);
    return expDays < 4;
  }
  if (sale_id === 7) {
    if (!product.ComboProducts_Products_combo_idToComboProducts) return false;
    const childQuantity =
      product.ComboProducts_Products_combo_idToComboProducts
        .Products_ComboProducts_child_product_idToProducts.product_left;
    if (Number(childQuantity) === 0 || isNaN(Number(childQuantity))) return false;
    return true;
  }
  if (sale_id && sale_id !== 0) return true;
  return false;
};

export const calculateDiscount = (product: Product, daysLeft?: number): number => {
  const { sale_id, Sales } = product;
  if (!Sales) return 0;
  let discount = 0;

  if (sale_id === 1 || sale_id === 2) {
    if (daysLeft === 3) discount = parseFloat(String(Sales.sale_discount_1));
    else if (daysLeft === 2) discount = parseFloat(String(Sales.sale_discount_2 ?? 0));
    else if (daysLeft !== undefined && daysLeft < 2) discount = parseFloat(String(Sales.sale_discount_3 ?? 0));
  } else if (sale_id === 3 || sale_id === 4 || sale_id === 6 || sale_id === 9) {
    discount = parseFloat(String(Sales.sale_discount_1));
  }

  return discount;
};

export const calculateNewPrice = (product: Product, discount: number): string => {
  const price = parseFloat(String(product.product_price));
  return discount > 0 ? (price - price * discount).toFixed(2) : price.toFixed(2);
};

export const calculateDaysLeft = (product: Product): number => {
  const loadData = product.LoadProducts_LoadProducts_product_idToProducts;
  if (!loadData || loadData.length === 0) return 999;
  const loadDate = moment(loadData[0].load_date);
  const expirationDate = loadDate.clone().add(product.exposition_term ?? 0, 'days');
  return expirationDate.diff(moment(), 'days');
};
