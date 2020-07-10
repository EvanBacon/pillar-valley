export default function (t: number, b: number, _c: number, d: number): number {
  const c = _c - b;
  return c * (t /= d) * t + b;
}
