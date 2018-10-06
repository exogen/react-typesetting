module.exports = {
  extends: ["standard", "standard-react", "prettier", "prettier/standard"],
  env: {
    es6: true,
    node: true,
    jest: true
  },
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2018
  },
  plugins: ["react", "prettier"],
  rules: {
    "prettier/prettier": ["warn", {}]
  }
};
