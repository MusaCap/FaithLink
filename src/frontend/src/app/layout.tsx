import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'FaithLink360',
    template: '%s | FaithLink360'
  },
  description: 'Church member engagement platform for tracking spiritual journeys, managing groups, and fostering community connections.',
  keywords: ['church management', 'member engagement', 'spiritual journey', 'community', 'faith'],
  authors: [{ name: 'FaithLink360 Team' }],
  creator: 'FaithLink360',
  publisher: 'FaithLink360',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'FaithLink360 - Church Member Engagement Platform',
    description: 'Help churches track, engage, and care for members across their spiritual journeys.',
    url: '/',
    siteName: 'FaithLink360',
    locale: 'en_US',
    type: 'website',
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
  verification: {
    // google: 'verification-token', // Add when available
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <div className="min-h-full">
          {/* Main app content */}
          <main className="flex-1">
            {children}
          </main>
          
          {/* Toast notifications container */}
          <div id="toast-root" />
        </div>
        
        {/* Scripts for analytics, etc. can be added here */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics or other tracking scripts */}
          </>
        )}
      </body>
    </html>
  )
}
