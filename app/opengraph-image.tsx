import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #1d4ed8 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: 200,
            background: 'rgba(255,255,255,0.04)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: 250,
            background: 'rgba(255,255,255,0.03)',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'linear-gradient(145deg, #2563eb, #1e40af)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                width: 52,
                height: 34,
                borderRadius: 6,
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#2563eb',
                  lineHeight: 1,
                }}
              >
                P
              </span>
            </div>
            <div
              style={{
                width: 60,
                height: 3,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.5)',
                marginTop: 5,
              }}
            />
          </div>
          <span
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: 'white',
              lineHeight: 1,
              letterSpacing: -1,
            }}
          >
            Propeida
          </span>
        </div>
        <p
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.85)',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.4,
            marginTop: 8,
          }}
        >
          Practice UNILORIN Post-UTME & JAMB past questions with interactive CBT mock exams
        </p>
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.6)',
              padding: '8px 20px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.1)',
            }}
          >
            NGN 1,500 one-time
          </span>
          <span
            style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.6)',
              padding: '8px 20px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.1)',
            }}
          >
            No subscription
          </span>
        </div>
      </div>
    ),
    size,
  )
}
