import type { ReactNode } from "react"

interface NeonButtonProps {
  children: ReactNode
  onClick: () => void
  color?: "cyan" | "pink" | "green"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  className?: string
}

const colorStyles = {
  cyan: {
    border: "#00f0ff",
    text: "#00f0ff",
    bg: "rgba(0, 240, 255, 0.1)",
    bgSolid: "#0a1a1f",
    hoverBg: "rgba(0, 240, 255, 0.25)",
    shadow: "0 0 15px rgba(0, 240, 255, 0.4), inset 0 0 20px rgba(0, 240, 255, 0.1)",
    hoverShadow: "0 0 25px rgba(0, 240, 255, 0.6), inset 0 0 30px rgba(0, 240, 255, 0.15)",
  },
  pink: {
    border: "#ff00aa",
    text: "#ff00aa",
    bg: "rgba(255, 0, 170, 0.1)",
    bgSolid: "#1a0a14",
    hoverBg: "rgba(255, 0, 170, 0.25)",
    shadow: "0 0 15px rgba(255, 0, 170, 0.4), inset 0 0 20px rgba(255, 0, 170, 0.1)",
    hoverShadow: "0 0 25px rgba(255, 0, 170, 0.6), inset 0 0 30px rgba(255, 0, 170, 0.15)",
  },
  green: {
    border: "#00ff88",
    text: "#00ff88",
    bg: "rgba(0, 255, 136, 0.1)",
    bgSolid: "#0a1a10",
    hoverBg: "rgba(0, 255, 136, 0.25)",
    shadow: "0 0 15px rgba(0, 255, 136, 0.4), inset 0 0 20px rgba(0, 255, 136, 0.1)",
    hoverShadow: "0 0 25px rgba(0, 255, 136, 0.6), inset 0 0 30px rgba(0, 255, 136, 0.15)",
  },
}

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
}

export function NeonButton({
  children,
  onClick,
  color = "cyan",
  size = "md",
  disabled = false,
  className = "",
}: NeonButtonProps) {
  const colors = colorStyles[color]

  return (
    <div
      className={`relative ${className}`}
      style={{
        background: colors.border,
        clipPath: "polygon(24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%, 0 24px)",
        padding: '2px',
      }}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative w-full font-bold uppercase tracking-widest
          backdrop-blur-sm overflow-hidden
          transition-all duration-300 ease-out
          ${sizeStyles[size]}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.01] active:scale-[0.99]"}
        `}
        style={{
          color: colors.text,
          backgroundColor: colors.bgSolid,
          boxShadow: colors.shadow,
          clipPath: "polygon(23px 0, 100% 0, 100% calc(100% - 23px), calc(100% - 23px) 100%, 0 100%, 0 23px)",
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.boxShadow = colors.hoverShadow
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = colors.shadow
        }}
      >
        {/* Scan line effect */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)",
          }}
        />
        
        <span className="relative">{children}</span>
      </button>
    </div>
  )
}
