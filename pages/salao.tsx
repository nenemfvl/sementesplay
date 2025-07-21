import React, { useState } from 'react'
import Head from 'next/head'
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import { auth } from '../lib/auth'
import Navbar from '../components/Navbar';

export default function Salao() {
  const user = typeof window !== 'undefined' ? auth.getUser() : null;
  return (
    <>
      <Head>
        <title>Salão - SementesPLAY</title>
        <meta name="description" content="Salão da comunidade SementesPLAY" />
      </Head>
      <div className="min-h-screen bg-sss-dark">
        <Navbar />
        {/* Conteúdo da página do Salão */}
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-sss-medium rounded-lg shadow-lg p-8 border border-sss-light text-center">
            <h1 className="text-3xl font-bold text-sss-accent mb-4">Salão da Comunidade</h1>
            <p className="text-sss-white text-lg mb-2">Bem-vindo ao Salão! Em breve, novidades e interações para toda a comunidade. 🎉</p>
          </div>
        </div>
      </div>
    </>
  )
} 