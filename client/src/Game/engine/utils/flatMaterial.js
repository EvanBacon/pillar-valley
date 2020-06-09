import { MeshPhongMaterial } from "three";

export default (props) =>
  new MeshPhongMaterial({
    flatShading: true,
    ...props,
  });
