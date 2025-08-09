import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  BellIcon, 
  ArrowLeftIcon, 
  CheckIcon,
  XMarkIcon,
  HeartIcon,
  GiftIcon,
  TrophyIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'
import PushNotifications from '../components/PushNotifications'

export default function Notificacoes() {
  const [user, setUser] = useState<User | null>(null)
  const [notificacoes, setNotificacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todas')

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    setUser(currentUser)
  }, [])

  useEffect(() => {
    if (user) {
      loadNotificacoes()
    }
  }, [user])

  const loadNotificacoes = async () => {
    try {
      const response = await fetch(`/api/notificacoes?usuarioId=${user?.id}`)
      const data = await response.json()
      if (response.ok) {
        setNotificacoes(data.notificacoes)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLida = async (notificacaoId: string) => {
    try {
      const response = await fetch(`/api/notificacoes/${notificacaoId}/ler`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        // Atualizar estado local
        setNotificacoes(prev => 
          prev.map(n => 
            n.id === notificacaoId ? { ...n, lida: true } : n
          )
        )
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  const marcarTodasComoLidas = async () => {
    try {
      const response = await fetch(`/api/notificacoes/ler-todas`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuarioId: user?.id })
      })
      
      if (response.ok) {
        setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const getIconeNotificacao = (tipo: string) => {
    switch (tipo) {
      case 'doacao':
        return <HeartIcon className="w-5 h-5 text-red-500" />
      case 'cashback':
        return <GiftIcon className="w-5 h-5 text-green-500" />
      case 'ranking':
        return <TrophyIcon className="w-5 h-5 text-yellow-500" />
      case 'sistema':
        return <ExclamationTriangleIcon className="w-5 h-5 text-blue-500" />
      default:
        return <BellIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getCorNotificacao = (tipo: string) => {
    switch (tipo) {
      case 'doacao':
        return 'border-l-red-500'
      case 'cashback':
        return 'border-l-green-500'
      case 'ranking':
        return 'border-l-yellow-500'
      case 'sistema':
        return 'border-l-blue-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const notificacoesFiltradas = filter === 'todas' 
    ? notificacoes 
    : notificacoes.filter(n => n.tipo === filter)

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length

  if (!user) {
    return null
  }

  const filtros = [
    { id: 'todas', label: 'Todas', count: notificacoes.length },
    { id: 'doacao', label: 'Doações', count: notificacoes.filter(n => n.tipo === 'doacao').length },
    { id: 'cashback', label: 'Cashback', count: notificacoes.filter(n => n.tipo === 'cashback').length },
    { id: 'ranking', label: 'Ranking', count: notificacoes.filter(n => n.tipo === 'ranking').length },
    { id: 'sistema', label: 'Sistema', count: notificacoes.filter(n => n.tipo === 'sistema').length }
  ]

  return (
    <>
      <Head>
        <title>Notificações - SementesPLAY</title>
        <meta name="description" content="Suas notificações SementesPLAY" />
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
                  <p className="text-sm text-gray-300">Notificações</p>
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
                <h2 className="text-2xl font-bold text-sss-white">Notificações</h2>
                <p className="text-gray-300">
                  {notificacoesNaoLidas} não lida{notificacoesNaoLidas !== 1 ? 's' : ''}
                </p>
              </div>
              
              {notificacoesNaoLidas > 0 && (
                <button
                  onClick={marcarTodasComoLidas}
                  className="bg-sss-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  aria-label="Marcar todas as notificações como lidas"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* Configurações de Notificações */}
            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-sss-white mb-1">⚙️ Configurações</h3>
                  <p className="text-gray-400 text-sm">Configure suas preferências de notificação e som</p>
                </div>
              </div>
              
              {/* Componente de configurações */}
              <div className="flex justify-center">
                <PushNotifications inline={true} />
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
              <div className="flex flex-wrap gap-2">
                {filtros.map((filtro) => (
                  <button
                    key={filtro.id}
                    onClick={() => setFilter(filtro.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === filtro.id
                        ? 'bg-sss-accent text-white'
                        : 'bg-sss-dark text-gray-300 hover:text-sss-white'
                    }`}
                    aria-label={`Filtrar por ${filtro.label} (${filtro.count} itens)`}
                  >
                    {filtro.label} ({filtro.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Notificações */}
            <div className="bg-sss-medium rounded-lg border border-sss-light">
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
                <div className="divide-y divide-sss-light">
                  {notificacoesFiltradas.map((notificacao) => (
                    <motion.div
                      key={notificacao.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 border-l-4 ${getCorNotificacao(notificacao.tipo)} ${
                        !notificacao.lida ? 'bg-sss-accent/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="mt-1">
                            {getIconeNotificacao(notificacao.tipo)}
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold ${
                              !notificacao.lida ? 'text-sss-white' : 'text-gray-300'
                            }`}>
                              {notificacao.titulo}
                            </h3>
                            <p className="text-gray-400 text-sm mt-1">
                              {notificacao.mensagem}
                            </p>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(notificacao.data).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!notificacao.lida && (
                            <button
                              onClick={() => marcarComoLida(notificacao.id)}
                              className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                              title="Marcar como lida"
                              aria-label="Marcar notificação como lida"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 