import Constants from 'expo-constants'; 

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
