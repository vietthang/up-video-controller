import 'antd/dist/antd.css'
import './Root.css'

import {
  Button,
  Col,
  Collapse,
  Divider,
  Form,
  Icon,
  Layout,
  Row,
  Upload,
} from 'antd'
import { UploadFile } from 'antd/lib/upload/interface'
import { remove, update } from 'ramda'
import React, { useEffect, useState } from 'react'
import { Region, Sampler, SceneProps } from './common'
import { DisplayView } from './DisplayView'
import { SamplerHeader } from './SamplerHeader'
import { SamplerView } from './SamplerView'

const { Content } = Layout
const { Dragger } = Upload

type BrowserWindow = import('electron').BrowserWindow

export const Root: React.FunctionComponent = () => {
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined)
  const [[videoWidth, videoHeight], setVideoSize] = useState([0, 0])
  const [viewPort, setViewport] = useState<Region>({
    left: 0,
    top: 0,
    width: 600,
    height: 400,
  })
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [samplers, setSamplers] = useState<Sampler[]>([
    {
      in: {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      },
      out: {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      },
    },
  ])

  useEffect(() => {
    if (!videoUrl) {
      return
    }
    const video = document.createElement('video')
    const handler = () => {
      setVideoSize([video.videoWidth, video.videoHeight])
    }
    video.addEventListener('loadedmetadata', handler)
    video.src = videoUrl
    return () => {
      video.removeEventListener('loadedmetadata', handler)
    }
  }, [videoUrl])

  const [rendererWindow, setRendererWindow] = useState<
    BrowserWindow | undefined
  >()

  useEffect(() => {
    const electron: typeof import('electron').remote = window.require(
      'electron',
    ).remote
    const rendererWindow = new electron.BrowserWindow({
      x: viewPort.left,
      y: viewPort.top,
      width: viewPort.width,
      height: viewPort.height,
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
      },
      frame: false,
    })

    const rendererUrl = new URL('http://localhost:3001')
    const props: SceneProps = {
      videoUrl,
      viewPort,
      samplers,
    }
    rendererUrl.searchParams.append('config', JSON.stringify(props))

    rendererWindow
      .loadURL(rendererUrl.toString())
      .catch(error => console.error('error', error))

    const windowViewPortChangeHandler = () => {
      const bounds = rendererWindow.getBounds()
      if (
        bounds.x === viewPort.left &&
        bounds.y === viewPort.top &&
        bounds.width === viewPort.width &&
        bounds.height === viewPort.height
      ) {
        // nothing change, early return to prevent endless loop
        return
      }

      setViewport({
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
      })
    }
    rendererWindow.on('resize', windowViewPortChangeHandler)
    rendererWindow.on('move', windowViewPortChangeHandler)

    const closeHandler = () => setRendererWindow(undefined)
    rendererWindow.on('close', closeHandler)

    setRendererWindow(rendererWindow)
    return () => {
      rendererWindow.off('close', closeHandler)
      rendererWindow.off('move', windowViewPortChangeHandler)
      rendererWindow.off('resize', windowViewPortChangeHandler)
      // rendererWindow.close()
    }
  }, [])

  useEffect(() => {
    if (!rendererWindow) {
      return
    }
    const props: SceneProps = {
      videoUrl,
      viewPort,
      samplers,
    }
    rendererWindow.webContents.send('updateScene', props)
  }, [
    rendererWindow,
    JSON.stringify(samplers),
    JSON.stringify(viewPort),
    videoUrl,
  ])

  useEffect(() => {
    if (!rendererWindow) {
      return
    }

    const bounds = rendererWindow.getBounds()
    if (
      bounds.x === viewPort.left &&
      bounds.y === viewPort.top &&
      bounds.width === viewPort.width &&
      bounds.height === viewPort.height
    ) {
      // nothing change, early return to prevent endless loop
      return
    }

    rendererWindow.setBounds({
      x: viewPort.left,
      y: viewPort.top,
      width: viewPort.width,
      height: viewPort.height,
    })
  }, [
    rendererWindow,
    viewPort.left,
    viewPort.top,
    viewPort.width,
    viewPort.height,
  ])

  return (
    <Layout>
      <Content>
        <Row gutter={[16, 16]}>
          <Col span={6} />
          <Col span={12} id="main">
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
                beforeUpload={file => {
                  setVideoUrl(
                    file.path
                      ? window
                          .require('url')
                          .pathToFileURL(file.path)
                          .toString()
                      : URL.createObjectURL(file),
                  )
                  return false
                }}
                onChange={({ file }) => {
                  setFileList([file])
                }}
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
              <DisplayView viewport={viewPort} setViewport={setViewport} />

              <Divider>
                <h2>Setup Samplers</h2>
              </Divider>
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
                <Collapse
                  bordered={true}
                  activeKey={samplers.map((_, index) => index.toString())}
                >
                  {samplers.map((sampler, index) => (
                    <SamplerView
                      // disabled={true}
                      videoWidth={videoWidth}
                      videoHeight={videoHeight}
                      outputWidth={viewPort.width}
                      outputHeight={viewPort.height}
                      sampler={sampler}
                      key={index.toString()}
                      header={
                        <SamplerHeader
                          title={`Sampler #${index}`}
                          action={() => setSamplers(remove(index, 1, samplers))}
                        ></SamplerHeader>
                      }
                      setSampler={sampler =>
                        setSamplers(update(index, sampler, samplers))
                      }
                    ></SamplerView>
                  ))}
                </Collapse>

                <Form.Item>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSamplers([
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
                            width: 1,
                            height: 1,
                          },
                        },
                      ])
                    }}
                  >
                    Add
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>
          <Col span={6} />
        </Row>
      </Content>
    </Layout>
  )
}
