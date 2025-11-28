import { useEffect, useRef, useCallback, useState } from "react"
import type { TouchPoint } from "../types"
import { getPlayerColor } from "../types"
import { PlayerIndicator } from "./PlayerIndicator"

interface TouchAreaProps {
  touchPoints: TouchPoint[]
  onTouchChange: (points: TouchPoint[]) => void
  selectedId: number | null
  showTeams: boolean
  disabled: boolean
  isWaiting: boolean
}

export function TouchArea({
  touchPoints,
  onTouchChange,
  selectedId,
  showTeams,
  disabled,
  isWaiting,
}: TouchAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const indicatorRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const touchMapRef = useRef<Map<number, TouchPoint>>(new Map())
  const [localTouchPoints, setLocalTouchPoints] = useState<TouchPoint[]>([])

  // Update indicator positions directly via DOM for smooth movement
  const updateIndicatorPositions = useCallback((touches: TouchList) => {
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i]
      const indicator = indicatorRefs.current.get(touch.identifier)
      if (indicator) {
        indicator.style.left = `${touch.clientX}px`
        indicator.style.top = `${touch.clientY}px`
      }
    }
  }, [])

  // Handle touch changes - only update React state when count changes
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled) return
      e.preventDefault()

      const newTouchMap = new Map<number, TouchPoint>()

      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i]
        const existingPoint = touchMapRef.current.get(touch.identifier)

        newTouchMap.set(touch.identifier, {
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          color: existingPoint?.color ?? getPlayerColor(newTouchMap.size - 1),
          team: existingPoint?.team,
        })
      }

      // Reassign colors based on current order
      const touchArray = Array.from(newTouchMap.values()).map(
        (point, index) => ({
          ...point,
          color: getPlayerColor(index),
        })
      )

      touchMapRef.current = new Map(touchArray.map((p) => [p.id, p]))
      setLocalTouchPoints(touchArray)
      onTouchChange(touchArray)
    },
    [disabled, onTouchChange]
  )

  // Handle touch move - only update DOM, not React state
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled) return
      e.preventDefault()

      // Update positions directly in the DOM for performance
      updateIndicatorPositions(e.touches)

      // Also update the ref map for accurate positions
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i]
        const existingPoint = touchMapRef.current.get(touch.identifier)
        if (existingPoint) {
          touchMapRef.current.set(touch.identifier, {
            ...existingPoint,
            x: touch.clientX,
            y: touch.clientY,
          })
        }
      }
    },
    [disabled, updateIndicatorPositions]
  )

  // Handle touch end - update React state since count changed
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (disabled) return
      e.preventDefault()

      const newTouchMap = new Map<number, TouchPoint>()

      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i]
        const existingPoint = touchMapRef.current.get(touch.identifier)

        if (existingPoint) {
          newTouchMap.set(touch.identifier, {
            ...existingPoint,
            x: touch.clientX,
            y: touch.clientY,
          })
        }
      }

      // Reassign colors based on current order
      const touchArray = Array.from(newTouchMap.values()).map(
        (point, index) => ({
          ...point,
          color: getPlayerColor(index),
        })
      )

      touchMapRef.current = new Map(touchArray.map((p) => [p.id, p]))
      setLocalTouchPoints(touchArray)
      onTouchChange(touchArray)
    },
    [disabled, onTouchChange]
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd, { passive: false })
    container.addEventListener("touchcancel", handleTouchEnd, {
      passive: false,
    })

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
      container.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // Use passed touchPoints for display (includes simulated), but local for real touches
  const displayPoints = touchPoints.length > 0 ? touchPoints : localTouchPoints

  // Callback ref handler for indicators
  const setIndicatorRef = useCallback(
    (id: number) => (el: HTMLDivElement | null) => {
      if (el) {
        indicatorRefs.current.set(id, el)
      } else {
        indicatorRefs.current.delete(id)
      }
    },
    []
  )

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 touch-none select-none"
      style={{ touchAction: "none" }}
    >
      {/* Background grid effect */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Render all touch points */}
      {displayPoints.map((point) => (
        <PlayerIndicator
          key={point.id}
          ref={setIndicatorRef(point.id)}
          player={point}
          isSelected={selectedId === point.id}
          isWaiting={isWaiting}
          showTeam={showTeams}
        />
      ))}
    </div>
  )
}
