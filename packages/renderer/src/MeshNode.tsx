import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Point, Sampler } from './common'

export interface MeshNodeProps {
  texture: THREE.Texture
  sampler: Sampler
  renderPoints: Point[]
}

export const MeshNode: React.FC<MeshNodeProps> = ({
  texture,
  sampler,
  renderPoints,
}) => {
  const {
    left: outLeft,
    top: outTop,
    width: outWidth,
    height: outHeight,
  } = sampler.out

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

  const uvBufferAttribute = useMemo(() => {
    const buffer = new Float32Array((xPointCount + 1) * (yPointCount + 1) * 2)
    for (let y = 0; y < yPointCount + 1; y++) {
      for (let x = 0; x < xPointCount + 1; x++) {
        const index = x + y * (xPointCount + 1)
        buffer[index * 2 + 0] = x / (xPointCount + 1)
        buffer[index * 2 + 1] = 1 - y / (yPointCount + 1)
      }
    }
    return new THREE.Float32BufferAttribute(buffer, 2)
  }, [xPointCount, yPointCount])

  const normalBufferAttribute = useMemo(() => {
    const buffer = new Float32Array((xPointCount + 1) * (yPointCount + 1) * 2)
    for (let y = 0; y < yPointCount + 1; y++) {
      for (let x = 0; x < xPointCount + 1; x++) {
        const index = x + y * (xPointCount + 1)
        buffer[index * 2 + 0] = 0
        buffer[index * 2 + 1] = 0
        buffer[index * 2 + 2] = 1
      }
    }
    return new THREE.Float32BufferAttribute(buffer, 3)
  }, [xPointCount, yPointCount])

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

  // useEffect(() => {
  //   const builder = new flatbuffers.Builder()
  //   Renderer.RendererConstruct.startRendererConstruct(builder)
  //   Renderer.RendererConstruct.addIndexCount(
  //     builder,
  //     xPointCount * yPointCount * 6,
  //   )
  //   Renderer.RendererConstruct.addVertexCount(builder, renderPoints.length)
  //   flatbuffers
  //   Renderer.RendererConstruct.addPositionBuffer(builder, renderPoints.length)
  //   Renderer.RendererConstruct.addVertexCount(builder, renderPoints.length)
  // }, [
  //   renderPoints.length,
  //   positionBufferAttribute,
  //   uvBufferAttribute,
  //   normalBufferAttribute,
  //   indexBufferAttribute,
  // ])

  return (
    <group scale={[1, -1, 1]}>
      <mesh position={[outLeft - outWidth / 2, outTop - outHeight / 2, 0.0]}>
        <bufferGeometry
          attach="geometry"
          index={indexBufferAttribute}
          attributes={{
            position: positionBufferAttribute,
            normal: normalBufferAttribute,
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

  // return (
  //   <mesh
  //     position={[
  //       -viewPort.width / 2 + outLeft + outWidth / 2,
  //       viewPort.height / 2 - (outTop + outHeight / 2),
  //       0.0,
  //     ]}
  //   >
  //     <bufferGeometry
  //       attach="geometry"
  //       index={new THREE.Uint16BufferAttribute([1, 0, 2, 2, 0, 3], 1)}
  //       attributes={{
  //         position: new THREE.Float32BufferAttribute(
  //           [
  //             // left-top
  //             -outWidth / 2,
  //             -outHeight / 2,
  //             0,
  //             // left-bottom
  //             -outWidth / 2,
  //             outHeight / 2,
  //             0,
  //             // right-bottom
  //             outWidth / 2,
  //             outHeight / 2,
  //             0,
  //             // right-top
  //             outWidth / 2,
  //             -outHeight / 2,
  //             0,
  //           ],
  //           3,
  //         ),
  //         normal: new THREE.Float32BufferAttribute(
  //           [
  //             // left-top
  //             0,
  //             0,
  //             1,
  //             // left-bottom
  //             0,
  //             0,
  //             1,
  //             // right-bottom
  //             0,
  //             0,
  //             1,
  //             // right-top
  //             0,
  //             0,
  //             1,
  //           ],
  //           3,
  //         ),
  //         uv: new THREE.Float32BufferAttribute(
  //           [
  //             // left-top
  //             inLeft / videoWidth,
  //             inTop / videoHeight,
  //             // left-bottom
  //             inLeft / videoWidth,
  //             (inTop + inHeight) / videoHeight,
  //             // right-bottom
  //             (inLeft + inWidth) / videoWidth,
  //             (inTop + inHeight) / videoHeight,
  //             // right-top
  //             (inLeft + inWidth) / videoWidth,
  //             inTop / videoHeight,
  //           ],
  //           2,
  //         ),
  //       }}
  //     ></bufferGeometry>
  //     <meshBasicMaterial attach="material" map={texture} />
  //   </mesh>
  // )
}
