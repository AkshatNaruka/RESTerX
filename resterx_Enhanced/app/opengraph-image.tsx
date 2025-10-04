import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'RESTerX - The Complete Platform to Test APIs'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui',
          position: 'relative',
        }}
      >
        {/* Terminal-like border */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 40,
            right: 40,
            bottom: 40,
            border: '4px solid #00ff88',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
          }}
        >
          {/* Terminal dots */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              display: 'flex',
              gap: '12px',
            }}
          >
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#27c93f' }} />
          </div>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <div
              style={{
                fontSize: 96,
                fontWeight: 'bold',
                letterSpacing: '-0.05em',
                color: 'white',
              }}
            >
              RESTerX
            </div>
            <div
              style={{
                fontSize: 36,
                color: '#00ff88',
                textAlign: 'center',
                maxWidth: 900,
              }}
            >
              The Complete Platform to Test APIs
            </div>
            <div
              style={{
                fontSize: 24,
                color: '#888',
                textAlign: 'center',
                marginTop: 20,
              }}
            >
              Professional API testing • 9+ Languages • Environment Variables
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
