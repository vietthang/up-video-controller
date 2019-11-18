import React, { useCallback, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Sampler } from '../state'
import { useGenerateRenderPrimitives } from './render'

export interface MeshNodeProps {
  texture: THREE.Texture
  videoWidth: number
  videoHeight: number
  sampler: Sampler
  mesh: THREE.Mesh
}

export const MeshNode: React.FC<MeshNodeProps> = ({
  texture,
  sampler,
  videoWidth,
  videoHeight,
  mesh,
}) => {
  const positionBufferAttribute = useMemo(() => {
    return new THREE.Float32BufferAttribute(0, 3)
  }, [])

  const uvBufferAttribute = useMemo(() => {
    return new THREE.Float32BufferAttribute(0, 2)
  }, [])

  const indexBufferAttribute = useMemo(() => {
    return new THREE.Uint16BufferAttribute(0, 1)
  }, [])

  const onPositionBufferChange = useCallback(() => {
    console.log('position changed')
    positionBufferAttribute.needsUpdate = true
  }, [positionBufferAttribute])

  const onUvBufferChange = useCallback(() => {
    console.log('uv changed')
    uvBufferAttribute.needsUpdate = true
  }, [uvBufferAttribute])

  const onIndexBufferChange = useCallback(() => {
    console.log('uv changed')
    indexBufferAttribute.needsUpdate = true
  }, [indexBufferAttribute])

  const { positionBuffer, uvBuffer, indexBuffer } = useGenerateRenderPrimitives(
    {
      sampler,
      textureWidth: videoWidth,
      textureHeight: videoHeight,
      onPositionBufferChange,
      onUvBufferChange,
      onIndexBufferChange,
    },
  )

  useEffect(() => {
    positionBufferAttribute.array = positionBuffer
    positionBufferAttribute.needsUpdate = true
  }, [positionBufferAttribute, positionBuffer])

  useEffect(() => {
    uvBufferAttribute.array = uvBuffer
    uvBufferAttribute.needsUpdate = true
  }, [uvBufferAttribute, uvBuffer])

  useEffect(() => {
    indexBufferAttribute.array = indexBuffer
    indexBufferAttribute.needsUpdate = true
  }, [indexBufferAttribute, indexBuffer])

  useEffect(() => {
    const geometry = new THREE.BufferGeometry()
    geometry.setIndex(indexBufferAttribute)
    geometry.setAttribute('position', positionBufferAttribute)
    geometry.setAttribute('uv', uvBufferAttribute)

    const material = new THREE.MeshBasicMaterial({
      map: texture || null,
      side: THREE.DoubleSide,
    })

    mesh.position.x = sampler.out.left
    mesh.position.y = sampler.out.top
    mesh.position.z = 0
    mesh.geometry = geometry
    mesh.material = material

    setInterval(() => {
      const geometry = mesh.geometry as THREE.BufferGeometry
      const positionBa = geometry.attributes.position as THREE.BufferAttribute
      positionBa.needsUpdate = true
      console.log('positionBa.needsUpdate', positionBa.needsUpdate)
    }, 30)
  }, [
    mesh,
    positionBufferAttribute,
    uvBufferAttribute,
    indexBufferAttribute,
    sampler.out.left,
    sampler.out.top,
    texture,
  ])

  return <></>
}
