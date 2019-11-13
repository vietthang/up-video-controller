import React, { MutableRefObject, useEffect, useMemo, useState } from 'react'
import { useDrag } from 'react-dnd'
import { nextId, Point } from './common'

export interface ControlPointProps {
  containerRef: MutableRefObject<HTMLDivElement | null>
  point: Point
  setPoint: (point: Point) => void
  draggable: boolean
  className: string
  radius: number
}

export const ControlPoint: React.FC<ControlPointProps> = React.memo(
  ({ containerRef, point, setPoint, draggable, className, radius }) => {
    const id = useMemo(() => nextId(), [])

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
      if (!draggable || !isDragging || !coord) {
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
    ])

    return (
      <circle
        key={id}
        ref={dragRef}
        className={className}
        transform={`translate(${point.x} ${point.y})`}
        cx={0}
        cy={0}
        r={radius}
      ></circle>
    )
  },
)
