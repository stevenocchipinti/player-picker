import type { GameMode, TeamConfig } from "../types"
import { NeonButton } from "./NeonButton"

interface ModeSelectorProps {
  mode: GameMode
  onModeChange: (mode: GameMode) => void
  teamConfig: TeamConfig
  onTeamConfigChange: (config: TeamConfig) => void
  onStart: () => void
}

export function ModeSelector({
  mode,
  onModeChange,
  teamConfig,
  onTeamConfigChange,
  onStart,
}: ModeSelectorProps) {
  const isTeamMode = mode === "team"
  const showTeamCountControl =
    isTeamMode && teamConfig.groupingMode === "byTeamCount"
  const showPlayerCountControl =
    isTeamMode && teamConfig.groupingMode === "byPlayerCount"

  return (
    <div className="fixed inset-0 flex flex-col z-50 p-6">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(at 0% 0%, rgba(0, 240, 255, 0.4) 0%, transparent 50%),
              radial-gradient(at 100% 0%, rgba(191, 0, 255, 0.3) 0%, transparent 50%),
              radial-gradient(at 100% 100%, rgba(255, 0, 170, 0.4) 0%, transparent 50%),
              radial-gradient(at 0% 100%, rgba(0, 150, 255, 0.3) 0%, transparent 50%),
              radial-gradient(at 50% 50%, rgba(100, 0, 255, 0.2) 0%, transparent 60%)
            `,
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col flex-1 max-w-md w-full mx-auto">
        {/* Top section - Title and Mode Selection (anchored to top) */}
        <div className="space-y-8 pt-8">
          {/* Title */}
          <div className="text-center">
            <h1
              className="text-6xl md:text-8xl font-bold py-6"
              style={{
                background:
                  "linear-gradient(135deg, #00f0ff 0%, #bf00ff 50%, #ff00aa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 30px rgba(0, 240, 255, 0.7)) drop-shadow(0 0 60px rgba(191, 0, 255, 0.5))",
              }}
            >
              Player Picker
            </h1>
          </div>

          {/* Mode Selection - Single Column */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <ModeButton
                active={mode === "standard"}
                onClick={() => onModeChange("standard")}
                label="Standard"
                description="Pick one player"
              />
              <ModeButton
                active={showTeamCountControl}
                onClick={() => {
                  onModeChange("team")
                  onTeamConfigChange({
                    ...teamConfig,
                    groupingMode: "byTeamCount",
                  })
                }}
                label="Team Count"
                description="Split into X teams"
              />
              <ModeButton
                active={showPlayerCountControl}
                onClick={() => {
                  onModeChange("team")
                  onTeamConfigChange({
                    ...teamConfig,
                    groupingMode: "byPlayerCount",
                  })
                }}
                label="Team Size"
                description="X players per team"
              />
            </div>
          </div>
        </div>

        {/* Middle section - Numeric selector (fills remaining space, content at top) */}
        <div className="flex-1 pt-6">
          <div
            className={`
              transition-all duration-300 ease-in-out
              ${isTeamMode 
                ? "opacity-100" 
                : "opacity-0 h-0 overflow-hidden"}
            `}
          >
            <div
              style={{
                background: "#6b21a8",
                clipPath: "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)",
                padding: '1px',
              }}
            >
              <div
                className="flex items-center justify-center gap-4 p-4"
                style={{
                  background: "#0a0a0f",
                  clipPath: "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)",
                }}
              >
                <div
                  style={{
                    background: "#a855f7",
                    clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                    padding: '1px',
                  }}
                >
                  <button
                    onClick={() => {
                      if (showTeamCountControl) {
                        onTeamConfigChange({
                          ...teamConfig,
                          teamCount: Math.max(2, teamConfig.teamCount - 1),
                        })
                      } else {
                        onTeamConfigChange({
                          ...teamConfig,
                          playersPerTeam: Math.max(2, teamConfig.playersPerTeam - 1),
                        })
                      }
                    }}
                    className="w-10 h-10 text-purple-400 text-xl hover:bg-purple-500/20 transition-colors flex items-center justify-center"
                    style={{
                      background: "#0a0a0f",
                      clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                    }}
                  >
                    -
                  </button>
                </div>
                <div className="text-3xl font-bold text-purple-400 w-16 text-center">
                  {showTeamCountControl
                    ? teamConfig.teamCount
                    : teamConfig.playersPerTeam}
                </div>
                <div
                  style={{
                    background: "#a855f7",
                    clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                    padding: '1px',
                  }}
                >
                  <button
                    onClick={() => {
                      if (showTeamCountControl) {
                        onTeamConfigChange({
                          ...teamConfig,
                          teamCount: Math.min(10, teamConfig.teamCount + 1),
                        })
                      } else {
                        onTeamConfigChange({
                          ...teamConfig,
                          playersPerTeam: Math.min(10, teamConfig.playersPerTeam + 1),
                        })
                      }
                    }}
                    className="w-10 h-10 text-purple-400 text-xl hover:bg-purple-500/20 transition-colors flex items-center justify-center"
                    style={{
                      background: "#0a0a0f",
                      clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section - Start Button */}
        <div>
          <NeonButton
            onClick={onStart}
            color="cyan"
            size="lg"
            className="w-full py-4 text-xl"
          >
            Start
          </NeonButton>
        </div>
      </div>
    </div>
  )
}

interface ModeButtonProps {
  active: boolean
  onClick: () => void
  label: string
  description: string
}

function ModeButton({ active, onClick, label, description }: ModeButtonProps) {
  const borderColor = active ? "#00f0ff" : "#475569"
  
  return (
    <div
      className="relative"
      style={{
        background: borderColor,
        clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
        padding: '1px',
      }}
    >
      <button
        onClick={onClick}
        className={`
          relative w-full p-4 text-center transition-all duration-300
          backdrop-blur-sm
          ${
            active
              ? "bg-cyan-950/90"
              : "bg-[#0a0a0f] hover:bg-[#0f0f18]"
          }
        `}
        style={{
          clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
          boxShadow: active
            ? "0 0 20px rgba(0, 240, 255, 0.3), inset 0 0 30px rgba(0, 240, 255, 0.1)"
            : "none",
        }}
      >
        {/* Scan line effect */}
        {active && (
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 240, 255, 0.3) 2px, rgba(0, 240, 255, 0.3) 4px)",
            }}
          />
        )}
        
        <div
          className={`relative font-bold tracking-wide uppercase text-sm ${active ? "text-cyan-400" : "text-slate-300"}`}
        >
          {label}
        </div>
        <div className={`relative text-xs mt-1 ${active ? "text-cyan-500/70" : "text-slate-500"}`}>{description}</div>
      </button>
    </div>
  )
}
