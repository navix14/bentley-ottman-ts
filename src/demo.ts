import { BentleyOttman, Segment } from "./bentleyOttman";
import { Point } from "./util";

const s1 = new Segment("s1", new Point(0, 4), new Point(14, 5));
const s2 = new Segment("s2", new Point(2, 7), new Point(12, 0));
const s3 = new Segment("s3", new Point(5, 0), new Point(11, 6));

const bentleyOttman = new BentleyOttman([s1, s2, s3]);
const intersections = bentleyOttman.findIntersections();

console.log(intersections);
