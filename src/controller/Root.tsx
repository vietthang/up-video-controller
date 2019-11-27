import 'antd/dist/antd.css'
import './Root.css'

import {
  Button,
  Collapse,
  Divider,
  Form,
  Icon,
  Layout,
  notification,
  PageHeader,
  Upload,
} from 'antd'
import { RcFile, UploadFile } from 'antd/lib/upload/interface'
import { indexOf, remove } from 'ramda'
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { generateControlPoints, useSelectSetter } from '../common'
import { AppState, Sampler, TextureResource } from '../state'
import { DisplayView } from './DisplayView'
import { AppHeader } from './menu/Header'
import { SamplerHeader } from './SamplerHeader'
import { SamplerView } from './SamplerView'

const { Content } = Layout
const { Dragger } = Upload

declare global {
  interface Window {
    appState?: AppState
    setAppState?: Dispatch<SetStateAction<AppState>>
  }
}

export const Root: React.FunctionComponent = React.memo(() => {
  const [appState, setAppState] = useState<AppState>({
    viewPort: {
      left: 0,
      top: 0,
      width: 600,
      height: 400,
    },
    samplers: [],
    isPlaying: false,
  })
  const setterSelect = useSelectSetter<AppState>(setAppState)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [rendererWindow, setRendererWindow] = useState<Window | null>(null)

  useEffect(() => {
    if (!appState.isPlaying) {
      return
    }

    const newRendererWindow = window.open(
      './?app=renderer',
      'renderer',
      `menubar=no,status=no,titlebar=no,toolbar=no,frame=0`,
    )
    if (!newRendererWindow) {
      notification.error({ message: 'Failed to open new window' })
      return
    }
    setRendererWindow(newRendererWindow)

    return () => {
      newRendererWindow.close()
      setRendererWindow(null)
    }
  }, [appState.isPlaying])

  useEffect(() => {
    if (!rendererWindow) {
      return
    }

    rendererWindow.window.moveTo(appState.viewPort.left, appState.viewPort.top)
    rendererWindow.window.resizeTo(
      appState.viewPort.width,
      appState.viewPort.height,
    )
  }, [
    rendererWindow,
    appState.viewPort.left,
    appState.viewPort.top,
    appState.viewPort.width,
    appState.viewPort.height,
  ])

  useEffect(() => {
    window.setAppState = setAppState
  }, [setAppState])

  useEffect(() => {
    const event = new Event('appStateChanged')
    event.appState = appState
    window.appState = appState
    window.dispatchEvent(event)
  }, [appState])

  const handleBeforeUpload = useCallback(
    (file: RcFile) => {
      const setTextureResource = (textureResource: TextureResource): void => {
        setAppState(appState => ({ ...appState, textureResource }))
      }

      const loadImage = (url: string) => {
        const image = document.createElement('img')
        image.src = url
        image.addEventListener('load', () => {
          setTextureResource({
            type: 'image',
            url,
            width: image.width,
            height: image.height,
          })
        })
      }

      const loadVideo = (url: string) => {
        const video = document.createElement('video')
        video.src = url
        video.autoplay = true
        video.loop = true
        video.addEventListener('loadedmetadata', () => {
          setTextureResource({
            type: 'video',
            url,
            width: video.videoWidth,
            height: video.videoHeight,
          })
        })
      }
      const fileUrl = URL.createObjectURL(file)

      switch (true) {
        case file.name.endsWith('.mp4'):
          loadVideo(fileUrl)
          break
        case file.name.endsWith('.jpg'):
        case file.name.endsWith('.jpeg'):
        case file.name.endsWith('.png'):
          loadImage(fileUrl)
          break
      }

      setFileList([file])
      return false
    },
    [setAppState, setFileList],
  )

  const handleRemove = useCallback(
    (file: UploadFile<any>) => {
      setterSelect<TextureResource | undefined>('textureResource')(undefined)
      setFileList(fileList => remove(indexOf(file, fileList), 1, fileList))
    },
    [setterSelect, setFileList],
  )

  return (
    <Layout>
      <AppHeader
        appState={appState}
        setAppState={setAppState}
        rendererWindow={rendererWindow}
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
              <h2>Pick Video File</h2>
            </Divider>

            <Dragger
              multiple={false}
              directory={false}
              accept="video/*,image/*"
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
              viewport={appState.viewPort}
              setViewport={setterSelect('viewPort')}
            />

            <Divider>
              <h2>Setup Samplers</h2>
            </Divider>

            <Collapse
              bordered={true}
              activeKey={appState.samplers.map((_, index) => index.toString())}
            >
              {appState.samplers.map((sampler, index) => (
                <SamplerView
                  videoWidth={
                    appState.textureResource
                      ? appState.textureResource.width
                      : 1
                  }
                  videoHeight={
                    appState.textureResource
                      ? appState.textureResource.height
                      : 1
                  }
                  outputWidth={appState.viewPort.width}
                  outputHeight={appState.viewPort.height}
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
