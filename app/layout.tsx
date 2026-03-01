import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  title: {
    default: 'RiegoGenius - Monitoreo Inteligente de Cultivos',
    template: '%s | RiegoGenius',
  },
  description:
    'Plataforma open-source para optimizar tu cultivo domestico con IoT e Inteligencia Artificial. Sin configuracion, sin API keys, 100% gratuita.',
  keywords: ['agricultura', 'IoT', 'machine learning', 'cultivo', 'riego inteligente', 'open source', 'sensores'],
}

export const viewport: Viewport = {
  themeColor: '#2d6a4f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
