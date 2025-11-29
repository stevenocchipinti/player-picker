import { useState, useEffect, useCallback, useRef } from "react"
import type { TouchPoint, GameMode, GamePhase, TeamConfig } from "./types"
import { NEON_COLORS } from "./types"
import { TouchArea } from "./components/TouchArea"
import { Countdown } from "./components/Countdown"
import { ModeSelector } from "./components/ModeSelector"

const COUNTDOWN_START = 3
const MIN_PLAYERS = 2

function App() {
  const [phase, setPhase] = useState<GamePhase>("waiting")
  const [mode, setMode] = useState<GameMode>("standard")
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [_selectedTeam, setSelectedTeam] = useState<number | null>(null)
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
    setSelectedId(null)
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
      // Select first player of winning team for visual
      const winningPlayer = teamsAssigned.find((p) => p.team === winningTeam)
      if (winningPlayer) {
        setSelectedId(winningPlayer.id)
      }
    } else {
      // Standard or single player mode
      const randomIndex = Math.floor(Math.random() * allPoints.length)
      setSelectedId(allPoints[randomIndex].id)
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

  // Handle starting the game from menu
  const handleStart = useCallback(() => {
    setShowMenu(false)
    resetGame()
    // Push a history state so browser back button can return to menu
    window.history.pushState({ screen: "game" }, "")
    // Enter fullscreen if not already
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen request may fail (e.g., not triggered by user gesture)
      })
    }
  }, [resetGame])

  // Handle restart
  const handleRestart = useCallback(() => {
    resetGame()
    setShowMenu(true)
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {
        // Exit fullscreen may fail
      })
    }
  }, [resetGame])

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (!showMenu) {
        resetGame()
        setShowMenu(true)
        // Exit fullscreen if active
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {})
        }
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [showMenu, resetGame])

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

  if (showMenu) {
    return (
      <main className="min-h-screen bg-[#050508]">
        <ModeSelector
          mode={mode}
          onModeChange={setMode}
          teamConfig={teamConfig}
          onTeamConfigChange={setTeamConfig}
          onStart={handleStart}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050508] overflow-hidden relative">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      <TouchArea
        touchPoints={touchPoints}
        onTouchChange={handleTouchChange}
        selectedId={selectedId}
        showTeams={mode === "team" && phase === "result"}
        disabled={phase === "result"}
        isWaiting={phase === "ready" || phase === "countdown"}
      />

      <Countdown count={countdown} isVisible={phase === "countdown"} />

      {/* Back button */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={handleRestart}
          className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-sm transition-colors flex items-center gap-1.5"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Menu
        </button>
      </div>
    </main>
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
