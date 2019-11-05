import React, { useEffect, useState } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'
import { Display, Region } from './common'
import { SamplerPropView } from './SamplerPropView'

interface Config {
  displays: Display[]
}

function useDisplays(): Display[] {
  const [displays, setDisplays] = useState<Display[]>([
    // create virtual display using current window
    {
      id: 'virtual',
      viewPort: {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      },
    },
  ])

  const [configQuery] = useQueryParam('config', StringParam)

  useEffect(() => {
    if (!configQuery) {
      return
    }
    try {
      const config: Config = JSON.parse(configQuery)
      setDisplays(config.displays)
    } catch {
      // ignore
    }
  }, [configQuery])

  useEffect(() => {
    const electron: typeof import('electron') = window.require('electron')

    const handler = (evt: any, config: Config) => {
      setDisplays(config.displays)
    }

    electron.ipcRenderer.on('updateConfig', handler)

    return () => {
      electron.ipcRenderer.off('updateConfig', handler)
    }
  }, [])

  return displays
}

export interface DisplayViewProps {
  viewport: Region
  setViewport: (region: Region) => void
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
  const maxBottom = Math.min(
    ...displays.map(display => display.viewPort.top + display.viewPort.height),
  )

  return (
    <>
      <SamplerPropView
        label="Horizontal"
        boundRange={[minLeft, maxRight]}
        range={[viewport.left, viewport.left + viewport.width]}
        setRange={([left, right]) => {
          setViewport({
            ...viewport,
            left,
            width: right - left,
          })
        }}
      ></SamplerPropView>
      <SamplerPropView
        label="Vertical"
        boundRange={[minTop, maxBottom]}
        range={[viewport.top, viewport.top + viewport.height]}
        setRange={([top, bottom]) => {
          setViewport({
            ...viewport,
            top,
            height: bottom - top,
          })
        }}
      ></SamplerPropView>
    </>
  )
}
