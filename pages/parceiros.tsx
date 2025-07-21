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
        {/* Navbar igual à da home */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light sticky top-0 z-50 relative">
          {/* Logo e nome colados à esquerda como botão para o topo */}
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-6 focus:outline-none"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Ir para o topo"
          >
            <span className="text-2xl text-sss-accent">🌱</span>
            <span className="text-xl font-bold text-sss-accent">SementesPLAY</span>
          </button>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-6">
              <nav className="flex-1 flex justify-center hidden md:flex space-x-8">
                <a href="/" className="text-sss-white hover:text-sss-accent">Início</a>
                <a href="/status" className="text-sss-white hover:text-sss-accent">Status</a>
                <a href="/salao" className="text-sss-white hover:text-sss-accent">Salão</a>
                <a href="/criadores" className="text-sss-white hover:text-sss-accent">Criadores</a>
                <a href="/parceiros" className="text-sss-white hover:text-sss-accent">Parceiros</a>
                <a href="/dashboard" className="text-sss-white hover:text-sss-accent">Dashboard</a>
              </nav>
            </div>
          </div>
          {/* Usuário e logout colados na borda direita */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-4 px-6">
            {user ? (
              <>
                <span className="text-sss-accent font-bold">{user.nome}</span>
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