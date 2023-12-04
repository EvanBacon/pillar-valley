/** @type {import('@bacons/apple-targets').Config} */
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
    $accent: "#F09458",
    $widgetBackground: "#DB739C",
  },
  entitlements: {
    "com.apple.security.application-groups": ["group.bacon.data"],
  },
  images: {
    valleys: "../../valleys.png",
  },
};
