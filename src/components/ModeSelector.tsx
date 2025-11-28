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
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 p-6">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(0, 240, 255, 0.3) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(255, 0, 170, 0.3) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(191, 0, 255, 0.2) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{
              background: "linear-gradient(135deg, #00f0ff 0%, #bf00ff 50%, #ff00aa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(0, 240, 255, 0.5))",
            }}
          >
            Player Picker
          </h1>
          <p className="text-cyan-400/70 text-sm">Choose who goes first</p>
        </div>

        {/* Mode Selection */}
        <div className="space-y-4">
          <h2 className="text-cyan-400 text-lg font-semibold text-center">Select Mode</h2>
          <div className="grid grid-cols-3 gap-3">
            <ModeButton
              active={mode === "standard"}
              onClick={() => onModeChange("standard")}
              label="Standard"
              description="Pick one player"
            />
            <ModeButton
              active={mode === "single"}
              onClick={() => onModeChange("single")}
              label="Solo"
              description="Practice mode"
            />
            <ModeButton
              active={mode === "team"}
              onClick={() => onModeChange("team")}
              label="Teams"
              description="Group players"
            />
          </div>
        </div>

        {/* Team Configuration */}
        {mode === "team" && (
          <div className="space-y-4 p-4 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5">
            <h3 className="text-fuchsia-400 font-semibold">Team Settings</h3>

            {/* Grouping mode toggle */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  onTeamConfigChange({ ...teamConfig, groupingMode: "byTeamCount" })
                }
                className={`flex-1 py-2 px-3 rounded text-sm transition-all ${
                  teamConfig.groupingMode === "byTeamCount"
                    ? "bg-fuchsia-500/30 text-fuchsia-300 border border-fuchsia-400"
                    : "bg-slate-800/50 text-slate-400 border border-slate-600"
                }`}
              >
                # of Teams
              </button>
              <button
                onClick={() =>
                  onTeamConfigChange({ ...teamConfig, groupingMode: "byPlayerCount" })
                }
                className={`flex-1 py-2 px-3 rounded text-sm transition-all ${
                  teamConfig.groupingMode === "byPlayerCount"
                    ? "bg-fuchsia-500/30 text-fuchsia-300 border border-fuchsia-400"
                    : "bg-slate-800/50 text-slate-400 border border-slate-600"
                }`}
              >
                Players/Team
              </button>
            </div>

            {/* Number input */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  if (teamConfig.groupingMode === "byTeamCount") {
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
                className="w-10 h-10 rounded-full border border-cyan-400 text-cyan-400 text-xl hover:bg-cyan-400/20 transition-colors"
              >
                -
              </button>
              <div className="text-3xl font-bold text-cyan-400 w-16 text-center">
                {teamConfig.groupingMode === "byTeamCount"
                  ? teamConfig.teamCount
                  : teamConfig.playersPerTeam}
              </div>
              <button
                onClick={() => {
                  if (teamConfig.groupingMode === "byTeamCount") {
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
                className="w-10 h-10 rounded-full border border-cyan-400 text-cyan-400 text-xl hover:bg-cyan-400/20 transition-colors"
              >
                +
              </button>
            </div>

            <p className="text-slate-400 text-xs text-center">
              {teamConfig.groupingMode === "byTeamCount"
                ? `Divide players into ${teamConfig.teamCount} teams`
                : `Create teams of ${teamConfig.playersPerTeam} players each`}
            </p>
          </div>
        )}

        {/* Start Button */}
        <div className="flex justify-center pt-4">
          <NeonButton onClick={onStart} color="cyan" size="lg">
            Start
          </NeonButton>
        </div>

        {/* Instructions */}
        <div className="text-center text-slate-500 text-sm space-y-1">
          <p>Each player places a finger on the screen</p>
          <p>Keep fingers still for the countdown</p>
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
        p-3 rounded-lg text-center transition-all duration-300
        ${
          active
            ? "bg-cyan-500/20 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20"
            : "bg-slate-800/50 border border-slate-600 hover:border-slate-500"
        }
      `}
    >
      <div className={`font-semibold ${active ? "text-cyan-400" : "text-slate-300"}`}>
        {label}
      </div>
      <div className="text-xs text-slate-500 mt-1">{description}</div>
    </button>
  )
}
