class Point {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Vector {
  public dx: number;
  public dy: number;

  constructor(dx: number, dy: number) {
    this.dx = dx;
    this.dy = dy;
  }

  add(other: Vector): Vector {
    return new Vector(this.dx + other.dx, this.dy + other.dy);
  }

  sub(other: Vector): Vector {
    return new Vector(this.dx - other.dx, this.dy - other.dy);
  }

  mult(factor: number): Vector {
    return new Vector(this.dx * factor, this.dy * factor);
  }

  dot(other: Vector): number {
    return this.dx * other.dx + this.dy * other.dy;
  }

  cross(other: Vector): number {
    return this.dx * other.dy - this.dy * other.dx;
  }
}

export { Point, Vector };
