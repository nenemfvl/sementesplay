import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import Navbar from '../components/Navbar'

export default function ParceirosFavoritos() {
  const [parceiros, setParceiros] = useState<any[]>([])
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Carregar favoritos do localStorage
    const favoritosSalvos = localStorage.getItem('parceirosFavoritos')
    if (favoritosSalvos) {
      setFavoritos(new Set(JSON.parse(favoritosSalvos)))
    }

    // Carregar todos os parceiros
    fetch('/api/parceiros/ranking')
      .then(res => res.json())
      .then(data => {
        setParceiros(data.parceiros || [])
        setLoading(false)
      })
      .catch(error => {
        console.error('Erro ao carregar parceiros:', error)
        setLoading(false)
      })
  }, [])

  // Filtrar apenas parceiros favoritados
  const parceirosFavoritos = parceiros.filter(parceiro => favoritos.has(parceiro.id))

  const toggleFavorito = (parceiroId: string) => {
    const novosFavoritos = new Set(favoritos)
    if (novosFavoritos.has(parceiroId)) {
      novosFavoritos.delete(parceiroId)
    } else {
      novosFavoritos.add(parceiroId)
    }
    setFavoritos(novosFavoritos)
    
    // Salvar no localStorage
    localStorage.setItem('parceirosFavoritos', JSON.stringify(Array.from(novosFavoritos)))
  }

  const formatarNumero = (numero: number) => {
    if (numero >= 1000000) {
      return (numero / 1000000).toFixed(1) + 'M'
    } else if (numero >= 1000) {
      return (numero / 1000).toFixed(1) + 'K'
    }
    return numero.toString()
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Parceiros Favoritos - SementesPLAY</title>
        </Head>
        <div className="min-h-screen bg-sss-dark flex flex-col">
          <header className="bg-black shadow-lg border-b border-sss-light sticky top-0 z-50 relative">
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-6 focus:outline-none bg-transparent border-none cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Ir para o topo"
              title="Ir para o topo"
            >
              <span className="text-2xl text-sss-accent">🌱</span>
              <span className="text-xl font-bold text-sss-accent">SementesPLAY</span>
            </button>
            <Navbar />
          </header>
          <main className="flex-1 flex items-center justify-center">
            <div className="text-gray-400">Carregando parceiros favoritos...</div>
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Parceiros Favoritos - SementesPLAY</title>
      </Head>
      <div className="min-h-screen bg-sss-dark flex flex-col">
        {/* Header */}
        <header className="bg-black shadow-lg border-b border-sss-light sticky top-0 z-50 relative">
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-6 focus:outline-none bg-transparent border-none cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Ir para o topo"
            title="Ir para o topo"
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
              <span className="text-3xl">🏢</span>
              <h1 className="text-3xl font-bold text-sss-white">Parceiros Favoritos</h1>
            </div>
            
            {parceirosFavoritos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💔</div>
                <h2 className="text-xl font-semibold text-gray-400 mb-2">Nenhum parceiro favoritado</h2>
                <p className="text-gray-500 mb-6">Você ainda não favoritou nenhum parceiro.</p>
                <button
                  onClick={() => router.push('/parceiros')}
                  className="bg-sss-accent hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Ver Todos os Parceiros
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-400 mb-6">
                  Você tem {parceirosFavoritos.length} parceiro{parceirosFavoritos.length !== 1 ? 's' : ''} favoritado{parceirosFavoritos.length !== 1 ? 's' : ''}
                </p>

                {/* Grid de parceiros favoritos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {parceirosFavoritos.map((parceiro) => (
                    <div key={parceiro.id} className="bg-sss-medium rounded-xl p-4 shadow-md">
                      <div className="flex">
                        {/* Conteúdo Principal */}
                        <div className="flex items-center flex-1">
                          <div className="w-12 h-12 rounded-full border-2 border-blue-400 mr-3 bg-sss-dark flex items-center justify-center text-xl">
                            🏢
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-sss-white">{parceiro.nome}</div>
                            <div className="text-sm text-gray-400">{parceiro.nomeCidade}</div>
                            <div className="text-xs text-gray-500">Vendas: {formatarNumero(parceiro.totalVendas)}</div>
                          </div>
                        </div>
                        
                        {/* Botão Favoritar - Borda Direita */}
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => toggleFavorito(parceiro.id)}
                            className="text-lg hover:scale-110 transition-transform"
                            aria-label="Remover dos favoritos"
                            title="Remover dos favoritos"
                          >
                            <FaHeart className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botão para ver todos os parceiros */}
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => router.push('/parceiros')}
                    className="bg-sss-accent hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Ver Todos os Parceiros
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