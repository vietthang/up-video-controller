import './WarpConfigModal.css'

import { Button, Checkbox, Form, InputNumber } from 'antd'
import { lensPath, pipe, set } from 'ramda'
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { DndProvider } from 'react-dnd'
import MouseBackEnd from 'react-dnd-mouse-backend'
import { generateControlPoints, Point, Sampler } from './common'
import { ControlPoint } from './ControlPointView'
import { cubicInterpolatePoint, Point4 } from './math'

function getControlPointAt(
  sampler: Sampler,
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
  return sampler.config.controlPoints[index]
}

function getControlPointAtExtrapolate(
  sampler: Sampler,
  x: number,
  y: number,
): Point {
  const maxX = sampler.config.controlsX + 1
  const maxY = sampler.config.controlsY + 1

  // here's the magic: extrapolate points beyond the edges
  if (x < 0) {
    const p0 = getControlPointAtExtrapolate(sampler, 0, y)
    const p1 = getControlPointAtExtrapolate(sampler, 0 - x, y)
    return {
      x: 2 * p0.x - p1.x,
      y: 2 * p0.y - p1.y,
    }
  }

  if (y < 0) {
    const p0 = getControlPointAtExtrapolate(sampler, x, 0)
    const p1 = getControlPointAtExtrapolate(sampler, x, 0 - y)
    return {
      x: 2 * p0.x - p1.x,
      y: 2 * p0.y - p1.y,
    }
  }

  if (x > maxX) {
    const p0 = getControlPointAtExtrapolate(sampler, maxX, y)
    const p1 = getControlPointAtExtrapolate(sampler, 2 * maxX - x, y)
    return {
      x: 2 * p0.x - p1.x,
      y: 2 * p0.y - p1.y,
    }
  }

  if (y > maxY) {
    const p0 = getControlPointAtExtrapolate(sampler, x, maxY)
    const p1 = getControlPointAtExtrapolate(sampler, x, 2 * maxY - y)
    return {
      x: 2 * p0.x - p1.x,
      y: 2 * p0.y - p1.y,
    }
  }

  return getControlPointAt(sampler, x, y)!
}

export interface WarpConfigModalProps {
  sampler: Sampler
  setSampler: (sampler: Sampler) => void
}

