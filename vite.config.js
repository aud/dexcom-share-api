import path from "path";
import {defineConfig} from "vite";
import typescript from "@rollup/plugin-typescript";

const resolvePath = str => path.resolve(__dirname, "src", str)

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "DexcomApi",
      fileName: (format) => `dexcom-share-api.${format}.js`
    },
    rollupOptions: {
      plugins: [
        typescript({
          "target": "es2020",
          "rootDir": resolvePath("../src"),
          "declaration": true,
          "declarationDir": resolvePath("../dist"),
          allowSyntheticDefaultImports: true
        })
      ]
    },
  }
})

