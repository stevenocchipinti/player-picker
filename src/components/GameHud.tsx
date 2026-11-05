import type { GamePhase } from "../types"

export interface ResultTag {
  id: number
  x: number
  y: number
  color: string
  label: string
  highlight: boolean
}

interface GameHudProps {
  phase: GamePhase
  playerCount: number
  countdown: number
  modeLabel: string
  tags: ResultTag[]
  /** Distance below a finger to place its tag, so it clears the swarm */
  tagOffset: number
  onMenu: () => void
}

const STATUS: Record<GamePhase, string> = {
  waiting: "Awaiting input",
  ready: "Stabilising",
  countdown: "Locking",
  selecting: "Locking",
  result: "Target acquired",
}

export function GameHud({
  phase,
  playerCount,
  countdown,
  modeLabel,
  tags,
  tagOffset,
  onMenu,
}: GameHudProps) {
  const status =
    phase === "waiting" && playerCount === 1 ? "Need 2+ players" : STATUS[phase]

  return (
    <div className="fixed inset-0 pointer-events-none z-40 hud-safe">
      <div className="hud-bar">
        <span>
          Players <b>{String(playerCount).padStart(2, "0")}</b>
        </span>
        <span>
          {modeLabel} · <b>{status}</b>
        </span>
      </div>

      <div
        className={`hud-countdown ${phase === "countdown" ? "is-visible" : ""}`}
        aria-hidden={phase !== "countdown"}
      >
        <div className="hud-countdown__number">{countdown}</div>
        <div className="hud-countdown__label">Hold steady</div>
      </div>

      <div
        className={`hud-hint ${playerCount === 0 ? "is-visible" : ""}`}
        aria-hidden={playerCount !== 0}
      >
        Place fingers on the screen
      </div>

      {phase === "result" &&
        tags.map((tag) => {
          const below = tag.y + tagOffset < window.innerHeight - 40
          // Keep the tag on screen when a finger is near the left/right edge
          const halfWidth = tag.label.length * 5.5 + 16
          const left = Math.min(
            Math.max(tag.x, halfWidth + 8),
            window.innerWidth - halfWidth - 8
          )
          return (
            <div
              key={tag.id}
              className={`hud-tag ${tag.highlight ? "is-highlight" : ""}`}
              style={{
                left,
                top: below ? tag.y + tagOffset : tag.y - tagOffset - 20,
                color: tag.highlight ? undefined : tag.color,
                borderColor: tag.color,
                background: tag.highlight ? tag.color : undefined,
                boxShadow: tag.highlight ? `0 0 20px ${tag.color}` : undefined,
              }}
            >
              {tag.label}
            </div>
          )
        })}

      <button
        onClick={onMenu}
        className="hud-menu-button pointer-events-auto"
        aria-label="Back to menu"
      >
        ◂ Menu
      </button>
    </div>
  )
}
