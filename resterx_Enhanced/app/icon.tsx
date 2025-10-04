import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 32,
  height: 32,
}
 
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#1a1a1a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00ff88',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          border: '2px solid #00ff88',
          borderRadius: '4px',
        }}
      >
        &gt;
      </div>
    ),
    {
      ...size,
    }
  )
}
