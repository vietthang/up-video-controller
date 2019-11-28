import './App.css'

import React from 'react'
import { useSelectSetter } from '../common'
import { useAppState } from '../state'
import { BabylonScene } from './BabylonScene'
import { EditSamplerView } from './SamplerNode'

export const App: React.FC = () => {
  const { persistentState, transientState, setPersistentState } = useAppState()

  const selectSetter = useSelectSetter(setPersistentState)

  console.log('Renderer')

  return (
    <div
      style={{
        position: 'relative',
        left: 0,
        top: 0,
        width: persistentState.outputRegion.width,
        height: persistentState.outputRegion.height,
      }}
    >
      <BabylonScene
        persistentState={persistentState}
        transientState={transientState}
      ></BabylonScene>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {persistentState.samplers.map((sampler, index) => (
          <EditSamplerView
            key={`EditSamplerView_${index}`}
            sampler={sampler}
            showControlPoints={true}
            showRenderPoints={false}
            controlPoints={sampler.warp.controlPoints}
            setControlPoints={selectSetter(
              'samplers',
              index,
              'warp',
              'controlPoints',
            )}
          ></EditSamplerView>
        ))}
      </div>
    </div>
  )
}
