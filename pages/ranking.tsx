import React, { useState, useEffect, useCallback } from 'react'
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
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'

interface RankingItem {
  id: string
  nome: string
  avatar: string
  nivel: string
  nivelRanking?: string
  sementes: number
  sementesRecebidas?: number
  pontosUsuario?: number
  pontosVisualizacoes?: number
  pontosEnquetes?: number
  pontosRecadosPublicos?: number
  pontuacaoTotal?: number
  doacoes: number
  criadoresApoiados: number
  totalVisualizacoes?: number
  totalEnquetes?: number
  totalRecadosPublicos?: number
  posicao: number
  categoria: 'doador' | 'criador' | 'missao' | 'social'
  periodo: 'diario' | 'semanal' | 'mensal' | 'total'
  badge?: string
  icone: string
  cor: string
}

interface RankingCategoria {
  id: string
  nome: string
  descricao: string
  icone: string
  cor: string
  totalParticipantes: number
}

interface RankingPeriodo {
  id: string
  nome: string
  descricao: string
  icone: string
  ativo: boolean
}

interface EstatisticasRanking {
  totalDoadores: number
  totalCriadores: number
  sementesDistribuidas: number
  doacoesRealizadas: number
  rankingAtualizado: Date
}

export default function Ranking() {
  const [user, setUser] = useState<User | null>(null)
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [categorias, setCategorias] = useState<RankingCategoria[]>([])
  const [periodos, setPeriodos] = useState<RankingPeriodo[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasRanking | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategoria, setSelectedCategoria] = useState('doador')
  const [selectedPeriodo, setSelectedPeriodo] = useState('total')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<RankingItem | null>(null)
  const [showModal, setShowModal] = useState(false)

  const loadRanking = useCallback(async () => {
    setLoading(true)
    try {
      let response
      if (selectedCategoria === 'criador') {
        // Usar a nova API de ranking de criadores com pontuação composta
        response = await fetch('/api/ranking/criadores', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        const data = await response.json()
        if (response.ok && data.success) {
          // Converter dados da API de criadores para o formato do ranking
          const rankingCriadores = data.criadores.map((criador: any) => ({
            id: criador.id,
            nome: criador.nome,
            avatar: criador.avatar,
            nivel: criador.nivel,
            nivelRanking: criador.nivelRanking,
            sementes: criador.sementesRecebidas,
            sementesRecebidas: criador.sementesRecebidas,
            pontosUsuario: criador.pontosUsuario,
            pontosVisualizacoes: criador.pontosVisualizacoes,
            pontosEnquetes: criador.pontosEnquetes,
            pontosRecadosPublicos: criador.pontosRecadosPublicos,
            pontuacaoTotal: criador.pontuacaoTotal,
            doacoes: criador.totalDoacoes,
            criadoresApoiados: 0,
            totalVisualizacoes: criador.totalVisualizacoes,
            totalEnquetes: criador.totalEnquetes,
            totalRecadosPublicos: criador.totalRecadosPublicos,
            posicao: criador.posicao,
            categoria: 'criador' as const,
            periodo: selectedPeriodo as any,
            badge: criador.nivelRanking,
            icone: '🎭',
            cor: 'text-purple-500'
          }))
          setRanking(rankingCriadores)
        } else {
          console.error('Erro na resposta da API:', data)
          // Manter dados anteriores se disponível
          if (ranking.length === 0) {
            setRanking([])
          }
        }
      } else {
        // Usar API original para outras categorias
        response = await fetch(`/api/ranking?categoria=${selectedCategoria}&periodo=${selectedPeriodo}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        const data = await response.json()
        if (response.ok) {
          setRanking(data.ranking)
        } else {
          console.error('Erro na resposta da API:', data)
          // Manter dados anteriores se disponível
          if (ranking.length === 0) {
            setRanking([])
          }
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
  }, [selectedCategoria, selectedPeriodo, ranking.length])

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    setUser(currentUser)
    loadRanking()
    loadCategorias()
    loadPeriodos()
    loadEstatisticas()
  }, [loadRanking])

  const loadCategorias = async () => {
    try {
      const response = await fetch('/api/ranking/categorias')
      const data = await response.json()
      if (response.ok) {
        setCategorias(data.categorias)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const loadPeriodos = async () => {
    try {
      const response = await fetch('/api/ranking/periodos')
      const data = await response.json()
      if (response.ok) {
        setPeriodos(data.periodos)
      }
    } catch (error) {
      console.error('Erro ao carregar períodos:', error)
    }
  }

  const loadEstatisticas = async () => {
    try {
      const response = await fetch('/api/ranking/estatisticas')
      const data = await response.json()
      if (response.ok) {
        setEstatisticas(data.estatisticas)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
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
        return 'bg-yellow-500/20 border-yellow-500'
      case 2:
        return 'bg-gray-400/20 border-gray-400'
      case 3:
        return 'bg-orange-500/20 border-orange-500'
      default:
        return 'bg-sss-dark border-sss-light'
    }
  }

  const formatarNumero = (numero: number) => {
    if (numero >= 1000000) {
      return `${(numero / 1000000).toFixed(1)}M`
    }
    if (numero >= 1000) {
      return `${(numero / 1000).toFixed(1)}K`
    }
    return numero.toString()
  }

  const formatarData = (data: Date | string | null | undefined) => {
    if (!data) return 'Data não disponível'
    
    try {
      const dataObj = data instanceof Date ? data : new Date(data)
      
      if (isNaN(dataObj.getTime())) {
        return 'Data inválida'
      }
      
      return dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Data inválida'
    }
  }

  const getIconePeriodo = (icone: string) => {
    switch (icone) {
      case 'CalendarIcon':
        return <CalendarIcon className="w-5 h-5" />
      case 'ChartBarIcon':
        return <ChartBarIcon className="w-5 h-5" />
      case 'ClockIcon':
        return <ClockIcon className="w-5 h-5" />
      case 'FireIcon':
        return <FireIcon className="w-5 h-5" />
      default:
        return <CalendarIcon className="w-5 h-5" />
    }
  }

  const rankingFiltrado = filtrarRanking()
  const categoriaAtual = categorias.find(c => c.id === selectedCategoria)
  const periodoAtual = periodos.find(p => p.id === selectedPeriodo)

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Ranking - SementesPLAY</title>
        <meta name="description" content="Veja os melhores doadores e criadores" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/status" className="inline-flex items-center text-sss-accent hover:text-red-400">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Voltar ao Status
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <TrophyIcon className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-gray-300">Sistema de Ranking</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrophyIcon className="w-10 h-10 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Ranking de Doadores e Criadores
              </h2>
              <p className="text-gray-400">
                Descubra quem são os melhores da comunidade
              </p>
            </div>

            {/* Estatísticas Rápidas */}
            {estatisticas && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-sss-medium rounded-lg p-4 border border-sss-light"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total de Doadores</p>
                      <p className="text-sss-white font-bold text-lg">{formatarNumero(estatisticas.totalDoadores)}</p>
                    </div>
                    <UserIcon className="w-8 h-8 text-blue-500" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-sss-medium rounded-lg p-4 border border-sss-light"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total de Criadores</p>
                      <p className="text-sss-white font-bold text-lg">{formatarNumero(estatisticas.totalCriadores)}</p>
                    </div>
                    <TrophyIcon className="w-8 h-8 text-purple-500" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-sss-medium rounded-lg p-4 border border-sss-light"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Sementes Distribuídas</p>
                      <p className="text-sss-white font-bold text-lg">{formatarNumero(estatisticas.sementesDistribuidas)}</p>
                    </div>
                    <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-sss-medium rounded-lg p-4 border border-sss-light"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Doações Realizadas</p>
                      <p className="text-sss-white font-bold text-lg">{formatarNumero(estatisticas.doacoesRealizadas)}</p>
                    </div>
                    <HeartIcon className="w-8 h-8 text-red-500" />
                  </div>
                </motion.div>
              </div>
            )}

            {/* Filtros */}
            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Categorias */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-sss-white mb-3">Categoria</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {categorias.map((categoria) => (
                      <button
                        key={categoria.id}
                        onClick={() => setSelectedCategoria(categoria.id)}
                        className={`p-3 rounded-lg border transition-colors ${
                          selectedCategoria === categoria.id
                            ? `${categoria.cor} border-${categoria.cor} bg-${categoria.cor}/20`
                            : 'border-sss-light bg-sss-dark hover:bg-sss-light'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{categoria.icone}</span>
                          <div className="text-left">
                            <p className={`font-semibold text-sm ${
                              selectedCategoria === categoria.id ? 'text-sss-white' : 'text-gray-300'
                            }`}>
                              {categoria.nome}
                            </p>
                            <p className="text-xs text-gray-400">{categoria.totalParticipantes} participantes</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Períodos */}
                <div className="lg:w-64">
                  <h3 className="text-lg font-semibold text-sss-white mb-3">Período</h3>
                  <div className="space-y-2">
                    {periodos.map((periodo) => (
                      <button
                        key={periodo.id}
                        onClick={() => setSelectedPeriodo(periodo.id)}
                        className={`w-full p-3 rounded-lg border transition-colors ${
                          selectedPeriodo === periodo.id
                            ? 'border-sss-accent bg-sss-accent/20'
                            : 'border-sss-light bg-sss-dark hover:bg-sss-light'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {getIconePeriodo(periodo.icone)}
                          <div className="text-left">
                            <p className={`font-semibold text-sm ${
                              selectedPeriodo === periodo.id ? 'text-sss-white' : 'text-gray-300'
                            }`}>
                              {periodo.nome}
                            </p>
                            <p className="text-xs text-gray-400">{periodo.descricao}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Busca */}
            <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar no ranking..."
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
                      {categoriaAtual?.nome} - {periodoAtual?.nome}
                    </h3>
                    <p className="text-gray-400">{categoriaAtual?.descricao}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>Atualizado: {estatisticas ? formatarData(estatisticas.rankingAtualizado) : '...'}</span>
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
                    <h3 className="text-lg font-semibold text-sss-white mb-2">Nenhum resultado encontrado</h3>
                    <p className="text-gray-400">Tente ajustar os filtros ou a busca</p>
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
                              {item.categoria === 'criador' ? (
                                <>
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
                                </>
                              ) : (
                                <>
                                  <div className="text-center">
                                    <p className="text-sss-accent font-bold text-lg">{formatarNumero(item.sementes)}</p>
                                    <p className="text-gray-400 text-sm">Sementes Disponíveis</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sss-white font-semibold">{formatarNumero(item.doacoes)}</p>
                                    <p className="text-gray-400 text-sm">Doações</p>
                                  </div>
                                  {item.categoria === 'doador' && (
                                    <div className="text-center">
                                      <p className="text-sss-white font-semibold">{item.criadoresApoiados}</p>
                                      <p className="text-gray-400 text-sm">Criadores</p>
                                    </div>
                                  )}
                                </>
                              )}
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
                    {selectedItem.categoria === 'criador' ? (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-sss-accent font-bold text-lg">{formatarNumero(selectedItem.pontuacaoTotal || 0)}</p>
                          <p className="text-gray-400">Pontuação Total</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sss-white font-semibold">{formatarNumero(selectedItem.sementes || 0)}</p>
                          <p className="text-gray-400">Sementes Disponíveis</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sss-white font-semibold">{formatarNumero(selectedItem.doacoes)}</p>
                          <p className="text-gray-400">Total de Doações</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sss-white font-semibold">{selectedItem.totalVisualizacoes || 0}</p>
                          <p className="text-gray-400">Visualizações</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sss-white font-semibold">{selectedItem.totalEnquetes || 0}</p>
                          <p className="text-gray-400">Enquetes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sss-white font-semibold">{selectedItem.pontosUsuario || 0}</p>
                          <p className="text-gray-400">Pontos Extras</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-sss-accent font-bold text-lg">{formatarNumero(selectedItem.sementes)}</p>
                          <p className="text-gray-400">Sementes Disponíveis</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sss-white font-semibold">{formatarNumero(selectedItem.doacoes)}</p>
                          <p className="text-gray-400">Doações</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sss-white font-semibold">{selectedItem.nivel}</p>
                          <p className="text-gray-400">Nível</p>
                        </div>
                        {selectedItem.categoria === 'doador' && (
                          <div className="text-center">
                            <p className="text-sss-white font-semibold">{selectedItem.criadoresApoiados}</p>
                            <p className="text-gray-400">Criadores Apoiados</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedItem.badge && (
                    <div className="bg-sss-dark rounded-lg p-4">
                      <h4 className="text-sss-white font-semibold mb-2">Badge</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{selectedItem.icone}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedItem.cor}`}>
                          {selectedItem.badge}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
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