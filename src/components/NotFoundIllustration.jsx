export default function NotFoundIllustration({ className = "w-full max-w-xl mx-auto" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 600"
      className={className}
      role="img"
      aria-labelledby="title desc"
    >
      <title id="title">404 - Page not found</title>
      <desc id="desc">
        Illustration of a shopping bag and package with a large 404, for e-commerce not found page.
      </desc>

      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="b" />
          <feOffset dx="0" dy="18" result="o" />
          <feBlend in="SourceGraphic" in2="o" />
        </filter>
      </defs>

      {/* Background accent */}
      <rect x="0" y="0" width="900" height="600" rx="20" fill="#FBFDFF" />

      {/* Soft circle behind art */}
      <circle cx="540" cy="250" r="170" fill="url(#g1)" opacity="0.12" />

      {/* Box / package */}
      <g transform="translate(360,280)">
        <rect
          x="-120"
          y="-40"
          width="120"
          height="90"
          rx="10"
          fill="#fff"
          stroke="#E6EEF8"
          strokeWidth="2"
          filter="url(#softShadow)"
        />
        <rect x="-120" y="-40" width="120" height="30" rx="8" fill="#F8FAFF" />
        <line x1="-120" y1="-10" x2="0" y2="-10" stroke="#E6EEF8" strokeWidth="2" />
        <rect x="-100" y="-25" width="20" height="10" fill="#F1F5F9" />
      </g>

      {/* Shopping bag */}
      <g transform="translate(520,310) scale(1)">
        <rect
          x="-90"
          y="-110"
          width="120"
          height="110"
          rx="14"
          fill="#fff"
          stroke="#E9EEF8"
          strokeWidth="2"
          filter="url(#softShadow)"
        />
        <path
          d="M-50 -110 q10 -40 50 -14"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <rect x="-70" y="-70" width="80" height="18" rx="6" fill="url(#g1)" opacity="0.95" />
        <circle cx="-30" cy="-35" r="6" fill="#fff" opacity="0.9" />
      </g>

      {/* Magnifier / search */}
      <g transform="translate(240,360) scale(1)">
        <circle cx="0" cy="-20" r="32" fill="#fff" stroke="#E6EEF8" strokeWidth="4" />
        <line
          x1="23"
          y1="-2"
          x2="58"
          y2="34"
          stroke="#94A3B8"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="0" cy="-20" r="12" fill="none" stroke="#94A3B8" strokeWidth="4" />
      </g>

      {/* Large 404 text */}
      <g transform="translate(160,160) scale(1)">
        <text
          x="0"
          y="0"
          fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
          fontWeight="700"
          fontSize="140"
          fill="#0F172A"
        >
          404
        </text>
        <text
          x="0"
          y="86"
          fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
          fontSize="20"
          fill="#475569"
        >
          Page not found
        </text>
      </g>

      {/* Callout / small text area */}
      <g transform="translate(160,260)">
        <rect x="0" y="0" rx="12" ry="12" width="380" height="110" fill="#FFFFFF" stroke="#E6EEF8" />
        <text
          x="24"
          y="36"
          fontFamily="Inter, system-ui"
          fontWeight="600"
          fontSize="18"
          fill="#0F172A"
        >
          Looks like you’re lost
        </text>
        <text
          x="24"
          y="64"
          fontFamily="Inter, system-ui"
          fontSize="14"
          fill="#64748B"
        >
          Try searching for products or visit the home page to continue shopping.
        </text>
      </g>

      {/* Decorative dots */}
      <g fill="#CBD5E1" opacity="0.7">
        <circle cx="80" cy="520" r="4" />
        <circle cx="110" cy="520" r="3" />
        <circle cx="140" cy="520" r="5" />
        <circle cx="760" cy="520" r="4" />
        <circle cx="730" cy="520" r="3" />
      </g>
    </svg>
  );
}
