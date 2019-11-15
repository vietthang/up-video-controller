import 'antd/dist/antd.css'
import './Root.css'

import { Button, Collapse, Divider, Form, Icon, Layout, Upload } from 'antd'
import { RcFile, UploadFile } from 'antd/lib/upload/interface'
import { indexOf, remove } from 'ramda'
import React, { useCallback, useEffect, useState } from 'react'
import { generateControlPoints, useSelectSetter } from '../common'
import { AppState, Sampler } from '../state'
import { DisplayView } from './DisplayView'
import { SamplerHeader } from './SamplerHeader'
import { SamplerView } from './SamplerView'

const { Content } = Layout
const { Dragger } = Upload

export const Root: React.FunctionComponent = React.memo(() => {
  const [[videoWidth, videoHeight], setVideoSize] = useState([0, 0])
  const [appState, setAppState] = useState<AppState>({
    viewPort: {
      left: 0,
      top: 0,
      width: 600,
      height: 400,
    },
    samplers: [],
  })
  const { samplers, viewPort } = appState
  const setterSelect = useSelectSetter<AppState>(setAppState)

  const [fileList, setFileList] = useState<UploadFile[]>([])

  useEffect(() => {
    if (!appState.videoUrl) {
      return
    }
    const video = document.createElement('video')
    const handler = () => {
      setVideoSize([video.videoWidth, video.videoHeight])
    }
    video.addEventListener('loadedmetadata', handler)
    video.src = appState.videoUrl
    return () => {
      video.removeEventListener('loadedmetadata', handler)
    }
  }, [appState.videoUrl])

  const [rendererWindow, setRendererWindow] = useState<Window | null>(null)

  useEffect(() => {
    const newRendererWindow = window.open(
      './?app=renderer',
      'renderer',
      'menubar=no,status=no,titlebar=no,toolbar=no',
    )
    setRendererWindow(newRendererWindow)

    return () => {
      if (!newRendererWindow) {
        return
      }

      newRendererWindow.close()
    }
  }, [])

  useEffect(() => {
    if (!rendererWindow) {
      return
    }

    rendererWindow.moveTo(viewPort.left, viewPort.top)
    rendererWindow.resizeTo(viewPort.width, viewPort.height)
  }, [
    rendererWindow,
    viewPort.left,
    viewPort.top,
    viewPort.width,
    viewPort.height,
  ])

  useEffect(() => {
    if (!rendererWindow) {
      return
    }

    rendererWindow.window.parentApp = { appState, setAppState }

    const event = new Event('appStateChanged')
    event.appState = appState
    rendererWindow.window.dispatchEvent(event)

    return () => {
      rendererWindow.window.parentApp = undefined
    }
  }, [rendererWindow, appState, setAppState])

  const handleBeforeUpload = useCallback(
    (file: RcFile) => {
      const videoUrl = URL.createObjectURL(file)
      setterSelect<string>('videoUrl')(videoUrl)
      setFileList([file])
      return false
    },
    [setterSelect, setFileList],
  )

  const handleRemove = useCallback(
    (file: UploadFile<any>) => {
      setterSelect<string | undefined>('videoUrl')(undefined)
      setFileList(fileList => remove(indexOf(file, fileList), 1, fileList))
    },
    [setterSelect, setFileList],
  )

  return (
    <Layout>
      <Content>
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
            <h1>Video Controller</h1>

            <Divider>
              <h2>Pick Video File</h2>
            </Divider>

            <Dragger
              multiple={false}
              directory={false}
              accept=".mp4"
              fileList={fileList}
              beforeUpload={handleBeforeUpload}
              onRemove={handleRemove}
            >
              <p className="ant-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to select file
              </p>
            </Dragger>

            <Divider>
              <h2>Setup Canvas Viewport</h2>
            </Divider>
            <DisplayView
              viewport={viewPort}
              setViewport={setterSelect('viewPort')}
            />

            <Divider>
              <h2>Setup Samplers</h2>
            </Divider>

            <Collapse
              bordered={true}
              activeKey={samplers.map((_, index) => index.toString())}
            >
              {samplers.map((sampler, index) => (
                <SamplerView
                  videoWidth={videoWidth}
                  videoHeight={videoHeight}
                  outputWidth={viewPort.width}
                  outputHeight={viewPort.height}
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
                        width: 1280,
                        height: 720,
                      },
                      warp: {
                        type: 'bilinear',
                        linear: true,
                        resolution: 256,
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