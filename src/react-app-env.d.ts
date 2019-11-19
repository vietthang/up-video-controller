/// <reference types="react-scripts" />

import 'electron'

declare module 'react-dnd-mouse-backend' {
  const e: any
  export default e
}

import { Dispatch, SetStateAction } from 'react'
import { AppState } from './state'

declare global {
  interface Window {
    parentApp?: {
      appState: AppState
      setAppState: Dispatch<SetStateAction<AppState>>
    }
  }

  interface Event {
    appState?: AppState
  }
}
