import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../redux/features/cartSlice';
import { useEffect, useState } from 'react';
import { setFilter } from '../redux/features/filterSlice';
import { selectReciept } from '../redux/selectors/selectors';
import { Reciept } from './Reciept';
import { clearBuyStatus } from '../redux/features/buyStatus';

export const SuccessPurchasePage = () => {
  const [showCheck, setShowCheck] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const recieptData = useSelector(selectReciept) as Record<string, unknown>;

  useEffect(() => {
    dispatch(clearCart());
    dispatch(setFilter({ name: 'all', category: 0, subcategory: 0, categoryName: '' }));
    dispatch(clearBuyStatus());
  }, []);

  const handleGoToMain = () => navigate('/products');

  // true only when we have actual fiscal documents (with 'fiscal' key), not just { status: 'enqueued' }
  const fiscalResponse = recieptData.fiscalResponse as Record<string, unknown> | undefined;
  const hasFiscalResponse = !!fiscalResponse && Object.values(fiscalResponse).some(
    (v) => v !== null && typeof v === 'object' && 'fiscal' in (v as object),
  );
  // true when at least one fiscal job is still being processed asynchronously
  const isFiscalPending = !hasFiscalResponse && !!fiscalResponse && Object.values(fiscalResponse).some(
    (v) => v !== null && typeof v === 'object' && (v as Record<string, unknown>).status === 'enqueued',
  );
  const isPartSuccess = 'status' in recieptData && recieptData.status === 'part-success';

  return (
    <div className="success-container">
      <div className="success-page-decor-circle">
        <div className="success-page-message-wrapper">
          <div className="success-content">
            <div className="success-icon-wrapper">
              <img src="img/icons/success.svg" alt="" />
            </div>
            <div className="success-text-wrapper">
              <p className="seccess-text">Дякуємо за покупку!</p>
              <p className="seccess-text">Смачного!</p>
            </div>
            <div className="vertical-buttons">
              {hasFiscalResponse ? (
                <button onClick={() => setShowCheck(!showCheck)} className="filled-text-button wide-button">
                  Показати чек
                </button>
              ) : isFiscalPending ? (
                <p className="no-tax-msg">Чек формується...</p>
              ) : isPartSuccess ? (
                <p className="no-tax-msg">Перший платіж успішний. Другий платіж скасовано.</p>
              ) : (
                <p className="no-tax-msg">Відсутній зв'язок з ДПС</p>
              )}
              <button onClick={handleGoToMain} className="filled-text-button wide-button">
                Повернутися на головну сторінку
              </button>
            </div>
          </div>
        </div>
      </div>
      {showCheck && hasFiscalResponse && <Reciept fiscalResponse={fiscalResponse as Record<string, unknown>} />}
    </div>
  );
};
