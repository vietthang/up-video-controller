import React, { MutableRefObject, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { Point } from '../common'

export interface ControlPointProps {
  containerRef: MutableRefObject<SVGSVGElement | null>
  point: Point
  setPoint?: (point: Point) => void
  draggable: boolean
  className: string
}

export const ControlPoint: React.FC<ControlPointProps> = React.memo(
  ({ containerRef, point, setPoint, draggable, className }) => {
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
    }, [draggable, isDragging, coord, containerRef, setPoint])

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
