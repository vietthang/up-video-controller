import './App.css'

import { Icon, Modal } from 'antd'
import React, { SetStateAction, useCallback, useEffect, useState } from 'react'
import { generateControlPoints, useSelectSetter } from '../common'
import { AppState } from '../state'
import { useEffectAsync } from '../utils'
import { BabylonScene } from './BabylonScene'
import { EditSamplerView } from './SamplerNode'

export const App: React.FC = () => {
  const [localAppState, setLocalAppState] = useState<AppState>(
    (window.opener && window.opener.appState) || {
      textureResource: {
        type: 'video',
        url: './BBB.mp4',
        width: 1280,
        height: 720,
      },
      viewPort: { left: 0, top: 0, width: 1200, height: 1920 },
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
            width: 1200,
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
    },
  )

  useEffect(() => {
    if (!window.opener) {
      return
    }

    const opener: Window = window.opener

    const handler = (evt: Event & { appState?: AppState }) => {
      if (!evt.appState) {
        return
      }
      setLocalAppState(evt.appState)
    }

    opener.addEventListener('appStateChanged', handler)

    return () => {
      opener.removeEventListener('appStateChanged', handler)
    }
  }, [setLocalAppState])

  const setAppState = useCallback(
    (appState: SetStateAction<AppState>) => {
      setLocalAppState(appState)
      if (!window.opener) {
        return
      }
      window.opener.setAppState(appState)
    },
    [setLocalAppState],
  )

  const [showDraggableModal, setShowDraggableModal] = useState(false)

  useEffectAsync(() => {
    const handler = (evt: KeyboardEvent) => {
      switch (evt.key) {
        case 'q':
          return setShowDraggableModal(old => !old)
        default:
          return
      }
    }
    window.addEventListener('keyup', handler)
    return () => {
      window.removeEventListener('keyup', handler)
    }
  }, [setShowDraggableModal])

  const selectSetter = useSelectSetter(setAppState)

  return (
    <>
      <Modal
        visible={showDraggableModal}
        centered={false}
        width="100%"
        style={{ top: 0, left: 0, right: 0, width: '100%', position: 'fixed' }}
        footer={null}
      >
        <div className="webkitDraggale" style={{ textAlign: 'center' }}>
          <Icon type="drag" style={{ fontSize: '48px' }} />
        </div>
      </Modal>
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
    </>
  )
}

export default App
