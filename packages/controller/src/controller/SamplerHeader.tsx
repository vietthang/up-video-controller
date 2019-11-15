import { Button, Icon, Modal } from 'antd'
import React, { useCallback, useState } from 'react'

export interface SamplerHeaderProps {
  title: string
  deleteAction: () => void
}

export const SamplerHeader: React.FunctionComponent<SamplerHeaderProps> = ({
  title,
  deleteAction,
}) => {
  const [isShowModal, setIsShowModal] = useState<boolean>(false)

  const showModal = useCallback(() => setIsShowModal(true), [setIsShowModal])
  const hideModal = useCallback(() => setIsShowModal(false), [setIsShowModal])
  const okHandler = useCallback(() => {
    hideModal()
    deleteAction()
  }, [deleteAction, hideModal])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>{title}</span>
      <span>
        <Button style={{ marginLeft: '8px' }} onClick={showModal}>
          <Icon type="delete" theme="twoTone" twoToneColor="#eb2f96" />
        </Button>
      </span>
      <Modal
        title={title}
        visible={isShowModal}
        onOk={okHandler}
        onCancel={hideModal}
      >
        <p>{`Are you sure to delete sampler "${title}"?`}</p>
      </Modal>
    </div>
  )
}
