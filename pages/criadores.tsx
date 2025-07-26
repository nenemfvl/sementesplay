import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
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
import Navbar from '../components/Navbar'

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
}

export default function Criadores() {
  const [user, setUser] = useState<User | null>(null)
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<RankingItem | null>(null)
  const [showModal, setShowModal] = useState(false)

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
      const response = await fetch('/api/ranking/criadores')
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
          cor: 'text-purple-500'
        }))
        setRanking(rankingCriadores)
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error)
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

  return (
    <>
      <Head>
        <title>Ranking de Criadores - SementesPLAY</title>
        <meta name="description" content="Veja os melhores criadores" />
      </Head>
      <Navbar />
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
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sss-accent mx-auto"></div>
                    <p className="text-gray-400 mt-2">Carregando ranking...</p>
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
                          setSelectedItem(item)
                          setShowModal(true)
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
                                  <span>Nível {item.nivel}</span>
                                  {item.badge && (
                                    <span className={`px-2 py-1 rounded-full text-xs ${item.cor}`}>
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
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
                                 <p className="text-gray-400 text-sm">Sementes</p>
                               </div>
                              <div className="text-center">
                                <p className="text-sss-white font-semibold">{formatarNumero(item.doacoes)}</p>
                                <p className="text-gray-400 text-sm">Doações</p>
                              </div>
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

        {/* Modal de Detalhes */}
        <AnimatePresence>
          {showModal && selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-sss-medium rounded-lg p-6 w-full max-w-md mx-4"
              >
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-sss-dark mx-auto mb-4">
                    {getPosicaoIcon(selectedItem.posicao)}
                  </div>
                  <span className="text-4xl mb-2 block">
                    {selectedItem.avatar && selectedItem.avatar.startsWith('http') ? (
                      <img src={selectedItem.avatar} alt={selectedItem.nome} className="w-16 h-16 rounded-full object-cover mx-auto" />
                    ) : (
                      selectedItem.avatar
                    )}
                  </span>
                  <h3 className="text-xl font-bold text-sss-white mb-2">
                    {selectedItem.nome}
                  </h3>
                  <p className="text-gray-400">Posição #{selectedItem.posicao} no ranking</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-sss-dark rounded-lg p-4">
                    <h4 className="text-sss-white font-semibold mb-3">Estatísticas</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-sss-accent font-bold text-lg">{formatarNumero(selectedItem.pontuacaoTotal || 0)}</p>
                        <p className="text-gray-400">Pontuação Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sss-white font-semibold">{formatarNumero(selectedItem.sementesRecebidas || 0)}</p>
                        <p className="text-gray-400">Sementes Recebidas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sss-white font-semibold">{formatarNumero(selectedItem.pontosMissoes || 0)}</p>
                        <p className="text-gray-400">Pontos Missões</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sss-white font-semibold">{formatarNumero(selectedItem.pontosConquistas || 0)}</p>
                        <p className="text-gray-400">Pontos Conquistas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sss-white font-semibold">{formatarNumero(selectedItem.missoesCompletadas || 0)}</p>
                        <p className="text-gray-400">Missões Completadas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sss-white font-semibold">{formatarNumero(selectedItem.conquistasDesbloqueadas || 0)}</p>
                        <p className="text-gray-400">Conquistas Desbloqueadas</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-sss-accent text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
} 