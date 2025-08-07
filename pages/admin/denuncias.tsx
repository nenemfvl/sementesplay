import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Navbar from '../../components/Navbar'
import { auth } from '../../lib/auth'
import { useRouter } from 'next/router'
import { PageLoader } from '../../components/Loader'
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface Denuncia {
  id: string
  tipo: string
  motivo: string
  descricao: string
  status: string
  dataCriacao: string
  dataResolucao?: string
  denunciante: {
    id: string
    nome: string
    email: string
  }
  denunciado?: {
    id: string
    nome: string
    email: string
  }
  conteudo?: {
    id: string
    tipo: string
    titulo?: string
  }
}

export default function AdminDenuncias() {
  const [user, setUser] = useState<any>(null)
  const [denuncias, setDenuncias] = useState<Denuncia[]>([])
  const [denunciaAtual, setDenunciaAtual] = useState<Denuncia | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const router = useRouter()

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser || Number(currentUser.nivel) < 5) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    carregarDenuncias()
  }, [router])

  const carregarDenuncias = async () => {
    try {
      const params = new URLSearchParams()
      if (filtroStatus !== 'todos') params.append('status', filtroStatus)
      if (filtroTipo !== 'todos') params.append('tipo', filtroTipo)

      const response = await fetch(`/api/admin/denuncias?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDenuncias(data.denuncias)
      }
    } catch (error) {
      console.error('Erro ao carregar denúncias:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDenuncias()
  }, [filtroStatus, filtroTipo])

  const resolverDenuncia = async (denunciaId: string, acao: string) => {
    try {
      const response = await fetch('/api/admin/denuncias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          denunciaId,
          acao
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDenuncias(denuncias.map(d => 
          d.id === denunciaId ? { ...d, status: data.denuncia.status, dataResolucao: data.denuncia.dataResolucao } : d
        ))
        if (denunciaAtual?.id === denunciaId) {
          setDenunciaAtual({ ...denunciaAtual, status: data.denuncia.status, dataResolucao: data.denuncia.dataResolucao })
        }
      }
    } catch (error) {
      console.error('Erro ao resolver denúncia:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />
      case 'resolvida':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'rejeitada':
        return <XMarkIcon className="w-4 h-4 text-red-500" />
      default:
        return <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente'
      case 'resolvida':
        return 'Resolvida'
      case 'rejeitada':
        return 'Rejeitada'
      default:
        return 'Desconhecido'
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'usuario':
        return 'Usuário'
      case 'conteudo':
        return 'Conteúdo'
      case 'comentario':
        return 'Comentário'
      default:
        return tipo
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

  const denunciasFiltradas = denuncias.filter(denuncia => {
    if (filtroStatus !== 'todos' && denuncia.status !== filtroStatus) return false
    if (filtroTipo !== 'todos' && denuncia.tipo !== filtroTipo) return false
    return true
  })

  if (loading) {
    return <PageLoader />
  }

  return (
    <>
      <Head>
        <title>Denúncias - Painel Admin - SementesPLAY</title>
        <meta name="description" content="Gerenciamento de denúncias" />
      </Head>

      <Navbar />

      <div className="min-h-screen bg-sss-dark">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-sss-white mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 inline mr-2 text-sss-accent" />
                Denúncias - Painel Admin
              </h1>
              <p className="text-gray-300">
                Gerencie denúncias e moderação de conteúdo
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
                        <option value="pendente">Pendente</option>
                        <option value="resolvida">Resolvida</option>
                        <option value="rejeitada">Rejeitada</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tipo
                      </label>
                      <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="input-field bg-sss-light text-sss-white border-sss-light focus:ring-sss-accent"
                      >
                        <option value="todos">Todos</option>
                        <option value="usuario">Usuário</option>
                        <option value="conteudo">Conteúdo</option>
                        <option value="comentario">Comentário</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Denúncias */}
              <div className="lg:col-span-1">
                <div className="card">
                  <h2 className="text-xl font-semibold text-sss-white mb-4">Denúncias ({denunciasFiltradas.length})</h2>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {denunciasFiltradas && denunciasFiltradas.length > 0 ? denunciasFiltradas.map((denuncia) => (
                      <div
                        key={denuncia.id}
                        onClick={() => setDenunciaAtual(denuncia)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          denunciaAtual?.id === denuncia.id
                            ? 'bg-sss-accent/20 border border-sss-accent'
                            : 'bg-sss-light hover:bg-sss-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-sss-white truncate">
                            {getTipoLabel(denuncia.tipo)}
                          </h3>
                          {getStatusIcon(denuncia.status)}
                        </div>
                        <p className="text-sm text-gray-300 mb-1">
                          {denuncia.denunciante.nome}
                        </p>
                        <p className="text-xs text-gray-400 mb-2">
                          {denuncia.motivo}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">
                            {getStatusLabel(denuncia.status)}
                          </span>
                          <span className="text-gray-400">
                            {formatarData(denuncia.dataCriacao)}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center text-gray-400 py-4">
                        <p>Nenhuma denúncia encontrada</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detalhes da Denúncia */}
              <div className="lg:col-span-2">
                <div className="card">
                  {denunciaAtual ? (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-sss-white">
                            Denúncia #{denunciaAtual.id.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-300">
                            {getTipoLabel(denunciaAtual.tipo)} • {getStatusLabel(denunciaAtual.status)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(denunciaAtual.status)}
                        </div>
                      </div>

                      {/* Informações da Denúncia */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-sss-light p-4 rounded-lg">
                          <h4 className="font-medium text-sss-white mb-2">Denunciante</h4>
                          <p className="text-sm text-gray-300">{denunciaAtual.denunciante.nome}</p>
                          <p className="text-xs text-gray-400">{denunciaAtual.denunciante.email}</p>
                        </div>

                        {denunciaAtual.denunciado && (
                          <div className="bg-sss-light p-4 rounded-lg">
                            <h4 className="font-medium text-sss-white mb-2">Denunciado</h4>
                            <p className="text-sm text-gray-300">{denunciaAtual.denunciado.nome}</p>
                            <p className="text-xs text-gray-400">{denunciaAtual.denunciado.email}</p>
                          </div>
                        )}
                      </div>

                      {/* Detalhes */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sss-white mb-2">Motivo</h4>
                          <p className="text-sm text-gray-300 bg-sss-light p-3 rounded-lg">
                            {denunciaAtual.motivo}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-sss-white mb-2">Descrição</h4>
                          <p className="text-sm text-gray-300 bg-sss-light p-3 rounded-lg">
                            {denunciaAtual.descricao}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Data de Criação:</span>
                            <p className="text-sss-white">{formatarData(denunciaAtual.dataCriacao)}</p>
                          </div>
                          {denunciaAtual.dataResolucao && (
                            <div>
                              <span className="text-gray-400">Data de Resolução:</span>
                              <p className="text-sss-white">{formatarData(denunciaAtual.dataResolucao)}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      {denunciaAtual.status === 'pendente' && (
                        <div className="flex space-x-3 pt-4 border-t border-sss-light">
                          <button
                            onClick={() => resolverDenuncia(denunciaAtual.id, 'resolver')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Resolver
                          </button>
                          <button
                            onClick={() => resolverDenuncia(denunciaAtual.id, 'rejeitar')}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-gray-300">
                        <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 opacity-50 text-sss-accent" />
                        <p>Selecione uma denúncia para ver os detalhes</p>
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
