import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { Display, Region } from '../common'
import { SamplerPropView } from '../SamplerPropView'
import { useEffectAsync } from '../utils'

function useDisplays(): Display[] {
  const [displays, setDisplays] = useState<Display[]>([
    {
      id: 'virtual',
      viewPort: {
        left: 0,
        top: 0,
        width: 1200,
        height: 1920,
      },
    },
  ])

  useEffectAsync(() => {
    const { screen } = window.require('electron').remote
    const syncDisplays = () => {
      setDisplays(
        screen.getAllDisplays().map(display => ({
          id: display.id.toString(),
          viewPort: {
            left: display.bounds.x,
            top: display.bounds.y,
            width: display.bounds.width,
            height: display.bounds.height,
          },
        })),
      )
    }

    screen.addListener('display-added', syncDisplays)
    screen.addListener('display-removed', syncDisplays)
    screen.addListener('display-metrics-changed', syncDisplays)

    syncDisplays()

    return () => {
      screen.removeListener('display-metrics-changed', syncDisplays)
      screen.removeListener('display-added', syncDisplays)
      screen.removeListener('display-removed', syncDisplays)
    }
  }, [])

  useEffectAsync(() => {
    if (!window.nw) {
      return
    }

    nw.Screen.Init()

    const syncDisplays = () => {
      setDisplays(
        nw.Screen.screens.map(display => ({
          id: display.id.toString(),
          viewPort: {
            left: display.bounds.x,
            top: display.bounds.y,
            width: display.bounds.width,
            height: display.bounds.height,
          },
        })),
      )
    }

    nw.Screen.addListener('displayBoundsChanged', syncDisplays)
    nw.Screen.addListener('displayAdded', syncDisplays)
    nw.Screen.addListener('displayRemoved', syncDisplays)

    syncDisplays()

    return () => {
      nw.Screen.removeListener('displayRemoved', syncDisplays)
      nw.Screen.removeListener('displayAdded', syncDisplays)
      nw.Screen.removeListener('displayBoundsChanged', syncDisplays)
    }
  }, [setDisplays])

  return displays
}

export interface DisplayViewProps {
  viewport: Region
  setViewport: Dispatch<SetStateAction<Region>>
}

export const DisplayView: React.FunctionComponent<DisplayViewProps> = ({
  viewport,
  setViewport,
}) => {
  const displays = useDisplays()
  const minLeft = Math.min(...displays.map(display => display.viewPort.left))
  const maxRight = Math.max(
    ...displays.map(display => display.viewPort.left + display.viewPort.width),
  )
  const minTop = Math.min(...displays.map(display => display.viewPort.top))
  const maxBottom = Math.max(
    ...displays.map(display => display.viewPort.top + display.viewPort.height),
  )

  const setLeftRight = useCallback(
    ([left, right]: [number, number]) => {
      setViewport(viewport => ({ ...viewport, left, width: right - left }))
    },
    [setViewport],
  )

  const setTopBottom = useCallback(
    ([top, bottom]: [number, number]) => {
      setViewport(viewport => ({ ...viewport, top, height: bottom - top }))
    },
    [setViewport],
  )

  return (
    <>
      <SamplerPropView
        key="horizontal"
        label="Horizontal"
        boundRange={[minLeft, maxRight]}
        range={[viewport.left, viewport.left + viewport.width]}
        setRange={setLeftRight}
      ></SamplerPropView>
      <SamplerPropView
        key="vertical"
        label="Vertical"
        boundRange={[minTop, maxBottom]}
        range={[viewport.top, viewport.top + viewport.height]}
        setRange={setTopBottom}
      ></SamplerPropView>
    </>
  )
}
