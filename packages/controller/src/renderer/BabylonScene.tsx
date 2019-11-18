import React, { useState } from 'react'
import { AppState } from '../state'
import { BabylonSubScene } from './BabylonSubScene'

export const BabylonScene: React.FC<AppState> = ({
  textureResource,
  samplers,
  viewPort,
}) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  return (
    <>
      <canvas
        width={viewPort.width}
        height={viewPort.height}
        ref={setCanvas}
      ></canvas>

      {canvas && (
        <BabylonSubScene
          canvas={canvas}
          viewPort={viewPort}
          samplers={samplers}
          textureResource={textureResource}
        ></BabylonSubScene>
      )}

      {/* {texture &&
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
        })} */}
    </>
  )
}
