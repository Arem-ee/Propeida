import { useId } from 'react'
import type { SceneKey } from '@/lib/explore/visual-scenes'
import { SCENE_NAMES } from '@/lib/explore/visual-scenes'

interface SceneProps {
  uid: string
}

function Sky({ id, from, to }: { id: string; from: string; to: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={from} />
        <stop offset="100%" stopColor={to} />
      </linearGradient>
    </defs>
  )
}

function SkyRect({ id }: { id: string }) {
  return <rect width="400" height="300" fill={`url(#${id})`} />
}

function Sun({
  cx,
  cy,
  r,
  fill,
  glow,
  opacity = 1,
}: {
  cx: number
  cy: number
  r: number
  fill: string
  glow?: number
  opacity?: number
}) {
  return (
    <g>
      {glow ? <circle cx={cx} cy={cy} r={glow} fill={fill} opacity={0.25} /> : null}
      <circle cx={cx} cy={cy} r={r} fill={fill} opacity={opacity} />
    </g>
  )
}

function Ground({
  fill,
  y = 250,
  height = 50,
  opacity = 1,
}: {
  fill: string
  y?: number
  height?: number
  opacity?: number
}) {
  return <rect x="0" y={y} width="400" height={height} fill={fill} opacity={opacity} />
}

function PatternGrid({ id, stroke, opacity = 0.16 }: { id: string; stroke: string; opacity?: number }) {
  return (
    <g>
      <defs>
        <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={stroke} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill={`url(#${id})`} opacity={opacity} />
    </g>
  )
}

function PowerScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#0f172a" to="#1e3a5f" />
      <SkyRect id={uid} />
      <Sun cx={52} cy={58} r={26} fill="#f59e0b" glow={46} />
      <path d="M140 118 Q 210 178 280 118" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.7" />
      <path d="M120 132 Q 200 202 300 132" fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity="0.5" />
      <path d="M106 250 L140 118 L174 250" fill="none" stroke="#0b1220" strokeWidth="10" strokeLinejoin="round" />
      <path d="M122 172 H158" stroke="#0b1220" strokeWidth="5" />
      <path d="M116 204 H164" stroke="#0b1220" strokeWidth="5" />
      <path d="M140 118 V 104" stroke="#0b1220" strokeWidth="6" />
      <path d="M246 250 L280 118 L314 250" fill="none" stroke="#0b1220" strokeWidth="10" strokeLinejoin="round" />
      <path d="M262 172 H298" stroke="#0b1220" strokeWidth="5" />
      <path d="M256 204 H304" stroke="#0b1220" strokeWidth="5" />
      <path d="M280 118 V 104" stroke="#0b1220" strokeWidth="6" />
      <Ground fill="#0b1220" />
    </g>
  )
}

function SolarScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#e0f2fe" to="#f0f9ff" />
      <SkyRect id={uid} />
      <Sun cx={330} cy={60} r={26} fill="#fbbf24" glow={44} />
      <rect x="60" y="140" width="84" height="92" fill="#f8fafc" />
      <path d="M52 145 L102 100 L152 145 Z" fill="#334155" />
      <rect x="94" y="196" width="16" height="36" fill="#94a3b8" />
      <g transform="rotate(-8 248 130)">
        <rect x="200" y="120" width="48" height="26" rx="4" fill="#1e293b" />
        <rect x="206" y="126" width="36" height="4" fill="#38bdf8" opacity="0.8" />
        <rect x="206" y="136" width="36" height="4" fill="#38bdf8" opacity="0.8" />
        <rect x="255" y="120" width="48" height="26" rx="4" fill="#1e293b" />
        <rect x="261" y="126" width="36" height="4" fill="#38bdf8" opacity="0.8" />
        <rect x="261" y="136" width="36" height="4" fill="#38bdf8" opacity="0.8" />
        <rect x="310" y="120" width="48" height="26" rx="4" fill="#1e293b" />
        <rect x="316" y="126" width="36" height="4" fill="#38bdf8" opacity="0.8" />
        <rect x="316" y="136" width="36" height="4" fill="#38bdf8" opacity="0.8" />
      </g>
      <path d="M224 158 V 244" stroke="#475569" strokeWidth="3" />
      <path d="M279 158 V 244" stroke="#475569" strokeWidth="3" />
      <path d="M334 158 V 244" stroke="#475569" strokeWidth="3" />
      <Ground fill="#fef9c3" y={244} height={56} />
    </g>
  )
}

function TelecomScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#ecfeff" to="#f8fafc" />
      <SkyRect id={uid} />
      <path d="M160 250 L180 70 L200 250" fill="none" stroke="#64748b" strokeWidth="4" strokeLinejoin="round" />
      <path d="M166 210 H194" stroke="#64748b" strokeWidth="3" />
      <path d="M170 180 H190" stroke="#64748b" strokeWidth="3" />
      <path d="M173 150 H187" stroke="#64748b" strokeWidth="3" />
      <path d="M180 58 A 22 22 0 0 1 180 102" fill="none" stroke="#0f766e" strokeWidth="6" />
      <path d="M180 80 H 206" stroke="#334155" strokeWidth="3" />
      <circle cx="208" cy="80" r="4" fill="#334155" />
      <path d="M232 72 a 24 24 0 0 1 0 48" fill="none" stroke="#22d3ee" strokeWidth="3" />
      <path d="M232 62 a 34 34 0 0 1 0 68" fill="none" stroke="#67e8f9" strokeWidth="3" />
      <path d="M232 52 a 44 44 0 0 1 0 88" fill="none" stroke="#a5f3fc" strokeWidth="3" />
      <rect x="40" y="212" width="80" height="38" fill="#94a3b8" />
      <rect x="260" y="192" width="70" height="58" fill="#94a3b8" />
      <rect x="272" y="202" width="8" height="10" fill="#e0f2fe" />
      <rect x="288" y="202" width="8" height="10" fill="#e0f2fe" />
      <rect x="272" y="220" width="8" height="10" fill="#e0f2fe" />
      <Ground fill="#e0f2fe" />
    </g>
  )
}

function FactoryScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#ffedd5" to="#fed7aa" />
      <SkyRect id={uid} />
      <Sun cx={350} cy={55} r={18} fill="#f97316" glow={34} />
      <rect x="96" y="108" width="14" height="34" fill="#1c1917" />
      <rect x="166" y="92" width="14" height="50" fill="#1c1917" />
      <rect x="246" y="116" width="14" height="26" fill="#1c1917" />
      <circle cx="103" cy="92" r="10" fill="#94a3b8" opacity="0.35" />
      <circle cx="107" cy="74" r="13" fill="#94a3b8" opacity="0.35" />
      <circle cx="173" cy="72" r="11" fill="#94a3b8" opacity="0.35" />
      <circle cx="177" cy="54" r="14" fill="#94a3b8" opacity="0.35" />
      <circle cx="253" cy="100" r="9" fill="#94a3b8" opacity="0.35" />
      <circle cx="257" cy="84" r="11" fill="#94a3b8" opacity="0.35" />
      <rect x="40" y="142" width="320" height="8" fill="#475569" />
      <rect x="40" y="150" width="320" height="100" fill="#334155" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={64 + i * 50} y="172" width="20" height="26" rx="2" fill="#fbbf24" />
      ))}
      <Ground fill="#1c1917" />
    </g>
  )
}

function OilgasScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#e2e8f0" to="#f8fafc" />
      <SkyRect id={uid} />
      <path d="M110 250 L170 110 L230 250" fill="none" stroke="#475569" strokeWidth="8" strokeLinejoin="round" />
      <path d="M122 220 H218" stroke="#475569" strokeWidth="4" />
      <path d="M134 192 H206" stroke="#475569" strokeWidth="4" />
      <path d="M148 164 H192" stroke="#475569" strokeWidth="4" />
      <circle cx="170" cy="100" r="6" fill="#334155" />
      <path d="M170 100 V 150" stroke="#334155" strokeWidth="3" />
      <path d="M162 150 h 16 v 10 h -16 Z" fill="#334155" />
      <path d="M268 148 c 14 -22 26 -6 26 6 a 26 26 0 0 1 -52 0 c 0 -8 10 -14 26 -6 Z" fill="#f97316" />
      <path d="M268 158 c 8 -12 15 -4 15 2 a 15 15 0 0 1 -30 0 c 0 -5 6 -9 15 -2 Z" fill="#fde047" />
      <rect x="290" y="180" width="70" height="70" rx="6" fill="#64748b" />
      <path d="M290 180 a 35 35 0 0 1 70 0 Z" fill="#475569" />
      <path d="M290 205 H 252" stroke="#334155" strokeWidth="4" />
      <Ground fill="#d6d3d1" />
    </g>
  )
}

function ConstructionScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#dbeafe" to="#eff6ff" />
      <SkyRect id={uid} />
      <Sun cx={330} cy={55} r={22} fill="#fbbf24" glow={38} />
      <rect x="100" y="60" width="10" height="190" fill="#1e40af" />
      <rect x="110" y="60" width="210" height="8" fill="#1e40af" />
      <rect x="96" y="68" width="20" height="24" fill="#334155" />
      <rect x="250" y="58" width="18" height="12" fill="#1e40af" />
      <path d="M259 70 V 150" stroke="#334155" strokeWidth="2" />
      <path d="M244 150 h 30 v 24 h -30 Z" rx="4" fill="#f59e0b" />
      <rect x="210" y="118" width="130" height="12" fill="#475569" />
      <path d="M218 118 v -14 h 10 v 14" stroke="#475569" strokeWidth="3" fill="none" />
      <path d="M258 118 v -14 h 10 v 14" stroke="#475569" strokeWidth="3" fill="none" />
      <path d="M298 118 v -14 h 10 v 14" stroke="#475569" strokeWidth="3" fill="none" />
      <rect x="210" y="130" width="130" height="120" fill="#94a3b8" />
      <rect x="220" y="140" width="16" height="110" fill="#cbd5e1" />
      <rect x="265" y="140" width="16" height="110" fill="#cbd5e1" />
      <rect x="310" y="140" width="16" height="110" fill="#cbd5e1" />
      <Ground fill="#e2e8f0" />
    </g>
  )
}

function AutomationScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#f1f5f9" to="#fafaf9" />
      <SkyRect id={uid} />
      <rect x="90" y="210" width="70" height="40" rx="6" fill="#334155" />
      <rect x="110" y="150" width="14" height="60" fill="#6366f1" />
      <circle cx="117" cy="150" r="10" fill="#818cf8" />
      <rect x="105" y="90" width="14" height="58" rx="4" fill="#818cf8" transform="rotate(-25 117 150)" />
      <path d="M140 88 l 14 -8 v 14 Z" fill="#6366f1" />
      <path d="M140 88 l 14 8 v -14 Z" fill="#6366f1" />
      <circle cx="166" cy="86" r="12" fill="#f59e0b" />
      <rect x="160" y="72" width="12" height="4" fill="#f59e0b" />
      <rect x="160" y="96" width="12" height="4" fill="#f59e0b" />
      <rect x="154" y="80" width="4" height="12" fill="#f59e0b" />
      <rect x="174" y="80" width="4" height="12" fill="#f59e0b" />
      <rect x="190" y="216" width="170" height="16" rx="8" fill="#94a3b8" />
      {Array.from({ length: 5 }, (_, i) => (
        <circle key={i} cx={205 + i * 35} cy="224" r="5" fill="#e2e8f0" />
      ))}
      <rect x="215" y="190" width="26" height="26" fill="#475569" />
      <rect x="262" y="186" width="26" height="30" fill="#57534e" />
      <rect x="305" y="190" width="26" height="26" fill="#475569" />
      <circle cx="330" cy="140" r="32" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="8 8" opacity="0.8" />
      <circle cx="330" cy="140" r="26" fill="#f59e0b" />
      <circle cx="330" cy="140" r="8" fill="#0f172a" />
      <Ground fill="#e2e8f0" />
    </g>
  )
}

function CircuitScene({ uid }: SceneProps) {
  return (
    <g>
      <rect width="400" height="300" fill="#0f172a" />
      <PatternGrid id={uid} stroke="#1e293b" />
      <rect x="150" y="110" width="100" height="80" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      <rect x="165" y="125" width="70" height="50" rx="3" fill="#0b1220" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={158 + i * 12} y="102" width="8" height="8" rx="1" fill="#64748b" />
          <rect x={158 + i * 12} y="190" width="8" height="8" rx="1" fill="#64748b" />
        </g>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect x="142" y={118 + i * 12} width="8" height="8" rx="1" fill="#64748b" />
          <rect x="250" y={118 + i * 12} width="8" height="8" rx="1" fill="#64748b" />
        </g>
      ))}
      <path d="M205 110 V 70 H 330 V 100" stroke="#22d3ee" strokeWidth="3" fill="none" />
      <path d="M150 150 H 90 V 200" stroke="#34d399" strokeWidth="3" fill="none" />
      <path d="M250 150 H 330 V 230" stroke="#f472b6" strokeWidth="3" fill="none" />
      <circle cx="330" cy="100" r="5" fill="#22d3ee" />
      <circle cx="90" cy="200" r="5" fill="#34d399" />
      <circle cx="330" cy="230" r="5" fill="#f472b6" />
    </g>
  )
}

function HealthScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#ccfbf1" to="#f0fdfa" />
      <SkyRect id={uid} />
      <path
        d="M20 150 H 90 l 14 -28 16 52 16 -34 14 26 12 -16 H 380"
        fill="none"
        stroke="#0d9488"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="120" y="110" width="160" height="140" rx="8" fill="#0f766e" />
      <rect x="190" y="128" width="20" height="72" rx="3" fill="#ffffff" />
      <rect x="174" y="144" width="52" height="20" rx="3" fill="#ffffff" />
      <rect x="135" y="138" width="16" height="16" rx="2" fill="#99f6e4" />
      <rect x="250" y="138" width="16" height="16" rx="2" fill="#99f6e4" />
      <rect x="135" y="188" width="16" height="16" rx="2" fill="#99f6e4" />
      <rect x="250" y="188" width="16" height="16" rx="2" fill="#99f6e4" />
      <rect x="180" y="200" width="50" height="10" fill="#134e4a" />
      <rect x="194" y="210" width="22" height="40" rx="10" fill="#0b5e54" />
      <Ground fill="#f0fdfa" />
    </g>
  )
}

function LabScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#f0f9ff" to="#eff6ff" />
      <SkyRect id={uid} />
      <rect x="152" y="78" width="16" height="12" rx="3" fill="#64748b" />
      <path d="M150 90 H 170 V 140 L 210 210 a 20 20 0 0 1 -40 0 L 150 140 Z" fill="none" stroke="#38bdf8" strokeWidth="5" />
      <path d="M170 168 L 196 205 a 12 12 0 0 1 -24 0 Z" fill="#f472b6" opacity="0.9" />
      <circle cx="170" cy="120" r="4" fill="#bae6fd" />
      <circle cx="162" cy="106" r="3" fill="#bae6fd" />
      <path d="M275 115 L330 150 M330 150 L280 195 M280 195 L240 155 M240 155 L275 115" stroke="#94a3b8" strokeWidth="4" />
      <circle cx="275" cy="115" r="10" fill="#64748b" />
      <circle cx="330" cy="150" r="10" fill="#64748b" />
      <circle cx="280" cy="195" r="10" fill="#64748b" />
      <circle cx="240" cy="155" r="10" fill="#64748b" />
      <Ground fill="#f1f5f9" />
    </g>
  )
}

function CourtScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#eef2ff" to="#f5f3ff" />
      <SkyRect id={uid} />
      <path d="M60 110 L200 60 L340 110 Z" fill="#c7d2fe" />
      <rect x="90" y="110" width="22" height="140" fill="#f8fafc" stroke="#c7d2fe" strokeWidth="3" />
      <rect x="170" y="110" width="22" height="140" fill="#f8fafc" stroke="#c7d2fe" strokeWidth="3" />
      <rect x="250" y="110" width="22" height="140" fill="#f8fafc" stroke="#c7d2fe" strokeWidth="3" />
      <rect x="82" y="238" width="38" height="12" fill="#c7d2fe" />
      <rect x="162" y="238" width="38" height="12" fill="#c7d2fe" />
      <rect x="242" y="238" width="38" height="12" fill="#c7d2fe" />
      <path d="M200 246 V 192" stroke="#d97706" strokeWidth="5" />
      <rect x="176" y="188" width="48" height="6" rx="3" fill="#d97706" />
      <path d="M176 194 l -16 22 h 26 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
      <path d="M224 194 l 16 22 h -26 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
      <circle cx="200" cy="182" r="5" fill="#d97706" />
      <Ground fill="#e0e7ff" />
    </g>
  )
}

