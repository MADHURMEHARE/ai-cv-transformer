import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI CV Transformer',
  description: 'Transform raw CVs into polished, professional documents using AI',
  keywords: ['CV', 'Resume', 'AI', 'Document Processing', 'Professional'],
  authors: [{ name: 'AI CV Transformer Team' }],
  creator: 'AI CV Transformer',
  publisher: 'AI CV Transformer',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cv-transformer.com'),
  openGraph: {
    title: 'AI CV Transformer',
    description: 'Transform raw CVs into polished, professional documents using AI',
    url: 'https://cv-transformer.com',
    siteName: 'AI CV Transformer',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI CV Transformer',
    description: 'Transform raw CVs into polished, professional documents using AI',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}