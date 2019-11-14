import './App.css'

import { IpcRendererEvent } from 'electron'
import { lensPath, set } from 'ramda'
import React, { DependencyList, useEffect, useState } from 'react'
import { Canvas } from 'react-three-fiber'
import { StringParam, useQueryParam } from 'use-query-params'
import { generateControlPoints, SceneState } from './common'
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
  const [sceneState, setSceneState] = useState<SceneState>({
    videoUrl: './BBB.mp4',
    viewPort: { left: 0, top: 0, width: 1280, height: 720 },
    samplers: [
      {
        sampler: {
          in: {
            left: 0,
            top: 0,
            width: 640,
            height: 720,
          },
          out: {
            left: 0,
            top: 0,
            width: 1280,
            height: 720,
          },
          config: {
            type: 'bilinear',
            linear: true,
            resolution: 16,
            controlsX: 2,
            controlsY: 2,
          },
        },
        showControlPoints: false,
        showRenderPoints: false,
        controlPoints: generateControlPoints(2, 2),
        renderPoints: [],
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
      setSceneState(props)
    } catch {
      // no need to do anything
    }
  }, [q])

  useEffectAsync(() => {
    const { ipcRenderer }: typeof import('electron') = window.require(
      'electron',
    )

    const ipcEventHandler = (evt: IpcRendererEvent, message: any) => {
      setSceneState(message)
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

      setSceneState(evt.data.payload)
    }

    window.addEventListener('message', windowMessageHandler)

    return () => {
      window.removeEventListener('message', windowMessageHandler)
    }
  })

  useEffectAsync(() => {
    const saveFile = async () => {
      const { dialog }: typeof import('electron').remote = window.require(
        'electron',
      ).remote
      const fs: typeof import('fs').promises = window.require('fs').promises

      const { filePath } = await dialog.showSaveDialog({ title: 'Save config' })
      if (!filePath) {
        return
      }
      await fs.writeFile(filePath, JSON.stringify(sceneState))
    }

    const loadFile = async () => {
      const { dialog }: typeof import('electron').remote = window.require(
        'electron',
      ).remote
      const fs: typeof import('fs').promises = window.require('fs').promises

      const { filePaths } = await dialog.showOpenDialog({
        title: 'Load config',
      })
      if (!filePaths.length) {
        return
      }
      // TODO validate config
      setSceneState(JSON.parse(await fs.readFile(filePaths[0], 'utf8')))
    }

    const toggleShowControlPoints = async () => {
      const updatedState = sceneState.samplers.reduce(
        (prev, sampler, index) => {
          return set(
            lensPath(['samplers', index, 'showControlPoints']),
            !sampler.showControlPoints,
            prev,
          )
        },
        sceneState,
      )

      setSceneState(updatedState)
    }

    const toggleShowRenderPoints = async () => {
      const updatedState = sceneState.samplers.reduce(
        (prev, sampler, index) => {
          return set(
            lensPath(['samplers', index, 'showRenderPoints']),
            !sampler.showRenderPoints,
            prev,
          )
        },
        sceneState,
      )

      setSceneState(updatedState)
    }

    const handler = (evt: KeyboardEvent) => {
      switch (evt.key) {
        case 's':
          return saveFile()
        case 'l':
          return loadFile()
        case 'c':
          return toggleShowControlPoints()
        case 'r':
          return toggleShowRenderPoints()
        default:
          return
      }
    }
    window.addEventListener('keyup', handler)
    return () => {
      window.removeEventListener('keyup', handler)
    }
  }, [sceneState])

  return (
    <div
      style={{
        position: 'relative',
        left: sceneState.viewPort.left,
        top: sceneState.viewPort.top,
        width: sceneState.viewPort.width,
        height: sceneState.viewPort.height,
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
        <Scene {...sceneState}></Scene>
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
        {sceneState.samplers.map(
          (
            {
              sampler,
              controlPoints,
              renderPoints,
              showControlPoints,
              showRenderPoints,
            },
            index,
          ) => (
            <EditSamplerView
              sampler={sampler}
              showControlPoints={showControlPoints}
              showRenderPoints={showRenderPoints}
              renderPoints={renderPoints}
              setRenderPoints={points => {
                setSceneState(
                  set(
                    lensPath(['samplers', index, 'renderPoints']),
                    points,
                    sceneState,
                  ),
                )
              }}
              controlPoints={controlPoints}
              setControlPoints={points => {
                setSceneState(
                  set(
                    lensPath(['samplers', index, 'controlPoints']),
                    points,
                    sceneState,
                  ),
                )
              }}
            ></EditSamplerView>
          ),
        )}
      </div>
    </div>
  )
}

export default App
