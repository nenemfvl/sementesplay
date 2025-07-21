import React from 'react'
import Head from 'next/head'
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import { auth } from '../lib/auth'

export default function Criadores() {
  const user = typeof window !== 'undefined' ? auth.getUser() : null;
  return (
    <>
      <Head>
        <title>Criadores - SementesPLAY</title>
        <meta name="description" content="Página de criadores do SementesPLAY" />
      </Head>
      <div className="min-h-screen bg-sss-dark">
        {/* Navbar removida */}
        {/* Conteúdo centralizado zerado */}
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-sss-medium rounded-lg shadow-lg p-8 border border-sss-light text-center max-w-2xl w-full">
            <h1 className="text-3xl font-bold text-sss-accent mb-4">Criadores</h1>
            <p className="text-sss-white text-lg mb-2">Página pronta para receber conteúdo.</p>
          </div>
        </div>
      </div>
    </>
  )
} 