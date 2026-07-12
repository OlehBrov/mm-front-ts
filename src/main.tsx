import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import { persistor, store } from './redux/store';
import { Provider, useSelector } from 'react-redux';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Products } from './components/Products';
import { Cart } from './components/Cart';
import { Root } from './routes/root';
import { Authorization } from './components/Authorization';
import { StoreRoutesController } from './routes/routesControllers';
import { PersistGate } from 'redux-persist/integration/react';
import { SuccessPurchasePage } from './components/SuccessPurchasePage';
import { SearchResultsPage } from './components/SearchResultsPage';
import { ProductDetails } from './components/ProductDetails';
import { SetupScreen } from './components/SetupScreen';
import { MaintenanceCover } from './components/MaintenanceCover';
import { RootState } from './redux/store';

const MaintenanceWrapper = () => {
  const active = useSelector((s: RootState) => s.maintenance.active);
  return active ? <MaintenanceCover /> : null;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <PersistGate loading={'LOADING...'} persistor={persistor}>
      <HashRouter>
        <MaintenanceWrapper />
        <Routes>
          <Route path="/" element={<Root />}>
            <Route index element={<Authorization />} />
            <Route
              path="/products"
              element={
                <StoreRoutesController>
                  <Products />
                </StoreRoutesController>
              }
            />
            <Route path="/productDetails" element={<ProductDetails />} />
            <Route
              path="results"
              element={
                <StoreRoutesController>
                  <SearchResultsPage />
                </StoreRoutesController>
              }
            />
            <Route
              path="/cart"
              element={
                <StoreRoutesController>
                  <Cart />
                </StoreRoutesController>
              }
            />
            <Route
              path="/success"
              element={
                <StoreRoutesController>
                  <SuccessPurchasePage />
                </StoreRoutesController>
              }
            />
          </Route>
        <Route path="/setup" element={<SetupScreen />} />
        </Routes>
      </HashRouter>
    </PersistGate>
  </Provider>
);
