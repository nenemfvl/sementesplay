import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'

import { auth } from '../../lib/auth'
import { useRouter } from 'next/router'
import { PageLoader } from '../../components/Loader'
import { 
  ChatBubbleLeftIcon, 
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface Mensagem {
  id: string
  mensagem: string
  tipo: 'usuario' | 'admin'
  dataEnvio: string
  lida: boolean
  remetente?: {
    id: string
    nome: string
  }
}

interface Conversa {
  id: string
  titulo: string
  status: string
  categoria: string
  prioridade: string
  dataCriacao: string
  dataAtualizacao: string
  usuario: {
    id: string
    nome: string
    email: string
    nivel: string
  }
  mensagens: Mensagem[]
}

export default function AdminSuporte() {
  const [user, setUser] = useState<any>(null)
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [conversaAtual, setConversaAtual] = useState<Conversa | null>(null)
  const [novaMensagem, setNovaMensagem] = useState('')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroCategoria, setFiltroCategoria] = useState('todos')
  const router = useRouter()
  const mensagensEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentUser = auth.getUser()
    
    // Verificar se é admin - APENAS nível '5'
    const isAdmin = currentUser && currentUser.nivel === '5'
    
    if (!currentUser || !isAdmin) {
      console.log('❌ Acesso negado - Apenas administradores nível 5 podem acessar. Usuário:', currentUser?.nome, 'Nível:', currentUser?.nivel)
      alert('Acesso negado. Apenas administradores nível 5 podem acessar o suporte.')
      router.push('/login')
      return
    }
    
    console.log('✅ Admin nível 5 autenticado:', currentUser.nome, 'Nível:', currentUser.nivel)
    setUser(currentUser)
    // carregarConversas será chamado pelo useEffect que depende do user
  }, [router])

  const carregarConversas = async () => {
    try {
      const params = new URLSearchParams()
      if (filtroStatus !== 'todos') params.append('status', filtroStatus)
      if (filtroCategoria !== 'todos') params.append('categoria', filtroCategoria)

      // Preparar headers com fallback de autenticação
      const headers: any = {
        'Content-Type': 'application/json'
      }
      
      // Adicionar usuário no header Authorization como fallback
      if (user) {
        headers['Authorization'] = `Bearer ${encodeURIComponent(JSON.stringify(user))}`
      }

      const response = await fetch(`/api/admin/suporte?${params}`, {
        credentials: 'include',
        headers
      })
      if (response.ok) {
        const data = await response.json()
        setConversas(data.conversas)
      } else {
        console.error('Erro ao carregar conversas:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      carregarConversas()
    }
  }, [filtroStatus, filtroCategoria, user])

  // Polling para atualizar mensagens automaticamente
  useEffect(() => {
    if (!conversaAtual || !conversaAtual.id || !user) return

    const interval = setInterval(async () => {
      try {
        // Buscar conversa atualizada com mensagens
        const headers: any = {
          'Content-Type': 'application/json'
        }
        
        if (user) {
          headers['Authorization'] = `Bearer ${encodeURIComponent(JSON.stringify(user))}`
        }
        
        const response = await fetch(`/api/admin/suporte?status=${filtroStatus}&categoria=${filtroCategoria}`, {
          credentials: 'include',
          headers
        })
        if (response.ok) {
          const data = await response.json()
          const conversaAtualizada = data.conversas.find((c: Conversa) => c.id === conversaAtual.id)
          if (conversaAtualizada) {
            setConversaAtual(conversaAtualizada)
            setConversas(prev => prev.map(c => 
              c.id === conversaAtual.id ? conversaAtualizada : c
            ))
          }
        }
      } catch (error) {
        console.error('Erro ao atualizar mensagens:', error)
      }
    }, 2000) // Atualiza a cada 2 segundos

    return () => clearInterval(interval)
  }, [conversaAtual, filtroStatus, filtroCategoria, user])

  const enviarResposta = async () => {
    if (!conversaAtual || !novaMensagem.trim()) return

    const conteudoMensagem = novaMensagem
    const mensagemLocal: Mensagem = {
      id: `temp-${Date.now()}`, // ID temporário
      mensagem: conteudoMensagem,
      tipo: 'admin',
      dataEnvio: new Date().toISOString(),
      lida: false,
      remetente: {
        id: 'admin',
        nome: 'Admin'
      }
    }

    // Adiciona mensagem imediatamente ao estado local
    setConversaAtual(prev => ({
      ...prev!,
      mensagens: [...(prev?.mensagens || []), mensagemLocal]
    }))
    setNovaMensagem('')

    setEnviando(true)
    try {
      const headers: any = {
        'Content-Type': 'application/json'
      }
      
      if (user) {
        headers['Authorization'] = `Bearer ${encodeURIComponent(JSON.stringify(user))}`
      }
      
      const response = await fetch('/api/admin/suporte', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          conversaId: conversaAtual.id,
          mensagem: conteudoMensagem,
          acao: 'responder'
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Substitui a mensagem temporária pela mensagem real do servidor
        setConversaAtual(prev => {
          if (!prev) return prev
          const semTemporaria = prev.mensagens.filter(m => m.id !== mensagemLocal.id)
          return {
            ...prev,
            mensagens: [...semTemporaria, data.mensagem],
            status: 'em_espera',
            dataAtualizacao: new Date().toISOString()
          }
        })
        
        // Atualiza também na lista de conversas
        setConversas(prev => prev.map(c => 
          c.id === conversaAtual.id ? {
            ...c,
            mensagens: [...c.mensagens.filter(m => m.id !== mensagemLocal.id), data.mensagem],
            status: 'em_espera',
            dataAtualizacao: new Date().toISOString()
          } : c
        ))
      } else {
        // Remove a mensagem se houve erro
        setConversaAtual(prev => {
          if (!prev) return prev
          return {
            ...prev,
            mensagens: prev.mensagens.filter(m => m.id !== mensagemLocal.id)
          }
        })
        console.error('Erro ao enviar resposta')
      }
    } catch (error) {
      // Remove a mensagem se houve erro
      setConversaAtual(prev => {
        if (!prev) return prev
        return {
          ...prev,
          mensagens: prev.mensagens.filter(m => m.id !== mensagemLocal.id)
        }
      })
      console.error('Erro ao enviar resposta:', error)
    } finally {
      setEnviando(false)
    }
  }

  const atualizarStatus = async (status: string) => {
    if (!conversaAtual) return

    try {
      const headers: any = {
        'Content-Type': 'application/json'
      }
      
      if (user) {
        headers['Authorization'] = `Bearer ${encodeURIComponent(JSON.stringify(user))}`
      }
      
      const response = await fetch('/api/admin/suporte', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          conversaId: conversaAtual.id,
          status,
          acao: 'atualizar_status'
        })
      })

      if (response.ok) {
        const data = await response.json()
        const conversaAtualizada = {
          ...conversaAtual,
          status: data.conversa.status,
          dataAtualizacao: data.conversa.dataAtualizacao
        }
        setConversaAtual(conversaAtualizada)
        setConversas(conversas.map(c => 
          c.id === conversaAtual.id ? conversaAtualizada : c
        ))
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
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

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return 'text-red-500'
      case 'alta':
        return 'text-orange-500'
      case 'normal':
        return 'text-yellow-500'
      case 'baixa':
        return 'text-green-500'
      default:
        return 'text-gray-500'
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

  const conversasFiltradas = conversas.filter(conversa => {
    if (filtroStatus !== 'todos' && conversa.status !== filtroStatus) return false
    if (filtroCategoria !== 'todos' && conversa.categoria !== filtroCategoria) return false
    return true
  })

  if (loading) {
    return <PageLoader />
  }

  return (
    <>
      <Head>
        <title>Suporte - Painel Admin - SementesPLAY</title>
        <meta name="description" content="Gerenciamento de suporte" />
      </Head>

      

      <div className="min-h-screen bg-sss-dark">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-sss-white mb-4">
                <ChatBubbleLeftIcon className="w-8 h-8 inline mr-2 text-sss-accent" />
                Suporte - Painel Admin
              </h1>
              <p className="text-gray-300">
                Gerencie conversas de suporte dos usuários
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filtros */}
              <div className="lg:col-span-1">
                <div className="card">
                  <h2 className="text-xl font-semibold text-sss-white mb-4">Filtros</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className="input-field bg-sss-light text-sss-white border-sss-light focus:ring-sss-accent"
                      >
                        <option value="todos">Todos</option>
                        <option value="aberta">Aberta</option>
                        <option value="em_espera">Em espera</option>
                        <option value="fechada">Fechada</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Categoria
                      </label>
                      <select
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        className="input-field bg-sss-light text-sss-white border-sss-light focus:ring-sss-accent"
                      >
                        <option value="todos">Todas</option>
                        <option value="duvida">Dúvida</option>
                        <option value="problema">Problema</option>
                        <option value="sugestao">Sugestão</option>
                        <option value="denuncia">Denúncia</option>
                        <option value="outros">Outros</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Conversas */}
              <div className="lg:col-span-1">
                <div className="card">
                  <h2 className="text-xl font-semibold text-sss-white mb-4">Conversas ({conversasFiltradas.length})</h2>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {conversasFiltradas && conversasFiltradas.length > 0 ? conversasFiltradas.map((conversa) => (
                      <div
                        key={conversa.id}
                        onClick={() => setConversaAtual(conversa)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          conversaAtual?.id === conversa.id
                            ? 'bg-sss-accent/20 border border-sss-accent'
                            : 'bg-sss-light hover:bg-sss-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-sss-white truncate">
                            {conversa.titulo}
                          </h3>
                          {getStatusIcon(conversa.status)}
                        </div>
                        <p className="text-sm text-gray-300 mb-1">
                          {conversa.usuario.nome}
                        </p>
                        <p className="text-xs text-gray-400 mb-2">
                          {conversa.mensagens?.length || 0} mensagem{(conversa.mensagens?.length || 0) !== 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className={getPrioridadeColor(conversa.prioridade)}>
                            {conversa.prioridade}
                          </span>
                          <span className="text-gray-400">
                            {formatarData(conversa.dataAtualizacao)}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center text-gray-400 py-4">
                        <p>Nenhuma conversa encontrada</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat */}
              <div className="lg:col-span-2">
                <div className="card h-96 flex flex-col">
                  {conversaAtual ? (
                    <>
                      {/* Header do Chat */}
                      <div className="p-4 border-b border-sss-light">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-sss-white">
                              {conversaAtual.titulo}
                            </h3>
                            <p className="text-sm text-gray-300">
                              {conversaAtual.usuario.nome} • {conversaAtual.usuario.email}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(conversaAtual.status)}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-300">
                            <span>Status: {getStatusLabel(conversaAtual.status)}</span>
                            <span>Categoria: {conversaAtual.categoria}</span>
                            <span className={getPrioridadeColor(conversaAtual.prioridade)}>
                              Prioridade: {conversaAtual.prioridade}
                            </span>
                          </div>
                          
                          <div className="flex space-x-2">
                            {conversaAtual.status !== 'fechada' && (
                              <button
                                onClick={() => atualizarStatus('fechada')}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                              >
                                Fechar
                              </button>
                            )}
                            {conversaAtual.status === 'fechada' && (
                              <button
                                onClick={() => atualizarStatus('aberta')}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                              >
                                Reabrir
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Mensagens */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {conversaAtual.mensagens && conversaAtual.mensagens.length > 0 ? conversaAtual.mensagens.map((mensagem) => (
                          <div
                            key={mensagem.id}
                            className={`flex ${mensagem.tipo === 'admin' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                                mensagem.tipo === 'admin'
                                  ? 'bg-sss-accent text-white'
                                  : 'bg-sss-light text-sss-white'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs opacity-70">
                                  {mensagem.remetente?.nome || (mensagem.tipo === 'admin' ? 'Admin' : 'Usuário')}
                                </span>
                                <span className="text-xs opacity-70">
                                  {formatarData(mensagem.dataEnvio)}
                                </span>
                              </div>
                              <p className="text-sm">{mensagem.mensagem}</p>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center text-gray-400 py-4">
                            <p>Nenhuma mensagem ainda</p>
                          </div>
                        )}
                      </div>

                      {/* Input de Mensagem */}
                      <div className="p-4 border-t border-sss-light">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={novaMensagem}
                            onChange={(e) => setNovaMensagem(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && enviarResposta()}
                            placeholder="Digite sua resposta..."
                            className="input-field bg-sss-light text-sss-white placeholder-gray-300 border-sss-light focus:ring-sss-accent"
                            disabled={enviando || conversaAtual.status === 'fechada'}
                          />
                          <button
                            onClick={enviarResposta}
                            disabled={enviando || !novaMensagem.trim() || conversaAtual.status === 'fechada'}
                            className="btn-primary p-2 disabled:opacity-50"
                          >
                            <PaperAirplaneIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-gray-300">
                        <ChatBubbleLeftIcon className="w-16 h-16 mx-auto mb-4 opacity-50 text-sss-accent" />
                        <p>Selecione uma conversa para responder</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
