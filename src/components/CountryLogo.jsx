export default function CountryLogo({ countryId, color, size = 46 }) {
  const props = { width: size, height: size, viewBox: '0 0 60 60' }

  switch (countryId) {
    case 'japan':
      return <JapanLogo {...props} color={color} />
    case 'chile':
      return <ChileLogo {...props} color={color} />
    case 'indonesia':
      return <IndonesiaLogo {...props} color={color} />
    case 'algeria':
      return <AlgeriaLogo {...props} color={color} />
    case 'usa':
      return <USALogo {...props} color={color} />
    case 'france':
      return <FranceLogo {...props} color={color} />
    case 'germany':
      return <GermanyLogo {...props} color={color} />
    case 'brazil':
      return <BrazilLogo {...props} color={color} />
    case 'uk':
      return <UKLogo {...props} color={color} />
    case 'australia':
      return <AustraliaLogo {...props} color={color} />
    default:
      return <DefaultLogo {...props} color={color} />
  }
}

function JapanLogo({ color, ...p }) {
  const petals = Array.from({ length: 16 }, (_, i) => i)
  return (
    <svg {...p} fill="none">
      <circle cx="30" cy="30" r="28" stroke={color} strokeWidth="1.2" fill="none" />
      {petals.map(i => {
        const a = (i * 22.5) * Math.PI / 180
        const x = 30 + 14 * Math.cos(a)
        const y = 30 + 14 * Math.sin(a)
        return <ellipse key={i} cx={x} cy={y} rx="5.5" ry="3"
          fill={color} opacity="0.85"
          transform={`rotate(${i * 22.5}, ${x}, ${y})`} />
      })}
      <circle cx="30" cy="30" r="7" fill={color} />
      <circle cx="30" cy="30" r="4" fill="white" opacity="0.6" />
    </svg>
  )
}

function ChileLogo({ color, ...p }) {
  return (
    <svg {...p} fill="none">
      <circle cx="30" cy="30" r="27" stroke={color} strokeWidth="1.5" fill="none" />
      <polygon points="30,10 34.5,23.5 49,23.5 37.5,31.5 42,45 30,37 18,45 22.5,31.5 11,23.5 25.5,23.5"
        fill={color} opacity="0.85" />
      <circle cx="30" cy="30" r="8" fill="none" stroke={color} strokeWidth="1" />
    </svg>
  )
}

function IndonesiaLogo({ color, ...p }) {
  return (
    <svg {...p} fill="none">
      <ellipse cx="30" cy="25" rx="18" ry="8" fill={color} opacity="0.1" stroke={color} strokeWidth="1" />
      <path d="M12 25 C12 16 20 10 30 10 C40 10 48 16 48 25 C48 32 42 28 30 28 C18 28 12 32 12 25Z"
        fill={color} opacity="0.7" />
      <path d="M18 26 L15 40 L30 34 L45 40 L42 26" fill={color} opacity="0.5" />
      <path d="M22 26 L20 38 L30 33 L40 38 L38 26" fill={color} opacity="0.3" />
      <circle cx="30" cy="20" r="5" fill={color} />
      <circle cx="30" cy="20" r="2.5" fill="white" opacity="0.5" />
      <path d="M25 35 Q30 50 35 35" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="20" cy="32" r="2" fill={color} opacity="0.6" />
      <circle cx="40" cy="32" r="2" fill={color} opacity="0.6" />
    </svg>
  )
}

function AlgeriaLogo({ color, ...p }) {
  return (
    <svg {...p} fill="none">
      <circle cx="30" cy="30" r="27" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M36 20 A12 12 0 1 0 36 40 A8 8 0 1 1 36 20Z" fill={color} opacity="0.8" />
      <polygon points="40,22 41.2,25.8 45.2,25.8 42,28.2 43.2,32 40,29.6 36.8,32 38,28.2 34.8,25.8 38.8,25.8"
        fill={color} />
    </svg>
  )
}

