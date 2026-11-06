import { useId } from "react"

// Same geometry as public/favicon.svg: two arms of particles spiralling into a core
const DOTS = Array.from({ length: 2 }, (_, arm) =>
  Array.from({ length: 9 }, (_, i) => {
    const t = i / 9
    const angle = arm * Math.PI + t * 4.2
    const radius = 8 + t * 20
    return {
      cx: 32 + Math.cos(angle) * radius,
      cy: 32 + Math.sin(angle) * radius,
      r: 3.2 - t * 2.2,
      opacity: 1 - t * 0.6,
    }
  })
).flat()

export function Logo({ size = 28 }: { size?: number }) {
  const coreId = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id={coreId}>
          <stop offset="0" stopColor="#fff" />
          <stop offset=".35" stopColor="#bff8ff" />
          <stop offset="1" stopColor="#3ef0ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {DOTS.map((d, i) => (
        <circle key={i} {...d} fill="#3ef0ff" />
      ))}
      <circle cx="32" cy="32" r="11" fill={`url(#${coreId})`} />
      <circle cx="32" cy="32" r="4.5" fill="#fff" />
    </svg>
  )
}
