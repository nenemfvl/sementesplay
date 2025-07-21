import React from 'react'
import Head from 'next/head'
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import { auth } from '../lib/auth'

export default function Parceiros() {
  const user = typeof window !== 'undefined' ? auth.getUser() : null;
  return (
    <>
      <Head>
        <title>Parceiros - SementesPLAY</title>
        <meta name="description" content="Página de parceiros do SementesPLAY" />
      </Head>
      <div className="min-h-screen bg-sss-dark">
        {/* Navbar igual à home */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-gradient">
                    🌱 SementesPLAY
                  </h1>
                </div>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/" className="text-sss-white hover:text-sss-accent">Início</a>
                <a href="/status" className="text-sss-white hover:text-sss-accent">Status</a>
                <a href="/salao" className="text-sss-white hover:text-sss-accent">Salão</a>
                <a href="/criadores" className="text-sss-white hover:text-sss-accent">Criadores</a>
                <a href="/parceiros" className="text-sss-white hover:text-sss-accent">Parceiros</a>
                <a href="/dashboard" className="text-sss-white hover:text-sss-accent">Dashboard</a>
              </nav>
              <div className="flex space-x-4 items-center">
                {user ? (
                  <>
                    <span className="text-sss-white font-medium">{user.nome}</span>
                    <button onClick={() => { auth.logout(); window.location.reload(); }} title="Sair" className="p-2 text-gray-300 hover:text-red-400">
                      <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                    </button>
                  </>
                ) : (
                  <>
                    <a href="/login" className="btn-outline">Entrar</a>
                    <a href="/registro" className="btn-primary">Cadastrar</a>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
        {/* Conteúdo centralizado zerado */}
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-sss-medium rounded-lg shadow-lg p-8 border border-sss-light text-center max-w-2xl w-full">
            <h1 className="text-3xl font-bold text-sss-accent mb-4">Parceiros</h1>
            <p className="text-sss-white text-lg mb-2">Página pronta para receber conteúdo.</p>
          </div>
        </div>
      </div>
    </>
  )
} 