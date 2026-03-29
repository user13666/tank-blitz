module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "airbnb",
    "prettier",
  ],
  "overrides": [
    {
      "env": {
        "node": true
      },
      "files": [
        ".eslintrc.{js,cjs}"
      ],
      "parserOptions": {
        "sourceType": "script"
      }
    }
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-param-reassign": ["error", { "props": false }],
    'camelcase': 'off',
    "no-use-before-define": ["error", { "functions": false }],
    "no-restricted-syntax": ["error", "FunctionExpression", "WithStatement", "BinaryExpression[operator='in']"],
    "no-continue": "off",
    'no-await-in-loop': "off",
    "no-undef": "off",
    "prefer-destructuring": ["error", {"object": true, "array": false}],
    "no-return-await" : "off",
  },
  "globals": {
    "moment": false,
    "chrome": false,
    "Chart": false,
    "Dexie": false,
    "ClipboardJS": false,
  }
}
