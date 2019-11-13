import './SamplerNode.css'

import { update } from 'ramda'
import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { DndProvider } from 'react-dnd'
import MouseBackEnd from 'react-dnd-mouse-backend'
import {
  cubicInterpolatePoint,
  generateControlPoints,
  Point,
  Point4,
  Sampler,
} from './common'
import { ControlPoint } from './ControlPointView'

function getControlPointAt(
  sampler: Sampler,
  controlPoints: Point[],
  x: number,
  y: number,
): Point | undefined {
  if (x < 0 || x >= sampler.config.controlsX + 2) {
    return undefined
  }
  if (y < 0 || y >= sampler.config.controlsY + 2) {
    return undefined
  }
  const index = (sampler.config.controlsX + 2) * y + x
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
  const maxX = sampler.config.controlsX + 1
  const maxY = sampler.config.controlsY + 1

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

export interface SamplerNodeProps {
  sampler: Sampler
  setRenderPoints: (renderPoints: Point[]) => void
}

export const EditSamplerView: React.FC<SamplerNodeProps> = ({
  sampler,
  setRenderPoints,
}) => {
  const [controlPoints, setControlPoints] = useState<Point[]>(
    generateControlPoints(sampler.config.controlsX, sampler.config.controlsY),
  )
  const [localRenderPoints, setLocalRenderPoints] = useState<Point[]>([])

  const xPointCount = useMemo(
    () => Math.floor(sampler.out.width / sampler.config.resolution) + 1,
    [sampler.out.width, sampler.config.resolution],
  )

  const yPointCount = useMemo(
    () => Math.floor(sampler.out.height / sampler.config.resolution) + 1,
    [sampler.out.height, sampler.config.resolution],
  )

  useEffect(() => {
    const controlPoints = generateControlPoints(
      sampler.config.controlsX,
      sampler.config.controlsY,
    )
    setControlPoints(controlPoints)
  }, [sampler.config.controlsX, sampler.config.controlsY])

  useEffect(() => {
    const renderPoints = Array.from({ length: yPointCount + 1 }).flatMap(
      (_, y) => {
        return Array.from({
          length: xPointCount + 1,
        }).flatMap((_, x) => {
          const cx = (x / xPointCount) * (sampler.config.controlsX + 1)
          const cy = (y / yPointCount) * (sampler.config.controlsY + 1)

          const controlX = Math.floor(cx)
          const u = cx - controlX
          const controlY = Math.floor(cy)
          const v = cy - controlY

          const rows: Point[] = []
          for (let i = -1; i < 3; ++i) {
            const cols: Point[] = []
            for (let j = -1; j < 3; ++j) {
              cols.push(
                getControlPointAtExtrapolate(
                  sampler,
                  controlPoints,
                  controlX + i,
                  controlY + j,
                ),
              )
            }
            rows.push(cubicInterpolatePoint(cols as Point4, v))
          }

          return cubicInterpolatePoint(rows as Point4, u)
        })
      },
    )

    setLocalRenderPoints(renderPoints)
  }, [
    sampler.out.width,
    sampler.out.height,
    sampler.config.resolution,
    sampler.config.controlsX,
    sampler.config.controlsY,
    controlPoints,
  ])

  useEffect(() => {
    setRenderPoints(localRenderPoints)
  }, [localRenderPoints])

  // const positionBuffer = useMemo(() => {
  //   return new Float32Array(controlPoints.length * VERTEX_FLOAT_SIZE)
  // }, [controlPoints.length])

  // useEffect(() => {
  //   for (let y = 0; y < vPointCount + 1; y++) {
  //     for (let x = 0; y < hPointCount + 1; x++) {
  //       const index = x + y * (hPointCount + 1)
  //       const renderPoint = renderPoints[index]
  //       positionBuffer[index * VERTEX_FLOAT_SIZE + 0] = renderPoint.x
  //       positionBuffer[index * VERTEX_FLOAT_SIZE + 1] = renderPoint.y
  //       positionBuffer[index * VERTEX_FLOAT_SIZE + 2] = 0
  //       positionBuffer[index * VERTEX_FLOAT_SIZE + 3] = x / (hPointCount + 1)
  //       positionBuffer[index * VERTEX_FLOAT_SIZE + 4] = y / (vPointCount + 1)
  //     }
  //   }
  // }, [positionBuffer, renderPoints])

  // const positionBufferAttribute = useMemo(() => {
  //   let i = 0
  //   for (const renderPoint of renderPoints) {
  //     positionBuffer[i++] = renderPoint.x
  //     positionBuffer[i++] = renderPoint.y
  //     positionBuffer[i++] = 0
  //   }
  //   return new THREE.Float32BufferAttribute(positionBuffer, 3)
  // }, [renderPoints, positionBuffer])

  // const uvAttribute = useMemo(() => {
  //   const buffer = new Float32Array((hPointCount + 1) * (vPointCount + 1) * 2)
  //   for (let y = 0; y < vPointCount + 1; y++) {
  //     for (let x = 0; y < hPointCount + 1; x++) {
  //       const index = x + y * (hPointCount + 1)
  //       buffer[index * 2 + 0] = x / (hPointCount + 1)
  //       buffer[index * 2 + 1] = y / (vPointCount + 1)
  //     }
  //   }
  //   return new THREE.Float32BufferAttribute(buffer, 2)
  // }, [hPointCount, vPointCount])

  // const normalBufferAttribute = useMemo(() => {
  //   const buffer = new Float32Array((hPointCount + 1) * (vPointCount + 1) * 2)
  //   for (let y = 0; y < vPointCount + 1; y++) {
  //     for (let x = 0; y < hPointCount + 1; x++) {
  //       const index = x + y * (hPointCount + 1)
  //       buffer[index * 2 + 0] = 0
  //       buffer[index * 2 + 1] = 0
  //       buffer[index * 2 + 2] = 1
  //     }
  //   }
  //   return new THREE.Float32BufferAttribute(buffer, 3)
  // }, [hPointCount, vPointCount])

  // const indexBufferAttribute = useMemo(() => {
  //   const buffer = new Uint16Array(hPointCount * vPointCount * 6)
  //   let i = 0
  //   for (let y = 0; y < vPointCount + 1; y++) {
  //     for (let x = 0; y < hPointCount + 1; x++) {
  //       if (x + 1 < hPointCount && y + 1 < vPointCount) {
  //         buffer[i++] = (y + 0) * hPointCount + (x + 0)
  //         buffer[i++] = (y + 1) * hPointCount + (x + 0)
  //         buffer[i++] = (y + 1) * hPointCount + (x + 1)

  //         buffer[i++] = (y + 0) * hPointCount + (x + 0)
  //         buffer[i++] = (y + 1) * hPointCount + (x + 1)
  //         buffer[i++] = (y + 0) * hPointCount + (x + 1)
  //       }
  //     }
  //   }

  //   return new THREE.Uint16BufferAttribute(buffer, 1)
  // }, [hPointCount, vPointCount])

  // const {
  //   left: outLeft,
  //   top: outTop,
  //   width: outWidth,
  //   height: outHeight,
  // } = sampler.out

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
  //       index={indexBufferAttribute}
  //       attributes={{
  //         position: positionBufferAttribute,
  //         normal: normalBufferAttribute,
  //         uv: uvAttribute,
  //       }}
  //     />
  //     <meshBasicMaterial attach="material" map={texture} />
  //   </mesh>
  // )

  const containerRef = useRef<HTMLDivElement | null>(null)

  return (
    <DndProvider backend={MouseBackEnd}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <svg
          style={{
            left: sampler.out.left,
            top: sampler.out.top,
            width: sampler.out.width,
            height: sampler.out.height,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <g>
            {Array.from({ length: sampler.config.controlsY + 2 }).flatMap(
              (_, y) => {
                return Array.from({
                  length: sampler.config.controlsX + 2,
                }).flatMap((_, x) => {
                  const sourcePoint = getControlPointAt(
                    sampler,
                    controlPoints,
                    x,
                    y,
                  )
                  const targetPoint1 = getControlPointAt(
                    sampler,
                    controlPoints,
                    x + 1,
                    y,
                  )
                  const targetPoint2 = getControlPointAt(
                    sampler,
                    controlPoints,
                    x,
                    y + 1,
                  )
                  if (!sourcePoint) {
                    return []
                  }

                  let lines: ReactElement[] = []
                  if (targetPoint1) {
                    lines = [
                      ...lines,
                      <line
                        key={`line_1_${x}_${y}`}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth={2}
                        x1={sourcePoint.x * sampler.out.width}
                        y1={sourcePoint.y * sampler.out.height}
                        x2={targetPoint1.x * sampler.out.width}
                        y2={targetPoint1.y * sampler.out.height}
                      ></line>,
                    ]
                  }

                  if (targetPoint2) {
                    lines = [
                      ...lines,
                      <line
                        key={`line_2_${x}_${y}`}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth={2}
                        x1={sourcePoint.x * sampler.out.width}
                        y1={sourcePoint.y * sampler.out.height}
                        x2={targetPoint2.x * sampler.out.width}
                        y2={targetPoint2.y * sampler.out.height}
                      ></line>,
                    ]
                  }

                  return lines
                })
              },
            )}
          </g>
          {/* <g>
            {localRenderPoints.map((point, index) => {
              return (
                <ControlPoint
                  key={`renderPoint_${index}`}
                  point={{
                    x: point.x * sampler.out.width,
                    y: point.y * sampler.out.height,
                  }}
                  setPoint={() => {}}
                  containerRef={containerRef}
                  draggable={false}
                  className="renderPoint"
                  radius={8}
                />
              )
            })}
          </g> */}
          <g>
            {controlPoints.map((controlPoint, index) => {
              return (
                <ControlPoint
                  key={`controlPoint_${index}`}
                  point={{
                    x: controlPoint.x * sampler.out.width,
                    y: controlPoint.y * sampler.out.height,
                  }}
                  setPoint={point =>
                    setControlPoints(
                      update(
                        index,
                        {
                          x: point.x / sampler.out.width,
                          y: point.y / sampler.out.height,
                        },
                        controlPoints,
                      ),
                    )
                  }
                  containerRef={containerRef}
                  draggable={true}
                  className="controlPoint"
                  radius={8}
                />
              )
            })}
          </g>
        </svg>
      </div>
    </DndProvider>
  )
}