function CodeScene({ uid }: SceneProps) {
  return (
    <g>
      <rect width="400" height="300" fill="#1e1b4b" />
      <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#312e81" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </linearGradient>
      <rect width="400" height="300" fill={`url(#${uid})`} opacity="0.6" />
      <rect x="50" y="50" width="300" height="200" rx="14" fill="#0f172a" stroke="#4338ca" strokeWidth="3" />
      <circle cx="74" cy="67" r="5" fill="#f472b6" />
      <circle cx="92" cy="67" r="5" fill="#facc15" />
      <circle cx="110" cy="67" r="5" fill="#4ade80" />
      <rect x="130" y="58" width="180" height="18" rx="9" fill="#312e81" />
      <rect x="70" y="106" width="140" height="12" rx="4" fill="#818cf8" />
      <rect x="70" y="120" width="200" height="12" rx="4" fill="#22d3ee" />
      <rect x="70" y="134" width="120" height="12" rx="4" fill="#f472b6" />
      <rect x="70" y="148" width="220" height="12" rx="4" fill="#94a3b8" />
      <rect x="70" y="162" width="160" height="12" rx="4" fill="#818cf8" />
      <rect x="70" y="176" width="210" height="12" rx="4" fill="#22d3ee" />
      <rect x="70" y="190" width="90" height="12" rx="4" fill="#f472b6" />
      <rect x="70" y="204" width="180" height="12" rx="4" fill="#94a3b8" />
      <rect x="70" y="218" width="130" height="12" rx="4" fill="#818cf8" />
      <rect x="240" y="218" width="10" height="12" rx="2" fill="#f59e0b" />
    </g>
  )
}

function DevicesScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#f5f3ff" to="#faf5ff" />
      <SkyRect id={uid} />
      <rect x="60" y="90" width="130" height="90" rx="10" fill="#1e293b" />
      <rect x="72" y="102" width="60" height="6" rx="3" fill="#818cf8" />
      <rect x="72" y="116" width="80" height="6" rx="3" fill="#818cf8" />
      <rect x="72" y="130" width="50" height="6" rx="3" fill="#f472b6" />
      <rect x="72" y="144" width="70" height="6" rx="3" fill="#818cf8" />
      <path d="M52 180 H 198 L 186 204 H 64 Z" fill="#334155" />
      <rect x="270" y="70" width="56" height="180" rx="16" fill="#1e293b" />
      <rect x="278" y="82" width="40" height="130" rx="8" fill="#0b1220" />
      <rect x="285" y="88" width="26" height="6" rx="3" fill="#1e293b" />
      <rect x="284" y="102" width="28" height="6" rx="3" fill="#22d3ee" />
      <rect x="284" y="116" width="24" height="6" rx="3" fill="#818cf8" />
      <rect x="284" y="130" width="30" height="6" rx="3" fill="#f472b6" />
      <rect x="284" y="144" width="20" height="6" rx="3" fill="#818cf8" />
      <rect x="292" y="200" width="20" height="4" rx="2" fill="#334155" />
      <path d="M190 140 Q 230 100 270 130" fill="none" stroke="#a78bfa" strokeWidth="3" strokeDasharray="5 5" />
      <circle cx="232" cy="104" r="4" fill="#a78bfa" />
      <Ground fill="#ede9fe" />
    </g>
  )
}

function FinanceScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#ecfdf5" to="#f0fdf4" />
      <SkyRect id={uid} />
      <path d="M120 120 L200 76 L280 120 Z" fill="#047857" />
      <rect x="130" y="120" width="140" height="130" rx="6" fill="#059669" />
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={144 + i * 38} y="142" width="12" height="108" rx="2" fill="#d1fae5" />
      ))}
      <rect x="186" y="212" width="28" height="38" rx="10" fill="#064e3b" />
      <path d="M40 240 L120 200 L180 214 L250 150 L310 160 L360 96" fill="none" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M352 108 L360 96 L374 106 Z" fill="#10b981" />
      <circle cx="60" cy="210" r="14" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
      <circle cx="60" cy="186" r="14" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
      <circle cx="60" cy="162" r="14" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
      <Ground fill="#d1fae5" />
    </g>
  )
}

function EducationScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#e0f2fe" to="#f0f9ff" />
      <SkyRect id={uid} />
      <g transform="rotate(-12 210 126)">
        <rect x="180" y="118" width="60" height="14" rx="2" fill="#1d4ed8" />
      </g>
      <path d="M196 130 H 224 V 152 Q 210 160 196 152 Z" fill="#2563eb" />
      <path d="M240 126 L 262 140" stroke="#fbbf24" strokeWidth="3" />
      <circle cx="262" cy="140" r="4" fill="#f59e0b" />
      <rect x="70" y="210" width="90" height="22" rx="4" fill="#2563eb" />
      <rect x="76" y="190" width="84" height="20" rx="4" fill="#38bdf8" />
      <rect x="82" y="172" width="78" height="18" rx="4" fill="#f472b6" />
      <rect x="300" y="150" width="20" height="72" rx="10" fill="#fde68a" stroke="#f59e0b" strokeWidth="3" />
      <circle cx="310" cy="150" r="4" fill="#f59e0b" />
      <circle cx="310" cy="222" r="4" fill="#f59e0b" />
      <Ground fill="#e0f2fe" />
    </g>
  )
}

function MediaScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#fff1f2" to="#fff5f6" />
      <SkyRect id={uid} />
      <rect x="140" y="130" width="120" height="90" rx="16" fill="#be123c" />
      <rect x="160" y="118" width="40" height="16" rx="6" fill="#9f1239" />
      <rect x="240" y="122" width="20" height="14" rx="4" fill="#be123c" />
      <circle cx="200" cy="175" r="28" fill="#0f172a" />
      <circle cx="200" cy="175" r="20" fill="#334155" />
      <circle cx="200" cy="175" r="12" fill="#fda4af" />
      <rect x="262" y="130" width="14" height="10" rx="2" fill="#f8fafc" />
      <path d="M252 148 a 34 34 0 0 1 0 54" fill="none" stroke="#fb7185" strokeWidth="3" />
      <path d="M262 138 a 48 48 0 0 1 0 74" fill="none" stroke="#fda4af" strokeWidth="3" />
      <path d="M272 128 a 62 62 0 0 1 0 94" fill="none" stroke="#fecdd3" strokeWidth="3" />
      <Ground fill="#ffe4e6" />
    </g>
  )
}

function EstateScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#fde68a" to="#fecaca" />
      <SkyRect id={uid} />
      <Sun cx={200} cy={168} r={34} fill="#f97316" glow={50} opacity={0.85} />
      <rect x="18" y="80" width="6" height="170" fill="#0f172a" />
      <rect x="24" y="80" width="70" height="6" fill="#0f172a" />
      <rect x="60" y="120" width="50" height="130" fill="#1e293b" />
      <rect x="68" y="132" width="6" height="8" fill="#fbbf24" />
      <rect x="80" y="148" width="6" height="8" fill="#fbbf24" />
      <rect x="120" y="90" width="44" height="160" fill="#334155" />
      <rect x="130" y="100" width="6" height="8" fill="#fbbf24" />
      <rect x="142" y="110" width="6" height="8" fill="#fbbf24" />
      <rect x="130" y="122" width="6" height="8" fill="#fbbf24" />
      <rect x="142" y="134" width="6" height="8" fill="#fbbf24" />
      <rect x="170" y="140" width="40" height="110" fill="#1e293b" />
      <rect x="178" y="150" width="6" height="8" fill="#fbbf24" />
      <rect x="230" y="70" width="54" height="180" fill="#334155" />
      <rect x="240" y="82" width="6" height="8" fill="#fbbf24" />
      <rect x="254" y="96" width="6" height="8" fill="#fbbf24" />
      <rect x="240" y="112" width="6" height="8" fill="#fbbf24" />
      <rect x="254" y="128" width="6" height="8" fill="#fbbf24" />
      <rect x="300" y="110" width="44" height="140" fill="#1e293b" />
      <rect x="308" y="120" width="6" height="8" fill="#fbbf24" />
      <rect x="320" y="132" width="6" height="8" fill="#fbbf24" />
      <rect x="308" y="146" width="6" height="8" fill="#fbbf24" />
      <Ground fill="#1c1917" />
    </g>
  )
}

function RetailScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#fdf2f8" to="#fdf4ff" />
      <SkyRect id={uid} />
      <rect x="60" y="80" width="240" height="26" rx="6" fill="#9d174d" />
      <rect x="90" y="88" width="180" height="10" rx="4" fill="#fbcfe8" />
      <rect x="60" y="110" width="240" height="34" fill="#db2777" />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={70 + i * 46} y="110" width="22" height="34" fill="#fdf2f8" opacity="0.85" />
      ))}
      <rect x="70" y="144" width="100" height="90" rx="6" fill="#1e293b" />
      <path d="M80 170 h 40 M80 184 h 40 M80 198 h 30" stroke="#fbcfe8" strokeWidth="5" strokeLinecap="round" />
      <rect x="190" y="144" width="60" height="90" rx="8" fill="#831843" />
      <rect x="204" y="160" width="32" height="8" rx="4" fill="#fbcfe8" opacity="0.7" />
      <path d="M306 180 a 8 8 0 0 1 16 0" fill="none" stroke="#831843" strokeWidth="4" />
      <rect x="300" y="180" width="28" height="50" rx="6" fill="#831843" />
      <path d="M336 172 a 7 7 0 0 1 14 0" fill="none" stroke="#be123c" strokeWidth="4" />
      <rect x="330" y="172" width="26" height="44" rx="6" fill="#be123c" />
      <path d="M362 190 a 6 6 0 0 1 12 0" fill="none" stroke="#f472b6" strokeWidth="4" />
      <rect x="356" y="190" width="22" height="36" rx="5" fill="#f472b6" />
      <Ground fill="#fce7f3" />
    </g>
  )
}

function TransportScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#e0f2fe" to="#eff6ff" />
      <SkyRect id={uid} />
      <Sun cx={90} cy={60} r={24} fill="#facc15" glow={40} />
      <path d="M0 205 Q 100 172 200 205 T 400 205 Z" fill="#bae6fd" opacity="0.6" />
      <rect x="110" y="150" width="140" height="55" rx="6" fill="#2563eb" />
      <rect x="118" y="158" width="124" height="12" fill="#93c5fd" opacity="0.8" />
      <rect x="250" y="150" width="40" height="55" rx="6" fill="#1d4ed8" />
      <rect x="254" y="156" width="32" height="18" rx="4" fill="#bfdbfe" />
      <circle cx="160" cy="212" r="16" fill="#0f172a" />
      <circle cx="160" cy="212" r="6" fill="#94a3b8" />
      <circle cx="270" cy="212" r="16" fill="#0f172a" />
      <circle cx="270" cy="212" r="6" fill="#94a3b8" />
      <rect x="40" y="178" width="46" height="20" rx="8" fill="#f59e0b" />
      <circle cx="54" cy="200" r="8" fill="#0f172a" />
      <circle cx="74" cy="200" r="8" fill="#0f172a" />
      <rect x="0" y="205" width="400" height="45" fill="#334155" />
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={40 + i * 100} y="224" width="36" height="8" rx="4" fill="#f8fafc" />
      ))}
      <Ground fill="#f8fafc" y={250} height={50} opacity={0.4} />
    </g>
  )
}

function ResearchScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#f8fafc" to="#f1f5f9" />
      <SkyRect id={uid} />
      <rect x="60" y="180" width="120" height="70" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
      <rect x="72" y="192" width="80" height="6" rx="3" fill="#cbd5e1" />
      <rect x="72" y="206" width="60" height="6" rx="3" fill="#cbd5e1" />
      <rect x="72" y="220" width="72" height="6" rx="3" fill="#cbd5e1" />
      <path d="M90 70 H 104 V 110 L 130 170 a 14 14 0 0 1 -28 0 L 90 110 Z" fill="none" stroke="#06b6d4" strokeWidth="4" />
      <path d="M104 132 L 128 168 a 10 10 0 0 1 -20 0 L 104 132 Z" fill="#a5f3fc" />
      <path d="M250 90 L310 120 M310 120 L280 170 M280 170 L230 140 M230 140 L250 90" stroke="#94a3b8" strokeWidth="4" />
      <circle cx="280" cy="130" r="60" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="6 6" />
      <circle cx="250" cy="90" r="9" fill="#64748b" />
      <circle cx="310" cy="120" r="9" fill="#64748b" />
      <circle cx="280" cy="170" r="9" fill="#64748b" />
      <circle cx="230" cy="140" r="9" fill="#64748b" />
      <circle cx="200" cy="205" r="26" fill="none" stroke="#475569" strokeWidth="8" />
      <path d="M220 224 L 250 254" stroke="#475569" strokeWidth="10" strokeLinecap="round" />
      <Ground fill="#e2e8f0" />
    </g>
  )
}

function MiningScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#fef3c7" to="#fffbeb" />
      <SkyRect id={uid} />
      <Sun cx={330} cy={60} r={22} fill="#f59e0b" glow={38} />
      <path d="M60 250 L200 70 L340 250 Z" fill="#b45309" />
      <path d="M118 200 L200 110 L282 200 Z" fill="#92400e" />
      <path d="M160 250 L200 205 L240 250 Z" fill="#78350f" />
      <rect x="40" y="230" width="200" height="8" rx="4" fill="#57534e" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={52 + i * 30} y="226" width="5" height="16" fill="#44403c" />
      ))}
      <rect x="70" y="208" width="60" height="24" rx="6" fill="#78350f" />
      <circle cx="86" cy="236" r="7" fill="#292524" />
      <circle cx="114" cy="236" r="7" fill="#292524" />
      <path d="M262 200 L 302 158" stroke="#57534e" strokeWidth="6" strokeLinecap="round" />
      <path d="M298 150 l 16 -6 l -8 14 Z" fill="#57534e" />
      <Ground fill="#451a03" />
    </g>
  )
}

function PublicScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#eef2ff" to="#f8fafc" />
      <SkyRect id={uid} />
      <path d="M80 150 L200 100 L320 150 Z" fill="#475569" />
      <path d="M170 100 a 30 30 0 0 1 60 0 Z" fill="#64748b" />
      <path d="M200 100 V 56" stroke="#1e293b" strokeWidth="3" />
      <rect x="204" y="56" width="30" height="20" fill="#2563eb" />
      <rect x="90" y="150" width="220" height="100" fill="#334155" />
      <rect x="110" y="162" width="16" height="88" fill="#e0e7ff" rx="2" />
      <rect x="152" y="162" width="16" height="88" fill="#e0e7ff" rx="2" />
      <rect x="232" y="162" width="16" height="88" fill="#e0e7ff" rx="2" />
      <rect x="274" y="162" width="16" height="88" fill="#e0e7ff" rx="2" />
      <rect x="90" y="250" width="220" height="6" fill="#334155" />
      <Ground fill="#e2e8f0" y={256} height={44} />
    </g>
  )
}

function AgricultureScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#ecfccb" to="#f7fee7" />
      <SkyRect id={uid} />
      <Sun cx={330} cy={60} r={24} fill="#facc15" glow={42} />
      <path d="M0 196 Q 200 176 400 196 L 400 300 L 0 300 Z" fill="#d9f99d" />
      <path d="M0 224 Q 200 208 400 224 L 400 300 L 0 300 Z" fill="#ecfccb" />
      {Array.from({ length: 5 }, (_, i) => {
        const x = 70 + i * 26
        return (
          <g key={i}>
            <path d={`M${x} 250 V ${168 - i * 4}`} stroke="#65a30d" strokeWidth="4" />
            <ellipse cx={x} cy={158 - i * 4} rx="6" ry="16" fill="#a3e635" />
          </g>
        )
      })}
      <path d="M56 176 q 10 -14 22 -8 q -10 12 -22 8 Z" fill="#4ade80" />
      <Ground fill="#86efac" y={262} height={38} />
    </g>
  )
}

function StartupScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#1e1b4b" to="#4c1d95" />
      <SkyRect id={uid} />
      <circle cx="60" cy="60" r="2.5" fill="#fde047" />
      <circle cx="110" cy="90" r="2" fill="#fde047" />
      <circle cx="300" cy="50" r="2.5" fill="#fde047" />
      <circle cx="350" cy="110" r="2" fill="#fde047" />
      <circle cx="250" cy="120" r="2" fill="#fde047" />
      <circle cx="70" cy="140" r="2" fill="#fde047" />
      <rect x="186" y="50" width="28" height="110" rx="14" fill="#f8fafc" />
      <circle cx="200" cy="82" r="9" fill="#22d3ee" stroke="#0f172a" strokeWidth="3" />
      <path d="M186 140 L160 176 L190 170 Z" fill="#f472b6" />
      <path d="M214 140 L240 176 L210 170 Z" fill="#f472b6" />
      <path d="M194 160 C 194 188 182 196 200 216 C 218 196 206 188 206 160 Z" fill="#f59e0b" />
      <path d="M197 160 C 197 180 190 186 200 200 C 210 186 203 180 203 160 Z" fill="#fde047" />
      <circle cx="170" cy="250" r="14" fill="#94a3b8" opacity="0.3" />
      <circle cx="232" cy="252" r="14" fill="#94a3b8" opacity="0.3" />
      <circle cx="200" cy="258" r="18" fill="#94a3b8" opacity="0.3" />
      <rect x="40" y="240" width="36" height="60" fill="#0f172a" />
      <rect x="90" y="222" width="30" height="78" fill="#0f172a" />
      <rect x="150" y="232" width="28" height="68" fill="#0f172a" />
      <rect x="250" y="226" width="34" height="74" fill="#0f172a" />
      <rect x="310" y="238" width="40" height="62" fill="#0f172a" />
      <rect x="48" y="248" width="6" height="8" fill="#fbbf24" />
      <rect x="98" y="232" width="6" height="8" fill="#fbbf24" />
      <rect x="258" y="238" width="6" height="8" fill="#fbbf24" />
      <rect x="318" y="248" width="6" height="8" fill="#fbbf24" />
    </g>
  )
}

function SeedlingScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#dcfce7" to="#f0fdf4" />
      <SkyRect id={uid} />
      <Sun cx={90} cy={60} r={22} fill="#facc15" glow={38} />
      <path d="M200 232 C 198 210 200 196 200 178" fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" />
      <path d="M200 192 C 180 186 172 170 176 156 C 190 160 196 174 200 186 Z" fill="#4ade80" />
      <path d="M200 178 C 218 170 228 158 226 144 C 210 150 204 162 200 172 Z" fill="#22c55e" />
      <path d="M198 220 C 188 214 182 206 184 198 C 192 202 196 208 198 214 Z" fill="#4ade80" />
      <ellipse cx="200" cy="236" rx="150" ry="20" fill="#92400e" />
      <ellipse cx="200" cy="234" rx="120" ry="11" fill="#a16207" opacity="0.6" />
      <Ground fill="#d9f99d" y={258} height={42} />
    </g>
  )
}

function ToolsScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#f5f5f4" to="#fafaf9" />
      <SkyRect id={uid} />
      <circle cx="120" cy="150" r="16" fill="none" stroke="#78716c" strokeWidth="10" />
      <path d="M120 150 L 190 210" stroke="#78716c" strokeWidth="12" strokeLinecap="round" />
      <circle cx="270" cy="150" r="24" fill="#f59e0b" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x="266" y="112" width="8" height="12" rx="2" fill="#f59e0b" transform={`rotate(${i * 45} 270 150)`} />
      ))}
      <circle cx="270" cy="150" r="9" fill="#fafaf9" />
      <path d="M320 140 L 352 190" stroke="#a8a29e" strokeWidth="10" strokeLinecap="round" />
      <rect x="312" y="124" width="14" height="32" rx="4" fill="#57534e" transform="rotate(20 320 140)" />
      <circle cx="60" cy="180" r="5" fill="#94a3b8" />
      <circle cx="90" cy="192" r="4" fill="#94a3b8" />
      <circle cx="330" cy="178" r="5" fill="#94a3b8" />
      <rect x="40" y="230" width="320" height="14" rx="6" fill="#d6d3d1" />
      <rect x="60" y="244" width="10" height="56" fill="#a8a29e" />
      <rect x="330" y="244" width="10" height="56" fill="#a8a29e" />
    </g>
  )
}

function CompassScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#fefce8" to="#fffbeb" />
      <SkyRect id={uid} />
      <rect x="90" y="80" width="220" height="150" rx="14" fill="#f5f5f4" stroke="#e7e5e4" strokeWidth="3" />
      <path d="M140 200 Q 160 160 190 170 T 240 120" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="6 6" strokeLinecap="round" />
      <circle cx="240" cy="120" r="8" fill="#ef4444" />
      <path d="M240 128 l -5 8 h 10 Z" fill="#ef4444" />
      <circle cx="190" cy="150" r="34" fill="#1e40af" />
      <circle cx="190" cy="150" r="24" fill="#f8fafc" />
      <path d="M190 132 L 204 150 L 190 150 Z" fill="#f59e0b" />
      <path d="M190 168 L 176 150 L 190 150 Z" fill="#ef4444" />
      <circle cx="190" cy="150" r="4" fill="#0f172a" />
      <path d="M190 126 l 4 6 h -8 Z" fill="#1e40af" />
      <Ground fill="#fef9c3" />
    </g>
  )
}

function BriefcaseScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#f0f9ff" to="#f8fafc" />
      <SkyRect id={uid} />
      <rect x="150" y="90" width="100" height="130" fill="#cbd5e1" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={160 + (i % 3) * 28} y={104 + Math.floor(i / 3) * 26} width="16" height="14" rx="2" fill="#94a3b8" />
      ))}
      <path d="M175 150 V 132 a 25 25 0 0 1 50 0 V 150" fill="none" stroke="#2563eb" strokeWidth="10" />
      <rect x="120" y="150" width="160" height="90" rx="12" fill="#1d4ed8" />
      <rect x="190" y="152" width="20" height="8" rx="3" fill="#fbbf24" />
      <path d="M200 150 V 240" stroke="#fbbf24" strokeWidth="3" opacity="0.6" />
      <rect x="300" y="182" width="26" height="40" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" transform="rotate(-12 313 202)" />
      <rect x="312" y="188" width="26" height="40" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" transform="rotate(8 325 208)" />
      <path d="M330 210 L 356 234" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
      <Ground fill="#e2e8f0" />
    </g>
  )
}

function RocketScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#0f172a" to="#1e3a5f" />
      <SkyRect id={uid} />
      <circle cx="70" cy="60" r="2" fill="#e2e8f0" />
      <circle cx="330" cy="70" r="2" fill="#e2e8f0" />
      <circle cx="300" cy="150" r="2" fill="#e2e8f0" />
      <circle cx="90" cy="180" r="2" fill="#e2e8f0" />
      <circle cx="340" cy="200" r="2" fill="#e2e8f0" />
      <rect x="178" y="90" width="44" height="90" rx="20" fill="#f8fafc" />
      <circle cx="200" cy="125" r="10" fill="#22d3ee" stroke="#0f172a" strokeWidth="3" />
      <path d="M178 150 L152 188 L182 182 Z" fill="#f472b6" />
      <path d="M222 150 L248 188 L218 182 Z" fill="#f472b6" />
      <path d="M196 180 C 196 200 186 206 200 222 C 214 206 204 200 204 180 Z" fill="#f59e0b" />
      <path d="M199 180 C 199 194 192 198 200 210 C 208 198 201 194 201 180 Z" fill="#fde047" />
      <circle cx="200" cy="250" r="30" fill="none" stroke="#fde047" strokeWidth="2" opacity="0.5" />
      <circle cx="200" cy="250" r="44" fill="none" stroke="#fde047" strokeWidth="2" opacity="0.35" />
      <circle cx="200" cy="250" r="58" fill="none" stroke="#fde047" strokeWidth="2" opacity="0.2" />
      <rect x="150" y="240" width="100" height="10" rx="5" fill="#475569" />
      <rect x="160" y="250" width="10" height="50" fill="#334155" />
      <rect x="230" y="250" width="10" height="50" fill="#334155" />
    </g>
  )
}

function GenericScene({ uid }: SceneProps) {
  return (
    <g>
      <Sky id={uid} from="#e0f2fe" to="#f8fafc" />
      <SkyRect id={uid} />
      <PatternGrid id={`${uid}-grid`} stroke="#bfdbfe" opacity={0.35} />
      <Sun cx={200} cy={150} r={30} fill="#fbbf24" glow={48} />
      <path d="M0 250 L120 120 L240 250 Z" fill="#cbd5e1" />
      <path d="M120 250 L280 130 L400 250 Z" fill="#94a3b8" />
      <Ground fill="#e2e8f0" />
    </g>
  )
}

const SCENE_COMPONENTS: Record<SceneKey, (props: SceneProps) => React.ReactElement> = {
  power: PowerScene,
  solar: SolarScene,
  telecom: TelecomScene,
  factory: FactoryScene,
  oilgas: OilgasScene,
  construction: ConstructionScene,
  automation: AutomationScene,
  circuit: CircuitScene,
  health: HealthScene,
  lab: LabScene,
  court: CourtScene,
  code: CodeScene,
  devices: DevicesScene,
  finance: FinanceScene,
  education: EducationScene,
  media: MediaScene,
  estate: EstateScene,
  retail: RetailScene,
  transport: TransportScene,
  research: ResearchScene,
  mining: MiningScene,
  public: PublicScene,
  agriculture: AgricultureScene,
  startup: StartupScene,
  seedling: SeedlingScene,
  tools: ToolsScene,
  compass: CompassScene,
  briefcase: BriefcaseScene,
  rocket: RocketScene,
  generic: GenericScene,
}

interface SceneArtProps {
  scene: SceneKey
  className?: string
  label?: string
  decorative?: boolean
}

export function SceneArt({ scene, className, label, decorative = true }: SceneArtProps) {
  const uid = useId()
  const Render = SCENE_COMPONENTS[scene]
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label ?? SCENE_NAMES[scene]}
    >
      <Render uid={uid} />
    </svg>
  )
}

export function NigeriaOutline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 260"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label="Stylised outline of Nigeria, not to scale"
    >
      <path
        d="M32 30 L228 30 L228 118 L216 136 L220 152 L202 168 L170 180 L138 192 L118 184 L92 172 L64 158 L42 144 L32 126 Z"
        fill="#f8fafc"
        stroke="#334155"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle cx="80" cy="160" r="6" fill="#0d9488" />
      <circle cx="190" cy="100" r="6" fill="#2563eb" />
      <circle cx="120" cy="70" r="6" fill="#f59e0b" />
    </svg>
  )
}