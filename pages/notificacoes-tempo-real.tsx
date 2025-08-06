import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BellIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'

interface NotificacaoTempoReal {
  id: string
  tipo: 'info' | 'success' | 'warning' | 'error' | 'doacao' | 'cashback' | 'missao' | 'ranking'
  titulo: string
  mensagem: string
  timestamp: Date
  lida: boolean
  dados?: any
  acao?: {
    texto: string
    url: string
  }
}

export default function NotificacoesTempoReal() {
  const [user, setUser] = useState<User | null>(null)
  const [notificacoes, setNotificacoes] = useState<NotificacaoTempoReal[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('todas')
  const [somAtivo, setSomAtivo] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)
  const wsRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    setUser(currentUser)
    loadNotificacoes()
    setupWebSocket()
    setupAudio()

    return () => {
      if (wsRef.current && typeof wsRef.current.close === 'function') {
        wsRef.current.close()
      }
    }
  }, [])

  const setupAudio = () => {
    audioRef.current = new Audio('/notification-sound.mp3')
    audioRef.current.volume = 0.3
  }

  const setupWebSocket = () => {
    // Simular WebSocket para demonstração
    // Em produção, você usaria um WebSocket real
    const mockWebSocket = {
      onmessage: (event: any) => {
        // Simular mensagens em tempo real
        setTimeout(() => {
          const novaNotificacao: NotificacaoTempoReal = {
            id: Date.now().toString(),
            tipo: 'doacao',
            titulo: 'Nova Doação!',
            mensagem: 'Você recebeu uma doação de 500 Sementes!',
            timestamp: new Date(),
            lida: false,
            dados: { quantidade: 500, doador: 'João Silva' }
          }
          adicionarNotificacao(novaNotificacao)
        }, 5000)

        setTimeout(() => {
          const novaNotificacao: NotificacaoTempoReal = {
            id: (Date.now() + 1).toString(),
            tipo: 'missao',
            titulo: 'Missão Completada!',
            mensagem: 'Você completou a missão "Primeira Doação"!',
            timestamp: new Date(),
            lida: false,
            dados: { missao: 'Primeira Doação', recompensa: 1000 }
          }
          adicionarNotificacao(novaNotificacao)
        }, 15000)
      },
      close: () => {

      }
    }

    wsRef.current = mockWebSocket as any
    setWsConnected(true)
  }

  const loadNotificacoes = async () => {
    try {
      const response = await fetch('/api/notificacoes')
      const data = await response.json()
      if (response.ok) {
        setNotificacoes(data.notificacoes.map((n: any) => ({
          ...n,
          timestamp: new Date(n.data)
        })))
      }
    } catch (error) {
      // COMENTADO: Log de debug - não afeta funcionalidade
      // console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const adicionarNotificacao = (notificacao: NotificacaoTempoReal) => {
    setNotificacoes(prev => [notificacao, ...prev])
    
    if (somAtivo && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }

    // Mostrar toast notification
    mostrarToast(notificacao)
  }

  const mostrarToast = (notificacao: NotificacaoTempoReal) => {
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`
    
    const bgColor = {
      info: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      doacao: 'bg-purple-500',
      cashback: 'bg-green-500',
      missao: 'bg-yellow-500',
      ranking: 'bg-blue-500'
    }[notificacao.tipo] || 'bg-gray-500'

    toast.className += ` ${bgColor} text-white`
    
    toast.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          ${getIconeNotificacao(notificacao.tipo)}
        </div>
        <div class="flex-1">
          <h4 class="font-semibold">${notificacao.titulo}</h4>
          <p class="text-sm opacity-90">${notificacao.mensagem}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `
    
    document.body.appendChild(toast)
    
    // Animar entrada
    setTimeout(() => {
      toast.classList.remove('translate-x-full')
    }, 100)
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
      toast.classList.add('translate-x-full')
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast)
        }
      }, 300)
    }, 5000)
  }

  const marcarComoLida = async (id: string) => {
    try {
      const response = await fetch(`/api/notificacoes/${id}/ler`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setNotificacoes(prev => 
          prev.map(n => n.id === id ? { ...n, lida: true } : n)
        )
      }
    } catch (error) {
      // COMENTADO: Log de debug - não afeta funcionalidade
      // console.error('Erro ao marcar como lida:', error)
    }
  }

  const marcarTodasComoLidas = async () => {
    try {
      const response = await fetch('/api/notificacoes/ler-todas', {
        method: 'POST'
      })
      
      if (response.ok) {
        setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
      }
    } catch (error) {
      // COMENTADO: Log de debug - não afeta funcionalidade
      // console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const deletarNotificacao = async (id: string) => {
    try {
      const response = await fetch(`/api/notificacoes/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotificacoes(prev => prev.filter(n => n.id !== id))
      }
    } catch (error) {
      // COMENTADO: Log de debug - não afeta funcionalidade
      // console.error('Erro ao deletar notificação:', error)
    }
  }

  const getIconeNotificacao = (tipo: string) => {
    const iconClass = "w-5 h-5"
    switch (tipo) {
      case 'info':
        return `<svg class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
      case 'success':
        return `<svg class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
      case 'warning':
        return `<svg class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>`
      case 'error':
        return `<svg class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
      case 'doacao':
        return `<svg class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>`
      case 'cashback':
        return `<svg class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path></svg>`
      case 'missao':
        return `<svg class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>`
      case 'ranking':
        return `<svg class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`
      default:
        return `<svg class="${iconClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h10v-2H4v2zM4 11h14v-2H4v2zM4 7h18v-2H4v2z"></path></svg>`
    }
  }

  const getCorNotificacao = (tipo: string) => {
    switch (tipo) {
      case 'info':
        return 'border-l-blue-500 bg-blue-500/10'
      case 'success':
        return 'border-l-green-500 bg-green-500/10'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-500/10'
      case 'error':
        return 'border-l-red-500 bg-red-500/10'
      case 'doacao':
        return 'border-l-purple-500 bg-purple-500/10'
      case 'cashback':
        return 'border-l-green-500 bg-green-500/10'
      case 'missao':
        return 'border-l-yellow-500 bg-yellow-500/10'
      case 'ranking':
        return 'border-l-blue-500 bg-blue-500/10'
      default:
        return 'border-l-gray-500 bg-gray-500/10'
    }
  }

  const notificacoesFiltradas = notificacoes.filter(n => 
    filtroTipo === 'todas' || n.tipo === filtroTipo
  )

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Notificações em Tempo Real - SementesPLAY</title>
        <meta name="description" content="Notificações em tempo real" />
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
                  <p className="text-sm text-gray-300">Notificações em Tempo Real</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-sss-white">Notificações em Tempo Real</h2>
                <p className="text-gray-400">Receba atualizações instantâneas</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-400">
                    {wsConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                
                <div className="text-right">
                  <p className="text-sss-white font-semibold">{notificacoesNaoLidas}</p>
                  <p className="text-gray-400 text-sm">não lidas</p>
                </div>
              </div>
            </div>

            {/* Controles */}
            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="filtro-tipo" className="block text-sm font-medium text-gray-300 mb-2">
                    Filtrar por Tipo
                  </label>
                  <select
                    id="filtro-tipo"
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                    aria-label="Filtrar notificações por tipo"
                  >
                    <option value="todas">Todas as notificações</option>
                    <option value="info">Informações</option>
                    <option value="success">Sucessos</option>
                    <option value="warning">Avisos</option>
                    <option value="error">Erros</option>
                    <option value="doacao">Doações</option>
                    <option value="cashback">Cashbacks</option>
                    <option value="missao">Missões</option>
                    <option value="ranking">Rankings</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="som"
                    checked={somAtivo}
                    onChange={(e) => setSomAtivo(e.target.checked)}
                    className="w-4 h-4 text-sss-accent bg-sss-dark border-sss-light rounded focus:ring-sss-accent"
                  />
                  <label htmlFor="som" className="text-sm text-gray-300">
                    Som de notificação
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="autoScroll"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="w-4 h-4 text-sss-accent bg-sss-dark border-sss-light rounded focus:ring-sss-accent"
                  />
                  <label htmlFor="autoScroll" className="text-sm text-gray-300">
                    Auto-scroll
                  </label>
                </div>

                <div>
                  <button
                    onClick={marcarTodasComoLidas}
                    className="w-full px-4 py-2 bg-sss-accent hover:bg-red-600 text-white rounded-lg transition-colors"
                    aria-label="Marcar todas as notificações como lidas"
                  >
                    Marcar todas como lidas
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Notificações */}
            <div className="bg-sss-medium rounded-lg border border-sss-light overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sss-accent mx-auto"></div>
                  <p className="text-gray-400 mt-2">Carregando notificações...</p>
                </div>
              ) : notificacoesFiltradas.length === 0 ? (
                <div className="p-8 text-center">
                  <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Nenhuma notificação encontrada</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {notificacoesFiltradas.map((notificacao) => (
                      <motion.div
                        key={notificacao.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-4 border-l-4 ${getCorNotificacao(notificacao.tipo)} ${
                          !notificacao.lida ? 'bg-sss-accent/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="mt-1" dangerouslySetInnerHTML={{ 
                              __html: getIconeNotificacao(notificacao.tipo) 
                            }} />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className={`font-semibold ${
                                  !notificacao.lida ? 'text-sss-white' : 'text-gray-300'
                                }`}>
                                  {notificacao.titulo}
                                </h4>
                                {!notificacao.lida && (
                                  <div className="w-2 h-2 bg-sss-accent rounded-full"></div>
                                )}
                              </div>
                              <p className="text-gray-400 text-sm mt-1">
                                {notificacao.mensagem}
                              </p>
                              <p className="text-gray-500 text-xs mt-2">
                                {new Date(notificacao.timestamp).toLocaleString('pt-BR')}
                              </p>
                              {notificacao.acao && (
                                <Link 
                                  href={notificacao.acao.url}
                                  className="inline-block mt-2 text-sss-accent hover:text-red-400 text-sm"
                                >
                                  {notificacao.acao.texto} →
                                </Link>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!notificacao.lida && (
                              <button
                                onClick={() => marcarComoLida(notificacao.id)}
                                className="text-green-400 hover:text-green-300"
                                title="Marcar como lida"
                                aria-label="Marcar notificação como lida"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deletarNotificacao(notificacao.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Deletar"
                              aria-label="Deletar notificação"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400">
                    Total: {notificacoesFiltradas.length} notificações
                  </span>
                  <span className="text-gray-400">
                    Não lidas: {notificacoesNaoLidas}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-400">
                    WebSocket: {wsConnected ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 