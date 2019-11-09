import { Button, Icon, Modal } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { Sampler } from './common'
import { WarpConfigModal } from './WarpConfigModal'

export interface SamplerHeaderProps {
  title: string
  deleteAction: () => void
  sampler: Sampler
  setSampler: (sampler: Sampler) => void
}

export const SamplerHeader: React.FunctionComponent<SamplerHeaderProps> = ({
  title,
  deleteAction,
  sampler,
  setSampler,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false)

  const openConfigModal = useMemo(() => () => setShowConfigModal(true), [
    setShowConfigModal,
  ])
  const closeConfigModal = useMemo(() => () => setShowConfigModal(false), [
    setShowConfigModal,
  ])

  const [localSampler, setLocalSampler] = useState(sampler)
  useEffect(() => {
    setLocalSampler(sampler)
  }, [sampler])

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
        <Button style={{ marginLeft: '8px' }} onClick={openConfigModal}>
          <Icon type="gateway" twoToneColor="#eb2f96" />
        </Button>
        <Button
          style={{ marginLeft: '8px' }}
          onClick={() => setShowModal(true)}
        >
          <Icon type="delete" theme="twoTone" twoToneColor="#eb2f96" />
        </Button>
      </span>
      <Modal
        title={title}
        visible={showModal}
        onOk={() => {
          deleteAction()
          setShowModal(false)
        }}
        onCancel={() => setShowModal(false)}
      >
        <p>{`Are you sure to delete sampler "${title}"?`}</p>
      </Modal>
      <Modal
        title="Sampler Config"
        width={960}
        visible={showConfigModal}
        onOk={() => {
          closeConfigModal()
          setSampler(localSampler)
        }}
        onCancel={closeConfigModal}
      >
        <WarpConfigModal sampler={localSampler} setSampler={setLocalSampler} />
      </Modal>
    </div>
  )
}
