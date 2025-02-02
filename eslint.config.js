import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import solid from 'eslint-plugin-solid/configs/typescript';
import globals from 'globals';
import typescript from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...typescript.configs.recommended,
  {
    files: ['**/*.{js,ts,tsx}'],
  },
  {
    ...solid,
  },
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    ignores: [
      '.env',
      '.env.*',
      '!.env.example',
      '*.ignore.*',
      'build',
      'node_modules',
      'package',
      'src/common/pb*.ts',
    ],
  },
  prettier,
];
