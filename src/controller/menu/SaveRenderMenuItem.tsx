import { Form, Icon, Input, Modal } from 'antd'
import FileSaver from 'file-saver'
import React, { FormEvent, useCallback, useState } from 'react'
import { doHooks } from '../../common'
import { useGenerateRenderPrimitives } from '../../renderer/render'
import { AppState } from '../../state'
import protos from '../protos/scene_pb'

export interface SaveRenderMenuItemProps {
  appState: AppState
}

export const SaveRenderMenuItem: React.FC<SaveRenderMenuItemProps> = ({
  appState,
}) => {
  const [showModal, setShowModal] = useState(false)
  const [configName, setConfigName] = useState<string | undefined>(undefined)
  const onClickMenuItem = useCallback(() => setShowModal(true), [setShowModal])
  const onCancelModal = useCallback(() => setShowModal(false), [setShowModal])
  const onSubmit = useCallback(
    (evt: FormEvent) => {
      const renderItems = appState.samplers.map(sampler => {
        const { positionBuffer, uvBuffer, indexBuffer } = doHooks(hooks =>
          // eslint-disable-next-line
          useGenerateRenderPrimitives({
            sampler,
            textureWidth:
              (appState.textureResource && appState.textureResource.width) || 1,
            textureHeight:
              (appState.textureResource && appState.textureResource.height) ||
              1,
            useMemo: hooks.useMemo,
            useEffect: hooks.useEffect,
          }),
        )
        console.log('positionBuffer', positionBuffer)
        console.log('uvBuffer', uvBuffer)
        console.log('indexBuffer', indexBuffer)
        const renderItem = new protos.RenderItem()
        renderItem.setVertexcount(positionBuffer.length / 3)
        renderItem.setPositionbuffer(new Uint8Array(positionBuffer.buffer))
        renderItem.setUvbuffer(new Uint8Array(uvBuffer.buffer))
        renderItem.setIndexcount(indexBuffer.length)
        renderItem.setIndexbuffer(new Uint8Array(indexBuffer.buffer))
        return renderItem
      })
      const proto = new protos.RenderItems()
      proto.setItemsList(renderItems)
      setConfigName(configName => {
        FileSaver.saveAs(
          new Blob([proto.serializeBinary()]),
          configName || 'config.pb',
        )
        return configName
      })

      setShowModal(false)
      return evt.preventDefault()
    },
    [setShowModal, appState, setConfigName],
  )

  return (
    <>
      <Modal
        visible={showModal}
        onCancel={onCancelModal}
        onOk={onSubmit}
        afterClose={onCancelModal}
        title={'Download render file'}
        destroyOnClose={true}
        okButtonProps={{ title: 'Download', name: 'Download' }}
      >
        <Form onSubmit={onSubmit}>
          <Form.Item>
            <Input
              placeholder="Filename"
              value={configName}
              onChange={e => setConfigName(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
      <div
        style={{ width: '100%', height: '100%', padding: '0 20px' }}
        onClick={onClickMenuItem}
      >
        <Icon
          type="container"
          title="Save Render Primitives"
          style={{
            fontSize: '32px',
            marginRight: 0,
            lineHeight: '64px',
          }}
        />
      </div>
    </>
  )
}
