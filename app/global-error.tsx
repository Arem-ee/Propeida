'use client'

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#fffdf8', color: '#000000', fontFamily: 'system-ui, sans-serif' }}>
        <main
          role="alert"
          style={{ maxWidth: 420, margin: '0 auto', padding: '96px 20px', textAlign: 'center' }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Something went wrong</h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: '#3d4b63', margin: '0 0 28px' }}>
            Propeida hit an unexpected error. Your saved progress is safe.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 0,
              borderRadius: 12,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
