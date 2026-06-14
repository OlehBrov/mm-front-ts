import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { useDispatch, useSelector } from 'react-redux';
import { selectBuyStatus, selectNotify } from '../redux/selectors/selectors';
import { useCancelBuyProductsMutation, useGetStoreSaleProductsQuery } from '../api/storeApi';
import { ProductCard } from './ProductCard';
import { QRCode } from 'react-qr-code';
import { clearBuyStatus } from '../redux/features/buyStatus';
import { clearCart } from '../redux/features/cartSlice';

interface Props {
  onClose: () => void;
}

export const IdleWindow = ({ onClose }: Props) => {
  const { isIdleOpen } = useSelector(selectNotify);
  const { isSuccess, data } = useGetStoreSaleProductsQuery();
  const [cancelFunction] = useCancelBuyProductsMutation();
  const buyStatus = useSelector(selectBuyStatus);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isIdleOpen && buyStatus.status === 'loading') {
      cancelFunction(undefined);
    }
    if (isIdleOpen) {
      dispatch(clearBuyStatus());
      dispatch(clearCart());
    }
  }, [isIdleOpen]);

  if (!isIdleOpen) return null;

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot || !isSuccess || !data) return null;

  const handleCloseButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="portal-overlay">
      <div className="red-decor">
        <div className="idle-circle idle-circle-1" />
        <div className="idle-circle idle-circle-2" />
        <div className="idle-circle idle-circle-3" />
        <div className="light-shadow" />
      </div>
      <div className={`portal-content ${!data.products.length ? 'no-slider' : ''}`}>
        {!data.products.length && (
          <div className="no-sale-idle-logo-wrapper">
            <p className="screen-saver-logo">
              <span className="highlight-logo">NEXT</span>RETAIL
            </p>
          </div>
        )}
        {data.products.length > 0 && (
          <>
            <div className="idle-sale-marker-wrapper">
              <p className="idle-sale-marker-text">Акція дня</p>
            </div>
            <div className="idle-sale-heading-wrapper">
              <p className="idle-sale-heading">Цінопад</p>
              <p className="idle-sale-subheading">
                {data.store_sale_title} {(data.discount ?? 0) * 100}%
              </p>
            </div>
            <div className="portal-cards-grid">
              <Swiper
                modules={[Autoplay]}
                spaceBetween={50}
                slidesPerView={2}
                loop={true}
                autoplay={{ delay: 10000, disableOnInteraction: true }}
              >
                {data.products.map((product) => (
                  <SwiperSlide key={product.id}>
                    <ProductCard product={product} onIdle={true} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </>
        )}
        <div className="idle-sale-button-wrapper">
          <button className="idle-close-button" onClick={handleCloseButton}>
            Дивіться, що є!
          </button>
        </div>
      </div>
      <div className="portal-idle-footer">
        <div className="portal-idle-footer-text-wrapper">
          <p className="portal-idle-footer-heading">Цікавлять комплексні рішення для Вашої компанії?</p>
          <p className="portal-idle-footer-text">
            Ми пропонуємо широкий спектр послуг від встановлення мікромаркетів, вендингових апаратів, кавомашин, пуріфаєрів до їх обслуговування
          </p>
        </div>
        <div className="portal-idle-link-wrapper">
          <div className="portal-idle-link-txt-wrapper">Дізнатись більше можна тут</div>
          <div className="portal-idle-link-code-wrapper">
            <div className="qr-link-wrap">
              <QRCode
                size={180}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                value="https://nextretail.com.ua"
                viewBox="0 0 180 180"
              />
            </div>
            <p>www.nextretail.com.ua</p>
          </div>
        </div>
      </div>
    </div>,
    portalRoot
  );
};
