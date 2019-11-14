import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Point, Region, Sampler, SceneState } from './common'
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

export const Scene: React.FunctionComponent<SceneState> = ({
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
      {samplers.map(({ sampler, renderPoints }, index) => {
        return (
          <MeshNode
            key={index.toString()}
            texture={texture}
            sampler={sampler}
            videoWidth={videoWidth}
            videoHeight={videoHeight}
            renderPoints={renderPoints}
          ></MeshNode>
        )
      })}
    </>
  )
}
