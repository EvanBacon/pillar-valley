// @flow
function normalize(v, velocity, time) {
  const procure = (velocity.bound(v) - velocity.min) / velocity.delta;
  return time.min + procure * time.delta;
}

export default normalize;
