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
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
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
            top: -24,
            right: -24,
            width: 96,
            height: 96,
            borderRadius: 48,
            background: 'rgba(255,255,255,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -16,
            left: -16,
            width: 64,
            height: 64,
            borderRadius: 32,
            background: 'rgba(255,255,255,0.06)',
          }}
        />
        <span
          style={{
            fontSize: 130,
            fontWeight: 900,
            color: 'white',
            lineHeight: 1,
          }}
        >
          P
        </span>
      </div>
    ),
    size,
  )
}
