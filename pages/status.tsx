import React, { useState } from 'react'
import Head from 'next/head'
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import { auth } from '../lib/auth'
import Navbar from '../components/Navbar';

export default function Status() {
  const user = typeof window !== 'undefined' ? auth.getUser() : null;
  return (
    <>
      <Head>
        <title>Status - SementesPLAY</title>
        <meta name="description" content="Status do sistema SementesPLAY" />
      </Head>
      <div className="min-h-screen bg-sss-dark">
        <Navbar />
        {/* Conteúdo da página de status */}
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-sss-medium rounded-lg shadow-lg p-8 border border-sss-light text-center">
            <h1 className="text-3xl font-bold text-sss-accent mb-4">Status do Sistema</h1>
            <p className="text-sss-white text-lg mb-2">Tudo funcionando normalmente! 🚀</p>
            <span className="inline-block mt-2 px-4 py-1 rounded bg-green-600 text-white font-semibold">Online</span>
          </div>
        </div>
      </div>
    </>
  )
} 