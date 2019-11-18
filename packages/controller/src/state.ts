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

export interface ImageTextureResource {
  type: 'image'
  url: string
  width: number
  height: number
}

export interface VideoTextureResource {
  type: 'video'
  url: string
  width: number
  height: number
}

export type TextureResource = ImageTextureResource | VideoTextureResource

export interface AppState {
  textureResource?: TextureResource
  viewPort: Region
  samplers: Sampler[]
}
