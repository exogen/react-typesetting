import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

export default [
  {
    input: "src/index.ts",
    external: ["react", "prop-types", "debug"],
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.main.replace(/\.js$/, ".min.js"), format: "cjs" },
      { file: pkg.module, format: "es" },
      { file: pkg.module.replace(/\.js$/, ".min.js"), format: "es" }
    ],
    plugins: [
      typescript({
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          include: ["src/**/*"],
          exclude: ["node_modules", "**/*.test.ts", "**/*.test.tsx"]
        }
      }),
      babel({
        extensions: [".ts", ".tsx"]
      }),
      terser({
        include: /\.min\.js$/
      })
    ]
  }
];
