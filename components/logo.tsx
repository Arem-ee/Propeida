interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
}

export default function Logo({ size = 32, showText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" role="img" aria-label="Propeida">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
        </defs>
        <rect width={32} height={32} rx={8} fill="url(#lg)" />
        <rect x={6} y={8} width={20} height={14} rx={2} fill="white" />
        <text
          x={16}
          y={20}
          textAnchor="middle"
          fill="#2563eb"
          fontSize={10}
          fontWeight={900}
          fontFamily="system-ui, sans-serif"
        >
          P
        </text>
        <rect x={4} y={23} width={24} height={2} rx={1} fill="rgba(255,255,255,0.5)" />
      </svg>
      {showText && (
        <span className="text-xl font-extrabold tracking-tight text-gray-900">Propeida</span>
      )}
    </div>
  )
}
