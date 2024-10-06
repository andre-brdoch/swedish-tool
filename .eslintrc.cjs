require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,

  parser: 'vue-eslint-parser',

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script',
    parser: '@typescript-eslint/parser',
  },

  env: {
    browser: true,
  },

  // unignore our custom dot files
  ignorePatterns: ['!.eslintrc.cjs', '!.prettierrc.json', '.stylelintrc.json'],

  extends: ['@andre-brdoch/eslint-config', 'plugin:vue/vue3-recommended', 'prettier', 'plugin:@typescript-eslint/strict'],

  rules: {
    // typescript

    '@typescript-eslint/no-dynamic-delete': 'error',
    // Rule would lead to linting errors when declaring Vue 3 `defineEmits` with multiple function signatures.
    '@typescript-eslint/unified-signatures': 'off',

    // vue
    'vue/array-bracket-spacing': 'error',
    'vue/arrow-spacing': 'error',
    'vue/attribute-hyphenation': ['error', 'never', { ignore: [] }],
    'vue/attributes-order': ['error', { alphabetical: true }],
    'vue/block-order': [
      'error',
      {
        order: [
          'script:not([setup])',
          'script[setup]',
          'template',
          'style:not([scoped])',
          'style[scoped]',
        ],
      },
    ],
    'vue/block-spacing': 'error',
    'vue/brace-style': 'error',
    'vue/camelcase': 'error',
    'vue/component-name-in-template-casing': [
      'error',
      'PascalCase',
      { registeredComponentsOnly: false },
    ],
    'vue/dot-location': ['error', 'property'],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'vue/key-spacing': 'error',
    'vue/keyword-spacing': 'error',
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: {
          max: 1,
        },
        multiline: {
          max: 1,
        },
      },
    ],
    'vue/multi-word-component-names': 'error',
    'vue/no-boolean-default': ['error', 'default-false'],
    'vue/no-deprecated-scope-attribute': 'error',
    'vue/no-empty-pattern': 'error',
    'vue/no-mutating-props': 'error',
    'vue/no-reserved-component-names': 'error',
    'vue/object-curly-spacing': ['error', 'always'],
    'vue/order-in-components': 'error',
    'vue/space-infix-ops': 'error',
    'vue/space-unary-ops': 'error',
    'vue/v-on-function-call': 'error',
    'vue/v-slot-style': [
      'error',
      {
        atComponent: 'v-slot',
        default: 'v-slot',
        named: 'longform',
      },
    ],
    'vue/valid-v-slot': 'error',

    // testing
    'vitest/consistent-test-filename': [
      2,
      {
        // enforce .unit.test or .int.test files
        pattern: '.*\\.(unit|int)\\.test\\.[tj]s$',
        allTestPattern: '.*\\.(test|spec|unit)\\.[tj]sx?$',
      },
    ],
  },

  overrides: [
    {
      // non-source .js files
      env: {
        node: true,
      },
      files: ['*.js', '*.cjs'],
      rules: {
        '@typescript-eslint/no-var-requires': [0],
      },
    },

    {
      files: ['**/*.vue'],
      rules: {
        '@typescript-eslint/no-var-requires': 'error',
      },
    },

    {
      // test files
      files: ['**/*.test.js', '**/*.test.ts'],
      extends: ['@andre-brdoch/eslint-config-vitest'],
    },
  ],
}
