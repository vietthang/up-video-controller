import { IpcRendererEvent } from 'electron'
import React, { DependencyList, useEffect, useState } from 'react'
import { Canvas } from 'react-three-fiber'
import { StringParam, useQueryParam } from 'use-query-params'
import './App.css'
import { Scene, SceneProps } from './Scene'

type Resolvable<T> = T | Promise<T>

type EffectAyncCallback = () => Resolvable<
  void | (() => Resolvable<void | undefined>)
>

export type AsyncState =
  | { state: 'pending' }
  | { state: 'finished' }
  | { state: 'error'; error: any }

export function useEffectAsync(
  callback: EffectAyncCallback,
  deps?: DependencyList,
): AsyncState {
  const [effectState, setEffectState] = useState<AsyncState>({
    state: 'pending',
  })

  useEffect(() => {
    let active = true
    let unmountCallback: (() => Resolvable<void | undefined>) | undefined

    Promise.resolve(callback())
      .then(ret => {
        setEffectState({ state: 'finished' })

        if (!ret) {
          return
        }
        if (active) {
          unmountCallback = ret
          return
        }
        // resolved after unmount, just call the release
        return ret()
      })
      .catch(error => setEffectState({ state: 'error', error }))

    return () => {
      active = false
      if (unmountCallback) {
        Promise.resolve(unmountCallback()).catch(error =>
          setEffectState({ state: 'error', error }),
        )
      }
    }
  }, deps)

  return effectState
}

const App: React.FC = () => {
  const [sceneProps, setSceneProps] = useState<SceneProps>({
    videoUrl: './FILAMENT_WORK_SLOW_01.mp4',
    viewPort: { left: 0, top: 0, width: 1280, height: 720 },
    samplers: [
      {
        input: { left: 0, top: 0, width: 5376 / 2, height: 192 },
        output: { left: 0, top: 0, width: 360, height: 192 },
      },
      {
        input: { left: 5376 / 2, top: 0, width: 5376 / 2, height: 192 },
        output: { left: 640, top: 0, width: 360, height: 192 },
      },
    ],
  })

  const [q] = useQueryParam('props', StringParam)

  useEffect(() => {
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

  useEffectAsync(async () => {
    const { ipcRenderer } = await import('electron')

    const ipcEventHandler = (evt: IpcRendererEvent, message: any) => {
      setSceneProps(message.payload)
    }

    ipcRenderer.on('updateScene', ipcEventHandler)
    return () => {
      ipcRenderer.off('updateScene', ipcEventHandler)
    }
  })

  useEffect(() => {
    const windowMessageHnadler = (evt: MessageEvent) => {
      if (evt.data !== 'updateScene') {
        return
      }
      setSceneProps(evt.data.payload)
    }

    window.addEventListener('message', windowMessageHnadler)

    return () => {
      window.removeEventListener('message', windowMessageHnadler)
    }
  })

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
