import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import { auth } from '../lib/auth'
import { useRouter } from 'next/router'
import { PageLoader } from '../components/Loader'
import { 
  ChatBubbleLeftIcon, 
  PaperAirplaneIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Mensagem {
  id: string
  mensagem: string
  tipo: 'usuario' | 'admin'
  dataEnvio: string
  lida: boolean
}

interface Conversa {
  id: string
  titulo: string
  status: string
  categoria: string
  dataCriacao: string
  dataAtualizacao: string
  mensagens: Mensagem[]
}

export default function Suporte() {
  const [user, setUser] = useState<any>(null)
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [conversaAtual, setConversaAtual] = useState<Conversa | null>(null)
  const [novaMensagem, setNovaMensagem] = useState('')
  const [mostrarNovaConversa, setMostrarNovaConversa] = useState(false)
  const [tituloNovaConversa, setTituloNovaConversa] = useState('')
  const [categoriaNovaConversa, setCategoriaNovaConversa] = useState('outros')
  const [mensagemNovaConversa, setMensagemNovaConversa] = useState('')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const router = useRouter()
  const mensagensEndRef = useRef<HTMLDivElement>(null)

  const categorias = [
    { valor: 'duvida', label: 'Dúvida' },
    { valor: 'problema', label: 'Problema' },
    { valor: 'sugestao', label: 'Sugestão' },
    { valor: 'denuncia', label: 'Denúncia' },
    { valor: 'outros', label: 'Outros' }
  ]

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    carregarConversas()
  }, [router])

  const carregarConversas = async () => {
    try {
      const response = await fetch('/api/suporte')
      if (response.ok) {
        const data = await response.json()
        setConversas(data.conversas)
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversaAtual?.mensagens])

  const criarNovaConversa = async () => {
    if (!mensagemNovaConversa.trim()) return

    setEnviando(true)
    try {
      const response = await fetch('/api/suporte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: tituloNovaConversa,
          categoria: categoriaNovaConversa,
          mensagem: mensagemNovaConversa
        })
      })

      if (response.ok) {
        const data = await response.json()
        setConversas([data.conversa, ...conversas])
        setConversaAtual(data.conversa)
        setMostrarNovaConversa(false)
        setTituloNovaConversa('')
        setCategoriaNovaConversa('outros')
        setMensagemNovaConversa('')
      }
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
    } finally {
      setEnviando(false)
    }
  }

  const enviarMensagem = async () => {
    if (!conversaAtual || !novaMensagem.trim()) return

    setEnviando(true)
    try {
      const response = await fetch('/api/suporte/mensagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversaId: conversaAtual.id,
          mensagem: novaMensagem
        })
      })

      if (response.ok) {
        const data = await response.json()
        const conversaAtualizada = {
          ...conversaAtual,
          mensagens: [...conversaAtual.mensagens, data.mensagem],
          dataAtualizacao: new Date().toISOString()
        }
        setConversaAtual(conversaAtualizada)
        setConversas(conversas.map(c => 
          c.id === conversaAtual.id ? conversaAtualizada : c
        ))
        setNovaMensagem('')
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setEnviando(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aberta':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'em_espera':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />
      case 'fechada':
        return <XMarkIcon className="w-4 h-4 text-red-500" />
      default:
        return <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aberta':
        return 'Aberta'
      case 'em_espera':
        return 'Em espera'
      case 'fechada':
        return 'Fechada'
      default:
        return 'Desconhecido'
    }
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <>
      <Head>
        <title>Suporte - SementesPLAY</title>
        <meta name="description" content="Chat de suporte para usuários" />
      </Head>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                <ChatBubbleLeftIcon className="w-8 h-8 inline mr-2" />
                Suporte
              </h1>
              <p className="text-gray-300">
                Entre em contato com nossa equipe de suporte
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Conversas */}
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Conversas</h2>
                    <button
                      onClick={() => setMostrarNovaConversa(true)}
                      className="bg-sss-accent hover:bg-sss-accent/80 text-white p-2 rounded-lg transition-colors"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {conversas.map((conversa) => (
                      <div
                        key={conversa.id}
                        onClick={() => setConversaAtual(conversa)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          conversaAtual?.id === conversa.id
                            ? 'bg-sss-accent/20 border border-sss-accent'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-white truncate">
                            {conversa.titulo}
                          </h3>
                          {getStatusIcon(conversa.status)}
                        </div>
                        <p className="text-sm text-gray-300 mb-2">
                          {conversa.mensagens.length} mensagem{conversa.mensagens.length !== 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{getStatusLabel(conversa.status)}</span>
                          <span>{formatarData(conversa.dataAtualizacao)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat */}
              <div className="lg:col-span-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg h-96 flex flex-col">
                  {conversaAtual ? (
                    <>
                      {/* Header do Chat */}
                      <div className="p-4 border-b border-white/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {conversaAtual.titulo}
                            </h3>
                            <p className="text-sm text-gray-300">
                              {getStatusLabel(conversaAtual.status)} • {conversaAtual.categoria}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(conversaAtual.status)}
                          </div>
                        </div>
                      </div>

                      {/* Mensagens */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {conversaAtual.mensagens.map((mensagem) => (
                          <div
                            key={mensagem.id}
                            className={`flex ${mensagem.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                                mensagem.tipo === 'usuario'
                                  ? 'bg-sss-accent text-white'
                                  : 'bg-white/20 text-white'
                              }`}
                            >
                              <p className="text-sm">{mensagem.mensagem}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {formatarData(mensagem.dataEnvio)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={mensagensEndRef} />
                      </div>

                      {/* Input de Mensagem */}
                      <div className="p-4 border-t border-white/20">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={novaMensagem}
                            onChange={(e) => setNovaMensagem(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                            placeholder="Digite sua mensagem..."
                            className="flex-1 bg-white/10 text-white placeholder-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                            disabled={enviando || conversaAtual.status === 'fechada'}
                          />
                          <button
                            onClick={enviarMensagem}
                            disabled={enviando || !novaMensagem.trim() || conversaAtual.status === 'fechada'}
                            className="bg-sss-accent hover:bg-sss-accent/80 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                          >
                            <PaperAirplaneIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-gray-300">
                        <ChatBubbleLeftIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Selecione uma conversa ou crie uma nova</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nova Conversa */}
      {mostrarNovaConversa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Nova Conversa</h2>
              <button
                onClick={() => setMostrarNovaConversa(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título (opcional)
                </label>
                <input
                  type="text"
                  value={tituloNovaConversa}
                  onChange={(e) => setTituloNovaConversa(e.target.value)}
                  placeholder="Ex: Problema com login"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sss-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={categoriaNovaConversa}
                  onChange={(e) => setCategoriaNovaConversa(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sss-accent"
                >
                  {categorias.map((cat) => (
                    <option key={cat.valor} value={cat.valor}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem
                </label>
                <textarea
                  value={mensagemNovaConversa}
                  onChange={(e) => setMensagemNovaConversa(e.target.value)}
                  placeholder="Descreva sua dúvida, problema ou sugestão..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sss-accent resize-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setMostrarNovaConversa(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={criarNovaConversa}
                  disabled={enviando || !mensagemNovaConversa.trim()}
                  className="flex-1 px-4 py-2 bg-sss-accent text-white rounded-lg hover:bg-sss-accent/80 disabled:opacity-50 transition-colors"
                >
                  {enviando ? 'Enviando...' : 'Criar Conversa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
