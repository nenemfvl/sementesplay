import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeftIcon,
  CurrencyDollarIcon,
  GiftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  UserIcon,
  ChartBarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'

interface CodigoCashback {
  id: string
  codigo: string
  descricao: string
  valor: number
  tipo: 'percentual' | 'fixo'
  valorMinimo: number
  valorMaximo: number
  dataInicio: Date
  dataFim: Date
  status: 'ativo' | 'inativo' | 'expirado'
  categoria: 'geral' | 'criador' | 'especial' | 'parceiro'
  criadorId?: string
  criadorNome?: string
  usos: number
  maxUsos: number
  icone: string
  cor: string
}

interface HistoricoCashback {
  id: string
  codigo: string
  valor: number
  dataResgate: Date
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'processado'
  observacao?: string
  criadorNome?: string
}

interface EstatisticasCashback {
  totalResgatado: number
  totalPendente: number
  codigosUsados: number
  economiaTotal: number
  resgatesMes: number
  mediaPorResgate: number
}

export default function Cashback() {
  const [user, setUser] = useState<User | null>(null)
  const [codigos, setCodigos] = useState<CodigoCashback[]>([])
  const [historico, setHistorico] = useState<HistoricoCashback[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasCashback | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('disponiveis')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState('todas')
  const [selectedCodigo, setSelectedCodigo] = useState<CodigoCashback | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [resgateLoading, setResgateLoading] = useState(false)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    setUser(currentUser)
    loadCodigos()
    loadHistorico()
    loadEstatisticas()
  }, [])

  const loadCodigos = async () => {
    try {
      const response = await fetch('/api/cashback/codigos')
      const data = await response.json()
      if (response.ok) {
        setCodigos(data.codigos.map((c: any) => ({
          ...c,
          dataInicio: new Date(c.dataInicio),
          dataFim: new Date(c.dataFim)
        })))
      }
    } catch (error) {
      console.error('Erro ao carregar códigos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHistorico = async () => {
    try {
      const response = await fetch('/api/cashback/historico')
      const data = await response.json()
      if (response.ok) {
        setHistorico(data.historico.map((h: any) => ({
          ...h,
          dataResgate: new Date(h.dataResgate)
        })))
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    }
  }

  const loadEstatisticas = async () => {
    try {
      const response = await fetch('/api/cashback/estatisticas')
      const data = await response.json()
      if (response.ok) {
        setEstatisticas(data.estatisticas)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const resgatarCodigo = async (codigoId: string) => {
    setResgateLoading(true)
    try {
      const response = await fetch(`/api/cashback/codigos/${codigoId}/resgatar`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Cashback resgatado com sucesso! Você ganhou ${data.valor} Sementes!`)
        loadCodigos()
        loadHistorico()
        loadEstatisticas()
        setShowModal(false)
      } else {
        const error = await response.json()
        alert(`Erro: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro ao resgatar código:', error)
      alert('Erro ao resgatar código')
    } finally {
      setResgateLoading(false)
    }
  }

  const filtrarCodigos = () => {
    return codigos.filter(codigo => {
      const matchSearch = codigo.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         codigo.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCategoria = selectedCategoria === 'todas' || codigo.categoria === selectedCategoria
      return matchSearch && matchCategoria
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'border-green-500 bg-green-500/10'
      case 'inativo':
        return 'border-gray-500 bg-gray-500/10'
      case 'expirado':
        return 'border-red-500 bg-red-500/10'
      default:
        return 'border-gray-500 bg-gray-500/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'inativo':
        return <XCircleIcon className="w-5 h-5 text-gray-500" />
      case 'expirado':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const formatarValor = (valor: number, tipo: string) => {
    if (tipo === 'percentual') {
      return `${valor}%`
    }
    return `${valor} Sementes`
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
        year: 'numeric'
      })
    } catch (error) {
      return 'Data inválida'
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

  const getStatusHistoricoColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'text-green-400'
      case 'pendente':
        return 'text-yellow-400'
      case 'rejeitado':
        return 'text-red-400'
      case 'processado':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  const codigosFiltrados = filtrarCodigos()
  const codigosDisponiveis = codigosFiltrados.filter(c => c.status === 'ativo')
  const codigosExpirados = codigosFiltrados.filter(c => c.status === 'expirado')

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'disponiveis', label: 'Disponíveis', icon: GiftIcon, count: codigosDisponiveis.length },
    { id: 'historico', label: 'Histórico', icon: ClockIcon, count: historico.length },
    { id: 'estatisticas', label: 'Estatísticas', icon: ChartBarIcon }
  ]

  const categorias = [
    { id: 'todas', label: 'Todas' },
    { id: 'geral', label: 'Geral' },
    { id: 'criador', label: 'Criador' },
    { id: 'especial', label: 'Especial' },
    { id: 'parceiro', label: 'Parceiro' }
  ]

  return (
    <>
      <Head>
        <title>Cashback - SementesPLAY</title>
        <meta name="description" content="Resgate códigos de cashback e ganhe Sementes" />
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
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-gray-300">Sistema de Cashback</p>
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
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Sistema de Cashback
              </h2>
              <p className="text-gray-400">
                Resgate códigos promocionais e ganhe Sementes de volta
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
                      <p className="text-gray-400 text-sm">Total Resgatado</p>
                      <p className="text-sss-white font-bold text-lg">{estatisticas.totalResgatado} Sementes</p>
                    </div>
                    <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
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
                      <p className="text-gray-400 text-sm">Pendente</p>
                      <p className="text-sss-white font-bold text-lg">{estatisticas.totalPendente} Sementes</p>
                    </div>
                    <ClockIcon className="w-8 h-8 text-yellow-500" />
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
                      <p className="text-gray-400 text-sm">Códigos Usados</p>
                      <p className="text-sss-white font-bold text-lg">{estatisticas.codigosUsados}</p>
                    </div>
                    <GiftIcon className="w-8 h-8 text-purple-500" />
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
                      <p className="text-gray-400 text-sm">Economia Total</p>
                      <p className="text-sss-white font-bold text-lg">{estatisticas.economiaTotal} Sementes</p>
                    </div>
                    <ChartBarIcon className="w-8 h-8 text-blue-500" />
                  </div>
                </motion.div>
              </div>
            )}

            {/* Ações Rápidas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-sss-medium rounded-lg p-6 border border-sss-light"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-sss-white mb-4">
                  Ações Rápidas
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/registrar-compra"
                    className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Registrar Compra com Parceiro
                  </Link>
                  <Link
                    href="/parceiros"
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                    Ver Parceiros Disponíveis
                  </Link>
                </div>
                <p className="text-gray-400 text-sm mt-4">
                  Use o cupom <strong>sementesplay10</strong> nas compras e registre aqui para receber cashback!
                </p>
              </div>
            </motion.div>

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
                          ? 'border-green-500 text-green-500'
                          : 'border-transparent text-gray-300 hover:text-sss-white'
                      }`}
                      aria-label={`${tab.label}${tab.count !== undefined ? ` (${tab.count} itens)` : ''}`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span className="bg-sss-dark text-xs px-2 py-1 rounded-full">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'disponiveis' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Filtros */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label htmlFor="search-codigos" className="sr-only">Buscar códigos</label>
                        <div className="relative">
                          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            id="search-codigos"
                            type="text"
                            placeholder="Buscar códigos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                            aria-label="Buscar códigos de cashback"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FunnelIcon className="w-5 h-5 text-gray-400" />
                        <label htmlFor="categoria-filter" className="sr-only">Filtrar por categoria</label>
                        <select
                          id="categoria-filter"
                          value={selectedCategoria}
                          onChange={(e) => setSelectedCategoria(e.target.value)}
                          className="bg-sss-dark border border-sss-light rounded-lg px-3 py-2 text-sss-white focus:outline-none focus:border-green-500"
                          aria-label="Filtrar códigos por categoria"
                        >
                          {categorias.map((categoria) => (
                            <option key={categoria.id} value={categoria.id}>
                              {categoria.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Lista de Códigos */}
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                        <p className="text-gray-400 mt-2">Carregando códigos...</p>
                      </div>
                    ) : codigosDisponiveis.length === 0 ? (
                      <div className="text-center py-8">
                        <GiftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-sss-white mb-2">Nenhum código disponível</h3>
                        <p className="text-gray-400">Volte mais tarde para novos códigos de cashback</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {codigosDisponiveis.map((codigo) => (
                          <motion.div
                            key={codigo.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-lg border-l-4 ${getStatusColor(codigo.status)} cursor-pointer hover:bg-sss-dark transition-colors`}
                            onClick={() => {
                              setSelectedCodigo(codigo)
                              setShowModal(true)
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">{codigo.icone}</span>
                                <div>
                                  <h4 className="text-sss-white font-semibold">{codigo.codigo}</h4>
                                  <p className="text-gray-400 text-sm">{codigo.descricao}</p>
                                </div>
                              </div>
                              {getStatusIcon(codigo.status)}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Valor</span>
                                <span className="text-green-500 font-semibold">
                                  {formatarValor(codigo.valor, codigo.tipo)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Mínimo</span>
                                <span className="text-sss-white text-sm">
                                  {codigo.valorMinimo} Sementes
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Usos</span>
                                <span className="text-sss-white text-sm">
                                  {codigo.usos}/{codigo.maxUsos}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Expira</span>
                                <span className="text-gray-400 text-xs">
                                  {formatarTempo(codigo.dataFim)}
                                </span>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  resgatarCodigo(codigo.id)
                                }}
                                disabled={resgateLoading}
                                className="w-full mt-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-semibold"
                              >
                                {resgateLoading ? 'Processando...' : 'Resgatar'}
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'historico' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {historico.length === 0 ? (
                      <div className="text-center py-8">
                        <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-sss-white mb-2">Nenhum resgate encontrado</h3>
                        <p className="text-gray-400">Você ainda não resgatou nenhum código de cashback</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {historico.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-4 bg-sss-dark rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
                              </div>
                              <div>
                                <p className="text-sss-white font-medium">{item.codigo}</p>
                                <p className="text-gray-400 text-sm">
                                  {formatarData(item.dataResgate)}
                                  {item.criadorNome && ` • ${item.criadorNome}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-green-500 font-semibold">+{item.valor} Sementes</p>
                              <p className={`text-sm ${getStatusHistoricoColor(item.status)}`}>
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'estatisticas' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {estatisticas ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-sss-dark rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-sss-white mb-4">Resumo Mensal</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Resgates este mês</span>
                                <span className="text-sss-white">{estatisticas.resgatesMes}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Média por resgate</span>
                                <span className="text-sss-white">{estatisticas.mediaPorResgate} Sementes</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-sss-dark rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-sss-white mb-4">Economia</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Total economizado</span>
                                <span className="text-green-500 font-semibold">{estatisticas.economiaTotal} Sementes</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Total resgatado</span>
                                <span className="text-sss-white">{estatisticas.totalResgatado} Sementes</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-sss-dark rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-sss-white mb-4">Códigos Expirados</h3>
                          {codigosExpirados.length === 0 ? (
                            <p className="text-gray-400">Nenhum código expirado</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {codigosExpirados.slice(0, 6).map((codigo) => (
                                <div key={codigo.id} className="p-3 bg-sss-medium rounded-lg border border-red-500/20">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sss-white font-medium">{codigo.codigo}</span>
                                    <span className="text-red-400 text-sm">Expirado</span>
                                  </div>
                                  <p className="text-gray-400 text-sm">{codigo.descricao}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">Carregando estatísticas...</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Modal de Detalhes do Código */}
        <AnimatePresence>
          {showModal && selectedCodigo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-sss-medium rounded-lg p-6 w-full max-w-md mx-4"
              >
                <div className="text-center mb-6">
                  <span className="text-4xl mb-4 block">{selectedCodigo.icone}</span>
                  <h3 className="text-xl font-bold text-sss-white mb-2">
                    {selectedCodigo.codigo}
                  </h3>
                  <p className="text-gray-400">{selectedCodigo.descricao}</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-sss-dark rounded-lg p-4">
                    <h4 className="text-sss-white font-semibold mb-2">Detalhes</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Valor</span>
                        <span className="text-green-500 font-semibold">
                          {formatarValor(selectedCodigo.valor, selectedCodigo.tipo)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Valor mínimo</span>
                        <span className="text-sss-white">{selectedCodigo.valorMinimo} Sementes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Valor máximo</span>
                        <span className="text-sss-white">{selectedCodigo.valorMaximo} Sementes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Usos restantes</span>
                        <span className="text-sss-white">{selectedCodigo.maxUsos - selectedCodigo.usos}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Válido até: {formatarData(selectedCodigo.dataFim)}</span>
                    <span>Categoria: {selectedCodigo.categoria}</span>
                  </div>

                  {selectedCodigo.criadorNome && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 text-sm">
                          Código exclusivo do criador: {selectedCodigo.criadorNome}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => resgatarCodigo(selectedCodigo.id)}
                    disabled={resgateLoading}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
                  >
                    {resgateLoading ? 'Processando...' : 'Resgatar Cashback'}
                  </button>

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