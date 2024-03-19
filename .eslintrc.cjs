const { resolve } = require('node:path');

const project = resolve(__dirname, 'tsconfig.json');

module.exports = {
  root: true,
  extends: [require.resolve('@realshaunoneill/style-guide/eslint/node')],
  parserOptions: {
    project,
  },
  ignorePatterns: ['.eslintrc.js'],
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  rules: {
    'no-console': 'off',
    'operator-linebreak': 'off',
  },
};
