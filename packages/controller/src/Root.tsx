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
  Modal,
  Row,
  Upload,
} from 'antd'
import { UploadFile } from 'antd/lib/upload/interface'
import { remove, update } from 'ramda'
import React, { useEffect, useState } from 'react'
import { Region, Sampler } from './common'
import { DisplayView } from './DisplayView'
import { SamplerHeader } from './SamplerHeader'
import { SamplerView } from './SamplerView'

const { Content } = Layout
const { Dragger } = Upload

export const Root: React.FunctionComponent = () => {
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined)
  const [[videoWidth, videoHeight], setVideoSize] = useState([0, 0])
  const [viewport, setViewport] = useState<Region>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  })

  useEffect(() => {
    if (!videoUrl) {
      return
    }
    const video = document.createElement('video')
    video.addEventListener('loadedmetadata', () => {
      setVideoSize([video.videoWidth, video.videoHeight])
    })
    video.src = videoUrl
  }, [videoUrl])

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
                  setVideoUrl(URL.createObjectURL(file))
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
              <DisplayView viewport={viewport} setViewport={setViewport} />

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
                      outputWidth={1280}
                      outputHeight={720}
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
                            width: 0,
                            height: 0,
                          },
                          out: {
                            left: 0,
                            top: 0,
                            width: 0,
                            height: 0,
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
