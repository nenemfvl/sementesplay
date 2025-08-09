import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserGroupIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  CheckIcon,
  UserIcon
} from '@heroicons/react/24/outline'
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
}

interface SolicitacaoAmizade {
  id: string
  remetenteId: string
  remetenteNome: string
  remetenteEmail: string
  dataEnvio: Date
  mensagem?: string
}

interface UsuarioSugerido {
  id: string
  nome: string
  email: string
  nivel: string
  sementes: number
}

interface Mensagem {
  id: string
  remetenteId: string
  remetenteNome: string
  conteudo: string
  timestamp: Date
  lida: boolean
}

interface Conversa {
  id: string
  usuarioId: string
  usuarioNome: string
  ultimaMensagem: string
  ultimaAtividade: Date
  naoLidas: number
}

export default function FriendsChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [amigos, setAmigos] = useState<Amigo[]>([])
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [conversaAtiva, setConversaAtiva] = useState<Conversa | null>(null)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [onlineIds, setOnlineIds] = useState<string[]>([])
  const mensagensRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'amigos' | 'chat' | 'solicitacoes' | 'sugeridos' | 'buscar'>('amigos')
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAmizade[]>([])
  const [usuariosSugeridos, setUsuariosSugeridos] = useState<UsuarioSugerido[]>([])
  const [searchResults, setSearchResults] = useState<UsuarioSugerido[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (currentUser) {
      setUser(currentUser)
    }
  }, [])

  useEffect(() => {
    if (user && isOpen) {
      loadDados()
    }
  }, [user, isOpen])

  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight
    }
  }, [mensagens])

  // Polling para atualizar mensagens automaticamente
  useEffect(() => {
    if (!conversaAtiva || !conversaAtiva.id) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/chat/conversas/${conversaAtiva.id}/mensagens`)
        const data = await response.json()
        if (response.ok) {
          setMensagens(data.mensagens.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })))
        }
      } catch (error) {
        console.error('Erro ao atualizar mensagens:', error)
      }
    }, 2000) // Atualiza a cada 2 segundos

    return () => clearInterval(interval)
  }, [conversaAtiva])

  // Ping para marcar usuário como online
  useEffect(() => {
    if (!user) return
    const ping = () => {
      fetch('/api/chat/usuarios-online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
    }
    ping()
    const interval = setInterval(ping, 10000)
    return () => clearInterval(interval)
  }, [user])

  // Buscar usuários online
  useEffect(() => {
    const fetchOnline = async () => {
      try {
        const res = await fetch('/api/chat/usuarios-online')
        const data = await res.json()
        setOnlineIds(data.online || [])
      } catch (error) {
        console.error('Erro ao buscar usuários online:', error)
      }
    }
    fetchOnline()
    const interval = setInterval(fetchOnline, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadDados = async () => {
    if (!user) return
    setLoading(true)
    try {
      const token = localStorage.getItem('sementesplay_token')
      const [amigosResponse, conversasResponse, solicitacoesResponse, sugeridosResponse] = await Promise.all([
        fetch(`/api/amigos?usuarioId=${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }),
        fetch(`/api/chat/conversas?usuarioId=${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }),
        fetch(`/api/amigos/solicitacoes?usuarioId=${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }),
        fetch(`/api/amigos/sugeridos?usuarioId=${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
      ])

      if (amigosResponse.ok) {
        const data = await amigosResponse.json()
        setAmigos(data.amigos || [])
      }

      if (conversasResponse.ok) {
        const data = await conversasResponse.json()
        setConversas(data.conversas || [])
      }

      if (solicitacoesResponse.ok) {
        const data = await solicitacoesResponse.json()
        setSolicitacoes(data.solicitacoes || [])
      }

      if (sugeridosResponse.ok) {
        const data = await sugeridosResponse.json()
        setUsuariosSugeridos(data.usuarios || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const buscarUsuarios = async (q: string) => {
    if (!q || q.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const token = localStorage.getItem('sementesplay_token')
      const res = await fetch(`/api/usuarios?query=${encodeURIComponent(q)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const data = await res.json()
      setSearchResults(data.usuarios || [])
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setSearching(false)
    }
  }

  const enviarSolicitacao = async (amigoId: string) => {
    if (!user) return
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
        loadDados()
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error)
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
        loadDados()
      }
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error)
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
        loadDados()
      }
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error)
    }
  }

  const abrirConversa = async (conversa: Conversa) => {
    setConversaAtiva(conversa)
    setActiveTab('chat')
    
    try {
      // Se a conversa não tem ID (nova conversa), criar primeiro
      if (!conversa.id) {
        const createResponse = await fetch('/api/chat/conversas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('sementesplay_token')}`
          },
          body: JSON.stringify({
            usuario1Id: user?.id,
            usuario2Id: conversa.usuarioId
          })
        })

        if (createResponse.ok) {
          const createData = await createResponse.json()
          conversa.id = createData.id
          setConversaAtiva({...conversa, id: createData.id})
        } else {
          console.error('Erro ao criar conversa')
          return
        }
      }

      // Carregar mensagens da conversa
      const response = await fetch(`/api/chat/conversas/${conversa.id}/mensagens`)
      const data = await response.json()
      if (response.ok) {
        setMensagens(data.mensagens.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })))
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaAtiva || !user) return

    const conteudoMensagem = novaMensagem
    const mensagemLocal: Mensagem = {
      id: `temp-${Date.now()}`,
      remetenteId: user.id,
      remetenteNome: user.nome,
      conteudo: conteudoMensagem,
      timestamp: new Date(),
      lida: false
    }

    // Adiciona mensagem imediatamente ao estado local
    setMensagens(prev => [...prev, mensagemLocal])
    setNovaMensagem('')

    try {
      const response = await fetch(`/api/chat/conversas/${conversaAtiva.id}/mensagens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sementesplay_token')}`
        },
        body: JSON.stringify({
          conteudo: conteudoMensagem,
          tipo: 'texto'
        })
      })

      if (response.ok) {
        const responseData = await response.json()
        // Substitui a mensagem temporária pela mensagem real do servidor
        setMensagens(prev => {
          const semTemporaria = prev.filter(m => m.id !== mensagemLocal.id)
          return [...semTemporaria, {
            ...responseData.mensagem,
            timestamp: new Date(responseData.mensagem.timestamp)
          }]
        })
      } else {
        // Remove a mensagem se houve erro
        setMensagens(prev => prev.filter(m => m.id !== mensagemLocal.id))
        console.error('Erro ao enviar mensagem')
      }
    } catch (error) {
      // Remove a mensagem se houve erro
      setMensagens(prev => prev.filter(m => m.id !== mensagemLocal.id))
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const formatarTempo = (data: Date) => {
    const agora = new Date()
    const diff = agora.getTime() - new Date(data).getTime()
    const minutos = Math.floor(diff / 60000)
    const horas = Math.floor(diff / 3600000)
    const dias = Math.floor(diff / 86400000)

    if (minutos < 1) return 'Agora'
    if (minutos < 60) return `${minutos}m`
    if (horas < 24) return `${horas}h`
    return `${dias}d`
  }

  const amigosFiltrados = amigos.filter(amigo =>
    amigo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    amigo.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!user) return null

  return (
    <>
      {/* Botão flutuante */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-sss-accent hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <UserGroupIcon className="w-6 h-6" />
        {/* Badge para solicitações pendentes */}
        {solicitacoes.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {solicitacoes.length}
          </span>
        )}
      </motion.button>

      {/* Chat flutuante */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-20 right-4 z-50 w-80 h-96 bg-sss-medium rounded-lg shadow-2xl border border-sss-light flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-sss-light bg-sss-dark rounded-t-lg">
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="w-5 h-5 text-sss-accent" />
                <h3 className="text-sss-white font-semibold">Amigos</h3>
                {solicitacoes.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {solicitacoes.length}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab(activeTab === 'amigos' ? 'chat' : 'amigos')}
                  className="p-1 text-gray-400 hover:text-sss-accent"
                  title={activeTab === 'amigos' ? 'Ir para chat' : 'Ir para amigos'}
                >
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-red-400"
                  title="Fechar chat"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-sss-light bg-sss-dark">
              <button
                onClick={() => setActiveTab('amigos')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === 'amigos' ? 'text-sss-accent border-b-2 border-sss-accent' : 'text-gray-400 hover:text-sss-accent'
                }`}
              >
                Amigos ({amigos.length})
              </button>
              <button
                onClick={() => setActiveTab('solicitacoes')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === 'solicitacoes' ? 'text-sss-accent border-b-2 border-sss-accent' : 'text-gray-400 hover:text-sss-accent'
                }`}
              >
                Solicitações ({solicitacoes.length})
              </button>
              <button
                onClick={() => setActiveTab('sugeridos')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === 'sugeridos' ? 'text-sss-accent border-b-2 border-sss-accent' : 'text-gray-400 hover:text-sss-accent'
                }`}
              >
                Sugeridos
              </button>
              <button
                onClick={() => setActiveTab('buscar')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === 'buscar' ? 'text-sss-accent border-b-2 border-sss-accent' : 'text-gray-400 hover:text-sss-accent'
                }`}
              >
                Buscar
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'amigos' && (
                /* Lista de Amigos */
                <div className="h-full flex flex-col">
                  {/* Search */}
                  <div className="p-3 border-b border-sss-light">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar amigos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white text-sm focus:outline-none focus:ring-2 focus:ring-sss-accent"
                      />
                    </div>
                  </div>

                  {/* Lista */}
                  <div className="flex-1 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-gray-400">Carregando...</div>
                    ) : amigosFiltrados.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">Nenhum amigo encontrado</div>
                    ) : (
                      <div className="space-y-1">
                        {amigosFiltrados.map((amigo) => (
                          <motion.div
                            key={amigo.id}
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                            className="flex items-center justify-between p-3 hover:bg-sss-dark cursor-pointer"
                            onClick={() => {
                              const conversa = conversas.find(c => c.usuarioId === amigo.id)
                              if (conversa) {
                                abrirConversa(conversa)
                              } else {
                                const novaConversa: Conversa = {
                                  id: '',
                                  usuarioId: amigo.id,
                                  usuarioNome: amigo.nome,
                                  ultimaMensagem: '',
                                  ultimaAtividade: new Date(),
                                  naoLidas: 0
                                }
                                setConversaAtiva(novaConversa)
                                setActiveTab('chat')
                              }
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                                  <span className="text-lg">👤</span>
                                </div>
                                <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-sss-dark ${
                                  onlineIds.includes(amigo.id) ? 'bg-green-500' : 'bg-gray-500'
                                }`}></span>
                              </div>
                              <div>
                                <h4 className="text-sss-white font-medium text-sm">{amigo.nome}</h4>
                                <p className="text-gray-400 text-xs">{amigo.email}</p>
                                <p className="text-gray-500 text-xs">
                                  {onlineIds.includes(amigo.id) ? '🟢 Online' : '⚫ Offline'}
                                </p>
                              </div>
                            </div>
                            <ChatBubbleLeftIcon className="w-4 h-4 text-gray-400" />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'solicitacoes' && (
                /* Solicitações de Amizade */
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-gray-400">Carregando...</div>
                    ) : solicitacoes.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        <UserPlusIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>Nenhuma solicitação pendente</p>
                      </div>
                    ) : (
                      <div className="space-y-2 p-3">
                        {solicitacoes.map((solicitacao) => (
                          <motion.div
                            key={solicitacao.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-sss-dark rounded-lg p-3 border border-sss-light"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-sss-accent/20 rounded-full flex items-center justify-center">
                                  <span className="text-sm">👤</span>
                                </div>
                                <div>
                                  <h4 className="text-sss-white font-medium text-sm">{solicitacao.remetenteNome}</h4>
                                  <p className="text-gray-400 text-xs">{solicitacao.remetenteEmail}</p>
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => aceitarSolicitacao(solicitacao.id)}
                                  className="p-1 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded"
                                  title="Aceitar"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => rejeitarSolicitacao(solicitacao.id)}
                                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                                  title="Rejeitar"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'sugeridos' && (
                /* Usuários Sugeridos */
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-gray-400">Carregando...</div>
                    ) : usuariosSugeridos.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        <UserIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>Nenhuma sugestão disponível</p>
                      </div>
                    ) : (
                      <div className="space-y-2 p-3">
                        {usuariosSugeridos.map((usuario) => (
                          <motion.div
                            key={usuario.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-sss-dark rounded-lg p-3 border border-sss-light"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-sss-accent/20 rounded-full flex items-center justify-center">
                                  <span className="text-sm">👤</span>
                                </div>
                                <div>
                                  <h4 className="text-sss-white font-medium text-sm">{usuario.nome}</h4>
                                  <p className="text-gray-400 text-xs">{usuario.email}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => enviarSolicitacao(usuario.id)}
                                className="px-3 py-1 bg-sss-accent hover:bg-red-600 text-white text-xs rounded transition-colors"
                              >
                                Adicionar
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'buscar' && (
                /* Buscar Usuários */
                <div className="h-full flex flex-col">
                  <div className="p-3 border-b border-sss-light">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          buscarUsuarios(e.target.value)
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white text-sm focus:outline-none focus:ring-2 focus:ring-sss-accent"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {searching ? (
                      <div className="p-4 text-center text-gray-400">Buscando...</div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        {searchTerm.length > 0 ? 'Nenhum usuário encontrado' : 'Digite para buscar usuários'}
                      </div>
                    ) : (
                      <div className="space-y-2 p-3">
                        {searchResults.map((usuario) => (
                          <motion.div
                            key={usuario.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-sss-dark rounded-lg p-3 border border-sss-light"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-sss-accent/20 rounded-full flex items-center justify-center">
                                  <span className="text-sm">👤</span>
                                </div>
                                <div>
                                  <h4 className="text-sss-white font-medium text-sm">{usuario.nome}</h4>
                                  <p className="text-gray-400 text-xs">{usuario.email}</p>
                                </div>
                              </div>
                              {!amigos.some(a => a.id === usuario.id) ? (
                                <button
                                  onClick={() => enviarSolicitacao(usuario.id)}
                                  className="px-3 py-1 bg-sss-accent hover:bg-red-600 text-white text-xs rounded transition-colors"
                                >
                                  Adicionar
                                </button>
                              ) : (
                                <span className="text-xs text-green-400">Já é amigo</span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                /* Chat */
                <div className="h-full flex flex-col">
                  {conversaAtiva ? (
                    <>
                      {/* Header da conversa */}
                      <div className="flex items-center justify-between p-3 border-b border-sss-light bg-sss-dark">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-sss-accent/20 rounded-full flex items-center justify-center">
                            <span className="text-sm">👤</span>
                          </div>
                          <div>
                            <h4 className="text-sss-white font-medium text-sm">{conversaAtiva.usuarioNome}</h4>
                            <p className="text-gray-400 text-xs">
                              {onlineIds.includes(conversaAtiva.usuarioId) ? '🟢 Online' : '⚫ Offline'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setConversaAtiva(null)
                            setActiveTab('amigos')
                          }}
                          className="p-1 text-gray-400 hover:text-sss-accent"
                          title="Voltar para lista de amigos"
                        >
                          <ArrowLeftIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Mensagens */}
                      <div 
                        ref={mensagensRef}
                        className="flex-1 overflow-y-auto p-3 space-y-2"
                      >
                        {mensagens.map((mensagem) => (
                          <motion.div
                            key={mensagem.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${mensagem.remetenteId === user.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs ${
                              mensagem.remetenteId === user.id
                                ? 'bg-sss-accent text-white'
                                : 'bg-sss-dark text-sss-white'
                            } rounded-lg px-3 py-2`}>
                              <p className="text-sm">{mensagem.conteudo}</p>
                              <p className={`text-xs mt-1 ${
                                mensagem.remetenteId === user.id
                                  ? 'text-red-200'
                                  : 'text-gray-400'
                              }`}>
                                {formatarTempo(mensagem.timestamp)}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Input */}
                      <div className="p-3 border-t border-sss-light">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={novaMensagem}
                            onChange={(e) => setNovaMensagem(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                            placeholder="Digite uma mensagem..."
                            className="flex-1 px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white text-sm focus:outline-none focus:ring-2 focus:ring-sss-accent"
                          />
                          <button
                            onClick={enviarMensagem}
                            disabled={!novaMensagem.trim()}
                            className="px-3 py-2 bg-sss-accent hover:bg-red-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                            title="Enviar mensagem"
                          >
                            <PaperAirplaneIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-2" />
                        <p>Selecione um amigo para conversar</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 