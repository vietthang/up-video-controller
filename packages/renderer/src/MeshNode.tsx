import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Point, Region, Sampler } from './common'

export interface MeshNodeProps {
  texture: THREE.Texture
  viewPort: Region
  videoWidth: number
  videoHeight: number
  sampler: Sampler
  renderPoints: Point[]
}

export const MeshNode: React.FC<MeshNodeProps> = ({
  texture,
  viewPort,
  sampler,
  videoWidth,
  videoHeight,
  renderPoints,
}) => {
  const { left: outLeft, top: outTop } = sampler.out

  const xPointCount = useMemo(
    () => Math.floor(sampler.out.width / sampler.config.resolution) + 1,
    [sampler.out.width, sampler.config.resolution],
  )

  const yPointCount = useMemo(
    () => Math.floor(sampler.out.height / sampler.config.resolution) + 1,
    [sampler.out.height, sampler.config.resolution],
  )

  const positionBuffer = useMemo(() => {
    return new Float32Array(renderPoints.length * 3)
  }, [renderPoints.length])

  const positionBufferAttribute = useMemo(() => {
    let i = 0
    for (const renderPoint of renderPoints) {
      positionBuffer[i++] = renderPoint.x * sampler.out.width
      positionBuffer[i++] = renderPoint.y * sampler.out.height
      positionBuffer[i++] = 0
    }
    return new THREE.Float32BufferAttribute(positionBuffer, 3)
  }, [renderPoints, positionBuffer, sampler.out.width, sampler.out.height])

  const uvBuffer = useMemo(() => {
    return new Float32Array(renderPoints.length * 2)
  }, [renderPoints.length])

  const uvBufferAttribute = useMemo(() => {
    for (let y = 0; y < yPointCount + 1; y++) {
      for (let x = 0; x < xPointCount + 1; x++) {
        const index = x + y * (xPointCount + 1)
        uvBuffer[index * 2 + 0] =
          ((x / (xPointCount + 1)) * sampler.in.width) / videoWidth +
          sampler.in.left / videoWidth
        uvBuffer[index * 2 + 1] =
          1 -
          ((y / (yPointCount + 1)) * sampler.in.height) / videoHeight +
          sampler.in.top / videoHeight
      }
    }
    return new THREE.Float32BufferAttribute(uvBuffer, 2)
  }, [
    uvBuffer,
    xPointCount,
    yPointCount,
    videoWidth,
    videoHeight,
    sampler.in.left,
    sampler.in.top,
    sampler.in.width,
    sampler.in.height,
  ])

  const indexBufferAttribute = useMemo(() => {
    const buffer = new Uint16Array(xPointCount * yPointCount * 6)
    let i = 0
    for (let y = 0; y < yPointCount; y++) {
      for (let x = 0; x < xPointCount; x++) {
        buffer[i++] = (y + 0) * (xPointCount + 1) + (x + 0)
        buffer[i++] = (y + 1) * (xPointCount + 1) + (x + 0)
        buffer[i++] = (y + 1) * (xPointCount + 1) + (x + 1)

        buffer[i++] = (y + 0) * (xPointCount + 1) + (x + 0)
        buffer[i++] = (y + 1) * (xPointCount + 1) + (x + 1)
        buffer[i++] = (y + 0) * (xPointCount + 1) + (x + 1)
      }
    }

    return new THREE.Uint16BufferAttribute(buffer, 1)
  }, [xPointCount, yPointCount])

  return (
    <group scale={[1, -1, 1]}>
      <mesh
        position={[
          outLeft - viewPort.width / 2,
          outTop - viewPort.height / 2,
          0.0,
        ]}
      >
        <bufferGeometry
          attach="geometry"
          index={indexBufferAttribute}
          attributes={{
            position: positionBufferAttribute,
            uv: uvBufferAttribute,
          }}
        />
        <meshBasicMaterial
          attach="material"
          map={texture}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
