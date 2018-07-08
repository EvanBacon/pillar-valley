export default color => {
  if (color.startsWith('#')) {
    color = color.substr(1);
  }
  return parseInt('0x' + color, 16);
};
