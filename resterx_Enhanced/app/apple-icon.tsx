import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 180,
  height: 180,
}
 
export const contentType = 'image/png'
 
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 80,
          background: '#1a1a1a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00ff88',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          border: '8px solid #00ff88',
          borderRadius: '32px',
        }}
      >
        &gt;_
      </div>
    ),
    {
      ...size,
    }
  )
}
