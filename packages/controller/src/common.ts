export interface Region {
  left: number
  top: number
  width: number
  height: number
}

export interface Sampler {
  in: Region
  out: Region
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
