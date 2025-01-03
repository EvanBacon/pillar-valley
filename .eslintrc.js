module.exports = {
  // parser: "babel-eslint",
  extends: "expo",
  plugins: ["eslint-plugin-react-compiler", "react", "bacon"],
  rules: {
    "react-compiler/react-compiler": "error",
    "bacon/no-empty-styles": "error",
    "bacon/modern-react-native": [
      "error",
      { preserve: ["Image", "StatusBar"] },
    ],
    "bacon/no-vector-icon-barrel": "error",
    // "global-require": 0,
    // "no-console": 0,
    // "max-len": [
    //   2,
    //   {
    //     code: 120,
    //     ignoreComments: true,
    //     ignoreUrls: true,
    //   },
    // ],
    // "no-underscore-dangle": 0,
    // "no-use-before-define": 0,
    "react/forbid-prop-types": 0,
    "react/jsx-filename-extension": [
      2,
      {
        extensions: [".js", ".jsx", ".tsx"],
      },
    ],
    // "no-param-reassign": [
    //   2,
    //   {
    //     props: false,
    //   },
    // ],
    "react/prefer-stateless-function": 0,
  },

  env: { browser: true, jest: true },

  overrides: [
    {
      files: ["**/__tests__/*"],
      env: { node: true },
    },
  ],
};
