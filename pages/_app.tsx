import React from 'react'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import Head from 'next/head'
import PWABanner from '../components/PWABanner'
import OfflineIndicator from '../components/OfflineIndicator'
import '../styles/globals.css'

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <meta name="application-name" content="SementesPLAY" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SementesPLAY" />
        <meta name="description" content="Plataforma completa para apoiar criadores de conteúdo" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#dc2626" />

        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#dc2626" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://sementesplay.com" />
        <meta name="twitter:title" content="SementesPLAY" />
        <meta name="twitter:description" content="Plataforma completa para apoiar criadores de conteúdo" />
        <meta name="twitter:image" content="/icons/icon-192x192.png" />
        <meta name="twitter:creator" content="@sementesplay" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="SementesPLAY" />
        <meta property="og:description" content="Plataforma completa para apoiar criadores de conteúdo" />
        <meta property="og:site_name" content="SementesPLAY" />
        <meta property="og:url" content="https://sementesplay.com" />
        <meta property="og:image" content="/icons/icon-192x192.png" />
      </Head>
      
      {/* <PWABanner /> */}
      <OfflineIndicator />
      <Component {...pageProps} />
    </SessionProvider>
  )
} 