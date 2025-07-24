import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  UserGroupIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  UserMinusIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'

interface Amigo {
  id: string
  nome: string
  email: string
  nivel: string
  sementes: number
  status: 'online' | 'offline' | 'away'
  ultimaAtividade: Date
  mutual: boolean
  solicitacaoPendente?: boolean
}

interface SolicitacaoAmizade {
  id: string
  remetenteId: string
  remetenteNome: string
  remetenteEmail: string
  dataEnvio: Date
  mensagem?: string
}

export default function Amigos() {
  const [user, setUser] = useState<User | null>(null)
  const [amigos, setAmigos] = useState<Amigo[]>([])
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAmizade[]>([])
  const [usuariosSugeridos, setUsuariosSugeridos] = useState<Amigo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('amigos')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')

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
      loadDados()
    }
  }, [user])

  const loadDados = async () => {
    try {
      const token = localStorage.getItem('sementesplay_token')
      const [amigosResponse, solicitacoesResponse, sugeridosResponse] = await Promise.all([
        fetch(`/api/amigos?usuarioId=${user?.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }),
        fetch(`/api/amigos/solicitacoes?usuarioId=${user?.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }),
        fetch(`/api/amigos/sugeridos?usuarioId=${user?.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
      ])

      if (amigosResponse.ok) {
        const data = await amigosResponse.json()
        setAmigos(data.amigos)
      }

      if (solicitacoesResponse.ok) {
        const data = await solicitacoesResponse.json()
        setSolicitacoes(data.solicitacoes)
      }

      if (sugeridosResponse.ok) {
        const data = await sugeridosResponse.json()
        setUsuariosSugeridos(data.usuarios)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const enviarSolicitacao = async (amigoId: string) => {
    if (!user || !user.id) {
      alert('Usuário não autenticado. Faça login novamente.');
      return;
    }
    try {
      const token = localStorage.getItem('sementesplay_token')
      const response = await fetch('/api/amigos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          usuarioId: user.id,
          amigoId
        })
      })

      if (response.ok) {
        alert('Solicitação de amizade enviada!')
        loadDados()
      } else {
        const erro = await response.json();
        alert(erro.error || 'Erro ao enviar solicitação')
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error)
      alert('Erro ao enviar solicitação')
    }
  }

  const aceitarSolicitacao = async (solicitacaoId: string) => {
    try {
      const token = localStorage.getItem('sementesplay_token')
      const response = await fetch(`/api/amigos/solicitacoes/${solicitacaoId}/aceitar`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (response.ok) {
        alert('Solicitação aceita!')
        loadDados()
      } else {
        alert('Erro ao aceitar solicitação')
      }
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error)
      alert('Erro ao aceitar solicitação')
    }
  }

  const rejeitarSolicitacao = async (solicitacaoId: string) => {
    try {
      const token = localStorage.getItem('sementesplay_token')
      const response = await fetch(`/api/amigos/solicitacoes/${solicitacaoId}/rejeitar`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (response.ok) {
        alert('Solicitação rejeitada')
        loadDados()
      } else {
        alert('Erro ao rejeitar solicitação')
      }
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error)
      alert('Erro ao rejeitar solicitação')
    }
  }

  const removerAmigo = async (amigoId: string) => {
    if (!confirm('Tem certeza que deseja remover este amigo?')) return

    try {
      const token = localStorage.getItem('sementesplay_token')
      const response = await fetch(`/api/amigos/${amigoId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (response.ok) {
        alert('Amigo removido')
        loadDados()
      } else {
        alert('Erro ao remover amigo')
      }
    } catch (error) {
      console.error('Erro ao remover amigo:', error)
      alert('Erro ao remover amigo')
    }
  }

  const filtrarAmigos = () => {
    return amigos.filter(amigo => {
      const matchSearch = amigo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         amigo.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = filterStatus === 'todos' || amigo.status === filterStatus
      
      return matchSearch && matchStatus
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'away':
        return 'Ausente'
      case 'offline':
        return 'Offline'
      default:
        return 'Desconhecido'
    }
  }

  const formatarTempo = (data: Date) => {
    const agora = new Date()
    const diff = agora.getTime() - new Date(data).getTime()
    const minutos = Math.floor(diff / (1000 * 60))
    const horas = Math.floor(minutos / 60)
    const dias = Math.floor(horas / 24)

    if (dias > 0) return `${dias}d atrás`
    if (horas > 0) return `${horas}h atrás`
    if (minutos > 0) return `${minutos}m atrás`
    return 'Agora'
  }

  const amigosFiltrados = filtrarAmigos()

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'amigos', label: 'Amigos', count: amigos.length },
    { id: 'solicitacoes', label: 'Solicitações', count: solicitacoes.length },
    { id: 'sugeridos', label: 'Sugeridos', count: usuariosSugeridos.length }
  ]

  return (
    <>
      <Head>
        <title>Amigos - SementesPLAY</title>
        <meta name="description" content="Gerencie seus amigos e seguidores" />
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
                <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🌱</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-gray-300">Amigos e Seguidores</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <div className="w-20 h-20 bg-sss-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-10 h-10 text-sss-accent" />
              </div>
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Amigos e Seguidores
              </h2>
              <p className="text-gray-400">
                Conecte-se com outros membros da comunidade
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-sss-medium rounded-lg border border-sss-light">
              <div className="border-b border-sss-light">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-sss-accent text-sss-accent'
                          : 'border-transparent text-gray-300 hover:text-sss-white'
                      }`}
                    >
                      <UserGroupIcon className="w-5 h-5" />
                      <span>{tab.label}</span>
                      <span className="bg-sss-dark text-xs px-2 py-1 rounded-full">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'amigos' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Buscar
                        </label>
                        <div className="relative">
                          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Nome ou email..."
                            className="w-full pl-10 pr-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Status
                        </label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                        >
                          <option value="todos">Todos os status</option>
                          <option value="online">Online</option>
                          <option value="away">Ausente</option>
                          <option value="offline">Offline</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setSearchTerm('')
                            setFilterStatus('todos')
                          }}
                          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                          Limpar Filtros
                        </button>
                      </div>
                    </div>

                    {/* Lista de Amigos */}
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sss-accent mx-auto"></div>
                          <p className="text-gray-400 mt-2">Carregando amigos...</p>
                        </div>
                      ) : amigosFiltrados.length === 0 ? (
                        <div className="text-center py-8">
                          <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400">Nenhum amigo encontrado</p>
                        </div>
                      ) : (
                        amigosFiltrados.map((amigo) => (
                          <motion.div
                            key={amigo.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-4 bg-sss-dark rounded-lg border border-sss-light"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <div className="w-12 h-12 bg-sss-accent/20 rounded-full flex items-center justify-center">
                                  <span className="text-lg">👤</span>
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(amigo.status)} rounded-full border-2 border-sss-dark`}></div>
                              </div>
                              
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="text-sss-white font-semibold">{amigo.nome}</h3>
                                  {amigo.mutual && (
                                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                      Mutual
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-400 text-sm">{amigo.email}</p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-xs text-gray-500">
                                    Nível {amigo.nivel}
                                  </span>
                                  <span className="text-xs text-sss-accent">
                                    {amigo.sementes} 🌱
                                  </span>
                                  <span className={`text-xs ${amigo.status === 'online' ? 'text-green-500' : amigo.status === 'away' ? 'text-yellow-500' : 'text-gray-500'}`}>
                                    {getStatusText(amigo.status)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/chat?user=${amigo.id}`}
                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="Enviar mensagem"
                              >
                                <ChatBubbleLeftIcon className="w-5 h-5" />
                              </Link>
                              
                              <Link
                                href={`/perfil/${amigo.id}`}
                                className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                                title="Ver perfil"
                              >
                                <UserGroupIcon className="w-5 h-5" />
                              </Link>
                              
                              <button
                                onClick={() => removerAmigo(amigo.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Remover amigo"
                              >
                                <UserMinusIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'solicitacoes' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {solicitacoes.length === 0 ? (
                      <div className="text-center py-8">
                        <UserPlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400">Nenhuma solicitação pendente</p>
                      </div>
                    ) : (
                      solicitacoes.map((solicitacao) => (
                        <motion.div
                          key={solicitacao.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-4 bg-sss-dark rounded-lg border border-sss-light"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-sss-accent/20 rounded-full flex items-center justify-center">
                              <span className="text-lg">👤</span>
                            </div>
                            
                            <div>
                              <h3 className="text-sss-white font-semibold">{solicitacao.remetenteNome}</h3>
                              <p className="text-gray-400 text-sm">{solicitacao.remetenteEmail}</p>
                              {solicitacao.mensagem && (
                                <p className="text-gray-300 text-sm mt-1">"{solicitacao.mensagem}"</p>
                              )}
                              <p className="text-gray-500 text-xs mt-1">
                                {formatarTempo(solicitacao.dataEnvio)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => aceitarSolicitacao(solicitacao.id)}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                              title="Aceitar"
                            >
                              <CheckIcon className="w-5 h-5" />
                            </button>
                            
                            <button
                              onClick={() => rejeitarSolicitacao(solicitacao.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Rejeitar"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === 'sugeridos' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {usuariosSugeridos.length === 0 ? (
                      <div className="text-center py-8">
                        <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400">Nenhuma sugestão disponível</p>
                      </div>
                    ) : (
                      usuariosSugeridos.map((usuario) => (
                        <motion.div
                          key={usuario.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-4 bg-sss-dark rounded-lg border border-sss-light"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-sss-accent/20 rounded-full flex items-center justify-center">
                              <span className="text-lg">👤</span>
                            </div>
                            
                            <div>
                              <h3 className="text-sss-white font-semibold">{usuario.nome}</h3>
                              <p className="text-gray-400 text-sm">{usuario.email}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-500">
                                  Nível {usuario.nivel}
                                </span>
                                <span className="text-xs text-sss-accent">
                                  {usuario.sementes} 🌱
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/perfil/${usuario.id}`}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Ver perfil"
                            >
                              <UserGroupIcon className="w-5 h-5" />
                            </Link>
                            
                            <button
                              onClick={() => enviarSolicitacao(usuario.id)}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                              title="Adicionar amigo"
                            >
                              <UserPlusIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 