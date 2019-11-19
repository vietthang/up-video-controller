import { Collapse, Divider } from 'antd'
import { CollapsePanelProps } from 'antd/lib/collapse'
import { lensPath, pipe, set } from 'ramda'
import React, { Dispatch, SetStateAction, useCallback } from 'react'
import { SamplerPropView } from '../SamplerPropView'
import { Sampler } from '../state'

const { Panel } = Collapse

export interface SamplerViewProps extends CollapsePanelProps {
  videoWidth: number
  videoHeight: number
  outputWidth: number
  outputHeight: number
  sampler: Sampler
  setSampler: Dispatch<SetStateAction<Sampler>>
}

export const SamplerView: React.FunctionComponent<SamplerViewProps> = ({
  videoWidth,
  videoHeight,
  outputWidth,
  outputHeight,
  sampler,
  setSampler,
  ...props
}) => {
  const setInLeftRight = useCallback(
    ([left, right]: [number, number]) => {
      setSampler(
        pipe(
          set<number>(lensPath(['in', 'left']), left),
          set<number>(lensPath(['in', 'width']), right - left),
        ),
      )
    },
    [setSampler],
  )

  const setInTopBottom = useCallback(
    ([top, bottom]: [number, number]) => {
      setSampler(
        pipe(
          set<number>(lensPath(['in', 'top']), top),
          set<number>(lensPath(['in', 'height']), bottom - top),
        ),
      )
    },
    [setSampler],
  )

  const setOutLeftRight = useCallback(
    ([left, right]: [number, number]) => {
      setSampler(
        pipe(
          set<number>(lensPath(['out', 'left']), left),
          set<number>(lensPath(['out', 'width']), right - left),
        ),
      )
    },
    [setSampler],
  )

  const setOutTopBottom = useCallback(
    ([top, bottom]: [number, number]) => {
      setSampler(
        pipe(
          set<number>(lensPath(['out', 'top']), top),
          set<number>(lensPath(['out', 'height']), bottom - top),
        ),
      )
    },
    [setSampler],
  )

  return (
    <Panel {...props}>
      <Divider orientation="left">Input</Divider>
      <SamplerPropView
        label="Horizontal"
        boundRange={[0, videoWidth]}
        range={[sampler.in.left, sampler.in.left + sampler.in.width]}
        setRange={setInLeftRight}
      />
      <SamplerPropView
        label="Vertical"
        boundRange={[0, videoHeight]}
        range={[sampler.in.top, sampler.in.top + sampler.in.height]}
        setRange={setInTopBottom}
      />
      <Divider orientation="left">Output</Divider>
      <SamplerPropView
        label="Horizontal"
        boundRange={[0, outputWidth]}
        range={[sampler.out.left, sampler.out.left + sampler.out.width]}
        setRange={setOutLeftRight}
      />
      <SamplerPropView
        label="Vertical"
        boundRange={[0, outputHeight]}
        range={[sampler.out.top, sampler.out.top + sampler.out.height]}
        setRange={setOutTopBottom}
      />
    </Panel>
  )
}
