import { Collapse, Divider } from 'antd'
import { CollapsePanelProps } from 'antd/lib/collapse'
import { lensPath, pipe, set } from 'ramda'
import React from 'react'
import { Sampler } from './common'
import { SamplerPropView } from './SamplerPropView'

const { Panel } = Collapse

export interface SamplerViewProps extends CollapsePanelProps {
  videoWidth: number
  videoHeight: number
  outputWidth: number
  outputHeight: number
  sampler: Sampler
  setSampler: (sampler: Sampler) => void
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
  return (
    <Panel {...props}>
      <Divider orientation="left">Input</Divider>
      <SamplerPropView
        label="Horizontal"
        boundRange={[0, videoWidth]}
        range={[sampler.in.left, sampler.in.left + sampler.in.width]}
        setRange={range => {
          setSampler(
            pipe(
              set<number>(lensPath(['in', 'left']), range[0]),
              set<number>(lensPath(['in', 'width']), range[1] - range[0]),
            )(sampler),
          )
        }}
      />
      <SamplerPropView
        label="Vertical"
        boundRange={[0, videoHeight]}
        range={[sampler.in.top, sampler.in.top + sampler.in.height]}
        setRange={range => {
          setSampler(
            pipe(
              set<number>(lensPath(['in', 'top']), range[0]),
              set<number>(lensPath(['in', 'height']), range[1] - range[0]),
            )(sampler),
          )
        }}
      />
      <Divider orientation="left">Output</Divider>
      <SamplerPropView
        label="Horizontal"
        boundRange={[0, outputWidth]}
        range={[sampler.out.left, sampler.out.left + sampler.out.width]}
        setRange={range => {
          setSampler(
            pipe(
              set<number>(lensPath(['out', 'left']), range[0]),
              set<number>(lensPath(['out', 'width']), range[1] - range[0]),
            )(sampler),
          )
        }}
      />
      <SamplerPropView
        label="Vertical"
        boundRange={[0, outputHeight]}
        range={[sampler.out.top, sampler.out.top + sampler.out.height]}
        setRange={range => {
          setSampler(
            pipe(
              set<number>(lensPath(['out', 'top']), range[0]),
              set<number>(lensPath(['out', 'height']), range[1] - range[0]),
            )(sampler),
          )
        }}
      />
    </Panel>
  )
}
