import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../../lib/auth'

interface Candidatura {
  id: string
  usuarioId: string
  nome: string
  email: string
  bio: string
  categoria: string
  redesSociais: {
    youtube?: string
    twitch?: string
    instagram?: string
    tiktok?: string
    twitter?: string
  }
  portfolio: {
    descricao: string
    links: string[]
  }
  experiencia: string
  motivacao: string
  metas: string
  disponibilidade: string
  status: 'pendente' | 'aprovada' | 'rejeitada'
  dataCandidatura: Date
  dataRevisao?: Date
  observacoes?: string
}

export default function AdminCandidaturas() {
  const [user, setUser] = useState<User | null>(null)
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterCategoria, setFilterCategoria] = useState('todos')
  const [selectedCandidatura, setSelectedCandidatura] = useState<Candidatura | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    
    if (Number(currentUser.nivel) < 5) {
      alert('Acesso negado. Apenas administradores podem acessar esta área.')
      window.location.href = '/dashboard'
      return
    }
    
    setUser(currentUser)
    loadCandidaturas()
  }, [])

  const loadCandidaturas = async () => {
    try {
      const response = await fetch('/api/admin/candidaturas')
      const data = await response.json()
      if (response.ok) {
        setCandidaturas(data.candidaturas)
      }
    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtrarCandidaturas = () => {
    return candidaturas.filter(candidatura => {
      const matchSearch = candidatura.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidatura.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidatura.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = filterStatus === 'todos' || candidatura.status === filterStatus
      const matchCategoria = filterCategoria === 'todos' || candidatura.categoria === filterCategoria
      
      return matchSearch && matchStatus && matchCategoria
    })
  }

  const aprovarCandidatura = async (candidaturaId: string) => {
    try {
      const response = await fetch(`/api/admin/candidaturas/${candidaturaId}/aprovar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ observacoes })
      })

      if (response.ok) {
        alert('Candidatura aprovada com sucesso!')
        loadCandidaturas()
        setShowModal(false)
        setObservacoes('')
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao aprovar candidatura:', error)
      alert('Erro ao aprovar candidatura')
    }
  }

  const rejeitarCandidatura = async (candidaturaId: string) => {
    if (!observacoes.trim()) {
      alert('Por favor, informe o motivo da rejeição.')
      return
    }

    try {
      const response = await fetch(`/api/admin/candidaturas/${candidaturaId}/rejeitar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ observacoes })
      })

      if (response.ok) {
        alert('Candidatura rejeitada com sucesso!')
        loadCandidaturas()
        setShowModal(false)
        setObservacoes('')
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao rejeitar candidatura:', error)
      alert('Erro ao rejeitar candidatura')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'aprovada': return 'bg-green-100 text-green-800'
      case 'rejeitada': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <ClockIcon className="w-3 h-3 mr-1" />
      case 'aprovada': return <CheckCircleIcon className="w-3 h-3 mr-1" />
      case 'rejeitada': return <XCircleIcon className="w-3 h-3 mr-1" />
      default: return <ClockIcon className="w-3 h-3 mr-1" />
    }
  }

  const candidaturasFiltradas = filtrarCandidaturas()

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sss-accent"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Candidaturas de Criadores - Admin SementesPLAY</title>
        <meta name="description" content="Gerenciar candidaturas de criadores" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/admin" className="inline-flex items-center text-sss-accent hover:text-red-400">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Voltar ao Admin
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-red-400">Candidaturas de Criadores</p>
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
                <h2 className="text-3xl font-bold text-sss-white">Candidaturas de Criadores</h2>
                <p className="text-gray-400">Revisar e gerenciar candidaturas pendentes</p>
              </div>
              <div className="text-right">
                <p className="text-sss-white font-semibold">{candidaturasFiltradas.length} candidaturas</p>
                <p className="text-gray-400 text-sm">
                  {candidaturas.filter(c => c.status === 'pendente').length} pendentes
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      placeholder="Nome, email ou categoria..."
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
                    <option value="pendente">Pendente</option>
                    <option value="aprovada">Aprovada</option>
                    <option value="rejeitada">Rejeitada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={filterCategoria}
                    onChange={(e) => setFilterCategoria(e.target.value)}
                    className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                  >
                    <option value="todos">Todas as categorias</option>
                    <option value="Gaming/FiveM">Gaming/FiveM</option>
                    <option value="Streaming">Streaming</option>
                    <option value="Educativo">Educativo</option>
                    <option value="Entretenimento">Entretenimento</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={loadCandidaturas}
                    className="w-full px-4 py-2 bg-sss-accent hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Atualizar
                  </button>
                </div>
              </div>
            </div>

            {/* Candidaturas List */}
            <div className="bg-sss-medium rounded-lg border border-sss-light overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-sss-light">
                  <thead className="bg-sss-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Candidato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-sss-medium divide-y divide-sss-light">
                    {candidaturasFiltradas.map((candidatura) => (
                      <tr key={candidatura.id} className="hover:bg-sss-dark transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-sss-accent" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-sss-white">
                                {candidatura.nome}
                              </div>
                              <div className="text-sm text-gray-400">
                                {candidatura.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-sss-white">{candidatura.categoria}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(candidatura.status)}`}>
                            {getStatusIcon(candidatura.status)}
                            {candidatura.status.charAt(0).toUpperCase() + candidatura.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(candidatura.dataCandidatura).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedCandidatura(candidatura)
                                setShowModal(true)
                              }}
                              className="text-blue-400 hover:text-blue-300"
                              title="Ver detalhes"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            {candidatura.status === 'pendente' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedCandidatura(candidatura)
                                    setShowModal(true)
                                  }}
                                  className="text-green-400 hover:text-green-300"
                                  title="Aprovar"
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedCandidatura(candidatura)
                                    setShowModal(true)
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                  title="Rejeitar"
                                >
                                  <XCircleIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Modal de Detalhes */}
        {showModal && selectedCandidatura && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-sss-medium rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-sss-white">
                  Detalhes da Candidatura
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h4 className="text-md font-semibold text-sss-white mb-3">Informações Básicas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Nome</label>
                      <p className="text-sss-white">{selectedCandidatura.nome}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Email</label>
                      <p className="text-sss-white">{selectedCandidatura.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Categoria</label>
                      <p className="text-sss-white">{selectedCandidatura.categoria}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCandidatura.status)}`}>
                        {getStatusIcon(selectedCandidatura.status)}
                        {selectedCandidatura.status.charAt(0).toUpperCase() + selectedCandidatura.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Biografia */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Biografia</label>
                  <p className="text-sss-white bg-sss-dark p-3 rounded-lg">{selectedCandidatura.bio}</p>
                </div>

                {/* Redes Sociais */}
                <div>
                  <h4 className="text-md font-semibold text-sss-white mb-3">Redes Sociais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedCandidatura.redesSociais).map(([platform, url]) => (
                      url && (
                        <div key={platform}>
                          <label className="block text-sm font-medium text-gray-400 capitalize">{platform}</label>
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sss-accent hover:text-red-400 text-sm break-all"
                          >
                            {url}
                          </a>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Portfólio */}
                <div>
                  <h4 className="text-md font-semibold text-sss-white mb-3">Portfólio</h4>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Descrição</label>
                    <p className="text-sss-white bg-sss-dark p-3 rounded-lg">{selectedCandidatura.portfolio.descricao}</p>
                  </div>
                  {selectedCandidatura.portfolio.links.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Links</label>
                      <div className="space-y-2">
                        {selectedCandidatura.portfolio.links.map((link, index) => (
                          <a 
                            key={index}
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block text-sss-accent hover:text-red-400 text-sm break-all"
                          >
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Experiência e Motivação */}
                <div>
                  <h4 className="text-md font-semibold text-sss-white mb-3">Experiência e Motivação</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Experiência</label>
                      <p className="text-sss-white bg-sss-dark p-3 rounded-lg text-sm">{selectedCandidatura.experiencia}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Motivação</label>
                      <p className="text-sss-white bg-sss-dark p-3 rounded-lg text-sm">{selectedCandidatura.motivacao}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Metas</label>
                      <p className="text-sss-white bg-sss-dark p-3 rounded-lg text-sm">{selectedCandidatura.metas}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Disponibilidade</label>
                      <p className="text-sss-white bg-sss-dark p-3 rounded-lg text-sm">{selectedCandidatura.disponibilidade}</p>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {selectedCandidatura.status === 'pendente' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Observações {selectedCandidatura.status === 'pendente' && '(obrigatório para rejeição)'}
                    </label>
                    <textarea
                      rows={3}
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                      placeholder="Adicione observações sobre a candidatura..."
                    />
                  </div>
                )}

                {/* Ações */}
                {selectedCandidatura.status === 'pendente' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => aprovarCandidatura(selectedCandidatura.id)}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Aprovar</span>
                    </button>
                    <button
                      onClick={() => rejeitarCandidatura(selectedCandidatura.id)}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      <span>Rejeitar</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  )
} 