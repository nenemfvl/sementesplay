import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserGroupIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  StarIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  ChartBarIcon,
  PhotoIcon,
  LinkIcon,
  CogIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'

interface Criador {
  id: string
  nome: string
  email: string
  bio: string
  avatar: string
  categoria: string
  status: 'ativo' | 'pendente' | 'rejeitado' | 'suspenso'
  nivel: string
  seguidores: number
  doacoesRecebidas: number
  totalSementes: number
  dataCriacao: Date
  dataAprovacao?: Date
  redesSociais: {
    youtube?: string
    twitch?: string
    instagram?: string
    twitter?: string
  }
  estatisticas: {
    visualizacoes: number
    likes: number
    comentarios: number
    compartilhamentos: number
  }
  conteudos: Conteudo[]
  avaliacao: number
  tags: string[]
}

interface Conteudo {
  id: string
  titulo: string
  tipo: 'video' | 'stream' | 'post' | 'artigo'
  url: string
  thumbnail: string
  visualizacoes: number
  likes: number
  dataCriacao: Date
  status: 'ativo' | 'pendente' | 'rejeitado'
}

interface Candidatura {
  id: string
  criadorId: string
  criadorNome: string
  categoria: string
  bio: string
  redesSociais: any
  portfolio: string[]
  status: 'pendente' | 'aprovada' | 'rejeitada'
  dataCandidatura: Date
  dataRevisao?: Date
  observacoes?: string
}

