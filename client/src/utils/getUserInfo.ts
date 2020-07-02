import Constants from "expo-constants";

function getUserInfo() {
  const {
    appOwnership,
    expoVersion,
    deviceId,
    deviceName,
    deviceYearClass,
    isDevice,
  } = Constants;
  return {
    appOwnership,
    expoVersion,
    deviceId,
    deviceName,
    deviceYearClass,
    isDevice,
  };
}
export default getUserInfo;
