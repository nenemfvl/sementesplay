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
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../../lib/auth'

interface LogAuditoria {
  id: string
  usuarioId: string
  usuarioNome: string
  acao: string
  detalhes: string
  ip: string
  userAgent: string
  timestamp: Date
  nivel: 'info' | 'warning' | 'error' | 'success'
}

export default function AdminLogs() {
  const [user, setUser] = useState<User | null>(null)
  const [logs, setLogs] = useState<LogAuditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterNivel, setFilterNivel] = useState('todos')
  const [filterAcao, setFilterAcao] = useState('todos')
  const [selectedLog, setSelectedLog] = useState<LogAuditoria | null>(null)
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
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs')
      const data = await response.json()
      if (response.ok) {
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtrarLogs = () => {
    return logs.filter(log => {
      const matchSearch = log.usuarioNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.detalhes.toLowerCase().includes(searchTerm.toLowerCase())
      const matchNivel = filterNivel === 'todos' || log.nivel === filterNivel
      const matchAcao = filterAcao === 'todos' || log.acao === filterAcao
      
      return matchSearch && matchNivel && matchAcao
    })
  }

  const getNivelIcon = (nivel: string) => {
    switch (nivel) {
      case 'info':
        return <InformationCircleIcon className="w-4 h-4 text-blue-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <XCircleIcon className="w-4 h-4 text-red-500" />
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      default:
        return <InformationCircleIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'info':
        return 'border-l-blue-500'
      case 'warning':
        return 'border-l-yellow-500'
      case 'error':
        return 'border-l-red-500'
      case 'success':
        return 'border-l-green-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const formatarTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }

  const logsFiltrados = filtrarLogs()

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Logs de Auditoria - Admin SementesPLAY</title>
        <meta name="description" content="Logs de auditoria do sistema" />
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
                  <p className="text-sm text-red-400">Logs de Auditoria</p>
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
                <h2 className="text-3xl font-bold text-sss-white">Logs de Auditoria</h2>
                <p className="text-gray-400">Registro de todas as ações do sistema</p>
              </div>
              <div className="text-right">
                <p className="text-sss-white font-semibold">{logsFiltrados.length} logs</p>
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
                      placeholder="Usuário, ação ou detalhes..."
                      className="w-full pl-10 pr-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                    />
                  </div>
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
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="success">Success</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ação
                  </label>
                  <select
                    value={filterAcao}
                    onChange={(e) => setFilterAcao(e.target.value)}
                    className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                  >
                    <option value="todos">Todas as ações</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="doacao">Doação</option>
                    <option value="cashback">Cashback</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterNivel('todos')
                      setFilterAcao('todos')
                    }}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-sss-medium rounded-lg border border-sss-light overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sss-accent mx-auto"></div>
                  <p className="text-gray-400 mt-2">Carregando logs...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-sss-dark">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Nível
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Ação
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Detalhes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          IP
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Data/Hora
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sss-light">
                      {logsFiltrados.map((log) => (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`hover:bg-sss-dark transition-colors ${getNivelColor(log.nivel)}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getNivelIcon(log.nivel)}
                              <span className="ml-2 text-sm font-medium text-sss-white capitalize">
                                {log.nivel}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-sss-white font-medium">
                              {log.usuarioNome}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-sss-white">
                              {log.acao}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-400 max-w-xs truncate">
                              {log.detalhes}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-400">
                              {log.ip}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-400">
                              {formatarTimestamp(log.timestamp)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedLog(log)
                                setShowModal(true)
                              }}
                              className="text-blue-400 hover:text-blue-300"
                              title="Ver detalhes"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
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

        {/* Modal de Detalhes */}
        {showModal && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-sss-medium rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-sss-white mb-4">
                Detalhes do Log
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">ID</label>
                  <p className="text-sss-white text-sm">{selectedLog.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Usuário</label>
                  <p className="text-sss-white text-sm">{selectedLog.usuarioNome}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Ação</label>
                  <p className="text-sss-white text-sm">{selectedLog.acao}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Detalhes</label>
                  <p className="text-sss-white text-sm whitespace-pre-wrap">{selectedLog.detalhes}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">IP</label>
                  <p className="text-sss-white text-sm">{selectedLog.ip}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">User Agent</label>
                  <p className="text-sss-white text-sm text-xs">{selectedLog.userAgent}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Data/Hora</label>
                  <p className="text-sss-white text-sm">{formatarTimestamp(selectedLog.timestamp)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nível</label>
                  <div className="flex items-center">
                    {getNivelIcon(selectedLog.nivel)}
                    <span className="ml-2 text-sss-white text-sm capitalize">{selectedLog.nivel}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  )
} 