import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "RESTerX - The Complete Platform to Test APIs",
  description: "Professional API testing and development tool. Build, test, and debug APIs with the most powerful developer experience. Features include code generation, collections, authentication, and more.",
  keywords: ["API testing", "REST client", "API development", "Postman alternative", "HTTP client", "API playground", "developer tools", "REST API", "GraphQL", "WebSocket"],
  authors: [{ name: "RESTerX Team" }],
  creator: "RESTerX",
  publisher: "RESTerX",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://resterx.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "RESTerX - The Complete Platform to Test APIs",
    description: "Professional API testing and development tool. Build, test, and debug APIs with the most powerful developer experience.",
    url: 'https://resterx.vercel.app',
    siteName: 'RESTerX',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RESTerX - API Testing Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "RESTerX - The Complete Platform to Test APIs",
    description: "Professional API testing and development tool. Build, test, and debug APIs with the most powerful developer experience.",
    images: ['/og-image.png'],
    creator: '@resterx',
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
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  generator: 'Next.js',
  applicationName: 'RESTerX',
  referrer: 'origin-when-cross-origin',
  category: 'technology',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
