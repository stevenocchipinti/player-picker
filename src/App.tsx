import { useState, useEffect, useCallback, useRef } from "react"
import type { TouchPoint, GameMode, GamePhase, TeamConfig } from "./types"
import { getPlayerColor, NEON_COLORS } from "./types"
import { TouchArea } from "./components/TouchArea"
import { Countdown } from "./components/Countdown"
import { ModeSelector } from "./components/ModeSelector"

const COUNTDOWN_START = 3
const MIN_PLAYERS_STANDARD = 2
const MIN_PLAYERS_SINGLE = 1

function App() {
  const [phase, setPhase] = useState<GamePhase>("waiting")
  const [mode, setMode] = useState<GameMode>("standard")
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(COUNTDOWN_START)
  const [showMenu, setShowMenu] = useState(true)
  const [teamConfig, setTeamConfig] = useState<TeamConfig>({
    groupingMode: "byTeamCount",
    teamCount: 2,
    playersPerTeam: 2,
  })

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const previousTouchCountRef = useRef(0)
  const simulatedTouchesRef = useRef<TouchPoint[]>([])

  const minPlayers = mode === "single" ? MIN_PLAYERS_SINGLE : MIN_PLAYERS_STANDARD

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
    simulatedTouchesRef.current = []
  }, [clearCountdown])

  // Select a random player
  const selectRandomPlayer = useCallback(() => {
    const allPoints =
      mode === "single"
        ? [...touchPoints, ...simulatedTouchesRef.current]
        : touchPoints

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

      // Calculate total players including simulated
      const totalPlayers =
        mode === "single" ? newCount + simulatedTouchesRef.current.length : newCount

      // If touch count changed, reset countdown
      if (prevCount !== newCount && phase === "countdown") {
        clearCountdown()
        setPhase("ready")
        setCountdown(COUNTDOWN_START)
      }

      // Check if we have enough players
      if (totalPlayers >= minPlayers) {
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
    [phase, mode, minPlayers, clearCountdown, startCountdown]
  )

  // Generate simulated touches for single player mode
  const generateSimulatedTouches = useCallback(() => {
    const simulated: TouchPoint[] = []
    const numSimulated = 3 + Math.floor(Math.random() * 3) // 3-5 simulated players

    for (let i = 0; i < numSimulated; i++) {
      simulated.push({
        id: -(i + 1), // Negative IDs for simulated
        x: 100 + Math.random() * (window.innerWidth - 200),
        y: 150 + Math.random() * (window.innerHeight - 300),
        color: getPlayerColor(i + 1),
      })
    }

    simulatedTouchesRef.current = simulated
  }, [])

  // Handle starting the game from menu
  const handleStart = useCallback(() => {
    setShowMenu(false)
    resetGame()

    if (mode === "single") {
      generateSimulatedTouches()
    }
  }, [mode, resetGame, generateSimulatedTouches])

  // Handle restart
  const handleRestart = useCallback(() => {
    resetGame()
    setShowMenu(true)
  }, [resetGame])

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
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
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

  // Combine real and simulated touches for display
  const allTouchPoints =
    mode === "single"
      ? [...touchPoints, ...simulatedTouchesRef.current]
      : touchPoints

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <TouchArea
        touchPoints={allTouchPoints}
        onTouchChange={handleTouchChange}
        selectedId={selectedId}
        showTeams={mode === "team" && phase === "result"}
        disabled={phase === "result"}
        isWaiting={phase === "ready" || phase === "countdown"}
      />

      <Countdown count={countdown} isVisible={phase === "countdown"} />

      {/* Status overlay */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-40 pointer-events-none">
        <div className="px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm border border-cyan-400/30">
          <span className="text-cyan-400 text-sm font-medium">
            {phase === "waiting" && (
              <>
                {mode === "single"
                  ? "Tap anywhere to join"
                  : `Need ${minPlayers}+ players`}
              </>
            )}
            {phase === "ready" && "Hold still..."}
            {phase === "countdown" && "Selecting..."}
            {phase === "result" && (
              <>
                {mode === "team" && selectedTeam !== null
                  ? `Team ${selectedTeam + 1} Goes First!`
                  : "Winner!"}
              </>
            )}
          </span>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm border border-fuchsia-400/30">
          <span className="text-fuchsia-400 text-sm font-medium">
            {allTouchPoints.length} player{allTouchPoints.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Back button */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={handleRestart}
          className="px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-600/50 text-slate-400 hover:text-slate-200 hover:border-slate-500 text-sm transition-colors"
        >
          ← Menu
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