function USALogo({ color, ...p }) {
  return (
    <svg {...p} fill="none">
      <circle cx="30" cy="30" r="27" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M30 10 L32 18 L30 16 L28 18Z" fill={color} />
      <path d="M14 20 C14 20 22 22 30 16 C38 22 46 20 46 20 C46 30 42 38 30 44 C18 38 14 30 14 20Z"
        fill={color} opacity="0.75" />
      <path d="M22 30 C22 30 26 28 30 30 C34 28 38 30 38 30 L36 38 L30 42 L24 38Z"
        fill={color} opacity="0.5" />
      <ellipse cx="30" cy="26" rx="4" ry="5" fill="white" opacity="0.3" />
      <circle cx="24" cy="22" r="1.5" fill={color} />
      <circle cx="36" cy="22" r="1.5" fill={color} />
      <path d="M27 48 L30 44 L33 48" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M14 25 L8 22 M46 25 L52 22" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function FranceLogo({ color, ...p }) {
  return (
    <svg {...p} fill="none">
      <circle cx="30" cy="30" r="27" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M30 10 C30 10 26 14 27 18 C25 16 22 16 22 20 C22 24 26 24 28 22 C28 26 26 28 26 30 C28 28 32 28 34 30 C34 28 32 26 32 22 C34 24 38 24 38 20 C38 16 35 16 33 18 C34 14 30 10 30 10Z"
        fill={color} opacity="0.8" />
      <path d="M26 30 L23 44 L30 40 L37 44 L34 30Z" fill={color} opacity="0.6" />
      <path d="M24 44 L18 50 M36 44 L42 50" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function GermanyLogo({ color, ...p }) {
  return (
    <svg {...p} fill="none">
      <path d="M30 8 C30 8 14 14 14 26 C14 34 20 40 30 46 C40 40 46 34 46 26 C46 14 30 8 30 8Z"
        fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" />
      <path d="M22 16 C18 18 16 22 16 26 C16 32 20 38 30 44 C40 38 44 32 44 26 C44 22 42 18 38 16 L30 12 Z"
        fill={color} opacity="0.6" />
      <path d="M26 24 L20 28 L26 32 L28 42 L30 44 L32 42 L34 32 L40 28 L34 24 L32 14 L30 12 L28 14Z"
        fill={color} opacity="0.9" />
      <circle cx="30" cy="28" r="5" fill="white" opacity="0.3" />
      <circle cx="26" cy="30" r="2" fill="white" opacity="0.4" />
      <circle cx="34" cy="30" r="2" fill="white" opacity="0.4" />
    </svg>
  )
}

function BrazilLogo({ color, ...p }) {
  return (
    <svg {...p} fill="none">
      <circle cx="30" cy="30" r="27" stroke={color} strokeWidth="1.2" fill="none" opacity="0.4" />
      <polygon points="30,8 52,30 30,52 8,30" fill={color} opacity="0.12" stroke={color} strokeWidth="1.5" />
      <circle cx="30" cy="30" r="14" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx="30" cy="30" r="10" fill={color} opacity="0.12" />
      {[0,60,120,180,240,300].map((a, i) => {
        const r2 = i % 2 === 0 ? 7 : 9
        const x = 30 + r2 * Math.cos(a * Math.PI / 180)
        const y = 30 + r2 * Math.sin(a * Math.PI / 180)
        return <circle key={i} cx={x} cy={y} r="1.5" fill={color} />
      })}
      <circle cx="30" cy="30" r="3.5" fill={color} />
    </svg>
  )
}

function UKLogo({ color, ...p }) {
  return (
    <svg {...p} fill="none">
      <circle cx="30" cy="30" r="27" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
      <path d="M20 14 L20 20 L14 18 L12 22 L20 24 L20 30 L12 30 L12 34 L20 34 L20 46 L24 46 L24 34 L36 34 L36 46 L40 46 L40 34 L48 34 L48 30 L40 30 L40 24 L48 22 L46 18 L40 20 L40 14 L36 14 L36 26 L24 26 L24 14Z"
        fill={color} opacity="0.7" />
      <path d="M12 18 L24 26 M48 18 L36 26 M12 42 L24 34 M48 42 L36 34"
        stroke={color} strokeWidth="2" opacity="0.4" />
      <rect x="26" y="26" width="8" height="8" fill={color} opacity="0.9" />
    </svg>
  )
}

function AustraliaLogo({ color, ...p }) {
  const star7 = (cx, cy, r1, r2, n = 7) =>
    Array.from({ length: n * 2 }, (_, i) => {
      const a = (i * Math.PI / n) - Math.PI / 2
      const r = i % 2 === 0 ? r1 : r2
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
    }).join(' ')

  return (
    <svg {...p} fill="none">
      <circle cx="30" cy="30" r="27" stroke={color} strokeWidth="1.2" fill="none" opacity="0.4" />
      <polygon points={star7(30, 30, 22, 10)} fill={color} opacity="0.8" />
      <polygon points={star7(30, 30, 16, 7)} fill="white" opacity="0.2" />
      <circle cx="30" cy="30" r="6" fill={color} />
      <circle cx="30" cy="30" r="3" fill="white" opacity="0.4" />
    </svg>
  )
}

function DefaultLogo({ color, ...p }) {
  return (
    <svg {...p} fill="none">
      <circle cx="30" cy="30" r="27" stroke={color} strokeWidth="1.5" />
      <circle cx="30" cy="30" r="18" fill="none" stroke={color} strokeWidth="1" />
      {[0,45,90,135,180,225,270,315].map((a, i) => (
        <line key={i}
          x1={30 + 18 * Math.cos(a * Math.PI / 180)} y1={30 + 18 * Math.sin(a * Math.PI / 180)}
          x2={30 + 27 * Math.cos(a * Math.PI / 180)} y2={30 + 27 * Math.sin(a * Math.PI / 180)}
          stroke={color} strokeWidth="1.5" />
      ))}
      <circle cx="30" cy="30" r="6" fill={color} opacity="0.6" />
    </svg>
  )
}
