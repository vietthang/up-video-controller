import {
  Mesh,
  Scene,
  StandardMaterial,
  Texture,
  VertexBuffer,
  VertexData,
} from 'babylonjs'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Sampler } from '../state'
import { useGenerateRenderPrimitives } from './render'

export interface MeshNodeProps {
  scene: Scene
  texture: Texture
  videoWidth: number
  videoHeight: number
  sampler: Sampler
  mesh: Mesh
}

export const BabylonMeshNode: React.FC<MeshNodeProps> = ({
  scene,
  texture,
  sampler,
  videoWidth,
  videoHeight,
  mesh,
}) => {
  const onPositionBufferChange = useCallback(
    buffer => {
      mesh.updateVerticesData(VertexBuffer.PositionKind, buffer)
    },
    [mesh],
  )

  const onUvBufferChange = useCallback(
    buffer => {
      mesh.updateVerticesData(VertexBuffer.UVKind, buffer)
    },
    [mesh],
  )

  const onIndexBufferChange = useCallback(
    buffer => {
      mesh.updateIndices(buffer)
    },
    [mesh],
  )

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

  const material = useMemo(() => {
    const material = new StandardMaterial('material', scene)
    material.emissiveTexture = texture
    material.backFaceCulling = false
    material.sideOrientation = Mesh.DOUBLESIDE
    return material
  }, [scene, texture])

  useEffect(() => {
    mesh.material = material
  }, [mesh, material])

  useEffect(() => {
    const vertexData = new VertexData()
    vertexData.positions = positionBuffer
    vertexData.uvs = uvBuffer
    vertexData.indices = indexBuffer
    vertexData.applyToMesh(mesh, true)
  }, [positionBuffer, uvBuffer, indexBuffer, mesh])

  useEffect(() => {
    mesh.position.x = sampler.out.left
    mesh.position.y = sampler.out.top
  }, [mesh, sampler.out.left, sampler.out.top])

  return <></>
}
