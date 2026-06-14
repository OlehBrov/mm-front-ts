import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartProduct, CartState, TaxData } from '../../types';

const initialState: CartState = {
  cartProducts: [],
  noVATProducts: [],
  VATProducts: [],
  separatePayment: false,
  cartTotalSum: 0,
  storeTaxConfig: {
    isSingleMerchant: null,
    useVATbyDefault: null,
  },
};

const calcTotal = (products: CartProduct[]): string => {
  return products
    .reduce((total, p) => {
      const price = p.priceAfterDiscount ? Number(p.priceAfterDiscount) : Number(p.product_price);
      return total + price * p.inCartQuantity;
    }, 0)
    .toFixed(2);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: {
      reducer: (
        state,
        action: PayloadAction<{ product: CartProduct; taxData: TaxData }>
      ) => {
        const { product, taxData } = action.payload;

        if (!state.separatePayment && state.cartProducts.length > 0 && !taxData.isSingleMerchant) {
          state.separatePayment =
            state.cartProducts[state.cartProducts.length - 1].is_VAT_Excise !==
            product.is_VAT_Excise;
        }

        const isAdded = state.cartProducts.find(
          (item) => item.id === product.id && item.isComboParent !== true
        );

        if (isAdded) {
          isAdded.inCartQuantity += product.inCartQuantity;
        } else {
          state.cartProducts = [...state.cartProducts, product];
        }

        state.storeTaxConfig = taxData;
        state.cartTotalSum =
          state.cartProducts.length > 0 ? calcTotal(state.cartProducts) : 0;
      },
      prepare: (payload: { product: CartProduct; taxData: TaxData }) => ({ payload }),
    },

    addComboProductsToCart: (
      state,
      action: PayloadAction<{ parent: CartProduct; child: CartProduct }>
    ) => {
      const { parent, child } = action.payload;
      const isAdded = state.cartProducts.find(
        (item) => item.id === parent.id && item.isComboParent === true
      );

      if (isAdded && isAdded.productsChildProduct) {
        const childProductId = isAdded.productsChildProduct.id;
        const comboChildProduct = state.cartProducts.find(
          (item) => item.id === childProductId && item.isComboChild
        );
        isAdded.inCartQuantity += parent.inCartQuantity;
        if (comboChildProduct) comboChildProduct.inCartQuantity += child.inCartQuantity;
      } else {
        state.cartProducts.push(parent);
        state.cartProducts.push(child);
      }

      state.cartTotalSum =
        state.cartProducts.length > 0 ? calcTotal(state.cartProducts) : 0;
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.cartProducts = state.cartProducts.filter(
        (item) =>
          item.id !== action.payload ||
          item.isComboParent === true ||
          item.isComboChild === true
      );
      state.cartTotalSum =
        state.cartProducts.length > 0 ? calcTotal(state.cartProducts) : 0;
    },

    removeComboFromCart: (state, action: PayloadAction<number>) => {
      const comboProduct = state.cartProducts.find(
        (item) => item.id === action.payload && item.isComboParent === true
      );

      if (comboProduct) {
        const childProductId = comboProduct.productsChildProduct?.id;
        state.cartProducts = state.cartProducts.filter(
          (item) =>
            !(item.id === comboProduct.id && item.isComboParent) &&
            !(item.id === childProductId && item.isComboChild)
        );
        state.cartTotalSum = calcTotal(state.cartProducts);
      }
    },

    incrementProductsCount: (state, action: PayloadAction<number>) => {
      const product = state.cartProducts.find((item) => item.id === action.payload);
      if (product) product.inCartQuantity += 1;
      state.cartTotalSum =
        state.cartProducts.length > 0 ? calcTotal(state.cartProducts) : 0;
    },

    decrementProductsCount: (state, action: PayloadAction<number>) => {
      const product = state.cartProducts.find((item) => item.id === action.payload);
      if (!product) return;
      if (product.inCartQuantity === 1) {
        state.cartProducts = state.cartProducts.filter(
          (item) => item.id !== action.payload
        );
      } else {
        product.inCartQuantity -= 1;
      }
      state.cartTotalSum =
        state.cartProducts.length > 0 ? calcTotal(state.cartProducts) : 0;
    },

    incrementComboProductsCount: (state, action: PayloadAction<number>) => {
      const comboProduct = state.cartProducts.find((item) => item.id === action.payload);
      if (!comboProduct || !comboProduct.productsChildProduct) return;
      comboProduct.inCartQuantity += 1;
      const childProductId = comboProduct.productsChildProduct.id;
      const comboChildProduct = state.cartProducts.find(
        (item) => item.id === childProductId && item.isComboChild
      );
      if (comboChildProduct) comboChildProduct.inCartQuantity += 1;
      state.cartTotalSum = calcTotal(state.cartProducts);
    },

    decrementComboProductsCount: (state, action: PayloadAction<number>) => {
      const comboProduct = state.cartProducts.find((item) => item.id === action.payload);
      if (!comboProduct || !comboProduct.productsChildProduct) return;
      const childProductId = comboProduct.productsChildProduct.id;
      const comboChildProduct = state.cartProducts.find(
        (item) => item.id === childProductId && item.isComboChild
      );

      if (comboProduct.inCartQuantity === 1) {
        state.cartProducts = state.cartProducts.filter(
          (item) => item.id !== comboProduct.id && item.id !== childProductId
        );
      } else {
        comboProduct.inCartQuantity -= 1;
        if (comboChildProduct) comboChildProduct.inCartQuantity -= 1;
      }

      state.cartTotalSum =
        state.cartProducts.length > 0 ? calcTotal(state.cartProducts) : 0;
    },

    clearCart: (state) => {
      state.cartProducts = [];
      state.cartTotalSum = 0;
      state.separatePayment = false;
    },

    setStoreCartTaxConfig: (_state, _action: PayloadAction<unknown>) => {
      // handled server-side via merchantsSlice
    },
  },
});

export const {
  addToCart,
  addComboProductsToCart,
  removeFromCart,
  incrementProductsCount,
  decrementProductsCount,
  clearCart,
  incrementComboProductsCount,
  decrementComboProductsCount,
  removeComboFromCart,
  setStoreCartTaxConfig,
} = cartSlice.actions;

export default cartSlice.reducer;
