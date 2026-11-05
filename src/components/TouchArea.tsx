import { useEffect, useRef } from "react"
import type { TouchPoint } from "../types"
import { getPlayerColor } from "../types"
import type { ParticleField } from "../particles/ParticleField"

interface TouchAreaProps {
  field: ParticleField | null
  onTouchChange: (points: TouchPoint[]) => void
  disabled: boolean
}

/**
 * Invisible full-screen input layer. Finger count changes go through React;
 * finger movement goes straight to the particle field each touchmove.
 */
export function TouchArea({ field, onTouchChange, disabled }: TouchAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const touchMapRef = useRef<Map<number, TouchPoint>>(new Map())

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Rebuild the player list from the touches still on screen
    const syncTouches = (e: TouchEvent) => {
      if (disabled) return
      e.preventDefault()

      const points: TouchPoint[] = []
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i]
        const existing = touchMapRef.current.get(touch.identifier)
        points.push({
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          color: getPlayerColor(points.length),
          team: existing?.team,
        })
      }

      touchMapRef.current = new Map(points.map((p) => [p.id, p]))
      onTouchChange(points)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (disabled) return
      e.preventDefault()

      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i]
        const existing = touchMapRef.current.get(touch.identifier)
        if (!existing) continue
        existing.x = touch.clientX
        existing.y = touch.clientY
        field?.moveFinger(touch.identifier, touch.clientX, touch.clientY)
      }
    }

    const opts = { passive: false }
    container.addEventListener("touchstart", syncTouches, opts)
    container.addEventListener("touchmove", handleTouchMove, opts)
    container.addEventListener("touchend", syncTouches, opts)
    container.addEventListener("touchcancel", syncTouches, opts)

    return () => {
      container.removeEventListener("touchstart", syncTouches)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", syncTouches)
      container.removeEventListener("touchcancel", syncTouches)
    }
  }, [disabled, field, onTouchChange])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 touch-none select-none"
      style={{ touchAction: "none" }}
    />
  )
}
