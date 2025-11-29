export interface TouchPoint {
  id: number
  x: number
  y: number
  color: string
  isSelected?: boolean
  team?: number
}

export type GameMode = "standard" | "team"

export type GamePhase = "waiting" | "ready" | "countdown" | "selecting" | "result"

export type TeamGroupingMode = "byTeamCount" | "byPlayerCount"

export interface TeamConfig {
  groupingMode: TeamGroupingMode
  teamCount: number // Number of teams when groupingMode is "byTeamCount"
  playersPerTeam: number // Players per team when groupingMode is "byPlayerCount"
}

export interface GameState {
  mode: GameMode
  phase: GamePhase
  touchPoints: TouchPoint[]
  selectedId: number | null
  selectedTeam: number | null
  countdown: number
  minPlayers: number
  teamConfig: TeamConfig
  teams: TouchPoint[][]
}

// Neon colors for players
export const NEON_COLORS = [
  "#00f0ff", // Cyan
  "#ff00aa", // Pink
  "#00ff88", // Green
  "#ffff00", // Yellow
  "#ff6600", // Orange
  "#aa00ff", // Purple
  "#ff0066", // Red-Pink
  "#00ffcc", // Teal
  "#ff99ff", // Light Pink
  "#66ff00", // Lime
]

export const getPlayerColor = (index: number): string => {
  return NEON_COLORS[index % NEON_COLORS.length]
}
