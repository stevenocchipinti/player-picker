import { useEffect, useRef } from "react"
import { ParticleField } from "../particles/ParticleField"

interface ParticleCanvasProps {
  onReady: (field: ParticleField | null) => void
}

/** Full-screen particle backdrop shared by the menu and the game screen. */
export function ParticleCanvas({ onReady }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const field = new ParticleField(canvas)
    onReady(field)
    return () => {
      field.dispose()
      onReady(null)
    }
  }, [onReady])

  return (
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute inset-0 space-vignette" />
    </div>
  )
}
