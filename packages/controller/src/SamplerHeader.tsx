import { Button, Icon, Modal } from 'antd'
import React, { useState } from 'react'

export interface SamplerHeaderProps {
  title: string
  action: () => void
}

export const SamplerHeader: React.FunctionComponent<SamplerHeaderProps> = ({
  title,
  action,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false)

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>{title}</span>
      <Button onClick={() => setShowModal(true)}>
        <Icon type="delete" theme="twoTone" twoToneColor="#eb2f96" />
      </Button>
      <Modal
        title={title}
        visible={showModal}
        onOk={() => {
          action()
          setShowModal(false)
        }}
        onCancel={() => setShowModal(false)}
      >
        <p>{`Are you sure to delete sampler "${title}"?`}</p>
      </Modal>
    </div>
  )
}
