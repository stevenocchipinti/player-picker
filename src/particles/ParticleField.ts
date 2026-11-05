/**
 * A field of drifting particles that swarm and orbit around fingers.
 *
 * Framework-free: React feeds it fingers and phases, and it runs its own
 * requestAnimationFrame loop. Finger movement is pushed in directly via
 * `moveFinger` so touchmove never has to go through React state.
 */

type RGB = [number, number, number]

export interface FieldFinger {
  id: number
  x: number
  y: number
  color: string
}

/** gather: orbit fingers · countdown: tighten and spin up · result: winners keep their swarm */
export type FieldPhase = "gather" | "countdown" | "result"

interface Finger {
  id: number
  x: number
  y: number
  rgb: RGB
  appear: number
}

const BACKGROUND: RGB = [5 / 255, 5 / 255, 8 / 255]
const TRAIL_FADE = 0.2
const BASE_OMEGA = 2.2
const MAX_ORBIT = 80
const MAX_FINGERS = 20
const STRIDE = 7 // x, y, r, g, b, a, size
const DRIFT_TINTS: RGB[] = [
  [0.55, 0.68, 1],
  [0.35, 0.9, 1],
  [0.8, 0.55, 1],
  [0.9, 0.95, 1],
]

/** How far (CSS px) the winning swarm's halo extends, for placing labels outside it. */
export function resultHaloRadius(winnerCount: number): number {
  return MAX_ORBIT * resultScale(winnerCount)
}

function resultScale(winnerCount: number): number {
  return winnerCount <= 1 ? 1.7 : 1.2
}

function parseColor(hex: string): RGB {
  const h = hex.replace("#", "")
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB
}

// ---------------------------------------------------------------------------
// Renderers

interface Renderer {
  readonly maxParticles: number
  resize(width: number, height: number): void
  draw(data: Float32Array, count: number, wipe: boolean): void
  dispose(): void
}

const POINT_VS = `
attribute vec2 p; attribute vec4 c; attribute float s;
uniform vec2 res; varying vec4 vc;
void main() {
  vec2 z = p / res * 2.0 - 1.0;
  gl_Position = vec4(z.x, -z.y, 0.0, 1.0);
  gl_PointSize = s;
  vc = c;
}`

const POINT_FS = `
precision mediump float; varying vec4 vc;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = dot(d, d) * 4.0;
  if (r > 1.0) discard;
  float a = (1.0 - r) * (0.35 + 0.65 * exp(-r * 7.0));
  gl_FragColor = vec4(vc.rgb * vc.a * a, 1.0);
}`

