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
    '.next-prod/**',
    '.landing-source/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'public/landing/**',
    // Authoring/scratch scripts are CommonJS by design and not part of the app.
    'content-folder/**',
    'scripts/**',
    '_verify_ts.js',
    '_temp_tree.txt',
    // One-off root scratch scripts: CommonJS by design, not app code.
    '_parse-pdf.cjs',
    '_review.js',
    'db-state.cjs',
    'exam-subject-map.cjs',
  ]),
]

export default eslintConfig
