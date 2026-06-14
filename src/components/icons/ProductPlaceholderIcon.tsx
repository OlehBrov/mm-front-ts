export const ProductPlaceholderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" className="product-image">
    <rect width="120" height="120" rx="12" fill="#f5f5f5" />

    {/* Fork */}
    <line x1="28" y1="30" x2="28" y2="50" stroke="#ffbc0d" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="33" y1="30" x2="33" y2="50" stroke="#ffbc0d" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="38" y1="30" x2="38" y2="50" stroke="#ffbc0d" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M28 50 Q33 58 33 65 L33 90" stroke="#ffbc0d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M38 50 Q33 58 33 65" stroke="#ffbc0d" strokeWidth="2.5" strokeLinecap="round" fill="none" />

    {/* Knife */}
    <path d="M87 30 Q95 42 92 55 L87 58 L87 90" stroke="#ffbc0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M87 30 Q87 44 87 58" stroke="#ffbc0d" strokeWidth="2.5" strokeLinecap="round" fill="none" />

    {/* Plate */}
    <circle cx="60" cy="66" r="28" stroke="#ffbc0d" strokeWidth="2.5" fill="white" />
    <circle cx="60" cy="66" r="22" stroke="#ffbc0d" strokeWidth="1.5" fill="none" opacity="0.4" />

    {/* Food on plate — simple burger/sandwich shape */}
    <path d="M46 63 Q60 54 74 63" stroke="#ffbc0d" strokeWidth="3" strokeLinecap="round" fill="none" />
    <rect x="46" y="63" width="28" height="6" rx="1" fill="#ffbc0d" opacity="0.6" />
    <rect x="46" y="69" width="28" height="5" rx="1" fill="#ffbc0d" opacity="0.35" />
    <path d="M46 74 Q60 82 74 74" stroke="#ffbc0d" strokeWidth="3" strokeLinecap="round" fill="none" />
  </svg>
);
