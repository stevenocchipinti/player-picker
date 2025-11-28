interface CountdownProps {
  count: number
  isVisible: boolean
}

export function Countdown({ count, isVisible }: CountdownProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="relative">
        {/* Semi-transparent backdrop behind countdown only */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full bg-slate-900/80 backdrop-blur-sm" />
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

        {/* Pulsing rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="absolute w-32 h-32 rounded-full border-2 border-cyan-400 opacity-50 animate-ping"
            style={{ animationDuration: "1s" }}
          />
          <div
            className="absolute w-40 h-40 rounded-full border border-fuchsia-500 opacity-30 animate-ping"
            style={{ animationDuration: "1.5s" }}
          />
        </div>
      </div>
    </div>
  )
}
