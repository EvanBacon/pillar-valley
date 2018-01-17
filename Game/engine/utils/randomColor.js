import randomColor from 'randomcolor';
import colorToHex from './colorToHex';

export default props => colorToHex(randomColor(props));
