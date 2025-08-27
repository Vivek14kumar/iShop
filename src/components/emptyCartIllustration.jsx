// components/EmptyCartIllustration.jsx
export default function EmptyCartIllustration({
  size = 240,            // px
  primary = "#111827",   // text/lines (gray-900)
  accent = "#F59E0B",    // highlight (amber-500)
  soft = "#F3F4F6",      // soft bg fill (gray-100)
  className = ""
}) {
  return (
    <svg
      width={size}
      height={(size * 300) / 400}
      viewBox="0 0 400 300"
      role="img"
      aria-labelledby="emptyCartTitle emptyCartDesc"
      className={className}
    >
      <title id="emptyCartTitle">Empty cart illustration</title>
      <desc id="emptyCartDesc">
        A friendly empty shopping cart with subtle highlights and sparkles.
      </desc>

      {/* soft background blob */}
      <defs>
        <linearGradient id="gSoft" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={soft} />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="gAccent" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="#FFC978" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodOpacity="0.15" />
        </filter>
      </defs>

      <ellipse cx="200" cy="235" rx="140" ry="20" fill="#E5E7EB" opacity="0.5" />

      <path
        d="M57 210c-18 0-23-24-6-29l27-8 20-86c.7-2.9 3.3-5 6.3-5h210c3.6 0 6.5 2.9 6.5 6.5 0 3.4-2.6 6.2-6 6.5l-198 16-11 49 176 0c6 0 9.5 6.7 6 11.7l-20 28.3c-1.2 1.7-3.1 2.7-5.2 2.7H57z"
        fill="url(#gSoft)"
        filter="url(#shadow)"
      />

      {/* cart frame */}
      <g stroke={primary} strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M64 97h30" />
        <path d="M94 97l18 92h166l24-34H106" />
        <path d="M114 189l-9-43 214-17" />
      </g>

      {/* handle */}
      <path d="M64 90c0-10 8-18 18-18h12" stroke={primary} strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* basket front panel */}
      <rect x="122" y="128" width="150" height="40" rx="6" fill="url(#gSoft)" stroke={primary} strokeWidth="2" />

      {/* wheels */}
      <g>
        <circle cx="140" cy="210" r="16" fill="#fff" stroke={primary} strokeWidth="3" />
        <circle cx="140" cy="210" r="5" fill={primary} />
        <circle cx="260" cy="210" r="16" fill="#fff" stroke={primary} strokeWidth="3" />
        <circle cx="260" cy="210" r="5" fill={primary} />
      </g>

      {/* accent bags */}
      <g>
        <path d="M176 120h30c4 0 7 3 7 7v28h-44v-28c0-4 3-7 7-7z" fill="url(#gAccent)" />
        <path d="M187 120c0-9 7-16 16-16s16 7 16 16" fill="none" stroke={primary} strokeWidth="2" />
        <rect x="214" y="110" width="12" height="8" rx="2" fill={primary} opacity="0.15" />
      </g>

      {/* sparkles */}
      <g fill={accent}>
        <path d="M320 85l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8z" opacity="0.8">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.8s" repeatCount="indefinite" />
        </path>
        <path d="M95 60l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" opacity="0.6">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3.2s" repeatCount="indefinite" />
        </path>
      </g>

      {/* friendly face */}
      <g>
        <circle cx="198" cy="148" r="10" fill="#fff" stroke={primary} strokeWidth="2" />
        <circle cx="194" cy="146" r="1.8" fill={primary} />
        <circle cx="202" cy="146" r="1.8" fill={primary} />
        <path d="M193 151c2.5 2.5 6.5 2.5 9 0" stroke={primary} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* tiny bounce */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 -2; 0 0"
          dur="3s"
          repeatCount="indefinite"
        />
      </g>
    </svg>
  );
}
