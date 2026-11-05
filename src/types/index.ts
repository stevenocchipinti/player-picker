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

// Player colours: bright, distinct hues that read well against deep space
export const NEON_COLORS = [
  "#3ef0ff", // Cyan
  "#ff3fb4", // Pink
  "#8dff5a", // Lime
  "#ffc93e", // Amber
  "#9d6bff", // Violet
  "#ff7a3e", // Orange
  "#3effb0", // Mint
  "#ff5c5c", // Red
  "#5c8dff", // Blue
  "#f2ff3e", // Yellow
]

export const getPlayerColor = (index: number): string => {
  return NEON_COLORS[index % NEON_COLORS.length]
}
