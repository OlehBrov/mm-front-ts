import { CartProduct } from '../types';

interface TaxTotals {
  withVATTotalSum: number;
  noVATTotalSum: number;
  VATSum: number;
  exciseSum: number;
}

export const calculateTaxes = (
  cartProducts: CartProduct[],
  isSingleMerchant: boolean | null,
  useVATbyDefault: boolean | null
): TaxTotals => {
  return cartProducts.reduce(
    (totals, product) => {
      const price = product.priceAfterDiscount
        ? Number(product.priceAfterDiscount)
        : Number(product.product_price);
      const discountValue = product.discountValue || 0;

      if (isSingleMerchant && useVATbyDefault) {
        totals.noVATTotalSum = 0;
        totals.withVATTotalSum += price * product.inCartQuantity;
        const vatValue = parseFloat(String(product.VAT_value || 0));
        totals.VATSum += product.hasLowerPrice ? vatValue - vatValue * discountValue : vatValue;
        totals.exciseSum += parseFloat(String(product.excise_value || 0)) * product.inCartQuantity;
      } else if (isSingleMerchant && !useVATbyDefault) {
        totals.withVATTotalSum = 0;
        totals.noVATTotalSum += price * product.inCartQuantity;
        totals.VATSum = 0;
        totals.exciseSum += parseFloat(String(product.excise_value || 0)) * product.inCartQuantity;
      } else if (!isSingleMerchant && !useVATbyDefault) {
        if (!product.is_VAT_Excise) {
          totals.noVATTotalSum += price * product.inCartQuantity;
        } else {
          totals.withVATTotalSum += price * product.inCartQuantity;
          const vatValue = parseFloat(String(product.VAT_value || 0));
          totals.VATSum += product.hasLowerPrice
            ? (vatValue - vatValue * discountValue) * product.inCartQuantity
            : vatValue * product.inCartQuantity;
          totals.exciseSum += parseFloat(String(product.excise_value || 0)) * product.inCartQuantity;
        }
      }

      return totals;
    },
    { withVATTotalSum: 0, noVATTotalSum: 0, VATSum: 0, exciseSum: 0 } as TaxTotals
  );
};
