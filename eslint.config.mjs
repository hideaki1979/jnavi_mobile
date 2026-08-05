import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    // 未指定だと eslint-plugin-react が毎回警告を出す。
    // インストール済みの react から自動検出させる。
    settings: { react: { version: "detect" } }
  },
  {
    rules: {
      "react/react-in-jsx-scope": 0,
      "comma-dangle": [2, "never"],
      semi: [2, "never"],
      "react/prop-types": 0 // TypeScriptを使用しているため無効化
    }
  },
  {
    // Expo config plugin は app.config.ts からパス文字列で参照され、Node が
    // CommonJS として require する(package.json に "type": "module" が無いため
    // .js = CJS)。ESM の import 構文に書き換えると prebuild が壊れるため、
    // このディレクトリでのみ require() を許容する。
    files: ["plugins/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": 0
    }
  }
]
