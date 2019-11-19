import React, { useState } from 'react'
import { AppState } from '../state'
import { BabylonSubScene } from './BabylonSubScene'

export const BabylonScene: React.FC<AppState> = ({
  isPlaying,
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
          isPlaying={isPlaying}
        ></BabylonSubScene>
      )}
    </>
  )
}
