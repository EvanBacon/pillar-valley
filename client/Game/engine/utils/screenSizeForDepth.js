// @flow

type Size = {
  width: number,
  height: number,
};

const screenSizeForDepth = (
  zDepth: number,
  aspect: number,
  fov: number,
): Size => {
  const vFOV = fov * Math.PI / 180; // convert vertical fov to radians
  const height = Math.abs(2 * Math.tan(vFOV / 2) * zDepth); // visible height
  const width = height * aspect;
  return { height, width };
};

export default screenSizeForDepth;
