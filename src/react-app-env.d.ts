/// <reference types="react-scripts" />

declare module 'react-dnd-mouse-backend' {
  const e: any
  export default e
}

import { Dispatch, SetStateAction } from 'react'
import { AppState, PersistentAppState, TransientAppState } from './state'

declare global {
  interface Window {
    appState?: AppState
  }

  interface Event {
    persistentState?: PersistentAppState
    transientState?: TransientAppState
  }
}
