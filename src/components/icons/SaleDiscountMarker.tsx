const SALETYPENAMES: Record<number, string> = {
  1: 'знижка',
  2: 'знижка',
  3: 'новинка',
  4: 'знижка',
  5: '',
  6: 'товар дня',
  7: 'комбо',
  8: 'дубль',
  9: 'знижка',
};

interface Props {
  type: number;
  value?: number;
}

export const SaleDiscountMarker = ({ type, value }: Props) => {
  if (!type || type === 0) return null;
  const markerText = (SALETYPENAMES[type] ?? '').toUpperCase();
  let discount: number | undefined;
  if (type === 1 || type === 2 || (type === 4 && value) || (type === 9 && value)) {
    discount = Number(value) * 100;
  }
  return (
    <div className={`sale-marker marker-bg-${type}`}>
      {!discount && <p>{markerText}</p>}
      {discount && <p>{`${markerText} -${discount}%`}</p>}
    </div>
  );
};
