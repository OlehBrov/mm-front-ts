import { useSelector } from 'react-redux';
import { selectShowConfirm } from '../redux/selectors/selectors';

export const AddProductConfirm = () => {
  const showAddConfirm = useSelector(selectShowConfirm);
  if (!showAddConfirm.show) return null;
  return (
    <div className={`error-wrapper ${showAddConfirm.show ? 'error-visible' : ''}`}>
      <div className={`error-text-container ${showAddConfirm.isSuccess ? '' : 'bg-red'}`}>
        <div className="confirm-img-wrapper">
          <img src={showAddConfirm.product?.product_image} alt="" />
        </div>
        <h1 style={{ fontSize: '50px' }}>
          {showAddConfirm.product?.product_name} {showAddConfirm.message}
        </h1>
      </div>
    </div>
  );
};
