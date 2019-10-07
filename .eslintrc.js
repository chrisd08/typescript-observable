module.exports = {
  root: true,

  parser: "@typescript-eslint/parser",

  plugins: ["@typescript-eslint"],

  extends: [
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "prettier/@typescript-eslint",
  ],

  env: {
    es6: true,
    node: true,
  },

  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2018,
  },

  rules: {
    "@typescript-eslint/interface-name-prefix": [
      "error",
      { prefixWithI: "always" },
    ],
  },

  globals: {},
};
