import './App.css'

import { IpcRendererEvent } from 'electron'
import update from 'ramda/es/update'
import React, { DependencyList, useEffect, useState } from 'react'
import { Canvas } from 'react-three-fiber'
import { StringParam, useQueryParam } from 'use-query-params'
import { Point, SceneProps } from './common'
import { EditSamplerView } from './SamplerNode'
import { Scene } from './Scene'

type Resolvable<T> = T | Promise<T>

type EffectAyncCallback = () => Resolvable<
  void | (() => Resolvable<void | undefined>)
>

export type AsyncState =
  | { state: 'pending' }
  | { state: 'finished' }
  | { state: 'error'; error: any }

function toAsync(
  cb: EffectAyncCallback,
): Promise<void | (() => Resolvable<void | undefined>)> {
  return new Promise(async (resolve, reject) => {
    try {
      const value = await cb()
      return resolve(value)
    } catch (reason) {
      return reject(reason)
    }
  })
}

export function useEffectAsync(
  callback: EffectAyncCallback,
  deps: DependencyList = [],
): AsyncState {
  const [effectState, setEffectState] = useState<AsyncState>({
    state: 'pending',
  })

  useEffect(() => {
    let active = true
    let unmountCallback: (() => Resolvable<void | undefined>) | undefined

    Promise.resolve(toAsync(callback))
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
  }, [...deps])

  return effectState
}

const App: React.FC = () => {
  const [sceneProps, setSceneProps] = useState<SceneProps>({
    videoUrl: './BBB.mp4',
    viewPort: { left: 0, top: 0, width: 1920, height: 1080 },
    samplers: [
      {
        in: {
          left: 0,
          top: 0,
          width: 1280,
          height: 720,
        },
        out: {
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
        },
        config: {
          type: 'bilinear',
          linear: true,
          resolution: 16,
          controlsX: 2,
          controlsY: 2,
        },
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

  useEffectAsync(() => {
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
      if (!evt.data.payload) {
        return
      }

      if (evt.data.type !== 'updateScene') {
        return
      }

      setSceneProps(evt.data.payload)
    }

    window.addEventListener('message', windowMessageHandler)

    return () => {
      window.removeEventListener('message', windowMessageHandler)
    }
  })

  const [renderPoints, setRenderPoints] = useState<Point[][]>(
    sceneProps.samplers.map(() => []),
  )

  return (
    <div
      style={{
        position: 'relative',
        left: sceneProps.viewPort.left,
        top: sceneProps.viewPort.top,
        width: sceneProps.viewPort.width,
        height: sceneProps.viewPort.height,
      }}
    >
      <Canvas
        invalidateFrameloop={false}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
        }}
        orthographic={true}
      >
        <Scene
          {...{
            ...sceneProps,
            samplers: sceneProps.samplers.map((sampler, index) => ({
              ...sampler,
              renderPoints:
                index < renderPoints.length ? renderPoints[index] : undefined,
            })),
          }}
        ></Scene>
      </Canvas>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {sceneProps.samplers.map((sampler, index) => (
          <EditSamplerView
            sampler={sampler}
            setRenderPoints={points =>
              setRenderPoints(update(index, points, renderPoints))
            }
          ></EditSamplerView>
        ))}
      </div>
    </div>
  )
}

export default App
