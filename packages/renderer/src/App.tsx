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
        in: { left: 0, top: 0, width: 5376 / 2, height: 192 },
        out: { left: 0, top: 0, width: 360, height: 192 },
      },
      {
        in: { left: 5376 / 2, top: 0, width: 5376 / 2, height: 192 },
        out: { left: 640, top: 0, width: 360, height: 192 },
      },
    ],
  })

  const [q] = useQueryParam('config', StringParam)

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

  useEffect(() => {
    const { ipcRenderer }: typeof import('electron') = window.require(
      'electron',
    )

    const ipcEventHandler = (evt: IpcRendererEvent, message: any) => {
      setSceneProps(message)
    }

    ipcRenderer.on('updateScene', ipcEventHandler)
    return () => {
      ipcRenderer.off('updateScene', ipcEventHandler)
    }
  })

  useEffect(() => {
    const windowMessageHandler = (evt: MessageEvent) => {
      setSceneProps(evt.data.payload)
    }

    window.addEventListener('message', windowMessageHandler)

    return () => {
      window.removeEventListener('message', windowMessageHandler)
    }
  })

  return (
    <Canvas
      invalidateFrameloop={false}
      style={{
        width: '100%',
        height: '100%',
      }}
      orthographic={true}
    >
      <Scene {...sceneProps}></Scene>
    </Canvas>
  )
}

export default App
