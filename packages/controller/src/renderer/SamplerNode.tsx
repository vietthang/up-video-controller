import './SamplerNode.css'

import { update } from 'ramda'
import React, { Dispatch, ReactElement, SetStateAction, useRef } from 'react'
import { DndProvider } from 'react-dnd'
import { Point, useSelectSetter } from '../common'
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
  setControlPoints: Dispatch<SetStateAction<Point[]>>
}

export const EditSamplerView: React.FC<SamplerNodeProps> = ({
  showControlPoints,
  showRenderPoints,
  sampler,
  controlPoints,
  setControlPoints,
}) => {
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
                    setControlPoints(controlPoints =>
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
                />
              )
            })}
          </g>
        )}
      </svg>
    </DndProvider>
  )
}
