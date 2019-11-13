export interface Point {
  x: number
  y: number
}

export interface Region {
  left: number
  top: number
  width: number
  height: number
}

export interface SamplerConfig {
  type: 'bilinear'
  linear: boolean
  resolution: number
  controlsX: number
  controlsY: number
}

export function generateControlPoints(
  controlsX: number,
  controlsY: number,
): Point[] {
  return Array.from({
    length: controlsY + 2,
  }).flatMap((_, y) => {
    return Array.from({
      length: controlsX + 2,
    }).flatMap((_, x) => {
      return {
        x: x / (controlsX + 1),
        y: y / (controlsY + 1),
      }
    })
  })
}

export interface Sampler {
  in: Region
  out: Region
  config: SamplerConfig
}

export interface Display {
  id: string
  viewPort: Region
}

export interface SceneProps {
  videoUrl?: string
  viewPort: Region
  samplers: Sampler[]
}

let current = 0

export function nextId() {
  return (current++).toString()
}

export type Float4 = [number, number, number, number]

export type Float44 = [Float4, Float4, Float4, Float4]

export type Float444 = [Float44, Float44, Float44, Float44]

// https://www.paulinternet.nl/?page=bicubic
export function cubicInterpolate(p: Float4, x: number): number {
  return (
    p[1] +
    0.5 *
      x *
      (p[2] -
        p[0] +
        x *
          (2.0 * p[0] -
            5.0 * p[1] +
            4.0 * p[2] -
            p[3] +
            x * (3.0 * (p[1] - p[2]) + p[3] - p[0])))
  )
}

export function bicubicInterpolate(p: Float44, x: number, y: number): number {
  return cubicInterpolate(p.map(p => cubicInterpolate(p, y)) as Float4, x)
}

export function tricubicInterpolate(
  p: Float444,
  x: number,
  y: number,
  z: number,
): number {
  return cubicInterpolate(p.map(p => bicubicInterpolate(p, y, z)) as Float4, x)
}

export type Point4 = [Point, Point, Point, Point]

export function cubicInterpolatePoint(p: Point4, x: number): Point {
  const px: Float4 = [p[0].x, p[1].x, p[2].x, p[3].x]
  const py: Float4 = [p[0].y, p[1].y, p[2].y, p[3].y]
  return {
    x: cubicInterpolate(px, x),
    y: cubicInterpolate(py, x),
  }
}
