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

        {/* Load Barlow font from Google Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@1,200;1,300;1,400&display=swap" rel="stylesheet" />

        {/* Thêm Tiêu đề và Meta description cho chuẩn SEO */}
        <title>Iu MP - Thấu Hiểu Em</title>
        <meta name="description" content="Ứng dụng theo dõi sức khỏe, tâm lý và chu kỳ kinh nguyệt dành riêng cho cặp đôi. Dữ liệu bảo mật tuyệt đối, đồng bộ theo thời gian thực." />
        
        {/* PWA & iOS Safari Add to Home Screen */}
        <link rel="icon" type="image/png" href="/icon.png?v=2" />
        <link rel="apple-touch-icon" href="/icon.png?v=2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="For Embeiu" />

        
        {/* Open Graph / Facebook / Zalo */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://app.lunacare.com/" />
        <meta property="og:title" content="Iu MP - Thấu Hiểu Em" />
        <meta property="og:description" content="Ứng dụng chăm sóc sức khỏe sinh sản, theo dõi kinh nguyệt, thai kỳ và kết nối tình cảm gia đình." />
        <meta property="og:image" content="https://embeiu.vercel.app/icon.png" />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://app.lunacare.com/" />
        <meta property="twitter:title" content="Iu MP - Thấu Hiểu Em" />
        <meta property="twitter:description" content="Ứng dụng chăm sóc sức khỏe và kết nối tình cảm dành cho bạn và người thương." />
        <meta property="twitter:image" content="https://embeiu.vercel.app/icon.png" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
