import './App.css'

import React, { useEffect, useState } from 'react'
import { useAppState } from '../state'

export const App: React.FC = () => {
  const { persistentState, setTransientState } = useAppState()

  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null)

  useEffect(() => {
    chrome.tabCapture.capture({ video: true, audio: false }, stream => {
      if (!stream) {
        return setTransientState(oldState => ({
          ...oldState,
          mediaStream: {
            state: 'rejected',
            error: new Error('failed to capture'),
          },
        }))
      }
      return setTransientState(oldState => ({
        ...oldState,
        mediaStream: { state: 'resolved', value: stream },
      }))
    })
  }, [])

  switch (persistentState.inputWindow.contentTag) {
    case 'webview':
      return (
        <webview
          src={persistentState.inputWindow.url}
          style={{
            opacity: persistentState.inputWindow.opacity,
            width: '100%',
            height: '100%',
          }}
        ></webview>
      )
    case 'iframe':
      return (
        <iframe
          ref={setFrame}
          src={persistentState.inputWindow.url}
          style={{
            opacity: persistentState.inputWindow.opacity,
            width: '100%',
            height: '100%',
          }}
        ></iframe>
      )
  }
}
