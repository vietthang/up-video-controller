import { DependencyList, useEffect, useState } from 'react'

type Resolvable<T> = T | Promise<T>

type EffectAyncCallback = () => Resolvable<
  void | (() => Resolvable<void | undefined>)
>

export type AsyncState<T> =
  | { state: 'pending' }
  | { state: 'resolved'; value: T }
  | { state: 'rejected'; error: any }

async function executeAsync(
  cb: EffectAyncCallback,
): Promise<void | (() => Resolvable<void | undefined>)> {
  return cb()
}

export function useEffectAsync(
  callback: EffectAyncCallback,
  deps: DependencyList = [],
): AsyncState<void> {
  const [effectState, setEffectState] = useState<AsyncState<void>>({
    state: 'pending',
  })

  useEffect(() => {
    let active = true
    let unmountCallback: (() => Resolvable<void | undefined>) | undefined

    executeAsync(callback)
      .then(ret => {
        setEffectState({ state: 'resolved', value: undefined })

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
      .catch(error => setEffectState({ state: 'rejected', error }))

    return () => {
      active = false
      if (unmountCallback) {
        executeAsync(unmountCallback).catch(error =>
          setEffectState({ state: 'rejected', error }),
        )
      }
    }
  }, [...deps, setEffectState])

  return effectState
}

export function useResource<T>(
  creator: () => Resolvable<T>,
  remover: (value: T) => Resolvable<void>,
  deps: DependencyList = [],
): AsyncState<T> {
  const [resourceState, setResourceState] = useState<AsyncState<T>>({
    state: 'pending',
  })

  const effectState = useEffectAsync(async () => {
    const value = await creator()
    return async () => {
      await remover(value)
    }
  }, deps)

  useEffect(() => {
    if (effectState.state === 'rejected') {
      setResourceState(effectState)
    }
  }, [effectState, setResourceState])

  return resourceState
}

export function wait(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
