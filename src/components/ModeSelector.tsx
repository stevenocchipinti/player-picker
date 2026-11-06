import type { GameMode, TeamConfig } from "../types"
import { Logo } from "./Logo"

interface ModeSelectorProps {
  mode: GameMode
  onModeChange: (mode: GameMode) => void
  teamConfig: TeamConfig
  onTeamConfigChange: (config: TeamConfig) => void
  onStart: () => void
}

const MIN_TEAM_VALUE = 2
const MAX_TEAM_VALUE = 10

export function ModeSelector({
  mode,
  onModeChange,
  teamConfig,
  onTeamConfigChange,
  onStart,
}: ModeSelectorProps) {
  const isTeamMode = mode === "team"
  const byTeamCount = teamConfig.groupingMode === "byTeamCount"
  const value = byTeamCount ? teamConfig.teamCount : teamConfig.playersPerTeam

  const selectTeamMode = (groupingMode: TeamConfig["groupingMode"]) => {
    onModeChange("team")
    onTeamConfigChange({ ...teamConfig, groupingMode })
  }

  const changeValue = (delta: number) => {
    const next = Math.min(MAX_TEAM_VALUE, Math.max(MIN_TEAM_VALUE, value + delta))
    onTeamConfigChange(
      byTeamCount
        ? { ...teamConfig, teamCount: next }
        : { ...teamConfig, playersPerTeam: next }
    )
  }

  return (
    <div className="relative min-h-dvh flex flex-col p-6 box-border">
      <div className="flex flex-col flex-1 max-w-md w-full mx-auto">
        <div className="flex items-center justify-between hud-label">
          <Logo size={30} />
          <span>
            <span className="text-[var(--accent)]">●</span> Ready
          </span>
        </div>

        <h1 className="mt-[clamp(1rem,4.5vh,2.5rem)] mb-[clamp(1rem,4.5vh,2.5rem)] text-6xl font-semibold uppercase leading-[0.92] tracking-wide text-[var(--text)]">
          Player
          <br />
          <span className="text-[var(--accent)] drop-shadow-[0_0_24px_rgba(62,240,255,0.45)]">
            Picker
          </span>
        </h1>

        <div className="hud-label mb-3">// Select mode</div>
        <div className="flex flex-col gap-2">
          <ModeOption
            index="01"
            active={mode === "standard"}
            onClick={() => onModeChange("standard")}
            label="Standard"
            description="Pick one player"
          />
          <ModeOption
            index="02"
            active={isTeamMode && byTeamCount}
            onClick={() => selectTeamMode("byTeamCount")}
            label="Team Count"
            description="Split into X teams"
          />
          <ModeOption
            index="03"
            active={isTeamMode && !byTeamCount}
            onClick={() => selectTeamMode("byPlayerCount")}
            label="Team Size"
            description="X players per team"
          />
        </div>

        <div className="flex-1 min-h-4" />

        {/* Numeric selector - only relevant for team modes */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isTeamMode ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!isTeamMode}
        >
          <div className="flex items-center justify-between border-t border-[var(--line)] py-4 mb-2">
            <span className="hud-label">{byTeamCount ? "Teams" : "Players per team"}</span>
            <div className="flex items-center gap-4">
              <button
                className="stepper-button"
                onClick={() => changeValue(-1)}
                disabled={value <= MIN_TEAM_VALUE}
                tabIndex={isTeamMode ? 0 : -1}
                aria-label="Decrease"
              >
                −
              </button>
              <span className="w-6 text-center text-2xl font-semibold text-[var(--text)]">
                {value}
              </span>
              <button
                className="stepper-button"
                onClick={() => changeValue(1)}
                disabled={value >= MAX_TEAM_VALUE}
                tabIndex={isTeamMode ? 0 : -1}
                aria-label="Increase"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="start-wrap">
          <button onClick={onStart} className="start-button chamfer">
            Start
            <span className="start-button__arrow" aria-hidden="true">
              ▸
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

interface ModeOptionProps {
  index: string
  active: boolean
  onClick: () => void
  label: string
  description: string
}

function ModeOption({ index, active, onClick, label, description }: ModeOptionProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`mode-option ${active ? "is-active" : ""}`}
    >
      <span className="mode-option__index">{index}</span>
      <span>
        <span className="mode-option__label">{label}</span>
        <span className="mode-option__desc">{description}</span>
      </span>
    </button>
  )
}
