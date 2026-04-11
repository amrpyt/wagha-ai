import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wagha-ai | تصميم معماري بالذكاء الاصطناعي',
  description: 'حول تصاميمك المعمارية إلى عروض ثلاثية الأبعاد احترافية',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html dir="rtl" lang="ar" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
