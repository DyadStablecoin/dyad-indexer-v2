//import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        projectService: {
          allowDefaultProject: ['*.js', '*.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'simple-import-sort': eslintPluginSimpleImportSort,
      //"no-relative-import-paths": noRelativeImportPaths,
    },
    rules: {
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn', // or "error"
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
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
    ignores: ['node_modules/**', 'dist/**'],
  },
);
