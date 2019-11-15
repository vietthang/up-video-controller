import { Point, Region } from './common'

export interface Warp {
  type: 'bilinear'
  linear: boolean
  resolution: number
  controlsX: number
  controlsY: number
  controlPoints: Point[]
}

export interface Sampler {
  in: Region
  out: Region
  warp: Warp
  view: {
    edit: boolean
    debugRenderPoints: boolean
  }
}

export interface AppState {
  videoUrl?: string
  viewPort: Region
  samplers: Sampler[]
}
