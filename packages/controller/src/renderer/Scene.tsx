import React, { useCallback, useEffect, useMemo, useRef } from 'react'
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

    setState(state => ({ ...state, texture: new THREE.Texture(video) }))

    const handler = () => {
      setState(state => ({
        ...state,
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

function createDemoMesh(
  width: number,
  height: number,
  videoUrl: string,
): THREE.Mesh {
  const geometry = new THREE.BufferGeometry()
  geometry.setIndex(new THREE.Uint16BufferAttribute([1, 0, 2, 0, 2, 3], 1))
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      [
        // left-top
        -width / 2,
        -height / 2,
        1,
        // left-bottom
        -width / 2,
        height / 2,
        1,
        // right-bottom
        width / 2,
        height / 2,
        1,
        // right-top
        width / 2,
        -height / 2,
        1,
      ],
      3,
    ),
  )
  geometry.setAttribute(
    'normal',
    new THREE.Float32BufferAttribute(
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
  )
  geometry.setAttribute(
    'uv',
    new THREE.Float32BufferAttribute(
      [
        // left-top
        0,
        0,
        // left-bottom
        0,
        1,
        // right-bottom
        1,
        1,
        // right-top
        0,
        1,
      ],
      2,
    ),
  )

  const video = document.createElement('video')
  video.src = videoUrl
  video.autoplay = true
  video.loop = true

  const texture = new THREE.VideoTexture(video)
  const material = new THREE.MeshBasicMaterial({ map: texture })
  material.side = THREE.DoubleSide
  return new THREE.Mesh(geometry, material)
}

export const Scene: React.FunctionComponent<AppState> = ({
  videoUrl,
  samplers,
  viewPort,
}) => {
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

  // useEffect(() => {
  //   if (!videoUrl) {
  //     return
  //   }
  //   const mesh = createDemoMesh(viewPort.width, viewPort.height, videoUrl)
  //   scene.add(mesh)
  // }, [scene])

  useEffect(() => {
    let handle: number | undefined

    const render = () => {
      handle = requestAnimationFrame(render)
      if (!renderer) {
        return
      }
      console.log('render', scene.children.length)
      renderer.render(scene, camera)
    }

    render()

    return () => {
      if (handle !== undefined) {
        cancelAnimationFrame(handle)
      }
    }
  }, [renderer, camera, scene])

  return (
    <>
      <canvas
        width={viewPort.width}
        height={viewPort.height}
        ref={canvasRef}
      ></canvas>

      {samplers.map((sampler, index) => {
        return (
          <MeshNode
            key={index.toString()}
            texture={texture}
            sampler={sampler}
            viewPort={viewPort}
            videoWidth={videoWidth}
            videoHeight={videoHeight}
            controlPoints={sampler.warp.controlPoints}
            updateMesh={mesh => scene.add(mesh)}
          ></MeshNode>
        )
      })}
    </>
  )
  //   canvasSize && (<canvas ref={canvasRef}>

  //   </canvas>)
}
