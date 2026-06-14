import { RefObject } from 'react';

export const ThumbVertical = (props: Record<string, unknown>, scroll: RefObject<{ getScrollTop: () => number; getScrollHeight: () => number; getClientHeight: () => number; scrollTop: (value: number) => void }>) => {
  const position = { startY: 0, startScrollTop: 0 };
  let isDragging = false;

  const handleTouchStart = (event: React.TouchEvent) => {
    const container = scroll.current;
    if (!container) return;
    position.startY = event.touches[0].clientY;
    position.startScrollTop = container.getScrollTop();
    isDragging = true;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!isDragging) return;
    const container = scroll.current;
    if (!container) return;
    const currentY = event.touches[0].clientY;
    const deltaY = currentY - position.startY;
    const scrollRatio = container.getScrollHeight() / container.getClientHeight();
    container.scrollTop(position.startScrollTop + deltaY * scrollRatio);
  };

  const handleTouchEnd = () => {
    isDragging = false;
  };

  return (
    <div
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
      className="thumb-vertical"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
};
