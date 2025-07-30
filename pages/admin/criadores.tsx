import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  TrophyIcon,
  UsersIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../../lib/auth'
import Navbar from '../../components/Navbar'

interface Criador {
  id: string
  nome: string
  email: string
  nivel: string
  doacoesRecebidas: number
  apoiadores: number
  favoritos: number
  status: 'ativo' | 'suspenso' | 'pendente'
  dataCriacao: Date
}

export default function AdminCriadores() {
  const [user, setUser] = useState<User | null>(null)
  const [criadores, setCriadores] = useState<Criador[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    ativos: 0,
    supremos: 0,
    suspensos: 0
  })

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    
    // Verificar se é admin
    if (Number(currentUser.nivel) < 5) {
      alert('Acesso negado. Apenas administradores podem acessar esta área.')
      window.location.href = '/admin'
      return
    }
    
    setUser(currentUser)
    loadCriadores()
  }, [])

  const loadCriadores = async () => {
    try {
      setLoading(true)
      
      // Obter token do localStorage como fallback
      const token = localStorage.getItem('sementesplay_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      // Adicionar token no header se disponível
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/admin/criadores', {
        credentials: 'include',
        headers
      })
      
      if (response.ok) {
        const data = await response.json()
        setCriadores(data.criadores || [])
        setEstatisticas(data.estatisticas || {
          total: 0,
          ativos: 0,
          supremos: 0,
          suspensos: 0
        })
      } else {
        const errorText = await response.text()
        console.error('Erro na resposta:', response.status, errorText)
      }
    } catch (error) {
      console.error('Erro ao carregar criadores:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCriadores = criadores.filter(criador => {
    const matchesSearch = criador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         criador.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'todos' || criador.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'text-green-500 bg-green-500/10'
      case 'suspenso': return 'text-red-500 bg-red-500/10'
      case 'pendente': return 'text-yellow-500 bg-yellow-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Supremo': return 'text-purple-500 bg-purple-500/10'
      case 'Parceiro': return 'text-blue-500 bg-blue-500/10'
      case 'Comum': return 'text-gray-500 bg-gray-500/10'
      case 'Iniciante': return 'text-green-500 bg-green-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  // Funções para as ações
  const visualizarCriador = (criador: Criador) => {
    window.open(`/criador/${criador.id}`, '_blank')
  }

  const editarCriador = (criador: Criador) => {
    // Implementar modal de edição ou redirecionar para página de edição
    alert(`Editar criador: ${criador.nome}`)
  }

  const removerCriador = async (criador: Criador) => {
    if (confirm(`Tem certeza que deseja remover o criador "${criador.nome}"?\n\n⚠️ ATENÇÃO: Esta ação irá remover:\n• Todos os conteúdos criados\n• Todas as enquetes\n• Todos os recados enviados/recebidos\n• Todas as interações\n• Todas as doações recebidas\n• Todas as notificações\n• Todas as conquistas e emblemas\n• Todas as missões\n• Todos os comentários\n• Todas as conversas e mensagens\n• Candidatura de criador\n\nO usuário voltará ao nível comum.`)) {
      try {
        const response = await fetch(`/api/admin/criadores/${criador.id}/suspender`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          alert('Criador removido com sucesso!')
          loadCriadores() // Recarregar lista
        } else {
          const error = await response.text()
          alert(`Erro ao remover criador: ${error}`)
        }
      } catch (error) {
        console.error('Erro ao remover criador:', error)
        alert('Erro ao remover criador')
      }
    }
  }

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
        <title>Gerenciar Criadores - SementesPLAY</title>
        <meta name="description" content="Gerenciamento de criadores" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/admin" className="p-2 bg-sss-medium rounded-lg hover:bg-sss-light transition-colors">
                  <ArrowLeftIcon className="w-5 h-5 text-sss-white" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-sss-white">Gerenciar Criadores</h1>
                  <p className="text-gray-400">Aprovar e gerenciar criadores de conteúdo</p>
                </div>
              </div>
              <Link href="/admin/candidaturas" className="bg-sss-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <PlusIcon className="w-5 h-5" />
                <span>Ver Candidaturas</span>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-sss-medium rounded-lg p-6 border border-sss-light"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total de Criadores</p>
                    <p className="text-2xl font-bold text-sss-white">{estatisticas.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <TrophyIcon className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-sss-medium rounded-lg p-6 border border-sss-light"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Ativos</p>
                    <p className="text-2xl font-bold text-green-500">
                      {estatisticas.ativos}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <UsersIcon className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-sss-medium rounded-lg p-6 border border-sss-light"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Supremos</p>
                    <p className="text-2xl font-bold text-purple-500">
                      {estatisticas.supremos}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <TrophyIcon className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-sss-medium rounded-lg p-6 border border-sss-light"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Suspensos</p>
                    <p className="text-2xl font-bold text-red-500">
                      {estatisticas.suspensos}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <TrashIcon className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Filters */}
            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar criadores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-2 text-sss-white placeholder-gray-400 focus:outline-none focus:border-sss-accent"
                  />
                </div>
                <div>
                                     <select
                     value={filterStatus}
                     onChange={(e) => setFilterStatus(e.target.value)}
                     className="bg-sss-dark border border-sss-light rounded-lg px-4 py-2 text-sss-white focus:outline-none focus:border-sss-accent"
                     aria-label="Filtrar por status"
                   >
                    <option value="todos">Todos os Status</option>
                    <option value="ativo">Ativos</option>
                    <option value="suspenso">Suspensos</option>
                    <option value="pendente">Pendentes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Criadores Table */}
            <div className="bg-sss-medium rounded-lg border border-sss-light overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-sss-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Criador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Nível
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Doações
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Apoiadores
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sss-light">
                    {filteredCriadores.map((criador) => (
                      <tr key={criador.id} className="hover:bg-sss-dark transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-sss-white">{criador.nome}</div>
                            <div className="text-sm text-gray-400">{criador.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNivelColor(criador.nivel)}`}>
                            {criador.nivel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(criador.status)}`}>
                            {criador.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-sss-white">
                          {criador.doacoesRecebidas.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-sss-white">
                          {criador.apoiadores}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => visualizarCriador(criador)}
                              className="text-blue-500 hover:text-blue-400 transition-colors" 
                              aria-label="Visualizar criador"
                              title="Visualizar perfil"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => editarCriador(criador)}
                              className="text-yellow-500 hover:text-yellow-400 transition-colors" 
                              aria-label="Editar criador"
                              title="Editar criador"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => removerCriador(criador)}
                              className="text-red-500 hover:text-red-400 transition-colors" 
                              aria-label="Remover criador"
                              title="Remover criador"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
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
      </div>
    </>
  )
} 