module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'unicorn'],
  rules: {
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'class', format: ['PascalCase'], leadingUnderscore: 'allow' },
      { selector: 'method', format: ['camelCase'], leadingUnderscore: 'allow' },
    ],
  },
  overrides: [
    {
      files: ['__tests__/**', '**/*.test.{ts,js}', '**/*.spec.{ts,js}'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {},
    },
    {
      files: ['**/*.gen.ts'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/ban-types': 'off',
      },
    },
    {
      files: ['**/*.js'],
      rules: { '@typescript-eslint/no-var-requires': 'off' },
    },
    {
      files: ['libs/**/*.ts', '!**/__generated__/**'],
      rules: {
        'no-console': 1,
      },
    },
  ],
};
