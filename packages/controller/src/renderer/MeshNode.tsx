import React, { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { cubicInterpolatePoint, Point, Point4, Region } from '../common'
import { Sampler } from '../state'

function getControlPointAt(
  sampler: Sampler,
  controlPoints: Point[],
  x: number,
  y: number,
): Point | undefined {
  if (x < 0 || x >= sampler.warp.controlsX + 2) {
    return undefined
  }
  if (y < 0 || y >= sampler.warp.controlsY + 2) {
    return undefined
  }
  const index = (sampler.warp.controlsX + 2) * y + x
  if (controlPoints.length <= index) {
    throw new Error(`out of bound 'x'=${x} 'y'=${y}`)
  }
  return controlPoints[index]
}

function getControlPointAtExtrapolate(
  sampler: Sampler,
  controlPoints: Point[],
  x: number,
  y: number,
): Point {
  const maxX = sampler.warp.controlsX + 1
  const maxY = sampler.warp.controlsY + 1

  // here's the magic: extrapolate points beyond the edges
  if (x < 0) {
    const p0 = getControlPointAtExtrapolate(sampler, controlPoints, 0, y)
    const p1 = getControlPointAtExtrapolate(sampler, controlPoints, 0 - x, y)
    return {
      x: 2 * p0.x - p1.x,
      y: 2 * p0.y - p1.y,
    }
  }

  if (y < 0) {
    const p0 = getControlPointAtExtrapolate(sampler, controlPoints, x, 0)
    const p1 = getControlPointAtExtrapolate(sampler, controlPoints, x, 0 - y)
    return {
      x: 2 * p0.x - p1.x,
      y: 2 * p0.y - p1.y,
    }
  }

  if (x > maxX) {
    const p0 = getControlPointAtExtrapolate(sampler, controlPoints, maxX, y)
    const p1 = getControlPointAtExtrapolate(
      sampler,
      controlPoints,
      2 * maxX - x,
      y,
    )
    return {
      x: 2 * p0.x - p1.x,
      y: 2 * p0.y - p1.y,
    }
  }

  if (y > maxY) {
    const p0 = getControlPointAtExtrapolate(sampler, controlPoints, x, maxY)
    const p1 = getControlPointAtExtrapolate(
      sampler,
      controlPoints,
      x,
      2 * maxY - y,
    )
    return {
      x: 2 * p0.x - p1.x,
      y: 2 * p0.y - p1.y,
    }
  }

  return getControlPointAt(sampler, controlPoints, x, y)!
}

export interface MeshNodeProps {
  texture: THREE.Texture
  videoWidth: number
  videoHeight: number
  sampler: Sampler
  controlPoints: Point[]
  mesh: THREE.Mesh
}

export const MeshNode: React.FC<MeshNodeProps> = ({
  texture,
  sampler,
  videoWidth,
  videoHeight,
  controlPoints,
  mesh,
}) => {
  const xPointCount = useMemo(
    () => Math.floor(sampler.out.width / sampler.warp.resolution) + 1,
    [sampler.out.width, sampler.warp.resolution],
  )

  const yPointCount = useMemo(
    () => Math.floor(sampler.out.height / sampler.warp.resolution) + 1,
    [sampler.out.height, sampler.warp.resolution],
  )

  const renderPoints = useMemo(() => {
    const renderPoints: Point[] = new Array(
      (yPointCount + 1) * (xPointCount + 1),
    )
    let i = 0
    for (let y = 0; y < yPointCount + 1; y++) {
      for (let x = 0; x < xPointCount + 1; x++) {
        const cx = (x / xPointCount) * (sampler.warp.controlsX + 1)
        const cy = (y / yPointCount) * (sampler.warp.controlsY + 1)

        const controlX = Math.floor(cx)
        const u = cx - controlX
        const controlY = Math.floor(cy)
        const v = cy - controlY

        const rows: Point4 = [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ]
        for (let i = -1; i < 3; ++i) {
          const cols: Point4 = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
          ]
          for (let j = -1; j < 3; ++j) {
            cols[j + 1] = getControlPointAtExtrapolate(
              sampler,
              controlPoints,
              controlX + i,
              controlY + j,
            )
          }
          rows[i + 1] = cubicInterpolatePoint(cols, v)
        }

        renderPoints[i++] = cubicInterpolatePoint(rows as Point4, u)
      }
    }

    return renderPoints
  }, [
    // sampler, // TODO
    sampler.out.width,
    sampler.out.height,
    sampler.warp.resolution,
    sampler.warp.controlsX,
    sampler.warp.controlsY,
    controlPoints,
    xPointCount,
    yPointCount,
  ])

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
  }, [
    mesh,
    positionBufferAttribute,
    uvBufferAttribute,
    indexBufferAttribute,
    texture,
  ])

  // const geometryRef = useUpdate<THREE.BufferGeometry>(
  //   geometry => {
  //     geometry.deleteAttribute('position')
  //     geometry.deleteAttribute('uv')
  //     geometry.setAttribute('position', positionBufferAttribute)
  //     geometry.setAttribute('uv', uvBufferAttribute)
  //     geometry.setIndex(indexBufferAttribute)
  //   },
  //   [indexBufferAttribute, positionBufferAttribute, uvBufferAttribute],
  // )

  // console.log(indexBufferAttribute.array.length)
  // console.log(positionBufferAttribute.array.length)
  // console.log(uvBufferAttribute.array.length)
  // console.log([outLeft - viewPort.width / 2, outTop - viewPort.height / 2, 0.0])

  return <></>

  // return (
  //   <group scale={[1, -1, 1]}>
  //     <mesh
  //       position={[
  //         outLeft - viewPort.width / 2,
  //         outTop - viewPort.height / 2,
  //         0.0,
  //       ]}
  //     >
  //       <bufferGeometry
  //         // ref={geometryRef}
  //         attach="geometry"
  //         index={indexBufferAttribute}
  //         attributes={{
  //           position: positionBufferAttribute,
  //           uv: uvBufferAttribute,
  //         }}
  //       />
  //       <meshBasicMaterial
  //         attach="material"
  //         map={texture}
  //         side={THREE.DoubleSide}
  //       />
  //     </mesh>
  //   </group>
  // )
}
