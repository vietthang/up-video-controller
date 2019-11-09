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
  controlPoints: Point[]
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
