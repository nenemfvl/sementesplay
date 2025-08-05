import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  PlayIcon,
  EyeIcon,
  HeartIcon,
  UserCircleIcon,
  VideoCameraIcon,
  GlobeAltIcon,
  ClockIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { auth } from '../lib/auth'
import Navbar from '../components/Navbar'

interface PlataformaLive {
  plataforma: string
  titulo: string
  espectadores: number
  url: string
}

interface CriadorLive {
  id: string
  usuarioId: string
  nome: string
  email: string
  bio: string
  avatar: string
  categoria: string
  nivel: string
  seguidores: number
  doacoesRecebidas: number
  totalSementes: number
  redesSociais: {
    youtube: string
    twitch: string
    instagram: string
    tiktok: string
    twitter: string
  }
  plataformasLive: PlataformaLive[]
  totalEspectadores: number
}

export default function Salao() {
  const [user, setUser] = useState<any>(null)
  const [criadoresLive, setCriadoresLive] = useState<CriadorLive[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroPlataforma, setFiltroPlataforma] = useState('todas')
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())

  useEffect(() => {
    const currentUser = auth.getUser()
    if (currentUser) {
      setUser(currentUser)
    }
    carregarCriadoresLive()
    carregarFavoritos()
  }, [])

           const carregarCriadoresLive = async () => {
           setLoading(true)
           try {
             // Usar a versão com dados reais (sem chaves de API)
             const response = await fetch('/api/salao/criadores-online-simple')
             const data = await response.json()
             if (data.success) {
               setCriadoresLive(data.criadores)
             }
           } catch (error) {
             console.error('Erro ao carregar criadores ao vivo:', error)
           } finally {
             setLoading(false)
           }
         }

  const carregarFavoritos = () => {
    const favoritosSalvos = localStorage.getItem('criadoresFavoritos')
    if (favoritosSalvos) {
      try {
        const favoritosArray = JSON.parse(favoritosSalvos)
        setFavoritos(new Set(favoritosArray))
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error)
      }
    }
  }

  const toggleFavorito = (criadorId: string) => {
    const novosFavoritos = new Set(favoritos)
    if (novosFavoritos.has(criadorId)) {
      novosFavoritos.delete(criadorId)
    } else {
      novosFavoritos.add(criadorId)
    }
    setFavoritos(novosFavoritos)
    localStorage.setItem('criadoresFavoritos', JSON.stringify(Array.from(novosFavoritos)))
  }

  const getPlataformaIcon = (plataforma: string) => {
    switch (plataforma.toLowerCase()) {
      case 'youtube':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.692 3.5 12 3.5 12 3.5s-7.692 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.88 0 12 0 12s0 4.12.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.308 20.5 12 20.5 12 20.5s7.692 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 16.12 24 12 24 12s0-4.12-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
          </svg>
        )
      case 'twitch':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
          </svg>
        )
      case 'instagram':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.98.98-1.274 2.092-1.334 3.374C2.013 5.741 2 6.151 2 12c0 5.849.013 6.259.072 7.54.06 1.282.354 2.394 1.334 3.374.98.98 2.092 1.274 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.06 2.394-.354 3.374-1.334.98-.98 1.274-2.092 1.334-3.374.059-1.281.072-1.691.072-7.54 0-5.849-.013-6.259-.072-7.54-.06-1.282-.354-2.394-1.334-3.374-.98-.98-2.092-1.274-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
          </svg>
        )
      case 'tiktok':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.75 2v14.25a2.25 2.25 0 1 1-2.25-2.25h.75V12h-.75a4.5 4.5 0 1 0 4.5 4.5V7.5a5.25 5.25 0 0 0 5.25 5.25V9.75A3.75 3.75 0 0 1 16.5 6V2h-3.75z"/>
          </svg>
        )
      default:
        return <GlobeAltIcon className="w-5 h-5" />
    }
  }

  const getPlataformaColor = (plataforma: string) => {
    switch (plataforma.toLowerCase()) {
      case 'youtube':
        return 'text-red-500'
      case 'twitch':
        return 'text-purple-500'
      case 'instagram':
        return 'text-pink-500'
      case 'tiktok':
        return 'text-black dark:text-white'
      default:
        return 'text-gray-500'
    }
  }

  const criadoresFiltrados = filtroPlataforma === 'todas' 
    ? criadoresLive 
    : criadoresLive.filter(criador => 
        criador.plataformasLive.some(p => p.plataforma.toLowerCase() === filtroPlataforma)
      )

  return (
    <>
      <Head>
        <title>Salão - SementesPLAY</title>
        <meta name="description" content="Salão da comunidade SementesPLAY - Criadores ao vivo" />
      </Head>
      <div className="min-h-screen bg-sss-dark">
        <header className="bg-black shadow-lg border-b border-sss-light sticky top-0 z-50 relative">
          <Navbar />
        </header>

        {/* Header do Salão */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-sss-white mb-4 flex items-center justify-center gap-3">
                <VideoCameraIcon className="w-10 h-10 text-red-500" />
                Salão da Comunidade
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Descubra criadores ao vivo em suas plataformas favoritas
              </p>
              
              {/* Filtros */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <button
                  onClick={() => setFiltroPlataforma('todas')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filtroPlataforma === 'todas' 
                      ? 'bg-sss-accent text-white' 
                      : 'bg-sss-medium text-gray-300 hover:text-white'
                  }`}
                >
                  Todas as Plataformas
                </button>
                <button
                  onClick={() => setFiltroPlataforma('youtube')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    filtroPlataforma === 'youtube' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-sss-medium text-gray-300 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.692 3.5 12 3.5 12 3.5s-7.692 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.88 0 12 0 12s0 4.12.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.308 20.5 12 20.5 12 20.5s7.692 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 16.12 24 12 24 12s0-4.12-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
                  </svg>
                  YouTube
                </button>
                <button
                  onClick={() => setFiltroPlataforma('twitch')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    filtroPlataforma === 'twitch' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-sss-medium text-gray-300 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                  </svg>
                  Twitch
                </button>
                <button
                  onClick={() => setFiltroPlataforma('instagram')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    filtroPlataforma === 'instagram' 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-sss-medium text-gray-300 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.98.98-1.274 2.092-1.334 3.374C2.013 5.741 2 6.151 2 12c0 5.849.013 6.259.072 7.54.06 1.282.354 2.394 1.334 3.374.98.98 2.092 1.274 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.06 2.394-.354 3.374-1.334.98-.98 1.274-2.092 1.334-3.374.059-1.281.072-1.691.072-7.54 0-5.849-.013-6.259-.072-7.54-.06-1.282-.354-2.394-1.334-3.374-.98-.98-2.092-1.274-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
                  </svg>
                  Instagram
                </button>
                <button
                  onClick={() => setFiltroPlataforma('tiktok')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    filtroPlataforma === 'tiktok' 
                      ? 'bg-black text-white' 
                      : 'bg-sss-medium text-gray-300 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.75 2v14.25a2.25 2.25 0 1 1-2.25-2.25h.75V12h-.75a4.5 4.5 0 1 0 4.5 4.5V7.5a5.25 5.25 0 0 0 5.25 5.25V9.75A3.75 3.75 0 0 1 16.5 6V2h-3.75z"/>
                  </svg>
                  TikTok
                </button>
              </div>

              {/* Estatísticas */}
              <div className="flex justify-center gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-sss-accent">{criadoresFiltrados.length}</div>
                  <div className="text-gray-400 text-sm">Criadores ao Vivo</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {criadoresFiltrados.reduce((sum, c) => sum + c.totalEspectadores, 0).toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">Total de Espectadores</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {criadoresFiltrados.reduce((sum, c) => sum + c.plataformasLive.length, 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Lives Ativas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sss-accent"></div>
              <span className="ml-3 text-sss-white">Carregando criadores ao vivo...</span>
            </div>
          ) : criadoresFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <VideoCameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-sss-white mb-2">
                Nenhum criador ao vivo no momento
              </h3>
              <p className="text-gray-400 mb-6">
                {filtroPlataforma === 'todas' 
                  ? 'Volte mais tarde para ver criadores fazendo live!' 
                  : `Nenhum criador ao vivo no ${filtroPlataforma} no momento.`
                }
              </p>
              <button
                onClick={carregarCriadoresLive}
                className="bg-sss-accent hover:bg-sss-accent/80 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Atualizar
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {criadoresFiltrados.map((criador, index) => (
                <motion.div
                  key={criador.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-sss-medium rounded-lg border border-sss-light hover:border-sss-accent transition-all duration-300 hover:shadow-lg overflow-hidden"
                >
                  {/* Header do Card */}
                  <div className="relative">
                    <div className="bg-gradient-to-r from-red-600 to-purple-600 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={criador.avatar}
                              alt={criador.nome}
                              className="w-12 h-12 rounded-full border-2 border-white"
                              onError={(e) => {
                                e.currentTarget.src = '/avatars/default.jpg'
                              }}
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{criador.nome}</h3>
                            <p className="text-sm text-gray-200">{criador.nivel}</p>
                          </div>
                        </div>
                                                 <button
                           onClick={() => toggleFavorito(criador.id)}
                           className={`p-2 rounded-lg transition-colors ${
                             favoritos.has(criador.id)
                               ? 'bg-red-500 text-white'
                               : 'bg-white/20 text-white hover:bg-white/30'
                           }`}
                           title={favoritos.has(criador.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                         >
                           <HeartIcon className="w-5 h-5" />
                         </button>
                      </div>
                    </div>
                  </div>

                  {/* Plataformas ao Vivo */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {criador.plataformasLive.map((plataforma, idx) => (
                        <div key={idx} className="bg-sss-dark rounded-lg p-3 border border-sss-light">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`${getPlataformaColor(plataforma.plataforma)}`}>
                                {getPlataformaIcon(plataforma.plataforma)}
                              </div>
                              <span className="font-medium text-sss-white">{plataforma.plataforma}</span>
                              <div className="flex items-center gap-1 text-red-500">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-xs">AO VIVO</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                              <EyeIcon className="w-4 h-4" />
                              <span>{plataforma.espectadores.toLocaleString()}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 mb-3 line-clamp-2">{plataforma.titulo}</p>
                          <a
                            href={plataforma.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-sss-accent hover:bg-sss-accent/80 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                          >
                            <PlayIcon className="w-4 h-4" />
                            Assistir
                          </a>
                        </div>
                      ))}
                    </div>

                    {/* Estatísticas do Criador */}
                    <div className="mt-4 pt-4 border-t border-sss-light">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-sss-white">{criador.seguidores.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">Seguidores</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-500">R$ {criador.doacoesRecebidas.toFixed(2)}</div>
                          <div className="text-xs text-gray-400">Doações</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-yellow-500">{criador.totalSementes.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">Sementes</div>
                        </div>
                      </div>
                    </div>

                    {/* Botão Ver Perfil */}
                    <div className="mt-4">
                      <Link
                        href={`/criador/${criador.id}`}
                        className="w-full bg-sss-dark hover:bg-sss-light text-sss-white text-center py-2 rounded-lg transition-colors block"
                      >
                        Ver Perfil Completo
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-black border-t border-sss-light mt-16">
          <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold text-sss-white">SementesPLAY</span>
            </div>
            <div className="flex gap-4 mb-4">
              <a href="https://discord.gg/7vtVZYvR" title="Discord" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.07.07 0 0 0-.073.035c-.211.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.164-.393-.405-.874-.617-1.249a.07.07 0 0 0-.073-.035A19.736 19.736 0 0 0 3.677 4.369a.064.064 0 0 0-.03.027C.533 9.09-.32 13.579.099 18.021a.08.08 0 0 0 .031.056c2.052 1.507 4.042 2.422 5.992 3.029a.077.077 0 0 0 .084-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.104c-.652-.247-1.27-.549-1.872-.892a.077.077 0 0 1-.008-.127c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.198.372.292a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.891.076.076 0 0 0-.04.105c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028c1.961-.607 3.951-1.522 6.003-3.029a.077.077 0 0 0 .031-.055c.5-5.177-.838-9.637-3.548-13.625a.061.061 0 0 0-.03-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z"/></svg>
              </a>
              <a href="#" title="Instagram" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.98.98-1.274 2.092-1.334 3.374C2.013 5.741 2 6.151 2 12c0 5.849.013 6.259.072 7.54.06 1.282.354 2.394 1.334 3.374.98.98 2.092 1.274 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.06 2.394-.354 3.374-1.334.98-.98 1.274-2.092 1.334-3.374.059-1.281.072-1.691.072-7.54 0-5.849-.013-6.259-.072-7.54-.06-1.282-.354-2.394-1.334-3.374-.98-.98-2.092-1.274-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
              </a>
              <a href="#" title="TikTok" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12.75 2v14.25a2.25 2.25 0 1 1-2.25-2.25h.75V12h-.75a4.5 4.5 0 1 0 4.5 4.5V7.5a5.25 5.25 0 0 0 5.25 5.25V9.75A3.75 3.75 0 0 1 16.5 6V2h-3.75z"/></svg>
              </a>
              <a href="https://www.youtube.com/@SementesPLAY" title="YouTube" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.692 3.5 12 3.5 12 3.5s-7.692 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.88 0 12 0 12s0 4.12.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.308 20.5 12 20.5 12 20.5s7.692 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 16.12 24 12 24 12s0-4.12-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
              </a>
              <a href="#" title="Twitter" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.116 2.813 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mb-4 text-gray-400 text-sm">
              <Link href="/termos" className="hover:text-sss-accent">Termos de Uso</Link>
              <span>|</span>
              <Link href="/termos" className="hover:text-sss-accent">Política de Privacidade</Link>
              <span>|</span>
              <Link href="/ajuda" className="hover:text-sss-accent">Ajuda</Link>
              <span>|</span>
              <Link href="/ranking" className="hover:text-sss-accent">Ranking de Criadores</Link>
            </div>
            <div className="text-gray-500 text-xs text-center">
              &copy; {new Date().getFullYear()} SementesPLAY. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 