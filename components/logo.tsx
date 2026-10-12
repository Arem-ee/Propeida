import Image from 'next/image'

interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
}

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
        <Image
          src="/propeida-logo.svg"
          alt="Propeida"
          width={size}
          height={size}
          style={{ width: '100%', height: '100%' }}
          priority={false}
        />
      </span>
      {showText && (
        <span className="font-display text-xl font-semibold tracking-tight text-ink">Propeida</span>
      )}
    </div>
  )
}
