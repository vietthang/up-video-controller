import React, { useMemo, useState } from 'react'
import { Canvas } from 'react-three-fiber'
import { StringParam, useQueryParam } from 'use-query-params'
import './App.css'
import { Scene, SceneProps } from './Scene'

export interface UpdateSceneMessage {
  type: 'updateScene'
  payload: SceneProps
}

const App: React.FC = () => {
  const [sceneProps, setSceneProps] = useState<SceneProps>({
    videoUrl: './FILAMENT_WORK_SLOW_01.mp4',
    viewPort: { left: 0, top: 0, width: 1280, height: 720 },
    samplers: [
      {
        input: { left: 0, top: 0, width: 5376 / 2, height: 192 },
        output: { left: 0, top: 0, width: 640, height: 192 },
      },
      {
        input: { left: 5376 / 2, top: 0, width: 5376 / 2, height: 192 },
        output: { left: 640, top: 0, width: 640, height: 192 },
      },
    ],
  })

  const [q] = useQueryParam('props', StringParam)

  useMemo(() => {
    if (!q) {
      return
    }
    try {
      const props = JSON.parse(q)
      setSceneProps(props)
    } catch {
      // no need to do anything
    }
  }, [q])

  useMemo(() => {
    import('electron')
      .then(electron => {
        const ipc = electron.ipcRenderer
        ipc.on('message', (evt, message) => {
          if (message.type !== 'updateScene') {
            return
          }
          setSceneProps(message.payload)
        })
      })
      .catch(error =>
        console.log(
          'can not import electron, maybe it is not run by electron',
          error,
        ),
      )

    window.addEventListener('message', evt => {
      if (evt.data !== 'updateScene') {
        return
      }
      setSceneProps(evt.data.payload)
    })
  }, [])

  return (
    <Canvas
      invalidateFrameloop={false}
      style={{
        left: sceneProps.viewPort.left,
        top: sceneProps.viewPort.top,
        width: sceneProps.viewPort.width,
        height: sceneProps.viewPort.height,
      }}
      orthographic={true}
    >
      <Scene {...sceneProps}></Scene>
    </Canvas>
  )
}

export default App
