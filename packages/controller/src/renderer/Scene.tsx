import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  AppState,
  ImageTextureResource,
  TextureResource,
  VideoTextureResource,
} from '../state'
import { MeshNode } from './MeshNode'

function loadImageTexture(resource: ImageTextureResource): THREE.Texture {
  const texture = new THREE.TextureLoader().load(resource.url)
  texture.minFilter = THREE.LinearFilter
  return texture
}

function loadVideoTexture(resource: VideoTextureResource): THREE.Texture {
  const video = document.createElement('video')
  video.src = resource.url
  video.autoplay = true
  video.loop = true
  return new THREE.VideoTexture(video)
}

export function useTexture(textureResource?: TextureResource): THREE.Texture {
  return useMemo(() => {
    if (!textureResource) {
      return new THREE.Texture() // return empty texture
    }
    switch (textureResource.type) {
      case 'image':
        return loadImageTexture(textureResource)
      case 'video':
        return loadVideoTexture(textureResource)
    }
  }, [textureResource])
}

export const Scene: React.FC<AppState> = ({
  textureResource,
  samplers,
  viewPort,
}) => {
  const texture = useTexture(textureResource)

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
  }, [scene, samplers.length])

  return (
    <>
      <canvas
        width={viewPort.width}
        height={viewPort.height}
        ref={canvasRef}
      ></canvas>

      {texture &&
        meshes &&
        meshes.length === samplers.length &&
        samplers.map((sampler, index) => {
          return (
            <MeshNode
              key={index.toString()}
              texture={texture}
              sampler={sampler}
              videoWidth={(textureResource && textureResource.width) || 1}
              videoHeight={(textureResource && textureResource.height) || 1}
              mesh={meshes[index]}
            ></MeshNode>
          )
        })}
    </>
  )
}
