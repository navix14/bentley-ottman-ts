import PriorityQueue from "./priorityQueue";
import { AVLTree } from "./avl";
import { Point, Vector } from "./util";

class Segment {
  public id: string;
  public start: Point;
  public end: Point;
  public value: number;

  constructor(id: string, start: Point, end: Point) {
    this.id = id;
    this.start = start;
    this.end = end;
    this.value = start.y;
  }

  updateValue(x: number) {
    const x1 = this.start.x;
    const y1 = this.start.y;
    const x2 = this.end.x;
    const y2 = this.end.y;

    if (x < x1) {
      this.value = y1;
    }

    this.value = y1 + ((y2 - y1) / (x2 - x1)) * (x - x1);
  }

  intersect(other: Segment): Point | null {
    const p = new Vector(this.start.x, this.start.y);
    const q = new Vector(other.start.x, other.start.y);

    const r = new Vector(this.end.x - this.start.x, this.end.y - this.start.y);
    const s = new Vector(
      other.end.x - other.start.x,
      other.end.y - other.start.y
    );

    const rxs = r.cross(s);
    const qp = q.sub(p);
    const qpr = qp.cross(r);

    if (rxs === 0 && qpr === 0) {
      const sr = s.dot(r);
      const rr = r.dot(r);
      const t0 = qp.dot(r) / rr;
      const t1 = t0 + sr / rr;

      let overlapping = false;
      if (sr >= 0) {
        overlapping =
          t0 < t1 && ((t0 < 0 && t1 >= 0) || (t0 >= 0 && t0 < 1 && t1 > 0));
      } else {
        overlapping =
          t1 < t0 && ((t1 < 0 && t0 >= 0) || (t1 >= 0 && t1 < 1 && t0 > 0));
      }

      if (!overlapping) {
        return null;
      }
    } else if (rxs === 0 && qpr !== 0) {
      return null;
    } else if (rxs !== 0) {
      const t = qp.cross(s) / rxs;
      const u = qp.cross(r) / rxs;

      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        const intersection = p.add(r.mult(t));
        return new Point(intersection.dx, intersection.dy);
      }
    } else {
      return null;
    }

    return null;
  }

  toString() {
    return this.id;
  }
}

enum EventType {
  LeftEndpoint,
  RightEndpoint,
  Intersection,
}

class Event {
  public point: Point;
  public segments: Segment[];
  public type: EventType;
  public priority: number;

  constructor(point: Point, segments: Segment[], type: EventType) {
    this.point = point;
    this.segments = segments;
    this.priority = -point.x;
    this.type = type;
  }
}

class BentleyOttman {
  private segments: Segment[];
  private queue: PriorityQueue<Event>;
  private tree: AVLTree<Segment>;

  private intersections: Point[];

  constructor(segments: Segment[]) {
    this.segments = segments;
    this.queue = new PriorityQueue<Event>((a, b) => b.priority - a.priority);
    this.tree = new AVLTree<Segment>((a, b) => a.value - b.value);
    this.intersections = [];

    this.initialize();
  }

  private initialize() {
    // Initially, our queue contains an event for each of the endpoints of the input segments.
    this.segments.forEach((segment) => {
      this.queue.enqueue(
        new Event(segment.start, [segment], EventType.LeftEndpoint)
      );
      this.queue.enqueue(
        new Event(segment.end, [segment], EventType.RightEndpoint)
      );
    });
  }

  private removeEvent(s: Segment, t: Segment) {
    for (const event of this.queue.list()) {
      if (event.type === EventType.Intersection) {
        const seg1 = event.segments[0];
        const seg2 = event.segments[1];

        if ((seg1 === s && seg2 === t) || (seg1 === t && seg2 === s)) {
          this.queue.remove(event);
        }
      }
    }
  }

  private updateSegments(currentX: number) {
    const iterator = this.tree.iterator();

    while (iterator.hasNext()) {
      const segment = iterator.next();
      segment?.updateValue(currentX);
    }
  }

  private swap(s: Segment, t: Segment) {
    this.tree.remove(s);
    this.tree.remove(t);

    const tmp = s.value;

    s.value = t.value;
    t.value = tmp;

    this.tree.insert(s);
    this.tree.insert(t);
  }

  private handleLeftEvent(event: Event) {
    const s = event.segments[0];

    this.updateSegments(s.start.x);

    // Insert segment into our AVL
    this.tree.insert(s);

    const r = this.tree.findSuccessor(s);
    const t = this.tree.findPredecessor(s);

    // If the crossing of r and t forms a potential future event in the event queue,
    // remove this possible future event from the event queue
    if (r && t) {
      this.removeEvent(r, t);
    }

    // If s crosses r or t, add those crossing points as potential future events in the event queue.
    if (r) {
      const intersection = s.intersect(r);

      if (intersection !== null) {
        this.intersections.push(intersection);

        this.queue.enqueue(
          new Event(intersection, [s, r], EventType.Intersection)
        );
      }
    }

    if (t) {
      const intersection = s.intersect(t);

      if (intersection !== null) {
        this.intersections.push(intersection);

        this.queue.enqueue(
          new Event(intersection, [s, t], EventType.Intersection)
        );
      }
    }
  }

  private handleRightEvent(event: Event) {
    const s = event.segments[0];

    const r = this.tree.findSuccessor(s);
    const t = this.tree.findPredecessor(s);

    this.tree.remove(s);

    if (r && t) {
      const intersection = r.intersect(t);

      if (intersection) {
        this.intersections.push(intersection);

        this.queue.enqueue(
          new Event(intersection, [r, t], EventType.Intersection)
        );
      }
    }
  }

  private handleIntersectionEvent(event: Event) {
    const s = event.segments[0];
    const t = event.segments[1];

    this.swap(s, t);

    const r = this.tree.findSuccessor(t);
    const u = this.tree.findPredecessor(s);

    if (r) {
      this.removeEvent(r, s);

      const intersectRT = r.intersect(t);
      if (intersectRT) {
        this.intersections.push(intersectRT);
      }
    }

    if (u) {
      this.removeEvent(t, u);

      const intersectSU = s.intersect(u);
      if (intersectSU) {
        this.intersections.push(intersectSU);
      }
    }
  }

  findIntersections(): Point[] {
    while (!this.queue.isEmpty()) {
      const event = this.queue.dequeue()!;

      switch (event.type) {
        case EventType.LeftEndpoint:
          this.handleLeftEvent(event);
          break;
        case EventType.RightEndpoint:
          this.handleRightEvent(event);
          break;
        case EventType.Intersection:
          this.handleIntersectionEvent(event);
          break;
      }
    }

    return this.intersections;
  }
}

export { Event, EventType, Segment, BentleyOttman };
