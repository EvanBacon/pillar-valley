/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "clip",
  icon: "../../icons/pillars/default.png",
  deploymentTarget: "17.6",
  entitlements: {
    /* Add entitlements */
  },
});
