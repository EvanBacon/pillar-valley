import { Constants } from 'expo';

function getUserInfo() {
  const {
    appOwnership,
    expoVersion,
    deviceId,
    deviceName,
    deviceYearClass,
    isDevice,
    platform,
  } = Constants;
  return {
    appOwnership,
    expoVersion,
    deviceId,
    deviceName,
    deviceYearClass,
    isDevice,
    // platform,
  };
}
export default getUserInfo;
