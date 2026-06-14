import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLoginStoreMutation } from '../api/storeApi';
import { logInStore } from '../redux/features/authSlice';
import { setStoreCartTaxConfig } from '../redux/features/cartSlice';
import { RiseLoader } from 'react-spinners';

export const Authorization = () => {
  const [loginStore, { isSuccess, isError, error }] = useLoginStoreMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    authSubmit();
  }, []);

  const authSubmit = async () => {
    try {
      const result = await loginStore({
        login: import.meta.env.VITE_STORE_LOGIN,
        password: import.meta.env.VITE_STORE_PASSWORD,
      }).unwrap();

      dispatch(logInStore(result));
      dispatch(setStoreCartTaxConfig(null));
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  useEffect(() => {
    if (isSuccess) navigate('/products');
    else if (isError) console.error('Login failed with error:', error);
  }, [isSuccess, isError, error, navigate]);

  return (
    <div className="container">
      <div className="auth-form-wrapper">
        <RiseLoader />
      </div>
    </div>
  );
};
