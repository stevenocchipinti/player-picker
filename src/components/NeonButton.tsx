import type { ReactNode } from "react"

interface NeonButtonProps {
  children: ReactNode
  onClick: () => void
  color?: "cyan" | "pink" | "green"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
}

const colorStyles = {
  cyan: {
    border: "#00f0ff",
    text: "#00f0ff",
    bg: "rgba(0, 240, 255, 0.1)",
    hoverBg: "rgba(0, 240, 255, 0.2)",
    shadow: "0 0 8px rgba(0, 240, 255, 0.4)",
    hoverShadow: "0 0 12px rgba(0, 240, 255, 0.6)",
  },
  pink: {
    border: "#ff00aa",
    text: "#ff00aa",
    bg: "rgba(255, 0, 170, 0.1)",
    hoverBg: "rgba(255, 0, 170, 0.2)",
    shadow: "0 0 8px rgba(255, 0, 170, 0.4)",
    hoverShadow: "0 0 12px rgba(255, 0, 170, 0.6)",
  },
  green: {
    border: "#00ff88",
    text: "#00ff88",
    bg: "rgba(0, 255, 136, 0.1)",
    hoverBg: "rgba(0, 255, 136, 0.2)",
    shadow: "0 0 8px rgba(0, 255, 136, 0.4)",
    hoverShadow: "0 0 12px rgba(0, 255, 136, 0.6)",
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
}: NeonButtonProps) {
  const colors = colorStyles[color]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative font-bold uppercase tracking-wider
        rounded-lg
        transition-all duration-300 ease-out
        ${sizeStyles[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95"}
      `}
      style={{
        border: `2px solid ${colors.border}`,
        color: colors.text,
        backgroundColor: colors.bg,
        boxShadow: colors.shadow,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = colors.hoverShadow
          e.currentTarget.style.backgroundColor = colors.hoverBg
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = colors.shadow
        e.currentTarget.style.backgroundColor = colors.bg
      }}
    >
      {children}
    </button>
  )
}
