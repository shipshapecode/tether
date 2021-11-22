module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended'
  ],
  env: {
    browser: true,
    es6: true
  },
  rules: {
    'complexity': ['warn', 6],
    'max-lines': ['warn', { max: 250, skipBlankLines: true, skipComments: true }],
    'no-console': 'off',
    'no-unused-vars': 'off',
    'prefer-const': 'off'
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        'babel.config.js',
        'jest.config.js',
        'rollup.config.js',
        '__mocks__/styleMock.js'
      ],
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020
      },
      env: {
        node: true
      }
    }
  ]
};
