import { Point } from './common'

export type Float4 = [number, number, number, number]

export type Float44 = [Float4, Float4, Float4, Float4]

export type Float444 = [Float44, Float44, Float44, Float44]

// https://www.paulinternet.nl/?page=bicubic
export function cubicInterpolate(p: Float4, x: number): number {
  return (
    p[1] +
    0.5 *
      x *
      (p[2] -
        p[0] +
        x *
          (2.0 * p[0] -
            5.0 * p[1] +
            4.0 * p[2] -
            p[3] +
            x * (3.0 * (p[1] - p[2]) + p[3] - p[0])))
  )
}

export function bicubicInterpolate(p: Float44, x: number, y: number): number {
  return cubicInterpolate(p.map(p => cubicInterpolate(p, y)) as Float4, x)
}

export function tricubicInterpolate(
  p: Float444,
  x: number,
  y: number,
  z: number,
): number {
  return cubicInterpolate(p.map(p => bicubicInterpolate(p, y, z)) as Float4, x)
}

export type Point4 = [Point, Point, Point, Point]

export function cubicInterpolatePoint(p: Point4, x: number): Point {
  return {
    x: cubicInterpolate(p.map(p => p.x) as Float4, x),
    y: cubicInterpolate(p.map(p => p.y) as Float4, x),
  }
}
