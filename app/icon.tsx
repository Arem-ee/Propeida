import { ImageResponse } from 'next/og'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          borderRadius: 32,
          background: 'linear-gradient(145deg, #2563eb 0%, #1e40af 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: 50,
            background: 'rgba(255,255,255,0.06)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -20,
            left: -20,
            width: 80,
            height: 80,
            borderRadius: 40,
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <div
            style={{
              width: 80,
              height: 50,
              background: 'white',
              borderRadius: '4px 4px 20px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: '#2563eb',
                lineHeight: 1,
                marginTop: -2,
              }}
            >
              P
            </span>
          </div>
          <div
            style={{
              width: 96,
              height: 4,
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    ),
    size,
  )
}
