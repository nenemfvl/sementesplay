import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrophyIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  FireIcon,
  GiftIcon,
  ChartBarIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'

interface Missao {
  id: string
  titulo: string
  descricao: string
  tipo: 'diaria' | 'semanal' | 'mensal' | 'unica'
  categoria: 'doacao' | 'social' | 'criador' | 'sistema' | 'ranking'
  objetivo: number
  progresso: number
  recompensa: {
    sementes: number
    experiencia: number
    badge?: string
  }
  status: 'disponivel' | 'em_progresso' | 'completada' | 'expirada'
  dataInicio: Date
  dataFim: Date
  icone: string
  cor: string
  reivindicada?: boolean
}

interface Conquista {
  id: string
  titulo: string
  descricao: string
  icone: string
  cor: string
  desbloqueada: boolean
  dataDesbloqueio?: Date
  raridade: 'comum' | 'rara' | 'epica' | 'lendaria'
}

interface Badge {
  id: string
  nome: string
  descricao: string
  icone: string
  cor: string
  desbloqueada: boolean
  nivel: number
  maxNivel: number
}

export default function Missoes() {
  const [user, setUser] = useState<User | null>(null)
  const [missoes, setMissoes] = useState<Missao[]>([])
  const [conquistas, setConquistas] = useState<Conquista[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('diarias')
  const [selectedMissao, setSelectedMissao] = useState<Missao | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    setUser(currentUser)
    loadMissoes()
    loadConquistas()
    loadBadges()
  }, [])

  const loadMissoes = async () => {
    try {
      const token = localStorage.getItem('sementesplay_token');
      const response = await fetch(`/api/missoes?usuarioId=${user?.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      const data = await response.json()
      if (response.ok) {
        setMissoes(data.missoes.map((m: any) => {
          // Calcular data de expiração baseada no tipo de missão
          let dataFim = new Date()
          const agora = new Date()
          
          switch (m.tipo) {
            case 'diaria':
              // Missão diária expira no final do dia
              dataFim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1, 0, 0, 0)
              break
            case 'semanal':
              // Missão semanal expira no final da semana (domingo)
              const diasParaDomingo = 7 - agora.getDay()
              dataFim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + diasParaDomingo, 0, 0, 0)
              break
            case 'mensal':
              // Missão mensal expira no final do mês
              dataFim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 0, 0, 0)
              break
            case 'unica':
              // Missão única não expira
              dataFim = new Date(agora.getFullYear() + 10, agora.getMonth(), agora.getDate())
              break
            default:
              dataFim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1, 0, 0, 0)
          }
          
          return {
            ...m,
            dataInicio: new Date(),
            dataFim: dataFim,
            status: m.completada ? 'completada' : m.progresso > 0 ? 'em_progresso' : 'disponivel',
            reivindicada: m.reivindicada || false,
            recompensa: {
              sementes: 0,
              experiencia: m.recompensa,
              badge: m.emblema
            },
            icone: m.emblema || '🎯',
            cor: 'blue'
          }
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar missões:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadConquistas = async () => {
    try {
      const token = localStorage.getItem('sementesplay_token');
      const response = await fetch(`/api/conquistas?usuarioId=${user?.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      const data = await response.json()
      if (response.ok) {
        setConquistas(data.conquistas.map((c: any) => ({
          ...c,
          dataDesbloqueio: c.dataConquista ? new Date(c.dataConquista) : undefined,
          desbloqueada: c.concluida || false
        })))
      }
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error)
    }
  }

  const loadBadges = async () => {
    try {
      const token = localStorage.getItem('sementesplay_token');
      const response = await fetch(`/api/emblemas?usuarioId=${user?.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      const data = await response.json()
      if (response.ok) {
        setBadges(data.emblemas.map((b: any) => ({
          ...b,
          desbloqueada: true,
          nivel: 1,
          maxNivel: 1
        })))
      }
    } catch (error) {
      console.error('Erro ao carregar badges:', error)
    }
  }

  const completarMissao = async (missaoId: string) => {
    try {
      const token = localStorage.getItem('sementesplay_token');
      const response = await fetch(`/api/missoes/${missaoId}/reivindicar`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Missão completada! Você ganhou ${data.recompensa || 0} XP!`)
        loadMissoes()
        loadConquistas()
        loadBadges()
      } else {
        alert('Erro ao completar missão')
      }
    } catch (error) {
      console.error('Erro ao completar missão:', error)
      alert('Erro ao completar missão')
    }
  }

  const filtrarMissoes = (tipo: string) => {
    return missoes.filter(missao => {
      if (tipo === 'diarias') return missao.tipo === 'diaria'
      if (tipo === 'semanais') return missao.tipo === 'semanal'
      if (tipo === 'mensais') return missao.tipo === 'mensal'
      if (tipo === 'especiais') return missao.tipo === 'unica'
      return true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel':
        return 'border-green-500 bg-green-500/10'
      case 'em_progresso':
        return 'border-yellow-500 bg-yellow-500/10'
      case 'completada':
        return 'border-blue-500 bg-blue-500/10'
      case 'expirada':
        return 'border-red-500 bg-red-500/10'
      default:
        return 'border-gray-500 bg-gray-500/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'disponivel':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'em_progresso':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      case 'completada':
        return <TrophyIcon className="w-5 h-5 text-blue-500" />
      case 'expirada':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getRaridadeColor = (raridade: string) => {
    switch (raridade) {
      case 'comum':
        return 'text-gray-400'
      case 'rara':
        return 'text-blue-400'
      case 'epica':
        return 'text-purple-400'
      case 'lendaria':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatarTempo = (data: Date) => {
    const agora = new Date()
    const diff = data.getTime() - agora.getTime()
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (dias > 0) return `${dias}d ${horas}h`
    if (horas > 0) return `${horas}h`
    return 'Menos de 1h'
  }

  const calcularProgresso = (progresso: number, objetivo: number) => {
    return Math.min((progresso / objetivo) * 100, 100)
  }

  const getProgressWidthClass = (progresso: number, objetivo: number) => {
    const percentual = calcularProgresso(progresso, objetivo)
    if (percentual <= 10) return 'w-[10%]'
    if (percentual <= 20) return 'w-[20%]'
    if (percentual <= 30) return 'w-[30%]'
    if (percentual <= 40) return 'w-[40%]'
    if (percentual <= 50) return 'w-[50%]'
    if (percentual <= 60) return 'w-[60%]'
    if (percentual <= 70) return 'w-[70%]'
    if (percentual <= 80) return 'w-[80%]'
    if (percentual <= 90) return 'w-[90%]'
    return 'w-full'
  }

  const missoesFiltradas = filtrarMissoes(activeTab)
  const missoesCompletadas = missoes.filter(m => m.status === 'completada').length
  const totalMissoes = missoes.length
  const progressoGeral = totalMissoes > 0 ? (missoesCompletadas / totalMissoes) * 100 : 0

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'diarias', label: 'Diárias', icon: CalendarIcon, count: missoes.filter(m => m.tipo === 'diaria').length },
    { id: 'semanais', label: 'Semanais', icon: ChartBarIcon, count: missoes.filter(m => m.tipo === 'semanal').length },
    { id: 'mensais', label: 'Mensais', icon: StarIcon, count: missoes.filter(m => m.tipo === 'mensal').length },
    { id: 'especiais', label: 'Especiais', icon: FireIcon, count: missoes.filter(m => m.tipo === 'unica').length },
    { id: 'conquistas', label: 'Conquistas', icon: TrophyIcon, count: conquistas.filter(c => c.desbloqueada).length },
    { id: 'badges', label: 'Badges', icon: GiftIcon, count: badges.filter(b => b.desbloqueada).length }
  ]

  return (
    <>
      <Head>
        <title>Missões - SementesPLAY</title>
        <meta name="description" content="Complete missões e ganhe recompensas" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/status" className="inline-flex items-center text-sss-accent hover:text-red-400">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🌱</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-gray-300">Missões e Conquistas</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <div className="w-20 h-20 bg-sss-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrophyIcon className="w-10 h-10 text-sss-accent" />
              </div>
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Missões e Conquistas
              </h2>
              <p className="text-gray-400">
                Complete missões para ganhar Sementes, XP e desbloquear conquistas
              </p>
            </div>

            {/* Progresso Geral */}
            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-sss-white">Progresso Geral</h3>
                <span className="text-sss-accent font-semibold">
                  {missoesCompletadas}/{totalMissoes} Completadas
                </span>
              </div>
              <div className="w-full bg-sss-dark rounded-full h-3 mb-2">
                <div 
                  className={`bg-gradient-to-r from-sss-accent to-red-600 h-3 rounded-full transition-all duration-500 ${getProgressWidthClass(missoesCompletadas, totalMissoes)}`}
                ></div>
              </div>
              <p className="text-gray-400 text-sm">
                {Math.round(progressoGeral)}% das missões completadas
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-sss-medium rounded-lg border border-sss-light">
              <div className="border-b border-sss-light">
                <nav className="flex space-x-8 px-6 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-sss-accent text-sss-accent'
                          : 'border-transparent text-gray-300 hover:text-sss-white'
                      }`}
                      aria-label={`${tab.label} (${tab.count} itens)`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                      <span className="bg-sss-dark text-xs px-2 py-1 rounded-full">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {['diarias', 'semanais', 'mensais', 'especiais'].includes(activeTab) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sss-accent mx-auto"></div>
                        <p className="text-gray-400 mt-2">Carregando missões...</p>
                      </div>
                    ) : missoesFiltradas.length === 0 ? (
                      <div className="text-center py-8">
                        <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400">Nenhuma missão disponível</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {missoesFiltradas.map((missao) => (
                          <motion.div
                            key={missao.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-lg border-l-4 ${getStatusColor(missao.status)} cursor-pointer hover:bg-sss-dark transition-colors`}
                            onClick={() => {
                              setSelectedMissao(missao)
                              setShowModal(true)
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">{missao.icone}</span>
                                <div>
                                  <h4 className="text-sss-white font-semibold">{missao.titulo}</h4>
                                  <p className="text-gray-400 text-sm">{missao.descricao}</p>
                                </div>
                              </div>
                              {getStatusIcon(missao.status)}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Progresso</span>
                                <span className="text-sss-white">
                                  {missao.progresso}/{missao.objetivo}
                                </span>
                              </div>
                              <div className="w-full bg-sss-dark rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    missao.status === 'completada' 
                                      ? 'bg-green-500' 
                                      : missao.status === 'em_progresso'
                                      ? 'bg-yellow-500'
                                      : 'bg-gray-500'
                                  } ${getProgressWidthClass(missao.progresso, missao.objetivo)}`}
                                ></div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-blue-400 font-semibold">
                                    {missao.recompensa.experiencia} XP
                                  </span>
                                  {missao.recompensa.badge && (
                                    <span className="text-purple-400 font-semibold">
                                      {missao.recompensa.badge}
                                    </span>
                                  )}
                                </div>
                                <span className="text-gray-400 text-xs">
                                  {formatarTempo(missao.dataFim)}
                                </span>
                              </div>

                              {missao.status === 'em_progresso' && missao.progresso >= missao.objetivo && !missao.reivindicada && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    completarMissao(missao.id)
                                  }}
                                  className="w-full mt-2 bg-sss-accent hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-semibold"
                                >
                                  Reivindicar Recompensa
                                </button>
                              )}
                              {missao.reivindicada && (
                                <div className="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-semibold text-center">
                                  ✅ Recompensa Reivindicada
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'conquistas' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {conquistas.map((conquista) => (
                        <motion.div
                          key={conquista.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-lg border ${
                            conquista.desbloqueada 
                              ? 'border-green-500 bg-green-500/10' 
                              : 'border-gray-500 bg-gray-500/10'
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <span className={`text-2xl ${conquista.desbloqueada ? 'opacity-100' : 'opacity-50'}`}>
                              {conquista.icone}
                            </span>
                            <div className="flex-1">
                              <h4 className={`font-semibold ${conquista.desbloqueada ? 'text-sss-white' : 'text-gray-400'}`}>
                                {conquista.titulo}
                              </h4>
                              <p className={`text-sm ${conquista.desbloqueada ? 'text-gray-300' : 'text-gray-500'}`}>
                                {conquista.descricao}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${getRaridadeColor(conquista.raridade)}`}>
                              {conquista.raridade.toUpperCase()}
                            </span>
                          </div>
                          
                          {conquista.desbloqueada && conquista.dataDesbloqueio && (
                            <p className="text-green-400 text-xs">
                              Desbloqueada em {conquista.dataDesbloqueio.toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'badges' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {badges.map((badge) => (
                        <motion.div
                          key={badge.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-lg border ${
                            badge.desbloqueada 
                              ? 'border-blue-500 bg-blue-500/10' 
                              : 'border-gray-500 bg-gray-500/10'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`text-4xl mb-2 ${badge.desbloqueada ? 'opacity-100' : 'opacity-30'}`}>
                              {badge.icone}
                            </div>
                            <h4 className={`font-semibold mb-1 ${badge.desbloqueada ? 'text-sss-white' : 'text-gray-400'}`}>
                              {badge.nome}
                            </h4>
                            <p className={`text-sm mb-3 ${badge.desbloqueada ? 'text-gray-300' : 'text-gray-500'}`}>
                              {badge.descricao}
                            </p>
                            <div className="flex items-center justify-center space-x-2">
                              <span className="text-xs text-gray-400">Nível</span>
                              <span className={`text-sm font-semibold ${badge.desbloqueada ? 'text-blue-400' : 'text-gray-500'}`}>
                                {badge.nivel}/{badge.maxNivel}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Modal de Detalhes da Missão */}
        <AnimatePresence>
          {showModal && selectedMissao && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-sss-medium rounded-lg p-6 w-full max-w-md mx-4"
              >
                <div className="text-center mb-6">
                  <span className="text-4xl mb-4 block">{selectedMissao.icone}</span>
                  <h3 className="text-xl font-bold text-sss-white mb-2">
                    {selectedMissao.titulo}
                  </h3>
                  <p className="text-gray-400">{selectedMissao.descricao}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-sss-white">
                      {selectedMissao.progresso}/{selectedMissao.objetivo}
                    </span>
                  </div>
                  
                  <div className="w-full bg-sss-dark rounded-full h-3">
                    <div 
                      className={`bg-sss-accent h-3 rounded-full transition-all duration-500 ${getProgressWidthClass(selectedMissao.progresso, selectedMissao.objetivo)}`}
                    ></div>
                  </div>

                  <div className="bg-sss-dark rounded-lg p-4">
                    <h4 className="text-sss-white font-semibold mb-2">Recompensas</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-400 font-semibold">
                          {selectedMissao.recompensa.experiencia} XP
                        </span>
                        {selectedMissao.recompensa.badge && (
                          <span className="text-purple-400 font-semibold">
                            {selectedMissao.recompensa.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Expira em: {formatarTempo(selectedMissao.dataFim)}</span>
                    <span>Tipo: {selectedMissao.tipo}</span>
                  </div>

                  {selectedMissao.status === 'em_progresso' && selectedMissao.progresso >= selectedMissao.objetivo && (
                    <button
                      onClick={() => {
                        completarMissao(selectedMissao.id)
                        setShowModal(false)
                      }}
                      className="w-full bg-sss-accent hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
                    >
                      Completar Missão
                    </button>
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