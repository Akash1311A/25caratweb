export default function BrandMark({ className = '' }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 96" className="h-full w-full drop-shadow-[0_8px_20px_rgba(212,175,55,0.25)]" aria-hidden="true">
        <defs>
          <linearGradient id="brand-ring-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4E1A1" />
            <stop offset="45%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#A66F1F" />
          </linearGradient>
        </defs>

        <ellipse
          cx="42"
          cy="42"
          rx="28"
          ry="18"
          transform="rotate(-35 42 42)"
          fill="none"
          stroke="url(#brand-ring-gold)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <ellipse
          cx="72"
          cy="52"
          rx="28"
          ry="18"
          transform="rotate(35 72 52)"
          fill="none"
          stroke="url(#brand-ring-gold)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M28 36c7-7 16-10 25-11"
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M69 67c10 0 20-4 28-12"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
