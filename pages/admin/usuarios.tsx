import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  UsersIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  UserIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../../lib/auth'

interface UsuarioAdmin {
  id: string
  nome: string
  email: string
  tipo: string
  nivel: string
  sementes: number
  pontuacao: number
  dataCriacao: Date
  status: 'ativo' | 'banido' | 'pendente'
}

export default function AdminUsuarios() {
  const [user, setUser] = useState<User | null>(null)
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [filterNivel, setFilterNivel] = useState('todos')
  const [selectedUser, setSelectedUser] = useState<UsuarioAdmin | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    
    if (Number(currentUser.nivel) < 5) {
      alert('Acesso negado. Apenas administradores podem acessar esta área.')
              window.location.href = '/admin'
      return
    }
    
    setUser(currentUser)
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      const response = await fetch('/api/admin/usuarios')
      const data = await response.json()
      if (response.ok) {
        setUsuarios(data.usuarios)
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtrarUsuarios = () => {
    return usuarios.filter(usuario => {
      const matchSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchTipo = filterTipo === 'todos' || usuario.tipo === filterTipo
      const matchNivel = filterNivel === 'todos' || usuario.nivel === filterNivel
      
      return matchSearch && matchTipo && matchNivel
    })
  }

  const [showBanModal, setShowBanModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [duracaoSuspensao, setDuracaoSuspensao] = useState(7)

  const banirUsuario = async (usuarioId: string) => {
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo do banimento.')
      return
    }

    try {
      const response = await fetch(`/api/admin/usuarios/${usuarioId}/banir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motivo })
      })

      if (response.ok) {
        alert('Usuário banido com sucesso!')
        loadUsuarios()
        setShowBanModal(false)
        setMotivo('')
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao banir usuário:', error)
      alert('Erro ao banir usuário')
    }
  }
      alert('Erro ao banir usuário')
    }
  }

  const suspenderUsuario = async (usuarioId: string) => {
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo da suspensão.')
      return
    }

    try {
      const response = await fetch(`/api/admin/usuarios/${usuarioId}/suspender`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motivo, duracao: duracaoSuspensao })
      })

      if (response.ok) {
        alert('Usuário suspenso com sucesso!')
        loadUsuarios()
        setShowSuspendModal(false)
        setMotivo('')
        setDuracaoSuspensao(7)
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao suspender usuário:', error)
      alert('Erro ao suspender usuário')
    }
  }

  const reativarUsuario = async (usuarioId: string) => {
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo da reativação.')
      return
    }

    try {
      const response = await fetch(`/api/admin/usuarios/${usuarioId}/reativar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motivo })
      })

      if (response.ok) {
        alert('Usuário reativado com sucesso!')
        loadUsuarios()
        setShowReactivateModal(false)
        setMotivo('')
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao reativar usuário:', error)
      alert('Erro ao reativar usuário')
    }
  }

  const alterarNivel = async (usuarioId: string, novoNivel: string) => {
    try {
      const response = await fetch(`/api/admin/usuarios/${usuarioId}/nivel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nivel: novoNivel })
      })

      if (response.ok) {
        alert('Nível alterado com sucesso!')
        loadUsuarios()
        setShowModal(false)
      } else {
        alert('Erro ao alterar nível')
      }
    } catch (error) {
      console.error('Erro ao alterar nível:', error)
      alert('Erro ao alterar nível')
    }
  }

  const usuariosFiltrados = filtrarUsuarios()

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Gerenciar Usuários - Admin SementesPLAY</title>
        <meta name="description" content="Gerenciamento de usuários" />
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
                  <p className="text-sm text-red-400">Gerenciar Usuários</p>
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
                <h2 className="text-2xl font-bold text-sss-white">Gerenciar Usuários</h2>
                <p className="text-gray-400">Gerencie todos os usuários da plataforma</p>
              </div>
              <div className="text-right">
                <p className="text-sss-white font-semibold">{usuariosFiltrados.length} usuários</p>
                <p className="text-gray-400 text-sm">encontrados</p>
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
                      placeholder="Nome ou email..."
                      className="w-full pl-10 pr-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo
                  </label>
                  <select
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                  >
                    <option value="todos">Todos os tipos</option>
                    <option value="comum">Comum</option>
                    <option value="criador">Criador</option>
                    <option value="parceiro">Parceiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nível
                  </label>
                  <select
                    value={filterNivel}
                    onChange={(e) => setFilterNivel(e.target.value)}
                    className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                  >
                    <option value="todos">Todos os níveis</option>
                    <option value="comum">Comum</option>
                    <option value="parceiro">Parceiro</option>
                    <option value="supremo">Supremo</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterTipo('todos')
                      setFilterNivel('todos')
                    }}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-sss-medium rounded-lg border border-sss-light overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sss-accent mx-auto"></div>
                  <p className="text-gray-400 mt-2">Carregando usuários...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-sss-dark">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Tipo/Nível
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Sementes
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
                    <tbody className="divide-y divide-sss-light">
                      {usuariosFiltrados.map((usuario) => (
                        <motion.tr
                          key={usuario.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-sss-dark transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-sss-accent/20 rounded-full flex items-center justify-center">
                                <UserIcon className="w-4 h-4 text-sss-accent" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-sss-white">
                                  {usuario.nome}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {usuario.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-sss-white">
                              <span className="capitalize">{usuario.tipo}</span>
                            </div>
                            <div className="text-sm text-gray-400">
                              Nível {usuario.nivel}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-sss-white font-medium">
                              {usuario.sementes.toLocaleString()} 🌱
                            </div>
                            <div className="text-sm text-gray-400">
                              {usuario.pontuacao} pts
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {usuario.status === 'ativo' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                Ativo
                              </span>
                            ) : usuario.status === 'banido' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <NoSymbolIcon className="w-3 h-3 mr-1" />
                                Banido
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <XCircleIcon className="w-3 h-3 mr-1" />
                                Pendente
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {new Date(usuario.dataCriacao).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(usuario)
                                  setShowModal(true)
                                }}
                                className="text-blue-400 hover:text-blue-300"
                                title="Editar"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => window.open(`/admin/usuarios/${usuario.id}`, '_blank')}
                                className="text-green-400 hover:text-green-300"
                                title="Ver detalhes"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                              {usuario.status === 'ativo' ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(usuario)
                                      setShowSuspendModal(true)
                                    }}
                                    className="text-yellow-400 hover:text-yellow-300"
                                    title="Suspender"
                                  >
                                    <ClockIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(usuario)
                                      setShowBanModal(true)
                                    }}
                                    className="text-red-400 hover:text-red-300"
                                    title="Banir"
                                  >
                                    <NoSymbolIcon className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (usuario.status === 'banido' || usuario.status === 'suspenso') ? (
                                <button
                                  onClick={() => {
                                    setSelectedUser(usuario)
                                    setShowReactivateModal(true)
                                  }}
                                  className="text-green-400 hover:text-green-300"
                                  title="Reativar"
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Modal de Edição */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-sss-medium rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-sss-white mb-4">
                Editar Usuário: {selectedUser.nome}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nível
                  </label>
                  <select
                    defaultValue={selectedUser.nivel}
                    className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                  >
                    <option value="comum">Comum</option>
                    <option value="parceiro">Parceiro</option>
                    <option value="supremo">Supremo</option>
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      const select = document.querySelector('select') as HTMLSelectElement
                      alterarNivel(selectedUser.id, select.value)
                    }}
                    className="flex-1 px-4 py-2 bg-sss-accent hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Banimento */}
        {showBanModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-sss-medium rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-red-400 mb-4">
                Banir Usuário: {selectedUser.nome}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Motivo do Banimento *
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Informe o motivo do banimento..."
                    className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowBanModal(false)
                      setMotivo('')
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => banirUsuario(selectedUser.id)}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Banir Usuário
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Suspensão */}
        {showSuspendModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-sss-medium rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                Suspender Usuário: {selectedUser.nome}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Motivo da Suspensão *
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Informe o motivo da suspensão..."
                    className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duração (dias)
                  </label>
                  <select
                    value={duracaoSuspensao}
                    onChange={(e) => setDuracaoSuspensao(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value={1}>1 dia</option>
                    <option value={3}>3 dias</option>
                    <option value={7}>7 dias</option>
                    <option value={14}>14 dias</option>
                    <option value={30}>30 dias</option>
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowSuspendModal(false)
                      setMotivo('')
                      setDuracaoSuspensao(7)
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => suspenderUsuario(selectedUser.id)}
                    className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                  >
                    Suspender Usuário
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Reativação */}
        {showReactivateModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-sss-medium rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-green-400 mb-4">
                Reativar Usuário: {selectedUser.nome}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Motivo da Reativação *
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Informe o motivo da reativação..."
                    className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowReactivateModal(false)
                      setMotivo('')
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => reativarUsuario(selectedUser.id)}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Reativar Usuário
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  )
} 