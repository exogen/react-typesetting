module.exports = {
  presets: [
    [
      "next/babel",
      {
        cjs: { "preset-env": { modules: "commonjs" } },
        esm: { "preset-env": { modules: false } }
      }[process.env.BABEL_ENV] || {}
    ]
  ],
  plugins: [["babel-plugin-styled-components", { ssr: true }]]
};
