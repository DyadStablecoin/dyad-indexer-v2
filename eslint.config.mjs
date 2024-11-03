import eslint from "@eslint/js";
//import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";
import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    languageOptions: {
      globals: globals.node,
    },
    plugins: {
      "simple-import-sort": eslintPluginSimpleImportSort,
      //"no-relative-import-paths": noRelativeImportPaths,
    },
    rules: {
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn", // or "error"
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      // "no-relative-import-paths/no-relative-import-paths": [
      //   "warn",
      //   {
      //     allowSameFolder: false,
      //     prefix: "@",
      //   },
      // ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
    ],
  }
);
