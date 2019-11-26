import './App.css'

import React, { SetStateAction, useCallback, useEffect, useState } from 'react'
import { generateControlPoints, useSelectSetter } from '../common'
import { AppState } from '../state'
import { useEffectAsync } from '../utils'
import { BabylonScene } from './BabylonScene'
import { EditSamplerView } from './SamplerNode'

export const App: React.FC = () => {
  const [localAppState, setLocalAppState] = useState<AppState>({
    textureResource: {
      type: 'video',
      url: './BBB.mp4',
      width: 1280,
      height: 720,
    },
    viewPort: { left: 0, top: 0, width: 1280, height: 1920 },
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
          width: 1280,
          height: 1920,
        },
        warp: {
          type: 'bilinear',
          linear: true,
          resolution: 16,
          controlsX: 2,
          controlsY: 2,
          controlPoints: generateControlPoints(2, 2),
        },
        view: {
          edit: true,
          debugRenderPoints: false,
        },
      },
    ],
    isPlaying: true,
  })

  useEffect(() => {
    if (!window.parentApp) {
      return
    }

    setLocalAppState(window.parentApp.appState)
    const handler = () => {
      if (!window.parentApp) {
        return
      }
      setLocalAppState(window.parentApp.appState)
    }
    window.addEventListener('appStateChanged', handler)

    return () => {
      window.removeEventListener('appStateChanged', handler)
    }
  }, [setLocalAppState])

  const setAppState = useCallback(
    (appState: SetStateAction<AppState>) => {
      setLocalAppState(appState)
      if (!window.parentApp) {
        return
      }
      window.parentApp.setAppState(appState)
    },
    [setLocalAppState],
  )

  const saveFile = useCallback(async () => {
    const { dialog } = window.require('electron').remote
    const fs: typeof import('fs').promises = window.require('fs').promises

    const { filePath } = await dialog.showSaveDialog({ title: 'Save config' })
    if (!filePath) {
      return
    }

    fs.writeFile(filePath, JSON.stringify(localAppState)).catch()
  }, [localAppState])

  const loadFile = useCallback(async () => {
    const { dialog } = window.require('electron').remote
    const fs: typeof import('fs').promises = window.require('fs').promises

    const { filePaths } = await dialog.showOpenDialog({
      title: 'Load config',
    })
    if (!filePaths.length) {
      return
    }
    // TODO validate config
    setAppState(JSON.parse(await fs.readFile(filePaths[0], 'utf8')))
  }, [setAppState])

  useEffectAsync(() => {
    const handler = (evt: KeyboardEvent) => {
      switch (evt.key) {
        case 's':
          return saveFile().catch()
        case 'l':
          return loadFile().catch()
        default:
          return
      }
    }
    window.addEventListener('keyup', handler)
    return () => {
      window.removeEventListener('keyup', handler)
    }
  }, [])

  const selectSetter = useSelectSetter(setAppState)

  return (
    <div
      style={{
        position: 'relative',
        left: 0,
        top: 0,
        width: localAppState.viewPort.width,
        height: localAppState.viewPort.height,
      }}
    >
      <BabylonScene {...localAppState}></BabylonScene>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {localAppState.samplers.map((sampler, index) => (
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

export default App
