export const MaintenanceIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 200"
    fill="none"
    aria-hidden="true"
  >
    {/* Large gear */}
    <path
      d="M85 18h30l4 16a52 52 0 0 1 12.5 7.2l16.2-5.4 15 26-12.4 11.2a52 52 0 0 1 0 14.4L162.7 98.6l-15 26-16.2-5.4A52 52 0 0 1 119 126.8l-4 16H85l-4-16a52 52 0 0 1-12.5-7.2l-16.2 5.4-15-26 12.4-11.2a52 52 0 0 1 0-14.4L37.3 62.6l15-26 16.2 5.4A52 52 0 0 1 81 34.8Z"
      fill="#ffbc0d"
      opacity="0.18"
    />
    <path
      d="M85 18h30l4 16a52 52 0 0 1 12.5 7.2l16.2-5.4 15 26-12.4 11.2a52 52 0 0 1 0 14.4L162.7 98.6l-15 26-16.2-5.4A52 52 0 0 1 119 126.8l-4 16H85l-4-16a52 52 0 0 1-12.5-7.2l-16.2 5.4-15-26 12.4-11.2a52 52 0 0 1 0-14.4L37.3 62.6l15-26 16.2 5.4A52 52 0 0 1 81 34.8Z"
      stroke="#ffbc0d"
      strokeWidth="4"
    />
    {/* Gear center hole */}
    <circle cx="100" cy="73" r="18" fill="#fff" />
    <circle cx="100" cy="73" r="18" stroke="#ffbc0d" strokeWidth="4" fill="none" />

    {/* Wrench handle + head */}
    <rect
      x="88"
      y="110"
      width="24"
      height="72"
      rx="12"
      fill="#ffbc0d"
      opacity="0.22"
    />
    <rect
      x="88"
      y="110"
      width="24"
      height="72"
      rx="12"
      stroke="#ffbc0d"
      strokeWidth="4"
      fill="none"
    />
    {/* Wrench head cross-bar */}
    <rect x="74" y="107" width="52" height="18" rx="9" fill="#ffbc0d" />

    {/* Bolt in wrench head */}
    <circle cx="100" cy="116" r="5" fill="#fff" />
  </svg>
);
