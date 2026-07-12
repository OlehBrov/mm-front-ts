import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
const storage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
};

import authorizationReducer from './features/authSlice';
import categoriesReducer from './features/categorySlice';
import filterReducer from './features/filterSlice';
import cartReducer from './features/cartSlice';
import showAddConfirmReducer from './features/showAddConfirmSlice';
import searchReducer from './features/searchSlice';
import detailedProductReducer from './features/detailedProductSlice';
import selectedQuantityReducer from './features/selectedQuantitySlice';
import subcategoriesReducer from './features/subcategoriesSlice';
import recieptReducer from './features/recieptSlice';
import buyStatusReducer from './features/buyStatus';
import terminalStateReducer from './features/terminalSlice';
import merchantReducer from './features/merchantsSlice';
import notifyReducer from './features/notifySlice';
import maintenanceReducer from './features/maintenanceSlice';
import setupAuthReducer from './features/setupAuthSlice';
import { storeApi } from '../api/storeApi';

const persistConfig = { key: 'authLocal', storage };

const persistedAuthReducer = persistReducer(persistConfig, authorizationReducer);

export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    filter: filterReducer,
    cart: cartReducer,
    authLocal: persistedAuthReducer,
    [storeApi.reducerPath]: storeApi.reducer,
    showAddConfirm: showAddConfirmReducer,
    search: searchReducer,
    detailedProduct: detailedProductReducer,
    selectedQuantity: selectedQuantityReducer,
    subcategories: subcategoriesReducer,
    reciept: recieptReducer,
    buyStatus: buyStatusReducer,
    terminalState: terminalStateReducer,
    merchant: merchantReducer,
    notify: notifyReducer,
    maintenance: maintenanceReducer,
    setupAuth: setupAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(storeApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
