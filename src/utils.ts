import { DependencyList, useEffect, useState } from 'react'

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
  deps: DependencyList = [],
): AsyncState {
  const [effectState, setEffectState] = useState<AsyncState>({
    state: 'pending',
  })

  const [unmountCallback, setUnmountCallback] = useState<
    (() => Resolvable<void | undefined>) | undefined
  >()

  const [active, setActive] = useState<boolean>(true)

  useEffect(() => {
    Promise.resolve(callback())
      .then(ret => {
        setEffectState({ state: 'finished' })

        if (!ret) {
          return
        }
        if (active) {
          setUnmountCallback(ret)
          return
        }
        // resolved after unmount, just call the release
        return ret()
      })
      .catch(error => setEffectState({ state: 'error', error }))

    return () => {
      setActive(false)
      if (unmountCallback) {
        Promise.resolve(unmountCallback()).catch(error =>
          setEffectState({ state: 'error', error }),
        )
      }
    }
  }, [callback, active, unmountCallback, ...deps])

  return effectState
}
