import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FaTwitch, FaYoutube, FaTiktok, FaInstagram, FaHeart, FaRegHeart } from 'react-icons/fa'
import Navbar from '../components/Navbar'

export default function CriadoresFavoritos() {
  const [criadores, setCriadores] = useState<any[]>([])
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Carregar favoritos do localStorage
    const favoritosSalvos = localStorage.getItem('criadoresFavoritos')
    if (favoritosSalvos) {
      setFavoritos(new Set(JSON.parse(favoritosSalvos)))
    }

    // Carregar todos os criadores
    fetch('/api/ranking/criadores')
      .then(res => res.json())
      .then(data => {
        setCriadores(data.criadores || [])
        setLoading(false)
      })
      .catch(error => {
        console.error('Erro ao carregar criadores:', error)
        setLoading(false)
      })
  }, [])

  // Filtrar apenas criadores favoritados
  const criadoresFavoritos = criadores.filter(criador => favoritos.has(criador.id))

  const toggleFavorito = (criadorId: string) => {
    const novosFavoritos = new Set(favoritos)
    if (novosFavoritos.has(criadorId)) {
      novosFavoritos.delete(criadorId)
    } else {
      novosFavoritos.add(criadorId)
    }
    setFavoritos(novosFavoritos)
    
    // Salvar no localStorage
    localStorage.setItem('criadoresFavoritos', JSON.stringify(Array.from(novosFavoritos)))
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Criadores Favoritos - SementesPLAY</title>
        </Head>
        <div className="min-h-screen bg-sss-dark flex flex-col">
          <header className="bg-black shadow-lg border-b border-sss-light sticky top-0 z-50 relative">
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-6 focus:outline-none"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Ir para o topo"
            >
              <span className="text-2xl text-sss-accent">🌱</span>
              <span className="text-xl font-bold text-sss-accent">SementesPLAY</span>
            </button>
            <Navbar />
          </header>
          <main className="flex-1 flex items-center justify-center">
            <div className="text-gray-400">Carregando criadores favoritos...</div>
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Criadores Favoritos - SementesPLAY</title>
      </Head>
      <div className="min-h-screen bg-sss-dark flex flex-col">
        {/* Header */}
        <header className="bg-black shadow-lg border-b border-sss-light sticky top-0 z-50 relative">
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-6 focus:outline-none"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Ir para o topo"
          >
            <span className="text-2xl text-sss-accent">🌱</span>
            <span className="text-xl font-bold text-sss-accent">SementesPLAY</span>
          </button>
          <Navbar />
        </header>

        <main className="flex-1 flex flex-col items-center py-12 px-2 md:px-0">
          {/* Título da página */}
          <section className="w-full max-w-5xl mx-auto mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">⭐</span>
              <h1 className="text-3xl font-bold text-sss-white">Criadores Favoritos</h1>
            </div>
            
            {criadoresFavoritos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💔</div>
                <h2 className="text-xl font-semibold text-gray-400 mb-2">Nenhum criador favoritado</h2>
                <p className="text-gray-500 mb-6">Você ainda não favoritou nenhum criador.</p>
                <button
                  onClick={() => router.push('/status')}
                  className="bg-sss-accent hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Ver Todos os Criadores
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-400 mb-6">
                  Você tem {criadoresFavoritos.length} criador{criadoresFavoritos.length !== 1 ? 'es' : ''} favoritado{criadoresFavoritos.length !== 1 ? 's' : ''}
                </p>

                {/* Grid de criadores favoritos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {criadoresFavoritos.map((criador) => (
                    <div key={criador.id} className="bg-sss-medium rounded-xl p-4 shadow-md">
                      <div className="flex">
                        {/* Conteúdo Principal */}
                        <div className="flex items-center flex-1">
                          <img 
                            src={criador.avatar || '/default-avatar.png'} 
                            alt={criador.nome} 
                            className="w-12 h-12 rounded-full border-2 border-blue-400 mr-3" 
                          />
                          <div className="flex-1">
                            <div className="font-bold text-sss-white">{criador.nome}</div>
                                                         <div className="text-sm text-gray-400">{criador.sementesRecebidas || 0} sementes</div>
                          </div>
                        </div>
                        
                        {/* Botão Favoritar e Redes Sociais - Borda Direita */}
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => toggleFavorito(criador.id)}
                            className="text-lg hover:scale-110 transition-transform"
                          >
                            <FaHeart className="text-red-500" />
                          </button>
                          
                          {/* Redes Sociais */}
                          {criador.redesSociais && (criador.redesSociais.twitch || criador.redesSociais.youtube || criador.redesSociais.tiktok || criador.redesSociais.instagram) && (
                            <div className="flex flex-row gap-2 mt-4">
                              {criador.redesSociais.twitch && (
                                <a 
                                  href={criador.redesSociais.twitch} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#9147ff] text-lg hover:scale-110 transition-transform"
                                >
                                  <FaTwitch />
                                </a>
                              )}
                              {criador.redesSociais.youtube && (
                                <a 
                                  href={criador.redesSociais.youtube} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#ff0000] text-lg hover:scale-110 transition-transform"
                                >
                                  <FaYoutube />
                                </a>
                              )}
                              {criador.redesSociais.tiktok && (
                                <a 
                                  href={criador.redesSociais.tiktok} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#000] text-lg hover:scale-110 transition-transform"
                                >
                                  <FaTiktok />
                                </a>
                              )}
                              {criador.redesSociais.instagram && (
                                <a 
                                  href={criador.redesSociais.instagram} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#e1306c] text-lg hover:scale-110 transition-transform"
                                >
                                  <FaInstagram />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botão para ver todos os criadores */}
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => router.push('/status')}
                    className="bg-sss-accent hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Ver Todos os Criadores
                  </button>
                </div>
              </>
            )}
          </section>
        </main>

        {/* Footer minimalista centralizado */}
        <footer className="bg-black border-t border-sss-light mt-16">
          <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col items-center">
            {/* Logo e nome */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold text-sss-white">SementesPLAY</span>
            </div>
            {/* Copyright */}
            <div className="text-gray-500 text-xs text-center">
              &copy; {new Date().getFullYear()} SementesPLAY. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 