export const WarpConfigModal: React.FC<WarpConfigModalProps> = React.memo(
  ({ sampler, setSampler }: WarpConfigModalProps) => {
    const [svgHeight, setSvgHeight] = useState(0)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [showRenderPoints, setShowRenderPoints] = useState(false)

    useEffect(() => {
      const element = containerRef.current
      if (!element) {
        return
      }
      const calculatedHeight =
        (element.offsetWidth / sampler.out.width) * sampler.out.height
      if (calculatedHeight === element.offsetHeight) {
        return
      }
      setSvgHeight(calculatedHeight)
    }, [sampler.out.width, sampler.out.height, svgHeight, containerRef])

    const hPointCount =
      Math.floor(sampler.out.width / sampler.config.resolution) + 1
    const vPointCount =
      Math.floor(sampler.out.height / sampler.config.resolution) + 1

    const scaleX = (svgHeight / sampler.out.height) * sampler.out.width
    const scaleY = svgHeight

    useEffect(() => {
      // 3 for position, 2 to tex coord
      const VERTEX_FLOAT_SIZE = 5
      const buffer = new Float32Array(
        (vPointCount + 1) * (hPointCount + 1) * VERTEX_FLOAT_SIZE,
      )

      Array.from({ length: vPointCount + 1 }).flatMap((_, y) => {
        return Array.from({
          length: hPointCount + 1,
        }).flatMap((_, x) => {
          const cx = (x / (hPointCount + 1)) * (sampler.config.controlsX + 1)
          const cy = (y / (vPointCount + 1)) * (sampler.config.controlsY + 1)

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
                  controlX + i,
                  controlY + j,
                ),
              )
            }
            rows.push(cubicInterpolatePoint(cols as Point4, v))
          }

          const renderPoint = cubicInterpolatePoint(rows as Point4, u)

          const baseIndex = (x + y * (hPointCount + 1)) * VERTEX_FLOAT_SIZE
          buffer[baseIndex + 0] = renderPoint.x
          buffer[baseIndex + 1] = renderPoint.y
          buffer[baseIndex + 2] = 0
          buffer[baseIndex + 3] = x / (hPointCount + 1)
          buffer[baseIndex + 4] = y / (vPointCount + 1)
        })
      })

      console.log('OK', buffer.byteLength)
      // buffer
    }, [
      hPointCount,
      vPointCount,
      sampler.config.controlsX,
      sampler.config.controlsY,
      sampler.config.controlPoints,
    ])

    return (
      <DndProvider backend={MouseBackEnd}>
        <div style={{ width: '100%' }}>
          <div>
            <Form layout="inline">
              <Form.Item label="X Controls">
                <InputNumber
                  min={0}
                  value={sampler.config.controlsX}
                  onChange={value => {
                    if (value === undefined) {
                      return
                    }

                    setSampler(
                      pipe(
                        set(lensPath(['config', 'controlsX']), value),
                        set(
                          lensPath(['config', 'controlPoints']),
                          generateControlPoints(
                            value,
                            sampler.config.controlsY,
                          ),
                        ),
                      )(sampler),
                    )
                  }}
                />
              </Form.Item>
              <Form.Item label="Y Controls">
                <InputNumber
                  min={0}
                  value={sampler.config.controlsY}
                  onChange={value => {
                    if (value === undefined) {
                      return
                    }

                    setSampler(
                      pipe(
                        set(lensPath(['config', 'controlsY']), value),
                        set(
                          lensPath(['config', 'controlPoints']),
                          generateControlPoints(
                            sampler.config.controlsX,
                            value,
                          ),
                        ),
                      )(sampler),
                    )
                  }}
                />
              </Form.Item>
              <Form.Item label="Show Render Points">
                <Checkbox
                  checked={showRenderPoints}
                  onChange={event => setShowRenderPoints(event.target.checked)}
                ></Checkbox>
              </Form.Item>
            </Form>

            <Button>Add Horizontal</Button>
            <Button>Remove Horizontal</Button>
            <Button>Add Vertical</Button>
            <Button>Remove Vertical</Button>
          </div>

          <div
            ref={containerRef}
            style={{
              marginTop: '16px',
              marginBottom: '16px',
            }}
          >
            <svg
              style={{
                width: '100%',
                height: svgHeight,
                border: 'black solid 1px',
              }}
            >
              {showRenderPoints && (
                <g style={{}}>
                  {Array.from({ length: vPointCount + 1 }).flatMap((_, y) => {
                    return Array.from({
                      length: hPointCount + 1,
                    }).flatMap((_, x) => {
                      const cx =
                        (x / (hPointCount + 1)) * (sampler.config.controlsX + 1)
                      const cy =
                        (y / (vPointCount + 1)) * (sampler.config.controlsY + 1)

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
                              controlX + i,
                              controlY + j,
                            ),
                          )
                        }
                        rows.push(cubicInterpolatePoint(cols as Point4, v))
                      }

                      const finalPoint = cubicInterpolatePoint(
                        rows as Point4,
                        u,
                      )

                      return (
                        <ControlPoint
                          key={`renderPoint_${x}_${y}`}
                          point={{
                            x: finalPoint.x * scaleX,
                            y: finalPoint.y * scaleY,
                          }}
                          setPoint={() => {}}
                          containerRef={containerRef}
                          draggable={false}
                          className="interpolatedPoint"
                          radius={8}
                        />
                      )
                    })
                  })}
                </g>
              )}
              <g>
                {Array.from({ length: sampler.config.controlsY + 2 }).flatMap(
                  (_, y) => {
                    return Array.from({
                      length: sampler.config.controlsX + 2,
                    }).flatMap((_, x) => {
                      const sourcePoint = getControlPointAt(sampler, x, y)
                      const targetPoint1 = getControlPointAt(sampler, x + 1, y)
                      const targetPoint2 = getControlPointAt(sampler, x, y + 1)
                      if (!sourcePoint) {
                        return []
                      }

                      let lines: ReactElement[] = []
                      if (targetPoint1) {
                        lines = [
                          ...lines,
                          <line
                            key={`line_1_${x}_${y}`}
                            stroke="black"
                            strokeWidth={2}
                            x1={sourcePoint.x * scaleX}
                            y1={sourcePoint.y * scaleY}
                            x2={targetPoint1.x * scaleX}
                            y2={targetPoint1.y * scaleY}
                          ></line>,
                        ]
                      }

                      if (targetPoint2) {
                        lines = [
                          ...lines,
                          <line
                            key={`line_2_${x}_${y}`}
                            stroke="black"
                            strokeWidth={2}
                            x1={sourcePoint.x * scaleX}
                            y1={sourcePoint.y * scaleY}
                            x2={targetPoint2.x * scaleX}
                            y2={targetPoint2.y * scaleY}
                          ></line>,
                        ]
                      }

                      return lines
                    })
                  },
                )}
              </g>
              <g style={{}}>
                {sampler.config.controlPoints.map((controlPoint, index) => {
                  return (
                    <ControlPoint
                      key={`controlPoint_${index}`}
                      point={{
                        x: controlPoint.x * scaleX,
                        y: controlPoint.y * scaleY,
                      }}
                      setPoint={point =>
                        setSampler(
                          set(
                            lensPath(['config', 'controlPoints', index]),
                            {
                              x: point.x / scaleX,
                              y: point.y / scaleY,
                            },
                            sampler,
                          ),
                        )
                      }
                      containerRef={containerRef}
                      draggable={true}
                      className="controlPoint"
                      radius={16}
                    />
                  )
                })}
              </g>
            </svg>
          </div>
        </div>
      </DndProvider>
    )
  },
)
