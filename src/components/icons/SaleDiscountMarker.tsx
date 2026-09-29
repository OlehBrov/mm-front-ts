// Style key → CSS background class (see _products.scss .marker-bg-N). 11/12 (category/
// subcategory fallback discount, no sale_id of its own) reuse 9's "Акція дня" look.
const STYLE_KEY: Record<number, number> = { 11: 9, 12: 9 };

// Types where the badge is just an announcement, not a concrete number, matching the
// original frontend: комбо (7) and дубль (8) only make sense priced in the cart/combo
// screen; новинка (3) and товар дня (6) were deliberately shown without a % as well.
const HIDE_PERCENT: ReadonlySet<number> = new Set([3, 6, 7, 8]);

interface Props {
  saleName?: string | null;
  discountValue?: number;
  badgeType: number;
}

export const SaleDiscountMarker = ({ saleName, discountValue, badgeType }: Props) => {
  if (!badgeType) return null;
  const styleKey = STYLE_KEY[badgeType] ?? badgeType;
  const markerText = (saleName ?? '').toUpperCase();
  const discount =
    !HIDE_PERCENT.has(badgeType) && discountValue ? Math.round(discountValue * 100) : undefined;

  return (
    <div className={`sale-marker marker-bg-${styleKey}`}>
      {!discount && <p>{markerText}</p>}
      {discount && <p>{`${markerText} -${discount}%`}</p>}
    </div>
  );
};
