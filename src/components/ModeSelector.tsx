import type { ReactNode } from "react"
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

  const stepper = (
    <>
      <span className="mode-option__tray-label">
        {byTeamCount ? "Teams" : "Players per team"}
      </span>
      <div className="flex items-center gap-3">
        <button
          className="stepper-button"
          onClick={() => changeValue(-1)}
          disabled={value <= MIN_TEAM_VALUE}
          aria-label="Decrease"
        >
          −
        </button>
        <span className="mode-option__value" aria-live="polite">
          {value}
        </span>
        <button
          className="stepper-button"
          onClick={() => changeValue(1)}
          disabled={value >= MAX_TEAM_VALUE}
          aria-label="Increase"
        >
          +
        </button>
      </div>
    </>
  )

  return (
    <div className="relative min-h-dvh flex flex-col p-6 box-border">
      <div className="flex flex-col flex-1 max-w-md w-full mx-auto">
        <div className="flex items-center">
          <Logo size={30} />
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
            controls={stepper}
          />
          <ModeOption
            index="03"
            active={isTeamMode && !byTeamCount}
            onClick={() => selectTeamMode("byPlayerCount")}
            label="Team Size"
            description="X players per team"
            controls={stepper}
          />
        </div>

        <div className="flex-1 min-h-4" />

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
  /** Settings shown inside the card while this mode is selected */
  controls?: ReactNode
}

function ModeOption({
  index,
  active,
  onClick,
  label,
  description,
  controls,
}: ModeOptionProps) {
  const expanded = active && !!controls
  return (
    <div
      className={`mode-option ${active ? "is-active" : ""} ${expanded ? "is-expanded" : ""}`}
    >
      <button onClick={onClick} aria-pressed={active} className="mode-option__select">
        <span className="mode-option__index">{index}</span>
        <span>
          <span className="mode-option__label">{label}</span>
          <span className="mode-option__desc">{description}</span>
        </span>
      </button>
      {controls && (
        <div className="mode-option__controls" inert={!expanded}>
          <div>
            <div className="mode-option__tray">{controls}</div>
          </div>
        </div>
      )}
    </div>
  )
}
