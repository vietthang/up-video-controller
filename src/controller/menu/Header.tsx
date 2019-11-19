import { Icon, Layout, List, Menu, Modal, notification, Tooltip } from 'antd'
import { remove } from 'ramda'
import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { AppState } from '../../state'
import {
  deleteStoreItem,
  listStoreItems,
  saveStoreItem,
  StoreItem,
} from '../store'

export interface HeaderProps {
  appState: AppState
  setAppState: Dispatch<SetStateAction<AppState>>
}

export const AppHeader: React.FC<HeaderProps> = ({ appState, setAppState }) => {
  const onClickPlay = useCallback(
    () => setAppState(oldState => ({ ...oldState, isPlaying: true })),
    [setAppState],
  )

  const onClickPause = useCallback(
    () => setAppState(oldState => ({ ...oldState, isPlaying: false })),
    [setAppState],
  )

  const [isShowSaveConfigModal, setIsShowConfigModal] = useState(false)

  const onClickSaveConfig = useCallback(() => setIsShowConfigModal(true), [
    setIsShowConfigModal,
  ])

  const onCancelSaveConfigModal = useCallback(
    () => setIsShowConfigModal(false),
    [setIsShowConfigModal],
  )

  const onOkSaveConfigModal = useCallback(() => {
    setIsShowConfigModal(false)
    setAppState(oldState => {
      saveStoreItem(oldState).catch(error =>
        notification.error({ message: error.message }),
      )
      return oldState
    })
  }, [setIsShowConfigModal, setAppState])

  const [isShowLoadConfigModal, setIsShowLoadConfigModal] = useState(false)

  const [storeItems, setStoreItems] = useState<StoreItem[]>([])
  const onClickLoadConfig = useCallback(() => {
    setIsShowLoadConfigModal(true)
    listStoreItems()
      .then(setStoreItems)
      .catch(error => notification.error({ message: error.message }))
  }, [setIsShowLoadConfigModal])

  const onCancelLoadConfigModal = useCallback(
    () => setIsShowLoadConfigModal(false),
    [setIsShowLoadConfigModal],
  )

  const onOkLoadConfigModal = useCallback(() => {
    setIsShowLoadConfigModal(false)
  }, [setIsShowLoadConfigModal])

  return (
    <>
      <Modal
        visible={isShowSaveConfigModal}
        onCancel={onCancelSaveConfigModal}
        onOk={onOkSaveConfigModal}
        afterClose={onCancelSaveConfigModal}
        closable={true}
      >
        Hello
      </Modal>
      <Modal
        visible={isShowLoadConfigModal}
        onCancel={onCancelLoadConfigModal}
        onOk={onOkLoadConfigModal}
        afterClose={onCancelLoadConfigModal}
        closable={true}
      >
        <div>
          <List
            itemLayout="horizontal"
            dataSource={storeItems}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  <a
                    key="list-load"
                    onClick={() => {
                      setAppState(item.state)
                    }}
                  >
                    load
                  </a>,
                  <a
                    key="list-loadmore-more"
                    onClick={() => {
                      deleteStoreItem(item.id).catch(error =>
                        notification.error({ message: error.message }),
                      )
                      setStoreItems(oldStoreItems =>
                        remove(index, 1, oldStoreItems),
                      )
                    }}
                  >
                    delete
                  </a>,
                ]}
              >
                <div>{item.name}</div>
              </List.Item>
            )}
          ></List>
        </div>
      </Modal>
      <Layout.Header
        style={{
          position: 'fixed',
          zIndex: 1,
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0)',
        }}
      >
        <div style={{ width: '960px', margin: '0 auto' }}>
          <div className="logo" />
          <Menu
            selectable={false}
            mode="horizontal"
            // theme="dark"
            style={{ lineHeight: '64px' }}
          >
            <Menu.Item
              key="playPause"
              onClick={appState.isPlaying ? onClickPause : onClickPlay}
              disabled={!appState.textureResource}
            >
              <Tooltip title={appState.isPlaying ? 'Pause' : 'Play'}>
                <Icon
                  type={appState.isPlaying ? 'pause-circle' : 'play-circle'}
                  title={appState.isPlaying ? 'Pause' : 'Play'}
                  style={{
                    fontSize: '32px',
                    marginRight: 0,
                    lineHeight: '64px',
                  }}
                />
              </Tooltip>
            </Menu.Item>
            <Menu.Item key="saveConfig" onClick={onClickSaveConfig}>
              <Tooltip title="Save Config">
                <Icon
                  type="download"
                  title="Save Config"
                  style={{
                    fontSize: '32px',
                    marginRight: 0,
                    lineHeight: '64px',
                  }}
                />
              </Tooltip>
            </Menu.Item>
            <Menu.Item key="load" onClick={onClickLoadConfig}>
              <Tooltip title="Load Config">
                <div style={{ width: '100%', height: '100%' }}>
                  <Icon
                    type="upload"
                    title="Load Config"
                    style={{
                      fontSize: '32px',
                      marginRight: 0,
                      lineHeight: '64px',
                    }}
                  />
                </div>
              </Tooltip>
            </Menu.Item>
            <Menu.Item key="saveRender">
              <Tooltip title="Save Render Primitives">
                <div style={{ width: '100%', height: '100%' }}>
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
              </Tooltip>
            </Menu.Item>
          </Menu>
        </div>
      </Layout.Header>
    </>
  )
}
