module.exports = {
  root: true,
  extends: 'eslint-config-egg/typescript',
  globals: {
    window: true,
  },
  rules: {
    'valid-jsdoc': 0,
    'no-script-url': 0,
    'no-multi-spaces': 0,
    'default-case': 0,
    'no-case-declarations': 0,
    'one-var-declaration-per-line': 0,
    'no-restricted-syntax': 0,
    'jsdoc/require-param': 0,
    'jsdoc/check-param-names': 0,
    'jsdoc/require-param-description': 0,
    'jsdoc/require-returns-description': 0,
    'arrow-parens': 0,
    'prefer-promise-reject-errors': 0,
    'no-control-regex': 0,
    'no-use-before-define': 0,
    'array-callback-return': 0,
    'no-bitwise': 0,
    'no-self-compare': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/no-this-alias': 0,
    'one-var': 0,
    'no-sparse-arrays': 0,
    'no-useless-concat': 0,
  },
};
