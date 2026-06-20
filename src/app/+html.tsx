import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Cấu hình SEO và Social Preview (Open Graph) */}
        <title>LunaCare - Yêu Thương & Thấu Hiểu</title>
        <meta name="description" content="LunaCare là ứng dụng AI thông minh giúp theo dõi chu kỳ, chăm sóc sức khỏe sinh sản và gắn kết tình cảm vợ chồng." />
        
        {/* PWA & iOS Safari Add to Home Screen */}
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LunaCare" />

        
        {/* Open Graph / Facebook / Zalo */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://lunacare-rho.vercel.app/" />
        <meta property="og:title" content="LunaCare - Yêu Thương & Thấu Hiểu" />
        <meta property="og:description" content="Ứng dụng AI thông minh giúp theo dõi chu kỳ, chăm sóc sức khỏe sinh sản và gắn kết tình cảm vợ chồng." />
        <meta property="og:image" content="https://lunacare-rho.vercel.app/icon.png" />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://lunacare-rho.vercel.app/" />
        <meta property="twitter:title" content="LunaCare - Yêu Thương & Thấu Hiểu" />
        <meta property="twitter:description" content="Ứng dụng AI thông minh giúp theo dõi chu kỳ, chăm sóc sức khỏe sinh sản và gắn kết tình cảm vợ chồng." />
        <meta property="twitter:image" content="https://lunacare-rho.vercel.app/icon.png" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
