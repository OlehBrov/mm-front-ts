import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { RootState } from '../redux/store';
import { logOutStore, refreshAccessToken } from '../redux/features/authSlice';

let navigateFn: ((path: string) => void) | null = null;
export const setNavigate = (nav: (path: string) => void) => {
  navigateFn = nav;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:6006/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).authLocal?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).authLocal?.refreshToken;

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/store/refresh-token',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const newToken = (refreshResult.data as { token: string }).token;
        api.dispatch(refreshAccessToken({ token: newToken }));

        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logOutStore());
      }
    } else {
      api.dispatch(logOutStore());
    }
  }

  return result;
};

export const storeApi = createApi({
  reducerPath: 'storeApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Products', 'Cart', 'StoreSale'],
  endpoints: (build) => ({
    loginStore: build.mutation({
      query: (data) => ({ url: 'auth/store/login', method: 'POST', body: data }),
      invalidatesTags: ['Auth'],
    }),
    logoutStore: build.query({
      query: () => ({ url: 'auth/store/logout', method: 'GET' }),
      providesTags: ['Auth'],
    }),
    getAllProducts: build.query<
      {
        status: string;
        message?: string;
        products?: import('../types').Product[];
        categories?: Array<{ Categories: import('../types').ProductCategory & { category_priority: number }; divisionData: import('../types').DivisionData[]; }>;
        subcategories?: Array<{ product_subcategory: number; Subcategories: import('../types').ProductSubcategory }>;
        hasNewProducts?: boolean;
      },
      { filter?: number; subcategory?: number[]; division?: number }
    >({
      query: ({ filter, subcategory, division }) => ({
        url: '/products',
        method: 'GET',
        params: { filter, subcategory, division },
      }),
      providesTags: ['Products'],
    }),
    getSingleProduct: build.query<{ product: import('../types').Product }, { barcode: string | null }>({
      query: ({ barcode }) => ({
        url: '/products/single',
        method: 'GET',
        params: { barcode },
      }),
      transformErrorResponse: (response) => {
        if (response.status === 404) return { error: 'Product not found' };
        return response;
      },
      providesTags: ['Products'],
    }),
    getProductById: build.query<{ childProduct: import('../types').Product }, { comboId: number | null | undefined }>({
      query: ({ comboId }) => ({
        url: '/products/product',
        method: 'GET',
        params: { comboId },
      }),
      providesTags: ['Products'],
    }),
    getStoreSaleProducts: build.query<import('../types').StoreSaleData, void>({
      query: () => ({ url: '/config/store-sale', method: 'GET' }),
      providesTags: ['StoreSale'],
    }),
    buyProducts: build.mutation({
      query: (products) => ({ url: 'cart/sell', method: 'POST', body: products }),
      invalidatesTags: ['Cart', 'Products'],
    }),
    searchProducts: build.query<{ searchResults: import('../types').Product[] }, { searchQuery: string }>({
      query: ({ searchQuery }) => ({
        url: '/products/search',
        method: 'GET',
        params: { searchQuery },
      }),
    }),
    cancelBuyProducts: build.mutation<unknown, void>({
      query: () => ({ url: 'cart/cancel', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
    getMerchantData: build.query<import('../types').MerchantData, void>({
      query: () => ({ url: '/config/merchant', method: 'GET' }),
    }),
    getScreensaverActive: build.query<{
      filename: string | null;
      type: 'image' | 'video' | null;
      url: string | null;
    }, void>({
      query: () => ({ url: '/screensaver/active', method: 'GET' }),
    }),
  }),
});

export const {
  useLoginStoreMutation,
  useLogoutStoreQuery,
  useGetAllProductsQuery,
  useBuyProductsMutation,
  useSearchProductsQuery,
  useCancelBuyProductsMutation,
  useGetProductByIdQuery,
  useGetSingleProductQuery,
  useLazyGetSingleProductQuery,
  useGetStoreSaleProductsQuery,
  useGetMerchantDataQuery,
  useGetScreensaverActiveQuery,
} = storeApi;
