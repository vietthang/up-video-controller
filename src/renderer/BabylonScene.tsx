import React, { useState } from 'react'
import { PersistentAppState, TransientAppState } from '../state'
import { BabylonSubScene } from './BabylonSubScene'

export interface BabylonSceneProps {
  persistentState: PersistentAppState
  transientState: TransientAppState
}

export const BabylonScene: React.FC<BabylonSceneProps> = ({
  persistentState,
  transientState,
}) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  return (
    <>
      <canvas
        width={persistentState.outputRegion.width}
        height={persistentState.outputRegion.height}
        ref={setCanvas}
      ></canvas>

      {canvas && (
        <BabylonSubScene
          canvas={canvas}
          viewPort={persistentState.outputRegion}
          samplers={persistentState.samplers}
          inputWidth={persistentState.inputWindow.region.width}
          inputHeight={persistentState.inputWindow.region.height}
          mediaStreamState={transientState.mediaStream}
        ></BabylonSubScene>
      )}
    </>
  )
}
