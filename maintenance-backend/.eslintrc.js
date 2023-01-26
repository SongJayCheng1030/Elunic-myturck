module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: '@elunic/eslint-config-ecs',
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['**/coverage/*'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
};
