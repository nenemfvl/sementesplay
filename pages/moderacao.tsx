import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheckIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  FlagIcon,
  EyeIcon,
  NoSymbolIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'

interface Denuncia {
  id: string
  tipo: 'conteudo' | 'usuario' | 'spam' | 'inadequado' | 'outro'
  categoria: string
  descricao: string
  denunciante: string
  denunciado: string
  conteudo?: string
  status: 'pendente' | 'em_analise' | 'resolvida' | 'rejeitada'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  dataDenuncia: Date
  dataResolucao?: Date
  moderador?: string
  acao?: string
  observacoes?: string
}

interface TicketSuporte {
  id: string
  usuario: string
  categoria: string
  titulo: string
  descricao: string
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  dataCriacao: Date
  dataResolucao?: Date
  agente?: string
  mensagens: MensagemSuporte[]
}

interface MensagemSuporte {
  id: string
  autor: string
  conteudo: string
  timestamp: Date
  tipo: 'usuario' | 'agente'
}

interface AcaoModerativa {
  id: string
  tipo: 'advertencia' | 'suspensao' | 'banimento' | 'remocao_conteudo'
  usuario: string
  motivo: string
  duracao?: number // em dias
  moderador: string
  dataAcao: Date
  status: 'ativa' | 'expirada' | 'revogada'
  observacoes?: string
}

