import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SwaddleShawls - Pure Comfort from India';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const fontCss = await fetch(`https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&text=${encodeURIComponent('SwaddleShawls Pure Comfort from India')}`, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2' } }).then((res) => res.text());
  const fontUrlMatch = fontCss.match(/url\((https:\/\/[^)]+)\)/);
  const playfairData = fontUrlMatch ? await fetch(fontUrlMatch[1]).then(res => res.arrayBuffer()) : null;

  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3002';
  const bgData = await fetch(`${baseUrl}/og/global_bg.png`).then((res) => res.arrayBuffer());
  const logoData = await fetch(`${baseUrl}/SwaddleShawlsSymbolLogo.png`).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#2C1810', position: 'relative' }}>
        <img
          src={bgData}
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(44,24,16,0.95), rgba(44,24,16,0.3))' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '60px', width: '100%', height: '100%', position: 'absolute' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={logoData} style={{ width: '110px', height: '110px', objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '30px' }}>
              <div style={{ fontSize: '80px', fontFamily: '"Playfair Display"', fontWeight: 'bold', color: '#FCFBF8', letterSpacing: '-0.02em', lineHeight: '1' }}>
                SwaddleShawls
              </div>
              <div style={{ fontSize: '32px', fontFamily: '"Playfair Display"', color: '#DBB55C', letterSpacing: '0.15em', marginTop: '12px', textTransform: 'uppercase' }}>
                Pure Comfort from India
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: playfairData ? [{ name: 'Playfair Display', data: playfairData, style: 'normal', weight: 700 }] : undefined,
    }
  );
}
