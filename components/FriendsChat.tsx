import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserGroupIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ArrowLeftIcon
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
  const [activeTab, setActiveTab] = useState<'amigos' | 'chat'>('amigos')

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
      const [amigosResponse, conversasResponse] = await Promise.all([
        fetch(`/api/amigos?usuarioId=${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }),
        fetch(`/api/chat/conversas?usuarioId=${user.id}`, {
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
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const abrirConversa = async (conversa: Conversa) => {
    setConversaAtiva(conversa)
    setActiveTab('chat')
    
    try {
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

    const mensagem: Mensagem = {
      id: Date.now().toString(),
      remetenteId: user.id,
      remetenteNome: user.nome,
      conteudo: novaMensagem,
      timestamp: new Date(),
      lida: false
    }

    try {
      const response = await fetch(`/api/chat/conversas/${conversaAtiva.id}/mensagens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sementesplay_token')}`
        },
        body: JSON.stringify({
          conteudo: novaMensagem,
          tipo: 'texto'
        })
      })

      if (response.ok) {
        setMensagens(prev => [...prev, mensagem])
        setNovaMensagem('')
      }
    } catch (error) {
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

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'amigos' ? (
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
                                // Criar nova conversa
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
                              </div>
                            </div>
                            <ChatBubbleLeftIcon className="w-4 h-4 text-gray-400" />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
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
                              {onlineIds.includes(conversaAtiva.usuarioId) ? 'Online' : 'Offline'}
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