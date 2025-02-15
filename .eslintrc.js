module.exports = {
  env: {
    browser: true,
    node: true,
  },

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:perfectionist/recommended-natural',
    'prettier',
  ],

  parser: '@typescript-eslint/parser',

  plugins: ['@typescript-eslint'],

  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',

    '@typescript-eslint/no-explicit-any': 'off',

    '@typescript-eslint/no-unused-vars': 'warn',

    'import/order': 'off',

    'no-empty': ['error', { allowEmptyCatch: true }],

    'node/handle-callback-err': 'off',

    'perfectionist/sort-imports': [
      'error',
      {
        'custom-groups': {
          type: { react: 'react' },
          value: { react: ['react', 'react-*'] },
        },
        groups: [
          'type',
          'react',
          ['builtin', 'external'],
          'internal-type',
          'internal',
          ['parent-type', 'sibling-type', 'index-type'],
          ['parent', 'sibling', 'index'],
          'side-effect',
          'style',
          'object',
          'unknown',
        ],
        'internal-pattern': ['@/**'],
        'newlines-between': 'always',
      },
    ],

    'perfectionist/sort-jsx-props': [
      'error',
      {
        'custom-groups': {
          callback: 'on*',
          top: ['key', 'ref', 'component', 'id'],
        },
        groups: ['top', 'shorthand', 'unknown', 'multiline', 'callback'],
      },
    ],

    // 'perfectionist/sort-object-types': [
    //   'error',
    //   {
    //     'custom-groups': {
    //       callback: ['get*', 'on*'],
    //       ids: ['id', 'Id', 'id_*', 'Id_*', '*_id', '*_Id', '*Id'],
    //       top: ['name', 'title', 'label', 'pathname'],
    //     },
    //     groups: ['ids', 'top', 'unknown', 'callback', 'multiline'],
    //   },
    // ],

    'perfectionist/sort-objects': 'off',

    // 'perfectionist/sort-objects': [
    //   'error',
    //   {
    //     'custom-groups': {
    //       callback: ['get*', 'on*'],
    //       ids: ['id', 'Id', 'id_*', 'Id_*', '*_id', '*_Id', '*Id'],
    //       top: ['name', 'title', 'label', 'pathname'],
    //     },
    //     groups: ['ids', 'top', 'unknown', 'callback', 'multiline'],
    //   },
    // ],

    'prefer-const': ['error', { destructuring: 'all' }],

    radix: ['warn', 'as-needed'],

    'react/jsx-curly-brace-presence': ['error', 'never'],

    'react/jsx-no-target-blank': 'off',

    'react/jsx-uses-react': 'off',

    'react/no-unescaped-entities': 'off',

    'react/react-in-jsx-scope': 'off',
  },

  settings: {
    react: {
      version: 'detect',
    },
  },
};
