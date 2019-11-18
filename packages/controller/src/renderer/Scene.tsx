import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { AppState } from '../state'
import { MeshNode } from './MeshNode'

export interface UseVideoState {
  texture?: THREE.Texture
  loading: boolean
  videoWidth: number
  videoHeight: number
}

export function useVideoTexture(videoUrl?: string): UseVideoState {
  const [state, setState] = React.useState<UseVideoState>({
    loading: true,
    videoWidth: 0,
    videoHeight: 0,
  })

  useEffect(() => {
    if (!videoUrl) {
      return
    }
    const video = document.createElement('video')
    video.src = videoUrl
    video.autoplay = true
    video.loop = true

    const handler = () => {
      setState(state => ({
        ...state,
        texture: new THREE.VideoTexture(video),
        loading: false,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      }))
    }

    video.addEventListener('canplay', handler)

    return () => {
      video.removeEventListener('canplay', handler)
    }
  }, [videoUrl])

  return state
}

export const Scene: React.FC<AppState> = ({ videoUrl, samplers, viewPort }) => {
  const { texture, loading, videoWidth, videoHeight } = useVideoTexture(
    videoUrl,
  )

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const renderer = useMemo(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return undefined
    }
    return new THREE.WebGLRenderer({
      antialias: true,
      canvas,
    })
  }, [canvasRef.current])

  const camera = useMemo(() => {
    const camera = new THREE.OrthographicCamera(
      0,
      viewPort.width,
      0,
      viewPort.height,
      1,
      1000,
    )
    camera.position.z = 75
    return camera
  }, [viewPort.width, viewPort.height])

  const scene = useMemo(() => new THREE.Scene(), [])

  useEffect(() => {
    let handle: number | undefined

    const render = () => {
      handle = requestAnimationFrame(render)
      if (!renderer) {
        return
      }
      renderer.render(scene, camera)
    }

    render()

    return () => {
      if (handle !== undefined) {
        cancelAnimationFrame(handle)
      }
    }
  }, [renderer, camera, scene])

  const [meshes, setMeshes] = useState<THREE.Mesh[] | undefined>()

  useEffect(() => {
    if (!videoUrl) {
      return
    }
    const meshes = Array.from({ length: samplers.length }).map(() => {
      return new THREE.Mesh()
    })
    for (const mesh of meshes) {
      scene.add(mesh)
    }
    setMeshes(meshes)

    return () => {
      for (const mesh of meshes) {
        scene.remove(mesh)
      }
    }
  }, [scene, samplers.length, videoUrl])

  return (
    <>
      <canvas
        width={viewPort.width}
        height={viewPort.height}
        ref={canvasRef}
      ></canvas>

      {texture &&
        meshes &&
        samplers.map((sampler, index) => {
          return (
            <MeshNode
              key={index.toString()}
              texture={texture}
              sampler={sampler}
              videoWidth={videoWidth}
              videoHeight={videoHeight}
              controlPoints={sampler.warp.controlPoints}
              mesh={meshes[index]}
            ></MeshNode>
          )
        })}
    </>
  )
}
