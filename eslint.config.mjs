import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'
import { globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // Mount-time data-fetch/hydration effects (useEffect(() => { load() }, []))
    // are intentional throughout the dashboard. The v7 react-hooks rule flags
    // them syntactically; keep as warning so they stay visible without
    // failing the gate. Revisit when migrating fetches to Server Components.
    plugins: { 'react-hooks': reactHooks },
    rules: { 'react-hooks/set-state-in-effect': 'warn' },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'public/landing/**',
    // Authoring/scratch scripts are CommonJS by design and not part of the app.
    'content-folder/**',
    '_verify_ts.js',
    '_temp_tree.txt',
  ]),
]

export default eslintConfig