export default function Criadores() {
  const [user, setUser] = useState<User | null>(null)
  const [criadores, setCriadores] = useState<Criador[]>([])
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('todas')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [selectedCriador, setSelectedCriador] = useState<Criador | null>(null)
  const [selectedCandidatura, setSelectedCandidatura] = useState<Candidatura | null>(null)
  const [showCriadorModal, setShowCriadorModal] = useState(false)
  const [showCandidaturaModal, setShowCandidaturaModal] = useState(false)
  const [activeTab, setActiveTab] = useState('criadores')

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    
    // Verificar se é admin ou criador
    if (Number(currentUser.nivel) < 3) {
      alert('Acesso negado. Apenas criadores e administradores podem acessar esta área.')
      window.location.href = '/dashboard'
      return
    }
    
    setUser(currentUser)
    loadCriadores()
    loadCandidaturas()
  }, [])

  const loadCriadores = async () => {
    try {
      const response = await fetch('/api/criadores')
      const data = await response.json()
      if (response.ok) {
        setCriadores(data.criadores)
      }
    } catch (error) {
      console.error('Erro ao carregar criadores:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCandidaturas = async () => {
    try {
      const response = await fetch('/api/criadores/candidaturas')
      const data = await response.json()
      if (response.ok) {
        setCandidaturas(data.candidaturas)
      }
    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error)
    }
  }

  const filtrarCriadores = () => {
    return criadores.filter(criador => {
      const matchSearch = criador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         criador.bio.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCategoria = filterCategoria === 'todas' || criador.categoria === filterCategoria
      const matchStatus = filterStatus === 'todos' || criador.status === filterStatus
      
      return matchSearch && matchCategoria && matchStatus
    })
  }

  const aprovarCandidatura = async (candidaturaId: string) => {
    try {
      const response = await fetch(`/api/criadores/candidaturas/${candidaturaId}/aprovar`, {
        method: 'POST'
      })

      if (response.ok) {
        alert('Candidatura aprovada com sucesso!')
        loadCandidaturas()
        loadCriadores()
        setShowCandidaturaModal(false)
      } else {
        alert('Erro ao aprovar candidatura')
      }
    } catch (error) {
      console.error('Erro ao aprovar candidatura:', error)
      alert('Erro ao aprovar candidatura')
    }
  }

  const rejeitarCandidatura = async (candidaturaId: string, observacoes: string) => {
    try {
      const response = await fetch(`/api/criadores/candidaturas/${candidaturaId}/rejeitar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ observacoes })
      })

      if (response.ok) {
        alert('Candidatura rejeitada com sucesso!')
        loadCandidaturas()
        setShowCandidaturaModal(false)
      } else {
        alert('Erro ao rejeitar candidatura')
      }
    } catch (error) {
      console.error('Erro ao rejeitar candidatura:', error)
      alert('Erro ao rejeitar candidatura')
    }
  }

  const suspenderCriador = async (criadorId: string) => {
    if (!confirm('Tem certeza que deseja suspender este criador?')) return

    try {
      const response = await fetch(`/api/criadores/${criadorId}/suspender`, {
        method: 'POST'
      })

      if (response.ok) {
        alert('Criador suspenso com sucesso!')
        loadCriadores()
      } else {
        alert('Erro ao suspender criador')
      }
    } catch (error) {
      console.error('Erro ao suspender criador:', error)
      alert('Erro ao suspender criador')
    }
  }

  const ativarCriador = async (criadorId: string) => {
    try {
      const response = await fetch(`/api/criadores/${criadorId}/ativar`, {
        method: 'POST'
      })

      if (response.ok) {
        alert('Criador ativado com sucesso!')
        loadCriadores()
      } else {
        alert('Erro ao ativar criador')
      }
    } catch (error) {
      console.error('Erro ao ativar criador:', error)
      alert('Erro ao ativar criador')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-500'
      case 'pendente': return 'bg-yellow-500'
      case 'rejeitado': return 'bg-red-500'
      case 'suspenso': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo'
      case 'pendente': return 'Pendente'
      case 'rejeitado': return 'Rejeitado'
      case 'suspenso': return 'Suspenso'
      default: return status
    }
  }

  const criadoresFiltrados = filtrarCriadores()

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Painel de Criadores - SementesPLAY</title>
        <meta name="description" content="Gerenciamento de criadores de conteúdo" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Navbar igual à home */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light sticky top-0 z-50">
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
        {/* Conteúdo da página Criadores */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-sss-white">Painel de Criadores</h2>
                <p className="text-gray-400">Gerencie criadores de conteúdo e candidaturas</p>
              </div>
              <div className="text-right">
                <p className="text-sss-white font-semibold">{criadoresFiltrados.length} criadores</p>
                <p className="text-sm text-gray-400">{candidaturas.filter(c => c.status === 'pendente').length} candidaturas pendentes</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-sss-medium rounded-lg p-1">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('criadores')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'criadores'
                      ? 'bg-sss-accent text-white'
                      : 'text-gray-400 hover:text-sss-white'
                  }`}
                >
                  <UserGroupIcon className="w-4 h-4 inline mr-2" />
                  Criadores
                </button>
                <button
                  onClick={() => setActiveTab('candidaturas')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'candidaturas'
                      ? 'bg-sss-accent text-white'
                      : 'text-gray-400 hover:text-sss-white'
                  }`}
                >
                  <ClockIcon className="w-4 h-4 inline mr-2" />
                  Candidaturas
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-sss-medium rounded-lg p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar criadores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterCategoria}
                    onChange={(e) => setFilterCategoria(e.target.value)}
                    className="px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                  >
                    <option value="todas">Todas Categorias</option>
                    <option value="gaming">Gaming</option>
                    <option value="tech">Tecnologia</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="educacao">Educação</option>
                    <option value="entretenimento">Entretenimento</option>
                  </select>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                  >
                    <option value="todos">Todos Status</option>
                    <option value="ativo">Ativo</option>
                    <option value="pendente">Pendente</option>
                    <option value="rejeitado">Rejeitado</option>
                    <option value="suspenso">Suspenso</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'criadores' ? (
                <motion.div
                  key="criadores"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sss-accent mx-auto"></div>
                      <p className="text-gray-400 mt-4">Carregando criadores...</p>
                    </div>
                  ) : criadoresFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                      <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-sss-white mb-2">Nenhum criador encontrado</h3>
                      <p className="text-gray-400">Tente ajustar os filtros de busca</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {criadoresFiltrados.map((criador) => (
                        <motion.div
                          key={criador.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="bg-sss-medium rounded-lg p-6 border border-sss-light hover:border-sss-accent transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {criador.nome.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-sss-white">{criador.nome}</h3>
                                <p className="text-sm text-gray-400">{criador.categoria}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(criador.status)} text-white`}>
                              {getStatusText(criador.status)}
                            </span>
                          </div>

                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{criador.bio}</p>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-sss-white">{criador.seguidores.toLocaleString()}</p>
                              <p className="text-xs text-gray-400">Seguidores</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-500">{criador.totalSementes.toLocaleString()}</p>
                              <p className="text-xs text-gray-400">Sementes</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                            <div className="flex items-center">
                              <StarIcon className="w-4 h-4 mr-1" />
                              <span>{criador.avaliacao.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center">
                              <ChartBarIcon className="w-4 h-4 mr-1" />
                              <span>{criador.estatisticas.visualizacoes.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedCriador(criador)
                                setShowCriadorModal(true)
                              }}
                              className="flex-1 py-2 px-3 bg-sss-accent hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors"
                            >
                              <EyeIcon className="w-4 h-4 inline mr-1" />
                              Ver Detalhes
                            </button>
                            
                            {criador.status === 'ativo' ? (
                              <button
                                onClick={() => suspenderCriador(criador.id)}
                                className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                              >
                                <ExclamationTriangleIcon className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => ativarCriador(criador.id)}
                                className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="candidaturas"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-sss-medium rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-sss-dark">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Criador
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Categoria
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Data
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sss-light">
                          {candidaturas.map((candidatura) => (
                            <tr key={candidatura.id} className="hover:bg-sss-dark transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold">
                                      {candidatura.criadorNome.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-sss-white">
                                      {candidatura.criadorNome}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-300">{candidatura.categoria}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidatura.status)} text-white`}>
                                  {getStatusText(candidatura.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {new Date(candidatura.dataCandidatura).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => {
                                    setSelectedCandidatura(candidatura)
                                    setShowCandidaturaModal(true)
                                  }}
                                  className="text-sss-accent hover:text-red-400 mr-3"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                                {candidatura.status === 'pendente' && (
                                  <>
                                    <button
                                      onClick={() => aprovarCandidatura(candidatura.id)}
                                      className="text-green-500 hover:text-green-400 mr-3"
                                    >
                                      <CheckCircleIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => rejeitarCandidatura(candidatura.id, '')}
                                      className="text-red-500 hover:text-red-400"
                                    >
                                      <XCircleIcon className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Modal Detalhes do Criador */}
        {showCriadorModal && selectedCriador && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-sss-medium rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-sss-white">Detalhes do Criador</h3>
                  <button
                    onClick={() => setShowCriadorModal(false)}
                    className="text-gray-400 hover:text-sss-white"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Informações Básicas */}
                  <div className="lg:col-span-1">
                    <div className="bg-sss-dark rounded-lg p-4">
                      <div className="text-center mb-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-white font-bold text-3xl">
                            {selectedCriador.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-sss-white">{selectedCriador.nome}</h4>
                        <p className="text-gray-400">{selectedCriador.categoria}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCriador.status)} text-white mt-2`}>
                          {getStatusText(selectedCriador.status)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email:</span>
                          <span className="text-sss-white">{selectedCriador.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Nível:</span>
                          <span className="text-sss-white">{selectedCriador.nivel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Membro desde:</span>
                          <span className="text-sss-white">{new Date(selectedCriador.dataCriacao).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {selectedCriador.dataAprovacao && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Aprovado em:</span>
                            <span className="text-sss-white">{new Date(selectedCriador.dataAprovacao).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-sss-dark rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-sss-white">{selectedCriador.seguidores.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">Seguidores</p>
                      </div>
                      <div className="bg-sss-dark rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-500">{selectedCriador.totalSementes.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">Sementes</p>
                      </div>
                      <div className="bg-sss-dark rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-blue-500">{selectedCriador.doacoesRecebidas.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">Doações</p>
                      </div>
                      <div className="bg-sss-dark rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-500">{selectedCriador.avaliacao.toFixed(1)}</p>
                        <p className="text-sm text-gray-400">Avaliação</p>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="bg-sss-dark rounded-lg p-4 mb-6">
                      <h5 className="font-semibold text-sss-white mb-2">Biografia</h5>
                      <p className="text-gray-300">{selectedCriador.bio}</p>
                    </div>

                    {/* Redes Sociais */}
                    <div className="bg-sss-dark rounded-lg p-4 mb-6">
                      <h5 className="font-semibold text-sss-white mb-3">Redes Sociais</h5>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedCriador.redesSociais.youtube && (
                          <a href={selectedCriador.redesSociais.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center text-red-500 hover:text-red-400">
                            <span className="text-lg mr-2">📺</span>
                            YouTube
                          </a>
                        )}
                        {selectedCriador.redesSociais.twitch && (
                          <a href={selectedCriador.redesSociais.twitch} target="_blank" rel="noopener noreferrer" className="flex items-center text-purple-500 hover:text-purple-400">
                            <span className="text-lg mr-2">🎮</span>
                            Twitch
                          </a>
                        )}
                        {selectedCriador.redesSociais.instagram && (
                          <a href={selectedCriador.redesSociais.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center text-pink-500 hover:text-pink-400">
                            <span className="text-lg mr-2">📷</span>
                            Instagram
                          </a>
                        )}
                        {selectedCriador.redesSociais.twitter && (
                          <a href={selectedCriador.redesSociais.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500 hover:text-blue-400">
                            <span className="text-lg mr-2">🐦</span>
                            Twitter
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Conteúdos Recentes */}
                    <div className="bg-sss-dark rounded-lg p-4">
                      <h5 className="font-semibold text-sss-white mb-3">Conteúdos Recentes</h5>
                      <div className="space-y-3">
                        {selectedCriador.conteudos.slice(0, 3).map((conteudo) => (
                          <div key={conteudo.id} className="flex items-center space-x-3 p-3 bg-sss-medium rounded-lg">
                            <div className="w-12 h-12 bg-sss-accent/20 rounded-lg flex items-center justify-center">
                              {conteudo.tipo === 'video' && <span className="text-lg">🎥</span>}
                              {conteudo.tipo === 'stream' && <span className="text-lg">📺</span>}
                              {conteudo.tipo === 'post' && <span className="text-lg">📝</span>}
                              {conteudo.tipo === 'artigo' && <span className="text-lg">📄</span>}
                            </div>
                            <div className="flex-1">
                              <h6 className="font-medium text-sss-white">{conteudo.titulo}</h6>
                              <p className="text-sm text-gray-400">{conteudo.visualizacoes.toLocaleString()} visualizações</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conteudo.status)} text-white`}>
                              {getStatusText(conteudo.status)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal Detalhes da Candidatura */}
        {showCandidaturaModal && selectedCandidatura && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-sss-medium rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-sss-white">Detalhes da Candidatura</h3>
                  <button
                    onClick={() => setShowCandidaturaModal(false)}
                    className="text-gray-400 hover:text-sss-white"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-sss-dark rounded-lg p-4">
                    <h4 className="font-semibold text-sss-white mb-3">Informações do Candidato</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Nome:</span>
                        <span className="text-sss-white">{selectedCandidatura.criadorNome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Categoria:</span>
                        <span className="text-sss-white">{selectedCandidatura.categoria}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCandidatura.status)} text-white`}>
                          {getStatusText(selectedCandidatura.status)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Data da Candidatura:</span>
                        <span className="text-sss-white">{new Date(selectedCandidatura.dataCandidatura).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-sss-dark rounded-lg p-4">
                    <h4 className="font-semibold text-sss-white mb-3">Biografia</h4>
                    <p className="text-gray-300">{selectedCandidatura.bio}</p>
                  </div>

                  <div className="bg-sss-dark rounded-lg p-4">
                    <h4 className="font-semibold text-sss-white mb-3">Portfolio</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedCandidatura.portfolio.map((item, index) => (
                        <div key={index} className="bg-sss-medium rounded-lg p-3">
                          <a href={item} target="_blank" rel="noopener noreferrer" className="text-sss-accent hover:text-red-400 text-sm">
                            {item}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedCandidatura.status === 'pendente' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => aprovarCandidatura(selectedCandidatura.id)}
                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => rejeitarCandidatura(selectedCandidatura.id, '')}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <XCircleIcon className="w-5 h-5 inline mr-2" />
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  )
} 