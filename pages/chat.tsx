import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChatBubbleLeftIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  VideoCameraIcon,
  PaperClipIcon,
  FaceSmileIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'

interface Mensagem {
  id: string
  remetenteId: string
  remetenteNome: string
  conteudo: string
  timestamp: Date
  tipo: 'texto' | 'imagem' | 'arquivo' | 'audio'
  lida: boolean
}

interface Conversa {
  id: string
  usuarioId: string
  usuarioNome: string
  usuarioEmail: string
  ultimaMensagem?: string
  ultimaMensagemTimestamp?: Date
  naoLidas: number
  online: boolean
}

export default function Chat() {
  const [user, setUser] = useState<User | null>(null)
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [conversaAtiva, setConversaAtiva] = useState<Conversa | null>(null)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [loading, setLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)
  const [gravando, setGravando] = useState(false)
  const mensagensRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

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
      loadConversas()
      setupWebSocket()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (conversaAtiva) {
      loadMensagens(conversaAtiva.id)
    }
  }, [conversaAtiva])

  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight
    }
  }, [mensagens])

  const setupWebSocket = () => {
    // Simular WebSocket para demonstração
    const mockWebSocket = {
      onmessage: (event: any) => {
        // Simular mensagens em tempo real
        setTimeout(() => {
          const novaMensagem: Mensagem = {
            id: Date.now().toString(),
            remetenteId: conversaAtiva?.usuarioId || '1',
            remetenteNome: conversaAtiva?.usuarioNome || 'João Silva',
            conteudo: 'Oi! Como você está?',
            timestamp: new Date(),
            tipo: 'texto',
            lida: false
          }
          adicionarMensagem(novaMensagem)
        }, 3000)
      },
      close: () => {
        console.log('WebSocket chat mock fechado')
      }
    }

    wsRef.current = mockWebSocket as any
    setWsConnected(true)
  }

  const loadConversas = async () => {
    try {
      if (!user) return;
      const token = localStorage.getItem('sementesplay_token')
      const response = await fetch(`/api/chat/conversas?usuarioId=${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const data = await response.json()
      if (response.ok) {
        setConversas(data.conversas)
        if (data.conversas.length > 0) {
          setConversaAtiva(data.conversas[0])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMensagens = async (conversaId: string) => {
    try {
      const response = await fetch(`/api/chat/conversas/${conversaId}/mensagens`)
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

  const adicionarMensagem = (mensagem: Mensagem) => {
    setMensagens(prev => [...prev, mensagem])
  }

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaAtiva) return

    const mensagem: Mensagem = {
      id: Date.now().toString(),
      remetenteId: user!.id,
      remetenteNome: user!.nome,
      conteudo: novaMensagem,
      timestamp: new Date(),
      tipo: 'texto',
      lida: false
    }

    try {
      const response = await fetch(`/api/chat/conversas/${conversaAtiva.id}/mensagens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conteudo: novaMensagem,
          tipo: 'texto'
        })
      })

      if (response.ok) {
        adicionarMensagem(mensagem)
        setNovaMensagem('')
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const iniciarGravacao = () => {
    setGravando(true)
    // Em produção, você implementaria a gravação de áudio
    setTimeout(() => {
      setGravando(false)
      // Simular envio de áudio
      const mensagemAudio: Mensagem = {
        id: Date.now().toString(),
        remetenteId: user!.id,
        remetenteNome: user!.nome,
        conteudo: '🎤 Áudio gravado',
        timestamp: new Date(),
        tipo: 'audio',
        lida: false
      }
      adicionarMensagem(mensagemAudio)
    }, 3000)
  }

  const formatarTempo = (data: Date) => {
    return new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatarData = (data: Date | string | null | undefined) => {
    if (!data) return 'Data não disponível'
    
    try {
      const dataMsg = data instanceof Date ? data : new Date(data)
      
      if (isNaN(dataMsg.getTime())) {
        return 'Data inválida'
      }
      
      const hoje = new Date()
      
      if (dataMsg.toDateString() === hoje.toDateString()) {
        return 'Hoje'
      }
      
      const ontem = new Date(hoje)
      ontem.setDate(hoje.getDate() - 1)
      
      if (dataMsg.toDateString() === ontem.toDateString()) {
        return 'Ontem'
      }
      
      return dataMsg.toLocaleDateString('pt-BR')
    } catch (error) {
      return 'Data inválida'
    }
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Chat - SementesPLAY</title>
        <meta name="description" content="Chat em tempo real" />
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
                  <p className="text-sm text-gray-300">Chat em Tempo Real</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto h-[calc(100vh-80px)] flex">
          {/* Lista de Conversas */}
          <div className="w-80 bg-sss-medium border-r border-sss-light flex flex-col">
            <div className="p-4 border-b border-sss-light">
              <h2 className="text-lg font-semibold text-sss-white">Conversas</h2>
              <div className="flex items-center space-x-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-400">
                  {wsConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sss-accent mx-auto"></div>
                </div>
              ) : conversas.length === 0 ? (
                <div className="p-4 text-center">
                  <ChatBubbleLeftIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Nenhuma conversa</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversas.map((conversa) => (
                    <motion.div
                      key={conversa.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setConversaAtiva(conversa)}
                      className={`p-4 cursor-pointer transition-colors ${
                        conversaAtiva?.id === conversa.id
                          ? 'bg-sss-accent/20 border-r-2 border-sss-accent'
                          : 'hover:bg-sss-dark'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                            <UserCircleIcon className="w-6 h-6 text-sss-accent" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-sss-medium ${
                            conversa.online ? 'bg-green-500' : 'bg-gray-500'
                          }`}></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sss-white font-medium truncate">
                              {conversa.usuarioNome}
                            </h3>
                            {conversa.naoLidas > 0 && (
                              <span className="bg-sss-accent text-white text-xs px-2 py-1 rounded-full">
                                {conversa.naoLidas}
                              </span>
                            )}
                          </div>
                          
                          {conversa.ultimaMensagem && (
                            <p className="text-gray-400 text-sm truncate">
                              {conversa.ultimaMensagem}
                            </p>
                          )}
                          
                          {conversa.ultimaMensagemTimestamp && (
                            <p className="text-gray-500 text-xs">
                              {formatarTempo(conversa.ultimaMensagemTimestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Área de Chat */}
          <div className="flex-1 flex flex-col">
            {conversaAtiva ? (
              <>
                {/* Header da Conversa */}
                <div className="bg-sss-medium border-b border-sss-light p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                          <UserCircleIcon className="w-6 h-6 text-sss-accent" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-sss-medium ${
                          conversaAtiva.online ? 'bg-green-500' : 'bg-gray-500'
                        }`}></div>
                      </div>
                      
                      <div>
                        <h3 className="text-sss-white font-semibold">
                          {conversaAtiva.usuarioNome}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {conversaAtiva.online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-sss-accent hover:bg-sss-accent/10 rounded-lg transition-colors">
                        <PhoneIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-sss-accent hover:bg-sss-accent/10 rounded-lg transition-colors">
                        <VideoCameraIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-sss-accent hover:bg-sss-accent/10 rounded-lg transition-colors">
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mensagens */}
                <div 
                  ref={mensagensRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  <AnimatePresence>
                    {mensagens.map((mensagem) => (
                      <motion.div
                        key={mensagem.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${mensagem.remetenteId === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${
                          mensagem.remetenteId === user.id
                            ? 'bg-sss-accent text-white'
                            : 'bg-sss-medium text-sss-white'
                        } rounded-lg px-4 py-2`}>
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
                  </AnimatePresence>
                </div>

                {/* Input de Mensagem */}
                <div className="bg-sss-medium border-t border-sss-light p-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-sss-accent hover:bg-sss-accent/10 rounded-lg transition-colors">
                      <PaperClipIcon className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={novaMensagem}
                        onChange={(e) => setNovaMensagem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                        placeholder="Digite sua mensagem..."
                        className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                      />
                      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-sss-accent">
                        <FaceSmileIcon className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {gravando ? (
                      <button
                        onClick={() => setGravando(false)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <MicrophoneIcon className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={iniciarGravacao}
                        className="p-2 text-gray-400 hover:text-sss-accent hover:bg-sss-accent/10 rounded-lg transition-colors"
                      >
                        <MicrophoneIcon className="w-5 h-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={enviarMensagem}
                      disabled={!novaMensagem.trim()}
                      className="p-2 bg-sss-accent text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ChatBubbleLeftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sss-white mb-2">
                    Selecione uma conversa
                  </h3>
                  <p className="text-gray-400">
                    Escolha um amigo para começar a conversar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 