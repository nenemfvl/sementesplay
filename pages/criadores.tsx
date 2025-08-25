import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigation } from '../hooks/useNavigation'
import { 
  ArrowLeftIcon,
  TrophyIcon,
  StarIcon,
  FireIcon,
  CalendarIcon,
  ChartBarIcon,
  UserIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { auth, User } from '../lib/auth'

import { PageLoader, CardLoader } from '../components/Loader'

interface RankingItem {
  id: string
  nome: string
  avatar: string
  nivel: string
  nivelRanking?: string
  sementes: number
  sementesRecebidas?: number
  pontosMissoes?: number
  pontosConquistas?: number
  pontosUsuario?: number
  pontuacaoTotal?: number
  doacoes: number
  criadoresApoiados: number
  missoesCompletadas?: number
  conquistasDesbloqueadas?: number
  posicao: number
  categoria: 'doador' | 'criador' | 'missao' | 'social'
  periodo: 'diario' | 'semanal' | 'mensal' | 'total'
  badge?: string
  icone: string
  cor: string
  redesSociais?: {
    youtube?: string
    twitch?: string
    instagram?: string
    tiktok?: string
    discord?: string
  }
}

export default function Criadores() {
  const router = useRouter()
  const { navigateTo, isNavigating } = useNavigation()
  const [user, setUser] = useState<User | null>(null)
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')


  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    setUser(currentUser)
    loadRanking()
  }, [])

  const loadRanking = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ranking/criadores', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      const data = await response.json()
      if (response.ok && data.success) {
        const rankingCriadores = data.criadores.map((criador: any) => ({
          id: criador.id,
          nome: criador.nome,
          avatar: criador.avatar,
          nivel: criador.nivel,
          nivelRanking: criador.nivelRanking,
          sementes: criador.sementes, // Sementes que o usuário tem no perfil
          sementesRecebidas: criador.sementesRecebidas,
          pontosMissoes: criador.pontosMissoes,
          pontosConquistas: criador.pontosConquistas,
          pontosUsuario: criador.pontosUsuario,
          pontuacaoTotal: criador.pontuacaoTotal,
          doacoes: criador.totalDoacoes,
          criadoresApoiados: 0,
          missoesCompletadas: criador.missoesCompletadas,
          conquistasDesbloqueadas: criador.conquistasDesbloqueadas,
          posicao: criador.posicao,
          categoria: 'criador' as const,
          periodo: 'total' as any,
          badge: criador.nivelRanking,
          icone: '🎭',
          cor: 'text-purple-500',
          redesSociais: criador.redesSociais || {}
        }))
        setRanking(rankingCriadores)
      } else {
        console.error('Erro na resposta da API:', data)
        // Manter dados anteriores se disponível
        if (ranking.length === 0) {
          setRanking([])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error)
      // Manter dados anteriores se disponível
      if (ranking.length === 0) {
        setRanking([])
      }
    } finally {
      setLoading(false)
    }
  }

  const filtrarRanking = () => {
    return ranking.filter(item => 
      item.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getPosicaoIcon = (posicao: number) => {
    switch (posicao) {
      case 1:
        return <TrophyIcon className="w-6 h-6 text-yellow-500" />
      case 2:
        return <TrophyIcon className="w-6 h-6 text-gray-400" />
      case 3:
        return <StarIcon className="w-6 h-6 text-orange-500" />
      default:
        return <span className="text-sss-white font-bold">{posicao}</span>
    }
  }

  const getPosicaoColor = (posicao: number) => {
    switch (posicao) {
      case 1:
        return 'border-yellow-500 bg-yellow-500/10'
      case 2:
        return 'border-gray-400 bg-gray-400/10'
      case 3:
        return 'border-orange-500 bg-orange-500/10'
      default:
        return 'border-sss-light bg-sss-medium hover:bg-sss-dark'
    }
  }

  const formatarNumero = (numero: number) => {
    if (numero >= 1000000) {
      return (numero / 1000000).toFixed(1) + 'M'
    } else if (numero >= 1000) {
      return (numero / 1000).toFixed(1) + 'K'
    }
    return numero.toString()
  }

  const rankingFiltrado = filtrarRanking()

  if (!user) {
    return null
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <>
      <Head>
        <title>Ranking de Criadores - SementesPLAY</title>
        <meta name="description" content="Veja os melhores criadores" />
      </Head>
      
      <div className="min-h-screen bg-sss-dark">
        {/* Header REMOVIDO */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrophyIcon className="w-10 h-10 text-purple-500" />
              </div>
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Ranking de Criadores
              </h2>
              <p className="text-gray-400">
                Descubra quem são os melhores criadores da comunidade
              </p>
            </div>

            {/* Busca */}
            <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar criador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:border-sss-accent"
                />
              </div>
            </div>

            {/* Ranking */}
            <div className="bg-sss-medium rounded-lg border border-sss-light">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-sss-white">
                      Ranking de Criadores
                    </h3>
                    <p className="text-gray-400">Baseado em pontuação composta (sementes + missões + conquistas)</p>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                      <CardLoader key={i} />
                    ))}
                  </div>
                ) : rankingFiltrado.length === 0 ? (
                  <div className="text-center py-12">
                    <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-sss-white mb-2">Nenhum criador encontrado</h3>
                    <p className="text-gray-400">Tente ajustar a busca</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rankingFiltrado.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`p-4 rounded-lg border ${getPosicaoColor(item.posicao)} cursor-pointer hover:bg-sss-dark transition-colors`}
                        onClick={() => {
                          router.push(`/criador/${item.id}`)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-sss-dark">
                              {getPosicaoIcon(item.posicao)}
                            </div>
                            <div className="flex items-center space-x-3">
                              {item.avatar && item.avatar.startsWith('http') ? (
                                <img src={item.avatar} alt={item.nome} className="w-12 h-12 rounded-full object-cover" />
                              ) : (
                                <span className="text-2xl">{item.avatar}</span>
                              )}
                                                             <div>
                                                                 <h4 className="text-sss-white font-semibold">{item.nome}</h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-400">
                                  <span>Nível {item.nivelRanking}</span>
                                </div>
                                {/* Redes Sociais */}
                                 {(item.redesSociais?.youtube || item.redesSociais?.twitch || item.redesSociais?.instagram || item.redesSociais?.tiktok || item.redesSociais?.discord) && (
                                   <div className="flex items-center space-x-2 mt-2">
                                     {item.redesSociais.youtube && (
                                       <a
                                         href={item.redesSociais.youtube}
                                         target="_blank"
                                         rel="noopener noreferrer"
                                         className="text-red-500 hover:text-red-400 transition-colors"
                                         title="YouTube"
                                       >
                                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                           <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                         </svg>
                                       </a>
                                     )}
                                     {item.redesSociais.twitch && (
                                       <a
                                         href={item.redesSociais.twitch}
                                         target="_blank"
                                         rel="noopener noreferrer"
                                         className="text-purple-500 hover:text-purple-400 transition-colors"
                                         title="Twitch"
                                       >
                                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                           <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                                         </svg>
                                       </a>
                                     )}
                                     {item.redesSociais.instagram && (
                                       <a
                                         href={item.redesSociais.instagram}
                                         target="_blank"
                                         rel="noopener noreferrer"
                                         className="text-pink-500 hover:text-pink-400 transition-colors"
                                         title="Instagram"
                                       >
                                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                           <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                         </svg>
                                       </a>
                                     )}
                                     {item.redesSociais.tiktok && (
                                       <a
                                         href={item.redesSociais.tiktok}
                                         target="_blank"
                                         rel="noopener noreferrer"
                                         className="text-black hover:text-gray-700 transition-colors"
                                         title="TikTok"
                                       >
                                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                           <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                         </svg>
                                       </a>
                                     )}
                                     {item.redesSociais.discord && (
                                       <a
                                         href={item.redesSociais.discord}
                                         target="_blank"
                                         rel="noopener noreferrer"
                                         className="text-blue-500 hover:text-blue-400 transition-colors"
                                         title="Discord"
                                       >
                                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                           <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                                         </svg>
                                       </a>
                                     )}
                                   </div>
                                 )}
                               </div>
                            </div>
                          </div>
                          
                                                     <div className="text-right">
                             <div className="flex items-center space-x-4">
                               <div className="text-center">
                                 <p className="text-sss-accent font-bold text-lg">{formatarNumero(item.pontuacaoTotal || 0)}</p>
                                 <p className="text-gray-400 text-sm">Pontos</p>
                               </div>
                               <div className="text-center">
                                 <p className="text-sss-white font-semibold">{formatarNumero(item.sementes || 0)}</p>
                                 <p className="text-gray-400 text-sm">Sementes Disponíveis</p>
                               </div>
                               <div className="text-center">
                                 <p className="text-sss-white font-semibold">{formatarNumero(item.doacoes)}</p>
                                 <p className="text-gray-400 text-sm">Doações</p>
                               </div>
                               {/* Botão de Doar */}
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation()
                                   window.location.href = `/doar?criador=${item.id}`
                                 }}
                                 className="px-4 py-2 bg-sss-accent hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center space-x-1"
                               >
                                 <HeartIcon className="w-4 h-4" />
                                 <span>Doar</span>
                               </button>
                             </div>
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


      </div>
    </>
  )
} 