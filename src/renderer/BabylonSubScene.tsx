import {
  Engine,
  FreeCamera,
  Mesh,
  Scene,
  Texture,
  Vector3,
  VideoTexture,
} from 'babylonjs'
import React, { useEffect, useMemo, useState } from 'react'
import { Region } from '../common'
import { Sampler } from '../state'
import { AsyncState } from '../utils'
import { BabylonMeshNode } from './BabylonMeshNode'

export function useTexture(
  scene: Scene,
  mediaStreamState: AsyncState<MediaStream>,
): Texture {
  const [texture, setTexture] = useState(new Texture(null, scene))

  useEffect(() => {
    if (mediaStreamState.state !== 'resolved') {
      return
    }

    const video = document.createElement('video')
    video.autoplay = true
    video.loop = true
    video.srcObject = mediaStreamState.value

    const texture = new VideoTexture(
      'video',
      video,
      scene,
      false,
      undefined,
      undefined,
      {
        autoUpdateTexture: true,
        autoPlay: true,
        loop: true,
      },
    )
    setTexture(texture)

    return () => {
      texture.dispose()
    }
  }, [mediaStreamState])

  return texture
}

export interface BabylonSubSceneProps {
  canvas: HTMLCanvasElement
  viewPort: Region
  samplers: Sampler[]
  inputWidth: number
  inputHeight: number
  mediaStreamState: AsyncState<MediaStream>
}

export const BabylonSubScene: React.FC<BabylonSubSceneProps> = ({
  canvas,
  viewPort,
  samplers,
  inputWidth,
  inputHeight,
  mediaStreamState,
}) => {
  const renderer = useMemo(() => {
    return new Engine(canvas, true)
  }, [canvas])

  useEffect(() => () => renderer.dispose(), [renderer])

  const scene = useMemo(() => {
    return new Scene(renderer)
  }, [renderer])

  useEffect(() => () => scene.dispose(), [scene])

  const texture = useTexture(scene, mediaStreamState)

  useEffect(() => {
    const camera = new FreeCamera(
      'camera',
      new Vector3(viewPort.width / 2, viewPort.height / 2, -1),
      scene,
    )
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA
    camera.orthoLeft = -viewPort.width / 2
    camera.orthoRight = viewPort.width / 2
    camera.orthoTop = -viewPort.height / 2
    camera.orthoBottom = viewPort.height / 2
    camera.minZ = 1
    camera.maxZ = 1000
    camera.setTarget(new Vector3(viewPort.width / 2, viewPort.height / 2, 0))

    scene.activeCamera = camera

    return () => {
      scene.activeCamera = null
      camera.dispose()
    }
  }, [canvas, scene, viewPort.width, viewPort.height])

  useEffect(() => {
    renderer.runRenderLoop(() => {
      scene.render()
    })

    return () => {
      renderer.stopRenderLoop()
    }
  }, [renderer, scene])

  const meshes = useMemo(() => {
    const meshes = Array.from({ length: samplers.length }).map((_, index) => {
      return new Mesh(`mesh_${index}`, scene)
    })

    return meshes
  }, [scene, samplers.length])

  useEffect(
    () => () => {
      for (const mesh of meshes) {
        mesh.dispose()
      }
    },
    [meshes],
  )

  return (
    <>
      {samplers.map((sampler, index) => {
        return (
          <BabylonMeshNode
            key={index.toString()}
            texture={texture}
            sampler={sampler}
            videoWidth={inputWidth}
            videoHeight={inputHeight}
            mesh={meshes[index]}
            scene={scene}
          ></BabylonMeshNode>
        )
      })}
    </>
  )
}
