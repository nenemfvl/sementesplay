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
  const [showRanking, setShowRanking] = useState(false)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    setUser(currentUser)
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
          sementes: criador.sementesRecebidas,
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

  const handleVerClassificacao = () => {
    setShowRanking(true)
    loadRanking()
  }

  const rankingFiltrado = filtrarRanking()

  if (!user) {
    return null
  }

  if (showRanking) {
    return (
      <>
        <Head>
          <title>Ranking de Criadores - SementesPLAY</title>
          <meta name="description" content="Veja os melhores criadores" />
        </Head>
        <Navbar />
        <div className="min-h-screen bg-sss-dark">
          {/* Header */}
          <header className="bg-sss-medium shadow-lg border-b border-sss-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setShowRanking(false)}
                    className="inline-flex items-center text-sss-accent hover:text-red-400"
                  >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Voltar aos Criadores
                  </button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <TrophyIcon className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                    <p className="text-sm text-gray-300">Ranking de Criadores</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

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
                                  <p className="text-sss-white font-semibold">{formatarNumero(item.sementesRecebidas || 0)}</p>
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

  return (
    <>
      <Head>
        <title>Criadores - SementesPLAY</title>
        <meta name="description" content="Página de criadores do SementesPLAY" />
      </Head>
      <Navbar />
      <div className="min-h-screen bg-sss-dark">
        {/* Conteúdo centralizado zerado */}
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-sss-medium rounded-lg shadow-lg p-8 border border-sss-light text-center max-w-2xl w-full">
            <h1 className="text-3xl font-bold text-sss-accent mb-4">Criadores</h1>
            <p className="text-sss-white text-lg mb-6">Página pronta para receber conteúdo.</p>
            <button
              onClick={handleVerClassificacao}
              className="inline-flex items-center px-6 py-3 bg-sss-accent text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <TrophyIcon className="w-5 h-5 mr-2" />
              Ver Classificação
            </button>
          </div>
        </div>
        {/* Footer minimalista centralizado */}
        <footer className="bg-black border-t border-sss-light mt-16">
          <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col items-center">
            {/* Logo e nome */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold text-sss-white">SementesPLAY</span>
            </div>
            {/* Redes sociais */}
            <div className="flex gap-4 mb-4">
              <a href="#" title="Discord" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.07.07 0 0 0-.073.035c-.211.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.164-.393-.405-.874-.617-1.249a.07.07 0 0 0-.073-.035A19.736 19.736 0 0 0 3.677 4.369a.064.064 0 0 0-.03.027C.533 9.09-.32 13.579.099 18.021a.08.08 0 0 0 .031.056c2.052 1.507 4.042 2.422 5.992 3.029a.077.077 0 0 0 .084-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.104c-.652-.247-1.27-.549-1.872-.892a.077.077 0 0 1-.008-.127c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.198.372.292a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.891.076.076 0 0 0-.04.105c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028c1.961-.607 3.951-1.522 6.003-3.029a.077.077 0 0 0 .031-.055c.5-5.177-.838-9.637-3.548-13.625a.061.061 0 0 0-.03-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z"/></svg>
              </a>
              <a href="#" title="Instagram" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.98.98-1.274 2.092-1.334 3.374C2.013 5.741 2 6.151 2 12c0 5.849.013 6.259.072 7.54.06 1.282.354 2.394 1.334 3.374.98.98 2.092 1.274 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.06 2.394-.354 3.374-1.334.98-.98 1.274-2.092 1.334-3.374.059-1.281.072-1.691.072-7.54 0-5.849-.013-6.259-.072-7.54-.06-1.282-.354-2.394-1.334-3.374-.98-.98-2.092-1.274-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
              </a>
              <a href="#" title="TikTok" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12.75 2v14.25a2.25 2.25 0 1 1-2.25-2.25h.75V12h-.75a4.5 4.5 0 1 0 4.5 4.5V7.5a5.25 5.25 0 0 0 5.25 5.25V9.75A3.75 3.75 0 0 1 16.5 6V2h-3.75z"/></svg>
              </a>
              <a href="#" title="YouTube" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.692 3.5 12 3.5 12 3.5s-7.692 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.88 0 12 0 12s0 4.12.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.308 20.5 12 20.5 12 20.5s7.692 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 16.12 24 12 24 12s0-4.12-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
              </a>
              <a href="#" title="Twitter" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.116 2.813 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
              </a>
            </div>
            {/* Links horizontais */}
            <div className="flex flex-wrap justify-center gap-4 mb-4 text-gray-400 text-sm">
              <a href="/termos" className="hover:text-sss-accent">Termos de Uso</a>
              <span>|</span>
              <a href="/privacidade" className="hover:text-sss-accent">Política de Privacidade</a>
              <span>|</span>
              <a href="/ajuda" className="hover:text-sss-accent">Ajuda</a>
              <span>|</span>
              <a href="/ranking" className="hover:text-sss-accent">Ranking de Criadores</a>
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