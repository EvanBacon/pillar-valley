import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: title */
const SvgComponent = (props: SvgProps) => (
  <Svg fill="#3DDC84" viewBox="0 0 24 24" {...props}>
    <Path d="M17.523 15.341a1 1 0 0 1 0-1.999 1 1 0 0 1 0 2m-11.046 0a1 1 0 0 1 0-2 1 1 0 0 1 0 2m11.405-6.02 1.997-3.46a.416.416 0 0 0-.152-.567.416.416 0 0 0-.568.152L17.137 8.95c-1.547-.706-3.284-1.1-5.137-1.1s-3.59.394-5.137 1.1L4.841 5.447a.416.416 0 0 0-.568-.152.416.416 0 0 0-.152.567l1.997 3.46C2.688 11.186.343 14.658 0 18.76h24c-.344-4.102-2.69-7.574-6.119-9.44" />
  </Svg>
);
export default SvgComponent;
