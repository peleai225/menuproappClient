import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Providers } from '@/components/providers'
import { BottomNav } from '@/components/bottom-nav'
import { CartSwitchDialog } from '@/components/cart-switch-dialog'
import { RegisterSW } from '@/components/register-sw'
import { OfflineBanner } from '@/components/offline-banner'
import { InstallPrompt } from '@/components/install-prompt'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MenuPro Delivery — Commandez vos repas en Côte d\u2019Ivoire',
  description:
    'Commandez vos plats préférés dans les meilleurs maquis et restaurants de Côte d\u2019Ivoire et suivez votre livraison en temps réel.',
  generator: 'v0.app',
  applicationName: 'MenuPro Delivery',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'MenuPro' },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${inter.variable} bg-muted`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <OfflineBanner />
          <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-muted pb-20 shadow-xl shadow-black/5">
            {children}
          </div>
          <BottomNav />
          <CartSwitchDialog />
          <InstallPrompt />
        </Providers>
        <RegisterSW />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
