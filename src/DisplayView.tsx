import React, { useState } from 'react'
import { Display, Region } from './common'
import { SamplerPropView } from './SamplerPropView'

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

  // const state = useEffectAsync(async () => {
  //   // const { screen } = await import('electron')
  //   // const syncDisplays = () =>
  //   //   setDisplays(
  //   //     screen.getAllDisplays().map(display => ({
  //   //       id: display.id.toString(),
  //   //       viewPort: {
  //   //         left: display.bounds.x,
  //   //         top: display.bounds.y,
  //   //         width: display.bounds.height,
  //   //         height: display.bounds.height,
  //   //       },
  //   //     })),
  //   //   )
  //   // screen.addListener('display-added', syncDisplays)
  //   // screen.addListener('display-removed', syncDisplays)
  //   // screen.addListener('display-metrics-changed', syncDisplays)
  //   // return () => {
  //   //   screen.removeListener('display-metrics-changed', syncDisplays)
  //   //   screen.removeListener('display-added', syncDisplays)
  //   //   screen.removeListener('display-removed', syncDisplays)
  //   // }
  // }, [])

  // if (state.state === 'error') {
  //   console.error('error', state.error)
  // }

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
