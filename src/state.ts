import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { generateControlPoints, Point, Region } from './common'
import { openWindow } from './nwUtils'
import { AsyncState, useEffectAsync } from './utils'

export interface Warp {
  type: 'bilinear'
  linear: boolean
  resolution: number
  controlsX: number
  controlsY: number
  controlPoints: Point[]
}

export interface Sampler {
  in: Region
  out: Region
  warp: Warp
  view: {
    edit: boolean
    debugRenderPoints: boolean
  }
}

export interface PersistentAppState {
  inputWindow: {
    url?: string
    region: Region
    opacity: number
    contentTag: 'iframe' | 'webview'
  }
  outputRegion: Region
  samplers: Sampler[]
  isPlaying: boolean
}

export interface TransientAppState {
  mediaStream: AsyncState<MediaStream>
}

export interface AppState {
  persistentState: PersistentAppState
  setPersistentState: Dispatch<SetStateAction<PersistentAppState>>
  transientState: TransientAppState
  setTransientState: Dispatch<SetStateAction<TransientAppState>>
}

const defaultPersistentAppState: PersistentAppState = {
  inputWindow: {
    url: 'https://www.youtube.com/embed/tgbNymZ7vqY',
    opacity: 1,
    region: {
      left: 0,
      top: 0,
      width: 400,
      height: 300,
    },
    contentTag: 'iframe',
  },
  outputRegion: { left: 0, top: 0, width: 1200, height: 1920 },
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
  isPlaying: false,
}

export function useAppState(): AppState {
  const [persistentState, setPersistentState] = useState<PersistentAppState>(
    defaultPersistentAppState,
  )
  const [transientState, setTransientState] = useState<TransientAppState>({
    mediaStream: { state: 'pending' },
  })

  const openerWindow = useMemo(() => {
    try {
      return window.opener.window as Window
    } catch {
      return undefined
    }
  }, [])

  const parentState = useMemo(() => {
    try {
      if (!openerWindow) {
        return
      }
      return openerWindow.appState
    } catch {
      return undefined
    }
  }, [openerWindow])

  // apply warp state from opener windows
  useEffectAsync(() => {
    if (!openerWindow || !parentState) {
      return
    }

    setPersistentState(parentState.persistentState)

    const handler = (evt: Event) => {
      if (!evt.persistentState) {
        return
      }
      setPersistentState(evt.persistentState)
    }

    openerWindow.addEventListener('persistentStateChanged', handler)

    return () => {
      openerWindow.removeEventListener('persistentStateChanged', handler)
    }
  }, [openerWindow, setPersistentState])

  // dispatch an "appStateChanged" to window object everytime appState changed
  useEffect(() => {
    const event = new Event('persistentStateChanged')
    event.persistentState = persistentState
    window.dispatchEvent(event)
  }, [persistentState])

  const setPersistentStatePropagate = useCallback(
    (value: SetStateAction<PersistentAppState>) => {
      setPersistentState(value)

      if (!parentState) {
        return
      }

      // propagate to opener
      parentState.setPersistentState(value)
    },
    [parentState, setPersistentState],
  )

  // apply transient state from opener windows
  useEffectAsync(() => {
    if (!openerWindow || !parentState) {
      return
    }

    setTransientState(parentState.transientState)

    const handler = (evt: Event) => {
      if (!evt.transientState) {
        return
      }
      setTransientState(evt.transientState)
    }

    openerWindow.addEventListener('transientStateChanged', handler)

    return () => {
      openerWindow.removeEventListener('transientStateChanged', handler)
    }
  }, [openerWindow, setTransientState])

  // dispatch an "transientStateChanged" to window object
  useEffect(() => {
    const event = new Event('transientStateChanged')
    event.transientState = transientState
    window.dispatchEvent(event)
  }, [transientState])

  const setTransientStatePropagate = useCallback(
    (value: SetStateAction<TransientAppState>) => {
      setTransientState(value)

      if (!parentState) {
        return
      }

      // propagate to opener
      parentState.setTransientState(value)
    },
    [parentState, setTransientState],
  )

  const appState = useMemo(() => {
    return {
      persistentState,
      setPersistentState: setPersistentStatePropagate,
      transientState,
      setTransientState: setTransientStatePropagate,
    }
  }, [
    persistentState,
    setPersistentStatePropagate,
    transientState,
    setTransientStatePropagate,
  ])

  // imbue window with the warp object
  useEffect(() => {
    window.appState = appState
  }, [appState])

  return appState
}

export interface UseWindowProps {
  url: string
  enabled: boolean
  target?: string
  region: Region
  options?: NWJS_Helpers.WindowOpenOption
}

export function useWindow({
  url,
  enabled,
  region,
  options = {},
  target,
}: UseWindowProps): AsyncState<Window> {
  const [state, setState] = useState<AsyncState<Window>>({ state: 'pending' })

  const effectState = useEffectAsync(async () => {
    if (!enabled) {
      return
    }

    const newWindow = await openWindow(url, { id: target, ...options })

    const loadedHandler = () => {
      setState({ state: 'resolved', value: newWindow.window as any })
    }

    newWindow.on('loaded', loadedHandler)

    const closedHandler = () => {
      setState({ state: 'pending' })
    }
    newWindow.on('closed', closedHandler)

    return () => {
      newWindow.off('closed', closedHandler)
      newWindow.off('loaded', loadedHandler)
      newWindow.close()
    }
  }, [enabled])

  useEffect(() => {
    if (effectState.state === 'rejected') {
      setState(effectState)
    }
  }, [effectState])

  useEffect(() => {
    if (state.state !== 'resolved') {
      return
    }

    state.value.moveTo(region.left, region.top)
    state.value.resizeTo(region.width, region.height)
  }, [state, region.left, region.top, region.width, region.height])

  return state
}
