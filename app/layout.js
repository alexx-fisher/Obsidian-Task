import './globals.css'

export const metadata = {
  title: 'Obsidian Task',
  description: 'Менеджер задач и проектов',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Obsidian Task',
  },
}

export const viewport = {
  themeColor: '#060e20',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png"/>
        <link rel="apple-touch-icon" href="/icon-180.png"/>
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png"/>
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="apple-mobile-web-app-title" content="Obsidian Task"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <link rel="manifest" href="/manifest.json"/>
      </head>
      <body>{children}</body>
    </html>
  )
}
