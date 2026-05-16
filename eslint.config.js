import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Serverless functions in /api run on Node, not the browser.
    files: ['api/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Context files necessarily export a Provider component AND a `useFoo`
    // hook from the same module. That's the canonical pattern; the
    // react-refresh restriction would force us to split every context into
    // two files for no behavior change.
    files: ['src/context/**/*.{js,jsx}'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
