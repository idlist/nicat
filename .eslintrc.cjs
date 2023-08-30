/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // Turn off rules
    '@typescript-eslint/no-empty': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-empty-interface': 'off',

    // Set some rules from error to warining
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'prefer-const': 'warn',
    'no-empty': 'warn',

    // Coding styles
    indent: ['warn', 2, { SwitchCase: 1 }],
    semi: ['warn', 'never'],
    quotes: ['warn', 'single'],
    'comma-dangle': ['warn', 'always-multiline'],
    'arrow-parens': ['warn', 'always'],
  },
}
