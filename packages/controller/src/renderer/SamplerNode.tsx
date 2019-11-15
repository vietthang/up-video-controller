import './SamplerNode.css'

import { update } from 'ramda'
import React, { ReactElement, useRef } from 'react'
import { DndProvider } from 'react-dnd'
import { Point } from '../common'
import { Sampler } from '../state'
import { ControlPoint } from './ControlPointView'

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

export interface SamplerNodeProps {
  sampler: Sampler
  showControlPoints: boolean
  showRenderPoints: boolean
  controlPoints: Point[]
  setControlPoints: (points: Point[]) => void
}

export const EditSamplerView: React.FC<SamplerNodeProps> = ({
  showControlPoints,
  showRenderPoints,
  sampler,
  controlPoints,
  setControlPoints,
}) => {
  // useEffect(() => {
  //   const renderPoints: Point[] = new Array(
  //     (yPointCount + 1) * (xPointCount + 1),
  //   )
  //   let i = 0
  //   for (let y = 0; y < yPointCount + 1; y++) {
  //     for (let x = 0; x < xPointCount + 1; x++) {
  //       const cx = (x / xPointCount) * (sampler.warp.controlsX + 1)
  //       const cy = (y / yPointCount) * (sampler.warp.controlsY + 1)

  //       const controlX = Math.floor(cx)
  //       const u = cx - controlX
  //       const controlY = Math.floor(cy)
  //       const v = cy - controlY

  //       const rows: Point[] = []
  //       for (let i = -1; i < 3; ++i) {
  //         const cols: Point[] = []
  //         for (let j = -1; j < 3; ++j) {
  //           cols.push(
  //             getControlPointAtExtrapolate(
  //               sampler,
  //               controlPoints,
  //               controlX + i,
  //               controlY + j,
  //             ),
  //           )
  //         }
  //         rows.push(cubicInterpolatePoint(cols as Point4, v))
  //       }

  //       renderPoints[i++] = cubicInterpolatePoint(rows as Point4, u)
  //     }
  //   }

  //   setRenderPoints(renderPoints)
  // }, [
  //   // sampler, // TODO
  //   sampler.out.width,
  //   sampler.out.height,
  //   sampler.warp.resolution,
  //   sampler.warp.controlsX,
  //   sampler.warp.controlsY,
  //   controlPoints,
  //   xPointCount,
  //   yPointCount,
  //   setRenderPoints,
  // ])

  const containerRef = useRef<SVGSVGElement | null>(null)

  if (!controlPoints) {
    return <></>
  }

  return (
    <DndProvider backend={require('react-dnd-mouse-backend').default}>
      <svg
        style={{
          left: sampler.out.left,
          top: sampler.out.top,
          width: sampler.out.width,
          height: sampler.out.height,
        }}
        ref={containerRef}
      >
        {showControlPoints && (
          <g>
            {Array.from({ length: sampler.warp.controlsY + 2 }).flatMap(
              (_, y) => {
                return Array.from({
                  length: sampler.warp.controlsX + 2,
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
        )}
        {/* {showRenderPoints && (
          <g>
            {renderPoints.map((point, index) => {
              return (
                <ControlPoint
                  key={`renderPoint_${index}`}
                  point={{
                    x: point.x * sampler.out.width,
                    y: point.y * sampler.out.height,
                  }}
                  containerRef={containerRef}
                  draggable={false}
                  className="renderPoint"
                  radius={8}
                />
              )
            })}
          </g>
        )} */}
        {showControlPoints && (
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
                  radius={32}
                />
              )
            })}
          </g>
        )}
      </svg>
    </DndProvider>
  )
}
