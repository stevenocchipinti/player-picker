interface CountdownProps {
  count: number
  isVisible: boolean
}

export function Countdown({ count, isVisible }: CountdownProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      {/* Subtle pulsing glow background */}
      <div className="absolute inset-0 countdown-glow-bg" />

      <div className="relative">
        {/* Semi-transparent backdrop behind countdown only */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full bg-black/80 backdrop-blur-sm" />
        </div>

        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="relative animate-pulse"
        >
          <defs>
            <linearGradient id="countdownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#bf00ff" />
              <stop offset="100%" stopColor="#ff00aa" />
            </linearGradient>
            <filter id="countdownGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer ring */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="url(#countdownGrad)"
            strokeWidth="4"
            filter="url(#countdownGlow)"
            opacity="0.8"
          >
            <animate
              attributeName="stroke-dasharray"
              values="0 565;565 0"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Inner ring */}
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="#00f0ff"
            strokeWidth="2"
            opacity="0.5"
          >
            <animate
              attributeName="r"
              values="70;75;70"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Number */}
          <text
            x="100"
            y="100"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="72"
            fontWeight="bold"
            fill="url(#countdownGrad)"
            filter="url(#countdownGlow)"
          >
            {count}
          </text>
        </svg>
      </div>
    </div>
  )
}