export default function Moderacao() {
  const [user, setUser] = useState<User | null>(null)
  const [denuncias, setDenuncias] = useState<Denuncia[]>([])
  const [tickets, setTickets] = useState<TicketSuporte[]>([])
  const [acoes, setAcoes] = useState<AcaoModerativa[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<TicketSuporte | null>(null)
  const [showDenunciaModal, setShowDenunciaModal] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [novaMensagem, setNovaMensagem] = useState('')

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    
    // Verificar se é moderador ou admin
    if (Number(currentUser.nivel) < 4) {
      alert('Acesso negado. Apenas moderadores e administradores podem acessar esta área.')
      window.location.href = '/dashboard'
      return
    }
    
    setUser(currentUser)
    loadModeracaoData()
  }, [])

  const loadModeracaoData = async () => {
    try {
      const [denunciasRes, ticketsRes, acoesRes] = await Promise.all([
        fetch('/api/moderacao/denuncias'),
        fetch('/api/moderacao/tickets'),
        fetch('/api/moderacao/acoes')
      ])

      if (denunciasRes.ok) {
        const denunciasData = await denunciasRes.json()
        setDenuncias(denunciasData.denuncias)
      }

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json()
        setTickets(ticketsData.tickets)
      }

      if (acoesRes.ok) {
        const acoesData = await acoesRes.json()
        setAcoes(acoesData.acoes)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de moderação:', error)
    } finally {
      setLoading(false)
    }
  }

  const resolverDenuncia = async (denunciaId: string, acao: string, observacoes?: string) => {
    try {
      const response = await fetch(`/api/moderacao/denuncias/${denunciaId}/resolver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ acao, observacoes })
      })

      if (response.ok) {
        alert('Denúncia resolvida com sucesso!')
        loadModeracaoData()
        setShowDenunciaModal(false)
      } else {
        alert('Erro ao resolver denúncia')
      }
    } catch (error) {
      console.error('Erro ao resolver denúncia:', error)
      alert('Erro ao resolver denúncia')
    }
  }

  const aplicarAcaoModerativa = async (usuarioId: string, tipo: string, motivo: string, duracao?: number) => {
    try {
      const response = await fetch('/api/moderacao/acoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuarioId, tipo, motivo, duracao })
      })

      if (response.ok) {
        alert('Ação moderativa aplicada com sucesso!')
        loadModeracaoData()
      } else {
        alert('Erro ao aplicar ação moderativa')
      }
    } catch (error) {
      console.error('Erro ao aplicar ação moderativa:', error)
      alert('Erro ao aplicar ação moderativa')
    }
  }

  const responderTicket = async (ticketId: string) => {
    if (!novaMensagem.trim()) return

    try {
      const response = await fetch(`/api/moderacao/tickets/${ticketId}/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mensagem: novaMensagem })
      })

      if (response.ok) {
        setNovaMensagem('')
        loadModeracaoData()
      } else {
        alert('Erro ao enviar resposta')
      }
    } catch (error) {
      console.error('Erro ao enviar resposta:', error)
      alert('Erro ao enviar resposta')
    }
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'baixa': return 'bg-green-500'
      case 'media': return 'bg-yellow-500'
      case 'alta': return 'bg-orange-500'
      case 'critica': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500'
      case 'em_analise': return 'bg-blue-500'
      case 'resolvida': return 'bg-green-500'
      case 'rejeitada': return 'bg-red-500'
      case 'aberto': return 'bg-yellow-500'
      case 'em_andamento': return 'bg-blue-500'
      case 'resolvido': return 'bg-green-500'
      case 'fechado': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'conteudo': return 'bg-blue-500'
      case 'usuario': return 'bg-purple-500'
      case 'spam': return 'bg-orange-500'
      case 'inadequado': return 'bg-red-500'
      case 'outro': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const denunciasPendentes = denuncias.filter(d => d.status === 'pendente').length
  const ticketsAbertos = tickets.filter(t => t.status === 'aberto').length
  const acoesAtivas = acoes.filter(a => a.status === 'ativa').length

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Painel de Moderação - SementesPLAY</title>
        <meta name="description" content="Sistema de moderação e suporte" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="inline-flex items-center text-sss-accent hover:text-red-400">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-blue-400">Painel de Moderação</p>
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
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-sss-white">Painel de Moderação</h2>
                <p className="text-gray-400">Gerencie denúncias, suporte e ações moderativas</p>
              </div>
              <div className="text-right">
                <p className="text-sss-white font-semibold">Moderador: {user.nome}</p>
                <p className="text-sm text-gray-400">Nível {user.nivel}</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-sss-medium rounded-lg p-6 border border-sss-light"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Denúncias Pendentes</p>
                    <p className="text-2xl font-bold text-sss-white">{denunciasPendentes}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <FlagIcon className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-sss-medium rounded-lg p-6 border border-sss-light"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Tickets Abertos</p>
                    <p className="text-2xl font-bold text-sss-white">{ticketsAbertos}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <ChatBubbleLeftIcon className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-sss-medium rounded-lg p-6 border border-sss-light"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Ações Ativas</p>
                    <p className="text-2xl font-bold text-sss-white">{acoesAtivas}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-sss-medium rounded-lg p-6 border border-sss-light"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Resolvido</p>
                    <p className="text-2xl font-bold text-sss-white">{denuncias.filter(d => d.status === 'resolvida').length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Tabs */}
            <div className="bg-sss-medium rounded-lg p-1">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-sss-accent text-white'
                      : 'text-gray-400 hover:text-sss-white'
                  }`}
                >
                  <ChartBarIcon className="w-4 h-4 inline mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('denuncias')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'denuncias'
                      ? 'bg-sss-accent text-white'
                      : 'text-gray-400 hover:text-sss-white'
                  }`}
                >
                  <FlagIcon className="w-4 h-4 inline mr-2" />
                  Denúncias
                </button>
                <button
                  onClick={() => setActiveTab('suporte')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'suporte'
                      ? 'bg-sss-accent text-white'
                      : 'text-gray-400 hover:text-sss-white'
                  }`}
                >
                  <ChatBubbleLeftIcon className="w-4 h-4 inline mr-2" />
                  Suporte
                </button>
                <button
                  onClick={() => setActiveTab('acoes')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'acoes'
                      ? 'bg-sss-accent text-white'
                      : 'text-gray-400 hover:text-sss-white'
                  }`}
                >
                  <ShieldCheckIcon className="w-4 h-4 inline mr-2" />
                  Ações
                </button>
              </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Denúncias Recentes */}
                  <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Denúncias Recentes</h3>
                    <div className="space-y-3">
                      {denuncias.slice(0, 5).map((denuncia) => (
                        <div key={denuncia.id} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(denuncia.tipo)} text-white`}>
                              {denuncia.tipo}
                            </span>
                            <div>
                              <p className="text-sss-white font-medium">{denuncia.denunciado}</p>
                              <p className="text-gray-400 text-sm">{denuncia.descricao.substring(0, 50)}...</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(denuncia.prioridade)} text-white`}>
                              {denuncia.prioridade}
                            </span>
                            <p className="text-gray-400 text-xs mt-1">
                              {new Date(denuncia.dataDenuncia).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tickets Urgentes */}
                  <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Tickets Urgentes</h3>
                    <div className="space-y-3">
                      {tickets.filter(t => t.prioridade === 'alta' || t.prioridade === 'critica').slice(0, 3).map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                          <div>
                            <p className="text-sss-white font-medium">{ticket.titulo}</p>
                            <p className="text-gray-400 text-sm">{ticket.usuario}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(ticket.prioridade)} text-white`}>
                              {ticket.prioridade}
                            </span>
                            <p className="text-gray-400 text-xs mt-1">
                              {new Date(ticket.dataCriacao).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'denuncias' && (
                <motion.div
                  key="denuncias"
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
                              Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Denunciado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Descrição
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Prioridade
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
                          {denuncias.map((denuncia) => (
                            <tr key={denuncia.id} className="hover:bg-sss-dark transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(denuncia.tipo)} text-white`}>
                                  {denuncia.tipo}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-sss-white">{denuncia.denunciado}</div>
                                <div className="text-sm text-gray-400">por {denuncia.denunciante}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-300 max-w-xs truncate">{denuncia.descricao}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(denuncia.prioridade)} text-white`}>
                                  {denuncia.prioridade}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(denuncia.status)} text-white`}>
                                  {denuncia.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {new Date(denuncia.dataDenuncia).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => {
                                    setSelectedDenuncia(denuncia)
                                    setShowDenunciaModal(true)
                                  }}
                                  className="text-sss-accent hover:text-red-400 mr-3"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                                {denuncia.status === 'pendente' && (
                                  <>
                                    <button
                                      onClick={() => resolverDenuncia(denuncia.id, 'advertencia')}
                                      className="text-yellow-500 hover:text-yellow-400 mr-3"
                                    >
                                      <ExclamationTriangleIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => resolverDenuncia(denuncia.id, 'suspensao')}
                                      className="text-orange-500 hover:text-orange-400 mr-3"
                                    >
                                      <NoSymbolIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => resolverDenuncia(denuncia.id, 'banimento')}
                                      className="text-red-500 hover:text-red-400"
                                    >
                                      <NoSymbolIcon className="w-4 h-4" />
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

              {activeTab === 'suporte' && (
                <motion.div
                  key="suporte"
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
                              Ticket
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Usuário
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Categoria
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Título
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Prioridade
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sss-light">
                          {tickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-sss-dark transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-sss-white">#{ticket.id}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-sss-white">{ticket.usuario}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-300">{ticket.categoria}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-300 max-w-xs truncate">{ticket.titulo}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(ticket.prioridade)} text-white`}>
                                  {ticket.prioridade}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)} text-white`}>
                                  {ticket.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => {
                                    setSelectedTicket(ticket)
                                    setShowTicketModal(true)
                                  }}
                                  className="text-sss-accent hover:text-red-400"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'acoes' && (
                <motion.div
                  key="acoes"
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
                              Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Usuário
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Motivo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Moderador
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Data
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sss-light">
                          {acoes.map((acao) => (
                            <tr key={acao.id} className="hover:bg-sss-dark transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  acao.tipo === 'advertencia' ? 'bg-yellow-500' :
                                  acao.tipo === 'suspensao' ? 'bg-orange-500' :
                                  acao.tipo === 'banimento' ? 'bg-red-500' : 'bg-gray-500'
                                } text-white`}>
                                  {acao.tipo}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-sss-white">{acao.usuario}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-300 max-w-xs truncate">{acao.motivo}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-300">{acao.moderador}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  acao.status === 'ativa' ? 'bg-green-500' :
                                  acao.status === 'expirada' ? 'bg-gray-500' : 'bg-red-500'
                                } text-white`}>
                                  {acao.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {new Date(acao.dataAcao).toLocaleDateString('pt-BR')}
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

        {/* Modal Detalhes da Denúncia */}
        {showDenunciaModal && selectedDenuncia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-sss-medium rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-sss-white">Detalhes da Denúncia</h3>
                  <button
                    onClick={() => setShowDenunciaModal(false)}
                    className="text-gray-400 hover:text-sss-white"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-sss-dark rounded-lg p-4">
                      <h4 className="font-semibold text-sss-white mb-2">Informações</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tipo:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(selectedDenuncia.tipo)} text-white`}>
                            {selectedDenuncia.tipo}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Prioridade:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(selectedDenuncia.prioridade)} text-white`}>
                            {selectedDenuncia.prioridade}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDenuncia.status)} text-white`}>
                            {selectedDenuncia.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-sss-dark rounded-lg p-4">
                      <h4 className="font-semibold text-sss-white mb-2">Usuários</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Denunciante:</span>
                          <span className="text-sss-white">{selectedDenuncia.denunciante}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Denunciado:</span>
                          <span className="text-sss-white">{selectedDenuncia.denunciado}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Data:</span>
                          <span className="text-sss-white">{new Date(selectedDenuncia.dataDenuncia).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-sss-dark rounded-lg p-4">
                    <h4 className="font-semibold text-sss-white mb-2">Descrição</h4>
                    <p className="text-gray-300">{selectedDenuncia.descricao}</p>
                  </div>

                  {selectedDenuncia.status === 'pendente' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => resolverDenuncia(selectedDenuncia.id, 'advertencia')}
                        className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <ExclamationTriangleIcon className="w-5 h-5 inline mr-2" />
                        Advertência
                      </button>
                      <button
                        onClick={() => resolverDenuncia(selectedDenuncia.id, 'suspensao')}
                        className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <NoSymbolIcon className="w-5 h-5 inline mr-2" />
                        Suspensão
                      </button>
                      <button
                        onClick={() => resolverDenuncia(selectedDenuncia.id, 'banimento')}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <NoSymbolIcon className="w-5 h-5 inline mr-2" />
                        Banimento
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal Detalhes do Ticket */}
        {showTicketModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-sss-medium rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-sss-white">Ticket #{selectedTicket.id}</h3>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="text-gray-400 hover:text-sss-white"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-sss-dark rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-sss-white mb-2">{selectedTicket.titulo}</h4>
                      <p className="text-gray-300">{selectedTicket.descricao}</p>
                    </div>

                    <div className="bg-sss-dark rounded-lg p-4">
                      <h4 className="font-semibold text-sss-white mb-4">Conversa</h4>
                      <div className="space-y-4 max-h-64 overflow-y-auto">
                        {selectedTicket.mensagens.map((mensagem) => (
                          <div key={mensagem.id} className={`flex ${mensagem.tipo === 'agente' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs p-3 rounded-lg ${
                              mensagem.tipo === 'agente' 
                                ? 'bg-sss-accent text-white' 
                                : 'bg-sss-medium text-gray-300'
                            }`}>
                              <p className="text-sm">{mensagem.conteudo}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(mensagem.timestamp).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <input
                          type="text"
                          value={novaMensagem}
                          onChange={(e) => setNovaMensagem(e.target.value)}
                          placeholder="Digite sua resposta..."
                          className="flex-1 px-3 py-2 bg-sss-medium border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                        />
                        <button
                          onClick={() => responderTicket(selectedTicket.id)}
                          className="px-4 py-2 bg-sss-accent hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          Enviar
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-sss-dark rounded-lg p-4">
                      <h4 className="font-semibold text-sss-white mb-3">Informações</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Usuário:</span>
                          <span className="text-sss-white">{selectedTicket.usuario}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Categoria:</span>
                          <span className="text-sss-white">{selectedTicket.categoria}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)} text-white`}>
                            {selectedTicket.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Prioridade:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(selectedTicket.prioridade)} text-white`}>
                            {selectedTicket.prioridade}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Criado em:</span>
                          <span className="text-sss-white">{new Date(selectedTicket.dataCriacao).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-sss-dark rounded-lg p-4">
                      <h4 className="font-semibold text-sss-white mb-3">Ações</h4>
                      <div className="space-y-2">
                        <button className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                          Marcar como Resolvido
                        </button>
                        <button className="w-full py-2 px-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors">
                          Fechar Ticket
                        </button>
                        <button className="w-full py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors">
                          Escalar para Admin
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  )
} 