import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthorization } from '../redux/selectors/selectors';

interface Props {
  children: ReactNode;
}

export const StoreRoutesController = ({ children }: Props) => {
  const isAuthenticated = useSelector(selectAuthorization);

  return isAuthenticated.isLoggedIn && isAuthenticated.role === 'store' ? (
    <>{children}</>
  ) : (
    <Navigate to="/" />
  );
};
