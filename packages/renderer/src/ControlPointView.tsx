import React, { MutableRefObject, useEffect, useMemo } from 'react'
import { useDrag } from 'react-dnd'
import { nextId, Point } from './common'

export interface ControlPointProps {
  containerRef: MutableRefObject<SVGSVGElement | null>
  point: Point
  setPoint?: (point: Point) => void
  draggable: boolean
  className: string
  radius: number
}

export const ControlPoint: React.FC<ControlPointProps> = React.memo(
  ({ containerRef, point, setPoint, draggable, className, radius }) => {
    const [{ isDragging, coord }, dragRef] = useDrag({
      item: {
        type: 'Point',
      },
      collect: monitor => {
        return {
          isDragging: monitor.isDragging(),
          coord: monitor.getClientOffset(),
        }
      },
    })

    useEffect(() => {
      if (!draggable || !isDragging || !coord || !setPoint) {
        return
      }
      const containerElement = containerRef.current
      if (!containerElement) {
        return
      }
      const boundingRect = containerElement.getBoundingClientRect()
      setPoint({
        x: coord.x - boundingRect.left,
        y: coord.y - boundingRect.top,
      })
    }, [
      draggable,
      isDragging,
      coord ? coord.x : null,
      coord ? coord.y : null,
      containerRef,
      // setPoint,
    ])

    return (
      <g
        className="controlGroup"
        transform={`translate(${point.x} ${point.y})`}
      >
        <circle key="render" className={className} r={4}></circle>
        <circle key="control" ref={dragRef} r={64} opacity={0}></circle>
      </g>
    )
  },
)
