import 'antd/dist/antd.css'
import './Root.css'

import {
  Button,
  Col,
  Collapse,
  Divider,
  Form,
  Input,
  InputNumber,
  Layout,
  PageHeader,
  Radio,
  Row,
  Select,
  Slider,
  Switch,
} from 'antd'
import { remove } from 'ramda'
import React, { useCallback } from 'react'
import { generateControlPoints, useSelectSetter } from '../common'
import { PersistentAppState, Sampler, useAppState, useWindow } from '../state'
import { DisplayView } from './DisplayView'
import { AppHeader } from './menu/Header'
import { SamplerHeader } from './SamplerHeader'
import { SamplerView } from './SamplerView'

const { Content } = Layout

export const Root: React.FunctionComponent = React.memo(() => {
  const { persistentState, setPersistentState } = useAppState()
  const setterSelect = useSelectSetter<PersistentAppState>(setPersistentState)

  const rendererWindowState = useWindow({
    url: new URL('./?app=renderer', window.location.href).href,
    enabled: persistentState.isPlaying,
    options: { resizable: false, frame: false },
    target: 'renderer',
    region: persistentState.outputRegion,
  })

  const refresh = useCallback(() => {
    if (rendererWindowState.state !== 'resolved') {
      return
    }

    rendererWindowState.value.location.reload()
  }, [rendererWindowState])

  useWindow({
    url: new URL('./?app=content', window.location.href).href,
    enabled: persistentState.isPlaying,
    options: { resizable: false, frame: false, transparent: true },
    target: 'content',
    region: persistentState.inputWindow.region,
  })

  return (
    <Layout>
      <AppHeader
        appState={persistentState}
        setAppState={setPersistentState}
        refresh={refresh}
      />
      <Content
        style={{
          background: 'white',
          padding: '32px',
          width: '960px',
          margin: '64px auto 16px',
        }}
      >
        <PageHeader title="Video Controller" />
        <Form
          labelCol={{
            xs: { span: 24 },
            sm: { span: 4 },
          }}
          wrapperCol={{
            xs: { span: 24 },
            sm: { span: 20 },
          }}
        >
          <div id="main">
            <Divider>
              <h2>Input HTML</h2>
            </Divider>
            <Form.Item label="Opacity" labelAlign="left">
              <Row>
                <Col span={16}>
                  <Slider
                    min={0}
                    max={1}
                    step={1 / 255}
                    value={persistentState.inputWindow.opacity}
                    onChange={value => {
                      if (Array.isArray(value)) {
                        return
                      }
                      setterSelect('inputWindow', 'opacity')(value)
                    }}
                  ></Slider>
                </Col>
                <Col span={8}>
                  <InputNumber
                    min={0}
                    max={1}
                    step={1 / 255}
                    style={{ marginLeft: 16 }}
                    value={persistentState.inputWindow.opacity}
                    onChange={setterSelect('inputWindow', 'opacity')}
                  />
                </Col>
              </Row>
            </Form.Item>
            <Form.Item label="Content Tag" labelAlign="left">
              <Radio.Group
                value={persistentState.inputWindow.contentTag}
                onChange={event =>
                  setterSelect('inputWindow', 'contentTag')(event.target.value)
                }
              >
                <Radio value="webview">webview</Radio>
                <Radio value="iframe">iframe</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="URL" labelAlign="left">
              <Input
                value={persistentState.inputWindow.url}
                onChange={evt => {
                  setterSelect<string>('inputWindow', 'url')(evt.target.value)
                }}
              ></Input>
            </Form.Item>
            <DisplayView
              viewport={persistentState.inputWindow.region}
              setViewport={setterSelect('inputWindow', 'region')}
            />

            <Divider>
              <h2>Setup Canvas Viewport</h2>
            </Divider>
            <DisplayView
              viewport={persistentState.outputRegion}
              setViewport={setterSelect('outputRegion')}
            />

            <Divider>
              <h2>Setup Samplers</h2>
            </Divider>

            <Collapse
              bordered={true}
              activeKey={persistentState.samplers.map((_, index) =>
                index.toString(),
              )}
            >
              {persistentState.samplers.map((sampler, index) => (
                <SamplerView
                  videoWidth={persistentState.inputWindow.region.width}
                  videoHeight={persistentState.inputWindow.region.height}
                  outputWidth={persistentState.outputRegion.width}
                  outputHeight={persistentState.outputRegion.height}
                  sampler={sampler}
                  key={index.toString()}
                  header={
                    <SamplerHeader
                      title={`Sampler #${index}`}
                      deleteAction={() => {
                        const setSamplers = setterSelect<Sampler[]>('samplers')
                        setSamplers(samplers => remove(index, 1, samplers))
                      }}
                    ></SamplerHeader>
                  }
                  setSampler={setterSelect('samplers', index)}
                ></SamplerView>
              ))}
            </Collapse>

            <Form.Item>
              <Button
                type="primary"
                onClick={() => {
                  const setSamplers = setterSelect<Sampler[]>('samplers')
                  setSamplers(samplers => [
                    ...samplers,
                    {
                      in: {
                        left: 0,
                        top: 0,
                        width: 1,
                        height: 1,
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
                        controlsX: 1,
                        controlsY: 1,
                        controlPoints: generateControlPoints(1, 1),
                      },
                      view: {
                        edit: true,
                        debugRenderPoints: false,
                      },
                    },
                  ])
                }}
              >
                Add
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Content>
    </Layout>
  )
})
