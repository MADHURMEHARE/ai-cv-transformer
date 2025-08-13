import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI CV Transformer - Professional CV Formatting',
  description: 'Transform raw CVs into polished, professional documents using AI and modern web technologies. Handle PDF, DOCX, and Excel formats with intelligent parsing and EHS formatting standards.',
  keywords: 'CV, resume, AI, formatting, professional, PDF, DOCX, Excel, transformation',
  authors: [{ name: 'AI CV Transformer Team' }],
  viewport: 'width=device-width, initial-scale=1',
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