const FADE_VS = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`
const FADE_FS = `precision mediump float; uniform vec4 col; void main() { gl_FragColor = col; }`

class WebGLRenderer implements Renderer {
  readonly maxParticles = 8000
  private gl: WebGLRenderingContext
  private canvas: HTMLCanvasElement
  private pointProg!: WebGLProgram
  private fadeProg!: WebGLProgram
  private quad!: WebGLBuffer
  private points!: WebGLBuffer
  private loc!: {
    p: number
    c: number
    s: number
    q: number
    res: WebGLUniformLocation | null
    col: WebGLUniformLocation | null
  }
  private lost = false

  static create(canvas: HTMLCanvasElement): WebGLRenderer | null {
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    })
    return gl ? new WebGLRenderer(canvas, gl) : null
  }

  private constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
    this.canvas = canvas
    this.gl = gl
    canvas.addEventListener("webglcontextlost", this.onLost)
    canvas.addEventListener("webglcontextrestored", this.onRestored)
    this.init()
  }

  private onLost = (e: Event) => {
    e.preventDefault()
    this.lost = true
  }

  private onRestored = () => {
    this.init()
    this.lost = false
  }

  private compile(vs: string, fs: string): WebGLProgram {
    const gl = this.gl
    const prog = gl.createProgram()!
    for (const [type, src] of [
      [gl.VERTEX_SHADER, vs],
      [gl.FRAGMENT_SHADER, fs],
    ] as const) {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, src)
      gl.compileShader(shader)
      gl.attachShader(prog, shader)
    }
    gl.linkProgram(prog)
    return prog
  }

  private init() {
    const gl = this.gl
    this.pointProg = this.compile(POINT_VS, POINT_FS)
    this.fadeProg = this.compile(FADE_VS, FADE_FS)
    this.quad = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    )
    this.points = gl.createBuffer()!
    this.loc = {
      p: gl.getAttribLocation(this.pointProg, "p"),
      c: gl.getAttribLocation(this.pointProg, "c"),
      s: gl.getAttribLocation(this.pointProg, "s"),
      q: gl.getAttribLocation(this.fadeProg, "p"),
      res: gl.getUniformLocation(this.pointProg, "res"),
      col: gl.getUniformLocation(this.fadeProg, "col"),
    }
    gl.enable(gl.BLEND)
  }

  resize(width: number, height: number) {
    this.gl.viewport(0, 0, width, height)
  }

  draw(data: Float32Array, count: number, wipe: boolean) {
    if (this.lost) return
    const { gl, loc } = this

    // Fade the previous frame towards the background to leave motion trails
    gl.useProgram(this.fadeProg)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad)
    gl.enableVertexAttribArray(loc.q)
    gl.vertexAttribPointer(loc.q, 2, gl.FLOAT, false, 0, 0)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.uniform4f(loc.col, ...BACKGROUND, wipe ? 1 : TRAIL_FADE)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.disableVertexAttribArray(loc.q)

    // Additively blend the particles so overlapping swarms glow
    gl.useProgram(this.pointProg)
    gl.uniform2f(loc.res, this.canvas.width, this.canvas.height)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.points)
    gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, count * STRIDE), gl.DYNAMIC_DRAW)
    const bytes = STRIDE * 4
    gl.enableVertexAttribArray(loc.p)
    gl.vertexAttribPointer(loc.p, 2, gl.FLOAT, false, bytes, 0)
    gl.enableVertexAttribArray(loc.c)
    gl.vertexAttribPointer(loc.c, 4, gl.FLOAT, false, bytes, 8)
    gl.enableVertexAttribArray(loc.s)
    gl.vertexAttribPointer(loc.s, 1, gl.FLOAT, false, bytes, 24)
    gl.blendFunc(gl.ONE, gl.ONE)
    gl.drawArrays(gl.POINTS, 0, count)
    gl.disableVertexAttribArray(loc.p)
    gl.disableVertexAttribArray(loc.c)
    gl.disableVertexAttribArray(loc.s)
  }

  dispose() {
    this.canvas.removeEventListener("webglcontextlost", this.onLost)
    this.canvas.removeEventListener("webglcontextrestored", this.onRestored)
  }
}

/** Fallback for devices without WebGL: fewer particles drawn as squares. */
class Canvas2DRenderer implements Renderer {
  readonly maxParticles = 1500
  private ctx: CanvasRenderingContext2D
  private width = 0
  private height = 0

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!
  }

  resize(width: number, height: number) {
    this.width = width
    this.height = height
  }

  draw(data: Float32Array, count: number, wipe: boolean) {
    const ctx = this.ctx
    const [r, g, b] = BACKGROUND.map((v) => Math.round(v * 255))
    ctx.globalCompositeOperation = "source-over"
    ctx.fillStyle = `rgba(${r},${g},${b},${wipe ? 1 : TRAIL_FADE})`
    ctx.fillRect(0, 0, this.width, this.height)
    ctx.globalCompositeOperation = "lighter"
    for (let i = 0; i < count; i++) {
      const o = i * STRIDE
      const s = data[o + 6]
      const a = Math.min(1, data[o + 5])
      ctx.fillStyle = `rgba(${(data[o + 2] * 255) | 0},${(data[o + 3] * 255) | 0},${(data[o + 4] * 255) | 0},${a})`
      if (s > 8) {
        ctx.beginPath()
        ctx.arc(data[o], data[o + 1], s / 4, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(data[o] - s / 2, data[o + 1] - s / 2, s, s)
      }
    }
  }

  dispose() {}
}

// ---------------------------------------------------------------------------
// Simulation

export class ParticleField {
  private canvas: HTMLCanvasElement
  private renderer: Renderer
  private resizeObserver: ResizeObserver
  private n: number

  // Per-particle state (structure of arrays for speed)
  private px: Float32Array
  private py: Float32Array
  private vx: Float32Array
  private vy: Float32Array
  private rank: Float32Array // stable 0..1 value deciding which finger a particle follows
  private orbit: Float32Array // preferred orbit radius
  private depth: Float32Array // fake parallax depth: size, brightness, drift speed
  private steer: Float32Array // how quickly velocity turns towards its target
  private twinkle: Float32Array
  private col: Float32Array // current rgb (3 per particle)
  private tint: Float32Array // resting rgb (3 per particle)
  private data: Float32Array

  private fingers: Finger[] = []
  private phase: FieldPhase = "gather"
  private phaseStart = 0
  private countdownSeconds = 3
  private winnerIds = new Set<number>()
  private radiusScale = 1
  private omega = BASE_OMEGA

  private width = 0
  private height = 0
  private dpr = 1
  private clock = 0
  private lastFrame = 0
  private frame = 0
  private wipe = true

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.renderer = WebGLRenderer.create(canvas) ?? new Canvas2DRenderer(canvas)

    const area = window.innerWidth * window.innerHeight
    this.n = Math.round(
      Math.min(this.renderer.maxParticles, Math.max(3000, area / 55))
    )
    const n = this.n
    this.px = new Float32Array(n)
    this.py = new Float32Array(n)
    this.vx = new Float32Array(n)
    this.vy = new Float32Array(n)
    this.rank = new Float32Array(n)
    this.orbit = new Float32Array(n)
    this.depth = new Float32Array(n)
    this.steer = new Float32Array(n)
    this.twinkle = new Float32Array(n)
    this.col = new Float32Array(n * 3)
    this.tint = new Float32Array(n * 3)
    this.data = new Float32Array((n + MAX_FINGERS * 2) * STRIDE)

    this.resize()
    for (let i = 0; i < n; i++) {
      this.px[i] = Math.random() * this.width
      this.py[i] = Math.random() * this.height
      this.rank[i] = Math.random()
      this.depth[i] = 0.25 + 0.75 * Math.random() ** 2
      this.orbit[i] = 10 + (MAX_ORBIT - 10) * Math.random() ** 1.6
      this.steer[i] = 1.5 + 4 * Math.random()
      this.twinkle[i] = Math.random() * Math.PI * 2
      const t = DRIFT_TINTS[(Math.random() * DRIFT_TINTS.length) | 0]
      this.tint.set(t, i * 3)
      this.col.set(t, i * 3)
    }

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas)
    this.lastFrame = performance.now()
    this.frame = requestAnimationFrame(this.tick)
  }

  /**
   * Set the active fingers. Order decides how particles are shared out.
   * Positions are only taken for new fingers; existing ones keep the live
   * position from `moveFinger`.
   */
  setFingers(fingers: FieldFinger[]) {
    const prev = new Map(this.fingers.map((f) => [f.id, f]))
    this.fingers = fingers.slice(0, MAX_FINGERS).map((f) => {
      const existing = prev.get(f.id)
      return {
        id: f.id,
        x: existing?.x ?? f.x,
        y: existing?.y ?? f.y,
        rgb: parseColor(f.color),
        appear: existing?.appear ?? 0,
      }
    })
  }

  moveFinger(id: number, x: number, y: number) {
    const f = this.fingers.find((f) => f.id === id)
    if (f) {
      f.x = x
      f.y = y
    }
  }

  getFingerPosition(id: number): { x: number; y: number } | null {
    const f = this.fingers.find((f) => f.id === id)
    return f ? { x: f.x, y: f.y } : null
  }

  setPhase(
    phase: FieldPhase,
    opts: { winnerIds?: number[]; countdownSeconds?: number } = {}
  ) {
    const changed = phase !== this.phase
    this.phase = phase
    this.winnerIds = new Set(opts.winnerIds ?? [])
    if (opts.countdownSeconds) this.countdownSeconds = opts.countdownSeconds
    if (changed) {
      this.phaseStart = this.clock
      if (phase === "result") this.burstLosers()
    }
  }

  dispose() {
    cancelAnimationFrame(this.frame)
    this.resizeObserver.disconnect()
    this.renderer.dispose()
  }

  private resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    if (!w || !h) return
    if (this.width && this.height && (w !== this.width || h !== this.height)) {
      for (let i = 0; i < this.n; i++) {
        this.px[i] *= w / this.width
        this.py[i] *= h / this.height
      }
    }
    this.width = w
    this.height = h
    this.canvas.width = Math.round(w * this.dpr)
    this.canvas.height = Math.round(h * this.dpr)
    this.renderer.resize(this.canvas.width, this.canvas.height)
    this.wipe = true
  }

  private fingerIndex(i: number): number {
    return Math.floor(this.rank[i] * this.fingers.length)
  }

  private burstLosers() {
    for (let i = 0; i < this.n; i++) {
      const f = this.fingers[this.fingerIndex(i)]
      if (!f || this.winnerIds.has(f.id)) continue
      const dx = this.px[i] - f.x
      const dy = this.py[i] - f.y
      const d = Math.hypot(dx, dy) + 0.01
      const kick = 150 + 450 * Math.random()
      this.vx[i] += (dx / d) * kick
      this.vy[i] += (dy / d) * kick
    }
  }

  private tick = (now: number) => {
    const dt = Math.min(0.033, (now - this.lastFrame) / 1000)
    this.lastFrame = now
    this.clock += dt
    const count = this.step(dt)
    this.renderer.draw(this.data, count, this.wipe)
    this.wipe = false
    this.frame = requestAnimationFrame(this.tick)
  }

  private step(dt: number): number {
    const t = this.clock
    const { px, py, vx, vy, col, tint, data, fingers, width: W, height: H, dpr } = this
    const n = fingers.length
    const elapsed = t - this.phaseStart

    // Phase-wide orbit shape
    if (this.phase === "countdown") {
      const p = Math.min(1, elapsed / this.countdownSeconds)
      this.radiusScale = 1 - 0.5 * p
      this.omega = BASE_OMEGA + 6 * p * p
    } else {
      const k = Math.min(1, dt * 2.5)
      const target =
        this.phase === "result"
          ? resultScale(this.winnerIds.size) + 0.12 * Math.sin(elapsed * 4)
          : 1
      this.radiusScale += (target - this.radiusScale) * k
      this.omega += ((this.phase === "result" ? 3 : BASE_OMEGA) - this.omega) * k
    }

    const isResult = this.phase === "result"
    const ck = Math.min(1, dt * 2.5)

    for (let i = 0; i < this.n; i++) {
      let f: Finger | undefined = n ? fingers[this.fingerIndex(i)] : undefined
      if (f && isResult && !this.winnerIds.has(f.id)) f = undefined

      let dvx: number, dvy: number, s: number, tr: number, tg: number, tb: number
      if (f) {
        const dx = px[i] - f.x
        const dy = py[i] - f.y
        const d = Math.hypot(dx, dy) + 0.001
        const ux = dx / d
        const uy = dy / d
        const R = this.orbit[i] * this.radiusScale
        if (d > R * 1.8 + 30) {
          // Inbound: spiral towards the finger
          const sp = Math.min(d * 2.4, 750)
          dvx = -ux * sp - uy * sp * 0.4
          dvy = -uy * sp + ux * sp * 0.4
        } else {
          // Captured: orbit at the preferred radius, inner particles faster
          const vt = this.omega * (1.4 - (0.5 * this.orbit[i]) / MAX_ORBIT) * Math.max(d, 6)
          const vr = (R - d) * 4
          dvx = -uy * vt + ux * vr
          dvy = ux * vt + uy * vr
        }
        s = this.steer[i]
        ;[tr, tg, tb] = f.rgb
      } else {
        // Free: drift through a slow flow field
        const a =
          Math.sin(px[i] * 0.004 + t * 0.07) * 2 +
          Math.cos(py[i] * 0.005 - t * 0.05) * 2
        const sp = 6 + 16 * this.depth[i]
        dvx = Math.cos(a) * sp
        dvy = Math.sin(a) * sp
        s = 0.5
        tr = tint[i * 3]
        tg = tint[i * 3 + 1]
        tb = tint[i * 3 + 2]
      }

      const k = Math.min(1, s * dt)
      vx[i] += (dvx - vx[i]) * k
      vy[i] += (dvy - vy[i]) * k
      px[i] += vx[i] * dt
      py[i] += vy[i] * dt
      if (!f) {
        if (px[i] < -20) px[i] += W + 40
        else if (px[i] > W + 20) px[i] -= W + 40
        if (py[i] < -20) py[i] += H + 40
        else if (py[i] > H + 20) py[i] -= H + 40
      }

      const c = i * 3
      col[c] += (tr - col[c]) * ck
      col[c + 1] += (tg - col[c + 1]) * ck
      col[c + 2] += (tb - col[c + 2]) * ck

      const speed = Math.hypot(vx[i], vy[i])
      const depth = this.depth[i]
      const o = i * STRIDE
      data[o] = px[i] * dpr
      data[o + 1] = py[i] * dpr
      data[o + 2] = col[c]
      data[o + 3] = col[c + 1]
      data[o + 4] = col[c + 2]
      if (f) {
        data[o + 5] = 0.55 + Math.min(0.45, speed / 900)
        data[o + 6] = (1.6 + 1.6 * depth) * dpr
      } else {
        data[o + 5] =
          (0.12 + 0.4 * depth) * (0.65 + 0.35 * Math.sin(t * 1.7 + this.twinkle[i])) +
          Math.min(0.5, speed / 800)
        data[o + 6] = (0.9 + 1.9 * depth) * dpr
      }
    }

    // Finger cores: a soft halo plus a hot centre
    let m = this.n
    const pulse =
      this.phase === "countdown" ? 1 + 0.25 * Math.sin(elapsed * 12) : 1
    for (const f of fingers) {
      f.appear = Math.min(1, f.appear + dt * 4)
      const won = isResult && this.winnerIds.has(f.id)
      const dim = isResult && !won ? 0.15 : 1
      const grow = (won ? 1.6 : 1) * (1 - (1 - f.appear) ** 3)
      const [r, g, b] = f.rgb
      data.set([f.x * dpr, f.y * dpr, r, g, b, 0.35 * dim, 70 * dpr * pulse * grow], m++ * STRIDE)
      data.set(
        [f.x * dpr, f.y * dpr, 0.6 + r * 0.4, 0.6 + g * 0.4, 0.6 + b * 0.4, dim, 13 * dpr * grow],
        m++ * STRIDE
      )
    }
    return m
  }
}
