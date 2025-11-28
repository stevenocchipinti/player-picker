import { forwardRef, memo } from "react"
import type { TouchPoint } from "../types"

interface PlayerIndicatorProps {
  player: TouchPoint
  isSelected: boolean
  isWaiting?: boolean
  showTeam?: boolean
}

export const PlayerIndicator = memo(
  forwardRef<HTMLDivElement, PlayerIndicatorProps>(function PlayerIndicator(
    { player, isSelected, isWaiting = false, showTeam = false },
    ref
  ) {
    const baseSize = 80
    const selectedSize = 100
    const size = isSelected ? selectedSize : baseSize

    return (
      <div
        ref={ref}
        className="absolute pointer-events-none will-change-transform"
        style={{
          left: player.x,
          top: player.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        <svg
          width={size * 2}
          height={size * 2}
          viewBox={`0 0 ${size * 2} ${size * 2}`}
          className="overflow-visible"
        >
          <defs>
            <radialGradient
              id={`grad-${player.id}`}
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor={player.color} stopOpacity="0.8" />
              <stop offset="70%" stopColor={player.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={player.color} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer glow ring */}
          <circle
            cx={size}
            cy={size}
            r={size - 10}
            fill="none"
            stroke={player.color}
            strokeWidth={isSelected ? 4 : 2}
            opacity={0.6}
          >
            {/* Subtle pulse when waiting, stronger when selected */}
            {(isSelected || isWaiting) && (
              <animate
                attributeName="r"
                values={
                  isSelected
                    ? `${size - 15};${size - 5};${size - 15}`
                    : `${size - 12};${size - 8};${size - 12}`
                }
                dur={isSelected ? "1s" : "2s"}
                repeatCount="indefinite"
              />
            )}
          </circle>

          {/* Main circle */}
          <circle
            cx={size}
            cy={size}
            r={size - 25}
            fill={`url(#grad-${player.id})`}
            stroke={player.color}
            strokeWidth={isSelected ? 3 : 2}
          />

          {/* Inner core */}
          <circle
            cx={size}
            cy={size}
            r={isSelected ? 15 : 10}
            fill={player.color}
            opacity={0.9}
          >
            {(isSelected || isWaiting) && (
              <animate
                attributeName="opacity"
                values={isSelected ? "0.9;1;0.9" : "0.7;0.9;0.7"}
                dur={isSelected ? "0.5s" : "1.5s"}
                repeatCount="indefinite"
              />
            )}
          </circle>

          {/* Subtle waiting pulse - single slow ring */}
          {isWaiting && !isSelected && (
            <circle
              cx={size}
              cy={size}
              r="20"
              fill="none"
              stroke={player.color}
              strokeWidth="1"
              opacity="0.3"
            >
              <animate
                attributeName="r"
                values="20;50;20"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.3;0;0.3"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          )}

          {/* Selection burst animation - only when selected (winner) */}
          {isSelected && (
            <>
              <circle
                cx={size}
                cy={size}
                r="20"
                fill="none"
                stroke={player.color}
                strokeWidth="2"
                opacity="0.8"
              >
                <animate
                  attributeName="r"
                  values="20;80;20"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.8;0;0.8"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx={size}
                cy={size}
                r="20"
                fill="none"
                stroke={player.color}
                strokeWidth="2"
                opacity="0.6"
              >
                <animate
                  attributeName="r"
                  values="20;100;20"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0;0.6"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </>
          )}
        </svg>

        {/* Glow effect using box-shadow instead of filter for better performance */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: isSelected
              ? `0 0 30px ${player.color}, 0 0 60px ${player.color}`
              : `0 0 15px ${player.color}`,
            opacity: 0.5,
          }}
        />

        {/* Team number display */}
        {showTeam && player.team !== undefined && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold"
            style={{
              color: player.color,
              textShadow: `0 0 10px ${player.color}, 0 0 20px ${player.color}`,
            }}
          >
            {player.team + 1}
          </div>
        )}
      </div>
    )
  })
)
