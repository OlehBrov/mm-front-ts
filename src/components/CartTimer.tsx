import { useEffect, useRef, useState } from 'react';
import SlotCounter from 'react-slot-counter';

interface Props {
  start: boolean;
  currentPaymentCount: number;
}

export const CartTimer = ({ start, currentPaymentCount }: Props) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPaymentCount = useRef(currentPaymentCount);

  const startCounter = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsedTime(0);

    intervalRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    if (start) startCounter();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [start]);

  useEffect(() => {
    if (prevPaymentCount.current === 1 && currentPaymentCount === 2 && start) {
      startCounter();
    }
    prevPaymentCount.current = currentPaymentCount;
  }, [currentPaymentCount, start]);

  return (
    <div className="cart-slot-wrapper">
      <p className="cart-counter-heading">Час на оплату:</p>
      <SlotCounter
        value={elapsedTime}
        sequentialAnimationMode={true}
        numberSlotClassName="counter-number"
        valueClassName="counter-value"
        useMonospaceWidth={true}
      />
    </div>
  );
};
