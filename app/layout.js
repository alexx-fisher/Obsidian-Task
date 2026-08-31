import './globals.css'

export const metadata = {
  title: 'Tudu',
  description: 'Менеджер задач и проектов',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tudu',
  },
}

export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
        <link rel="icon" href="/favicon.ico" sizes="any"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png"/>
        <link rel="apple-touch-icon" href="/icon-180.png"/>
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png"/>
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        <meta name="apple-mobile-web-app-title" content="Tudu"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <link rel="manifest" href="/manifest.json"/>
      </head>
      <body>{children}</body>
    </html>
  )
}
