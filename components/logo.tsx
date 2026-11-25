interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
}

/** Inline SVG so internal url(#…) references always resolve — no external file dependency. */
export default function Logo({ size = 32, showText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        aria-hidden={false}
        role="img"
        aria-label="Propeida"
        className="block shrink-0 overflow-hidden"
        style={{ width: size, height: size, borderRadius: Math.max(6, Math.round(size * 0.24)) }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 640 640"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2563EB" />
              <stop offset="1" stopColor="#1E3FAE" />
            </linearGradient>
            <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0B1F6B" floodOpacity="0.25" />
            </filter>
            <clipPath id="logo-frame">
              <rect width="640" height="640" />
            </clipPath>
          </defs>
          <g clipPath="url(#logo-frame)">
            <rect width="640" height="640" fill="url(#logo-bg)" />
            <circle cx="560" cy="75" r="175" fill="#FFFFFF" fillOpacity="0.08" />
            <circle cx="15" cy="625" r="170" fill="#FFFFFF" fillOpacity="0.08" />
            <path
              filter="url(#logo-shadow)"
              fill="#FFFFFF"
              d="M179 200 H462 Q474 200 474 212 V285 C474 350 430 395 370 395 H271 C211 395 167 350 167 285 V212 Q167 200 179 200 Z"
            />
            <path fill="#2563EB" fillRule="evenodd" d="M291 250 H328 C348 250 358 264 358 281 C358 298 348 312 328 312 H304 V348 H291 Z M304 262 V300 H327 C339 300 345 292 345 281 C345 270 339 262 327 262 Z" />
            <rect x="138" y="410" width="368" height="14" rx="7" fill="#FFFFFF" fillOpacity="0.7" />
          </g>
        </svg>
      </span>
      {showText && (
        <span className="font-display text-xl font-semibold tracking-tight text-ink">Propeida</span>
      )}
    </div>
  )
}
