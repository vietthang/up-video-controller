import { Col, Form, InputNumber, Row, Slider } from 'antd'
import React from 'react'

export interface SamplerPropViewProps {
  label: string
  boundRange: [number, number]
  range: [number, number]
  setRange: (range: [number, number]) => void
}

export const SamplerPropView: React.FunctionComponent<SamplerPropViewProps> = ({
  label,
  boundRange,
  range,
  setRange,
}) => {
  return (
    <Form.Item label={label} labelAlign="left">
      <Row gutter={32}>
        <Col span={16}>
          <Slider
            range={true}
            min={boundRange[0]}
            max={boundRange[1]}
            value={range}
            onChange={value => {
              if (!Array.isArray(value)) {
                return
              }
              setRange(value)
            }}
          />
        </Col>
        <Col span={8}>
          <InputNumber
            min={boundRange[0]}
            max={boundRange[1]}
            value={range[0]}
            onChange={value => {
              if (value === undefined) {
                return
              }
              setRange([value, range[1]])
            }}
          />
          <InputNumber
            min={range[0]}
            max={boundRange[1]}
            value={range[1]}
            onChange={value => {
              if (value === undefined) {
                return
              }
              setRange([range[0], value])
            }}
          />
        </Col>
      </Row>
    </Form.Item>
  )
}
