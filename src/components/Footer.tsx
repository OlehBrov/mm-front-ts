import { useLocation } from 'react-router-dom';
import { FooterCartSection } from './FooterCartSection';
import { FooterCartCountSection } from './FooterCartCountSection';

interface Props {
  timerPause: () => void;
  timerReset: () => void;
}

export const Footer = ({ timerPause, timerReset }: Props) => {
  const location = useLocation();
  const cartLocation = location.pathname === '/cart';

  return (
    <footer>
      {!cartLocation && <FooterCartSection />}
      {cartLocation && <FooterCartCountSection timerPause={timerPause} timerReset={timerReset} />}
      <div className="footer-contacts-grid">
        <div className="footer-grid-item">
          <p>Гаряча лінія</p>
          <p>+38 073 233 77 55</p>
        </div>
        <div className="footer-grid-item">
          <p>Технічна підтримка</p>
          <p>0 800 200 515</p>
        </div>
        <div className="footer-grid-item">
          <p>Відділ продажів</p>
          <p>+38 067 355 05 15</p>
        </div>
      </div>
    </footer>
  );
};
