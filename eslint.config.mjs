import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Mount-time data-fetch/hydration effects (useEffect(() => { load() }, []))
    // are intentional throughout the dashboard. The v6 react-hooks rule flags
    // them syntactically; keep as warning so they stay visible without
    // failing the gate. Revisit when migrating fetches to Server Components.
    rules: { 'react-hooks/set-state-in-effect': 'warn' },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'public/landing/**',
  ]),
])

export default eslintConfig
