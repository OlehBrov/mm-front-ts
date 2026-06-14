export interface SaleData {
  sale_discount_1: number | string;
  sale_discount_2?: number | string;
  sale_discount_3?: number | string;
  sale_name?: string;
}

export interface LoadProduct {
  load_date: string;
}

export interface ComboChildProduct {
  product_left: number | string;
  product_name: string;
  product_price: number | string;
  product_image: string;
  [key: string]: unknown;
}

export interface ComboProductData {
  Products_ComboProducts_child_product_idToProducts: ComboChildProduct;
}

export interface ProductSubcategory {
  category_ref_1C: number;
  subcategory_name: string;
  product_subcategory: number;
}

export interface ProductCategory {
  cat_1C_id: number;
  category_name: string;
  category_image: string;
  category_priority: number;
}

export interface ProductDivision {
  div_id: number;
  division_custom_id: number;
  division_name: string;
}

export interface DivisionData {
  ProductsDivisions: ProductDivision;
  product_division?: number;
}

export interface Product {
  id: number;
  barcode: string;
  product_code?: string;
  product_name: string;
  product_price: number | string;
  product_left: number | string;
  product_lot?: number;
  product_image: string;
  product_description?: string;
  is_VAT_Excise: boolean;
  excise_product?: boolean;
  mark?: string;
  VAT_value?: number | string;
  excise_value?: number | string;
  sale_id?: number | null;
  combo_id?: number | null;
  exposition_term?: number;
  Sales?: SaleData;
  LoadProducts_LoadProducts_product_idToProducts?: LoadProduct[];
  ComboProducts_Products_combo_idToComboProducts?: ComboProductData;
  Subcategories?: ProductSubcategory;
  Categories?: ProductCategory;
  ProductsDivisions?: ProductDivision;
  divisionData?: DivisionData[];
}

export interface CartProduct extends Product {
  inCartQuantity: number;
  priceDecrement: number | string;
  priceAfterDiscount: number | string | null;
  hasLowerPrice: boolean;
  merchant: string | null;
  discountValue: number;
  isComboParent?: boolean;
  isComboChild?: boolean;
  productsChildProduct?: CartProduct;
  taxData?: TaxData;
}

export interface TaxData {
  useVATbyDefault: boolean;
  isSingleMerchant: boolean;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  categoryImage: string;
}

export interface SubcategoriesMap {
  [categoryId: number]: ProductSubcategory[];
}

export interface DivisionsMap {
  [categoryId: number]: { division: DivisionData[] };
}

export interface AuthState {
  store_id: number;
  isLoggedIn: boolean;
  auth_id: string;
  token: string;
  refreshToken: string;
  role: string;
}

export interface MerchantData {
  defaultMerchant: string;
  isSingleMerchant: boolean;
  status: string;
  useVATbyDefault: boolean;
  vatExciseMerchant: string;
  noVATTaxGroup: number;
  VATTaxGroup: number;
  VATExciseTaxGroup: number;
}

export interface FilterState {
  name: string;
  category: number;
  subcategory: number[];
  categoryName: string;
  division: number;
}

export interface BuyStatusState {
  status: string | null;
  message: string;
  paymentCount: number;
}

export interface NotifyState {
  isNotifyOpen: boolean;
  isIdleOpen: boolean;
  idleOpenChecking: boolean;
  showNoProdError: boolean;
}

export interface ShowAddConfirmState {
  show: boolean;
  product: Product | null;
  isSuccess: boolean;
  message: string;
}

export interface SearchState {
  searchQuery: string;
  searchResults: Product[];
}

export interface CartState {
  cartProducts: CartProduct[];
  noVATProducts: CartProduct[];
  VATProducts: CartProduct[];
  separatePayment: boolean;
  cartTotalSum: number | string;
  storeTaxConfig: {
    isSingleMerchant: boolean | null;
    useVATbyDefault: boolean | null;
  };
}

export interface SelectedQuantityState {
  totalSelected: number;
  totalRemain: number;
  mainSelected: number;
  childSelected: number;
  maxAvailable: number;
}

export interface SubcategoriesState {
  subcategoryList: SubcategoriesMap;
  divisions: DivisionsMap | DivisionDefaultItem[];
}

export interface DivisionDefaultItem {
  div_id: number;
  division_custom_id: number;
  division_name: string;
}

export interface RecieptState {
  [key: string]: unknown;
}

export interface StoreSaleData {
  products: Product[];
  store_sale_title?: string;
  discount?: number;
}
