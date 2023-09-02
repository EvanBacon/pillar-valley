/** @type {import('../../target-plugin/config').Config} */
module.exports = {
  type: "widget",
  icon: "../../icons/pillars/spring.png",
  colors: {
    gradient1: {
      light: "#E4975D",
      dark: "#3E72A0",
    },
    gradient2: {
      light: "#EB513F",
      dark: "#282A37",
    },
  },
  entitlements: {
    "com.apple.security.application-groups": ["group.bacon.data"],
  },
  images: {
    valleys: "../../valleys.png",
  },
  widgetBackgroundColor: "#DB739C",
  accentColor: "#F09458",
};
