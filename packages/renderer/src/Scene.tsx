import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Point, Region, Sampler } from './common'
import { MeshNode } from './MeshNode'

export interface UseVideoState {
  loading: boolean
  videoWidth: number
  videoHeight: number
}

export function useVideoTexture(
  videoUrl?: string,
): UseVideoState & { texture?: THREE.Texture } {
  const [state, setState] = React.useState<UseVideoState>({
    loading: true,
    videoWidth: 0,
    videoHeight: 0,
  })

  const texture = useMemo(() => {
    if (!videoUrl) {
      return
    }
    const video = document.createElement('video')
    video.src = videoUrl
    video.autoplay = true
    video.loop = true
    video.addEventListener(
      'canplay',
      () => {
        setState({
          loading: false,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
        })
      },
      false,
    )

    return new THREE.VideoTexture(video)
  }, [videoUrl])

  return { ...state, texture }
}

export interface SamplerWithRenderPoints extends Sampler {
  renderPoints?: Point[]
}

export interface SceneProps {
  videoUrl?: string
  viewPort: Region
  samplers: SamplerWithRenderPoints[]
}

export const Scene: React.FunctionComponent<SceneProps> = ({
  videoUrl,
  samplers,
}) => {
  const { texture, loading, videoWidth, videoHeight } = useVideoTexture(
    videoUrl,
  )

  if (loading || !texture) {
    // TODO maybe display loading or something?
    return <></>
  }

  return (
    <>
      {samplers.map(sampler => {
        if (!sampler.renderPoints) {
          return <></>
        }
        return (
          <MeshNode
            texture={texture}
            sampler={sampler}
            renderPoints={sampler.renderPoints}
          ></MeshNode>
        )
      })}

      {/* {samplers.map((sampler, index) => {
        const {
          left: inLeft,
          top: inTop,
          width: inWidth,
          height: inHeight,
        } = sampler.in

        const {
          left: outLeft,
          top: outTop,
          width: outWidth,
          height: outHeight,
        } = sampler.out

        return (
          <mesh
            key={`mesh_${index}`}
            position={[
              -viewPort.width / 2 + outLeft + outWidth / 2,
              viewPort.height / 2 - (outTop + outHeight / 2),
              0.0,
            ]}
          >
            <bufferGeometry
              attach="geometry"
              index={new THREE.Uint16BufferAttribute([1, 0, 2, 2, 0, 3], 1)}
              attributes={{
                position: new THREE.Float32BufferAttribute(
                  [
                    // left-top
                    -outWidth / 2,
                    -outHeight / 2,
                    0,
                    // left-bottom
                    -outWidth / 2,
                    outHeight / 2,
                    0,
                    // right-bottom
                    outWidth / 2,
                    outHeight / 2,
                    0,
                    // right-top
                    outWidth / 2,
                    -outHeight / 2,
                    0,
                  ],
                  3,
                ),
                normal: new THREE.Float32BufferAttribute(
                  [
                    // left-top
                    0,
                    0,
                    1,
                    // left-bottom
                    0,
                    0,
                    1,
                    // right-bottom
                    0,
                    0,
                    1,
                    // right-top
                    0,
                    0,
                    1,
                  ],
                  3,
                ),
                uv: new THREE.Float32BufferAttribute(
                  [
                    // left-top
                    inLeft / videoWidth,
                    inTop / videoHeight,
                    // left-bottom
                    inLeft / videoWidth,
                    (inTop + inHeight) / videoHeight,
                    // right-bottom
                    (inLeft + inWidth) / videoWidth,
                    (inTop + inHeight) / videoHeight,
                    // right-top
                    (inLeft + inWidth) / videoWidth,
                    inTop / videoHeight,
                  ],
                  2,
                ),
              }}
            ></bufferGeometry>
            <meshBasicMaterial attach="material" map={texture} />
          </mesh>
        )
      })} */}
    </>
  )
}
