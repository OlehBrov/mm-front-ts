import { useSelector } from 'react-redux';
import { selectNotify } from '../redux/selectors/selectors';

export const NoProduct = () => {
  const { showNoProdError } = useSelector(selectNotify);
  if (!showNoProdError) return null;
  return (
    <div className={`error-wrapper ${showNoProdError ? 'error-visible' : ''}`}>
      <div className="error-text-container">
        <h1>Такого продукту немає</h1>
      </div>
    </div>
  );
};
