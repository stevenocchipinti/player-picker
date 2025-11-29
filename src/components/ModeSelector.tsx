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
              flex items-center justify-center gap-4 rounded-lg border bg-purple-950/30
              transition-all duration-300 ease-in-out
              ${isTeamMode 
                ? "opacity-100 p-3 border-purple-500/30" 
                : "opacity-0 h-0 p-0 border-transparent overflow-hidden"}
            `}
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
              className="w-10 h-10 rounded-full border border-purple-400 text-purple-400 text-xl hover:bg-purple-400/20 transition-colors"
            >
              -
            </button>
            <div className="text-3xl font-bold text-purple-400 w-16 text-center">
              {showTeamCountControl
                ? teamConfig.teamCount
                : teamConfig.playersPerTeam}
            </div>
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
              className="w-10 h-10 rounded-full border border-purple-400 text-purple-400 text-xl hover:bg-purple-400/20 transition-colors"
            >
              +
            </button>
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
  return (
    <button
      onClick={onClick}
      className={`
        p-3 rounded-lg text-center transition-all duration-300 border-2
        ${
          active
            ? "bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20"
            : "bg-black/30 border-slate-700 hover:border-slate-600"
        }
      `}
    >
      <div
        className={`font-semibold ${active ? "text-cyan-400" : "text-slate-300"}`}
      >
        {label}
      </div>
      <div className="text-xs text-slate-500 mt-1">{description}</div>
    </button>
  )
}
