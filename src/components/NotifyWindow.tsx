import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import SlotCounter from 'react-slot-counter';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNewUser: () => void;
  onPreviousUser: () => void;
  onTimerEnd: () => void;
  getRemainingTime: () => number;
  promptBeforeIdle: number;
  timeout: number;
}

export const NotifyWindow = ({
  isOpen,
  onNewUser,
  onPreviousUser,
  onTimerEnd,
  getRemainingTime,
  promptBeforeIdle,
}: Props) => {
  const [remainingTime, setRemainingTime] = useState(Math.floor(promptBeforeIdle / 1000));

  useEffect(() => {
    const timeLeftUntilIdle = getRemainingTime();
    setRemainingTime(Math.floor(timeLeftUntilIdle / 1000));
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const timeLeftUntilIdle = getRemainingTime();
      const remainingSeconds = Math.floor(timeLeftUntilIdle / 1000);
      setRemainingTime(remainingSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(interval);
        onTimerEnd();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen, getRemainingTime, onTimerEnd]);

  if (!isOpen) return null;

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;

  return ReactDOM.createPortal(
    <div className="portal-overlay">
      <div className="portal-content notify">
        <div className="notify-bg">
          <div className="notify-circle-content-wrapper">
            <div className="circular-progressbar">
              <CircularProgressbarWithChildren
                minValue={0}
                maxValue={Math.floor(promptBeforeIdle / 1000)}
                value={remainingTime}
                strokeWidth={2}
                styles={{
                  root: { width: '100%' },
                  path: { stroke: `rgba(255, 106, 20, ${promptBeforeIdle / 1000 / 100})` },
                  trail: { stroke: 'rgba(255, 106, 20, 0.15)' },
                }}
              >
                <SlotCounter
                  value={remainingTime}
                  sequentialAnimationMode={true}
                  numberSlotClassName="counter-number"
                  valueClassName="counter-value"
                  useMonospaceWidth={true}
                />
              </CircularProgressbarWithChildren>
            </div>
            <div className="double-buttons-wrapper">
              <button onClick={onNewUser} className="footer-counter-btn notify-button">
                Я новий покупець
              </button>
              <button onClick={onPreviousUser} className="footer-counter-btn notify-button">
                Я тут
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    portalRoot
  );
};
