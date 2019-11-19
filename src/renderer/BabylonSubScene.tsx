import { notification } from 'antd'
import {
  Engine,
  FreeCamera,
  Mesh,
  Scene,
  Texture,
  Vector3,
  VideoTexture,
} from 'babylonjs'
import React, { Dispatch, useEffect, useMemo } from 'react'
import { Region } from '../common'
import {
  ImageTextureResource,
  Sampler,
  TextureResource,
  VideoTextureResource,
} from '../state'
import { BabylonMeshNode } from './BabylonMeshNode'

function loadImageTexture(
  scene: Scene,
  resource: ImageTextureResource,
): Texture {
  return new Texture(resource.url, scene)
}

function loadVideoTexture(
  scene: Scene,
  resource: VideoTextureResource,
): VideoTexture {
  return new VideoTexture(
    'video',
    resource.url,
    scene,
    false,
    undefined,
    undefined,
    {
      autoPlay: true,
      autoUpdateTexture: true,
      loop: true,
    },
  )
}

export function useTexture(
  scene: Scene,
  textureResource?: TextureResource,
): [Texture, Dispatch<boolean> | undefined] {
  const [texture, setIsPlaying] = useMemo<
    [Texture, Dispatch<boolean> | undefined]
  >(() => {
    if (!textureResource) {
      return [new Texture(null, scene), undefined] // return empty texture
    }
    switch (textureResource.type) {
      case 'image':
        return [loadImageTexture(scene, textureResource), undefined]
      case 'video':
        const videoTexture = loadVideoTexture(scene, textureResource)
        return [
          videoTexture,
          isPlaying => {
            if (isPlaying && videoTexture.video.paused) {
              videoTexture.video
                .play()
                .catch(error => notification.error({ message: error }))
              return
            }

            if (!isPlaying && !videoTexture.video.paused) {
              videoTexture.video.pause()
              return
            }
          },
        ]
    }
  }, [scene, textureResource])

  useEffect(() => () => texture.dispose(), [texture])

  return [texture, setIsPlaying]
}

export interface BabylonSubSceneProps {
  isPlaying: boolean
  canvas: HTMLCanvasElement
  viewPort: Region
  textureResource?: TextureResource
  samplers: Sampler[]
}

export const BabylonSubScene: React.FC<BabylonSubSceneProps> = ({
  isPlaying,
  canvas,
  viewPort,
  textureResource,
  samplers,
}) => {
  const renderer = useMemo(() => {
    return new Engine(canvas, true)
  }, [canvas])

  useEffect(() => () => renderer.dispose(), [renderer])

  const scene = useMemo(() => {
    return new Scene(renderer)
  }, [renderer])

  useEffect(() => () => scene.dispose(), [scene])

  const [texture, setIsPlaying] = useTexture(scene, textureResource)
  useEffect(() => {
    setIsPlaying && setIsPlaying(isPlaying)
  }, [isPlaying, setIsPlaying])

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
            videoWidth={(textureResource && textureResource.width) || 1}
            videoHeight={(textureResource && textureResource.height) || 1}
            mesh={meshes[index]}
            scene={scene}
          ></BabylonMeshNode>
        )
      })}
    </>
  )
}
