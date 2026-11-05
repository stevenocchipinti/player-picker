import { useState, useEffect, useCallback, useRef } from "react"
import type { TouchPoint, GameMode, GamePhase, TeamConfig } from "./types"
import { NEON_COLORS } from "./types"
import { TouchArea } from "./components/TouchArea"
import { GameHud, type ResultTag } from "./components/GameHud"
import { ModeSelector } from "./components/ModeSelector"
import { ParticleCanvas } from "./components/ParticleCanvas"
import {
  type ParticleField,
  type FieldPhase,
  resultHaloRadius,
} from "./particles/ParticleField"

const COUNTDOWN_START = 3
const MIN_PLAYERS = 2

function App() {
  const [phase, setPhase] = useState<GamePhase>("waiting")
  const [mode, setMode] = useState<GameMode>("standard")
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([])
  const [winnerIds, setWinnerIds] = useState<number[]>([])
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null)
  const [field, setField] = useState<ParticleField | null>(null)
  const [countdown, setCountdown] = useState(COUNTDOWN_START)
  const [showMenu, setShowMenu] = useState(true)
  const [teamConfig, setTeamConfig] = useState<TeamConfig>({
    groupingMode: "byTeamCount",
    teamCount: 2,
    playersPerTeam: 2,
  })

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const previousTouchCountRef = useRef(0)

  const minPlayers = MIN_PLAYERS

  // Clear countdown timer
  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }, [])

  // Reset game to waiting state
  const resetGame = useCallback(() => {
    clearCountdown()
    setPhase("waiting")
    setWinnerIds([])
    setSelectedTeam(null)
    setCountdown(COUNTDOWN_START)
    setTouchPoints([])
    previousTouchCountRef.current = 0
  }, [clearCountdown])

  // Select a random player
  const selectRandomPlayer = useCallback(() => {
    const allPoints = touchPoints

    if (allPoints.length === 0) return

    if (mode === "team") {
      // Assign teams and select a random team
      const teamsAssigned = assignTeams(allPoints, teamConfig)
      setTouchPoints(teamsAssigned)
      const numTeams =
        teamConfig.groupingMode === "byTeamCount"
          ? teamConfig.teamCount
          : Math.ceil(allPoints.length / teamConfig.playersPerTeam)
      const winningTeam = Math.floor(Math.random() * numTeams)
      setSelectedTeam(winningTeam)
      setWinnerIds(
        teamsAssigned.filter((p) => p.team === winningTeam).map((p) => p.id)
      )
    } else {
      // Standard or single player mode
      const randomIndex = Math.floor(Math.random() * allPoints.length)
      setWinnerIds([allPoints[randomIndex].id])
    }

    setPhase("result")
  }, [mode, touchPoints, teamConfig])

  // Start countdown
  const startCountdown = useCallback(() => {
    clearCountdown()
    setPhase("countdown")
    setCountdown(COUNTDOWN_START)

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearCountdown()
          selectRandomPlayer()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearCountdown, selectRandomPlayer])

  // Handle touch changes
  const handleTouchChange = useCallback(
    (points: TouchPoint[]) => {
      // If we're in result phase, don't react to touch changes
      if (phase === "result") return

      const prevCount = previousTouchCountRef.current
      const newCount = points.length
      previousTouchCountRef.current = newCount

      setTouchPoints(points)

      // If touch count changed, reset countdown
      if (prevCount !== newCount && phase === "countdown") {
        clearCountdown()
        setPhase("ready")
        setCountdown(COUNTDOWN_START)
      }

      // Check if we have enough players
      if (newCount >= minPlayers) {
        if (phase === "waiting" || phase === "ready") {
          setPhase("ready")
          // Start countdown after a brief moment of stability
          if (prevCount === newCount && newCount > 0) {
            startCountdown()
          }
        }
      } else {
        if (phase !== "waiting") {
          clearCountdown()
          setPhase("waiting")
          setCountdown(COUNTDOWN_START)
        }
      }
    },
    [phase, minPlayers, clearCountdown, startCountdown]
  )

  // Check if running as installed PWA (already in fullscreen/standalone mode)
  const isStandalonePWA = useCallback(() => {
    return (
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true
    )
  }, [])

  // Handle starting the game from menu
  const handleStart = useCallback(() => {
    setShowMenu(false)
    resetGame()
    // Lock scrolling for game screen
    document.documentElement.classList.add("game-active")
    // Push a history state so browser back button can return to menu
    window.history.pushState({ screen: "game" }, "")
    // Enter fullscreen only if not already in PWA mode
    if (!isStandalonePWA() && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen request may fail (e.g., not triggered by user gesture)
      })
    }
  }, [resetGame, isStandalonePWA])

  // Handle restart
  const handleRestart = useCallback(() => {
    resetGame()
    setShowMenu(true)
    // Unlock scrolling for menu
    document.documentElement.classList.remove("game-active")
    // Exit fullscreen only if not in PWA mode (we entered it ourselves)
    if (!isStandalonePWA() && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {
        // Exit fullscreen may fail
      })
    }
  }, [resetGame, isStandalonePWA])

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (!showMenu) {
        resetGame()
        setShowMenu(true)
        // Unlock scrolling for menu
        document.documentElement.classList.remove("game-active")
        // Exit fullscreen only if not in PWA mode
        if (!isStandalonePWA() && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {})
        }
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [showMenu, resetGame, isStandalonePWA])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCountdown()
    }
  }, [clearCountdown])

  // Watch for stable touch count to start countdown
  useEffect(() => {
    if (phase === "ready" && touchPoints.length >= minPlayers) {
      const stableTimer = setTimeout(() => {
        startCountdown()
      }, 500)

      return () => clearTimeout(stableTimer)
    }
  }, [phase, touchPoints.length, minPlayers, startCountdown])

  // Keep the particle field in sync with the players on screen
  useEffect(() => {
    field?.setFingers(touchPoints)
  }, [field, touchPoints])

  useEffect(() => {
    const fieldPhase: FieldPhase =
      phase === "countdown" ? "countdown" : phase === "result" ? "result" : "gather"
    field?.setPhase(fieldPhase, { winnerIds, countdownSeconds: COUNTDOWN_START })
  }, [field, phase, winnerIds])

  const isTeamResult = mode === "team" && phase === "result"
  const resultTags: ResultTag[] =
    phase === "result" && field
      ? touchPoints.flatMap((p) => {
          const pos = field.getFingerPosition(p.id) ?? p
          const won = winnerIds.includes(p.id)
          if (!isTeamResult && !won) return []
          return [
            {
              id: p.id,
              x: pos.x,
              y: pos.y,
              color: p.color,
              highlight: won,
              label: isTeamResult
                ? `Team ${(p.team ?? 0) + 1}${p.team === selectedTeam ? " · Selected" : ""}`
                : "Selected",
            },
          ]
        })
      : []

  const modeLabel =
    mode === "standard"
      ? "Standard"
      : teamConfig.groupingMode === "byTeamCount"
        ? `${teamConfig.teamCount} teams`
        : `Teams of ${teamConfig.playersPerTeam}`

  return (
    <>
      <ParticleCanvas onReady={setField} />

      {showMenu ? (
        <main className="relative min-h-screen overflow-auto">
          <ModeSelector
            mode={mode}
            onModeChange={setMode}
            teamConfig={teamConfig}
            onTeamConfigChange={setTeamConfig}
            onStart={handleStart}
          />
        </main>
      ) : (
        <main className="fixed inset-0 overflow-hidden">
          <TouchArea
            field={field}
            onTouchChange={handleTouchChange}
            disabled={phase === "result"}
          />
          <GameHud
            phase={phase}
            playerCount={touchPoints.length}
            countdown={countdown}
            modeLabel={modeLabel}
            tags={resultTags}
            tagOffset={resultHaloRadius(winnerIds.length) + 16}
            onMenu={handleRestart}
          />
        </main>
      )}
    </>
  )
}

// Helper function to assign teams
function assignTeams(players: TouchPoint[], config: TeamConfig): TouchPoint[] {
  const shuffled = [...players].sort(() => Math.random() - 0.5)

  if (config.groupingMode === "byTeamCount") {
    // Divide evenly into X teams
    return shuffled.map((player, index) => ({
      ...player,
      team: index % config.teamCount,
      color: NEON_COLORS[index % config.teamCount % NEON_COLORS.length],
    }))
  } else {
    // Group into teams of Y players
    return shuffled.map((player, index) => ({
      ...player,
      team: Math.floor(index / config.playersPerTeam),
      color:
        NEON_COLORS[
          Math.floor(index / config.playersPerTeam) % NEON_COLORS.length
        ],
    }))
  }
}

export default App
