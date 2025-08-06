import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  BanknotesIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../../lib/auth'

interface Saque {
  id: string
  usuarioId: string
  valor: number
  taxa: number
  valorLiquido: number
  dadosBancarios: string
  status: string
  motivoRejeicao?: string
  dataSolicitacao: Date
  dataProcessamento?: Date
  dataConclusao?: Date
  comprovante?: string
  usuario: {
    nome: string
    email: string
  }
}

export default function AdminSaques() {
  const [user, setUser] = useState<User | null>(null)
  const [saques, setSaques] = useState<Saque[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSaque, setSelectedSaque] = useState<Saque | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('todos')

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser || currentUser.nivel !== '5') {
      window.location.href = '/login'
      return
    }
    
    setUser(currentUser)
    loadSaques()
  }, [])

  const loadSaques = async () => {
    try {
      const response = await fetch('/api/admin/saques')
      if (response.ok) {
        const data = await response.json()
        setSaques(data.saques)
      }
    } catch (error) {
      console.error('Erro ao carregar saques:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (saqueId: string, novoStatus: string, motivoRejeicao?: string) => {
    try {
      const response = await fetch(`/api/admin/saques/${saqueId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: novoStatus,
          motivoRejeicao
        })
      })

      if (response.ok) {
        alert('Status atualizado com sucesso!')
        loadSaques()
        setShowModal(false)
        setSelectedSaque(null)
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status')
    }
  }

  const getDadosPix = (dadosPixString: string) => {
    try {
      if (!dadosPixString) return null
      const dadosPix = JSON.parse(dadosPixString)
      return dadosPix
    } catch (error) {
      console.error('Erro ao parsear dados PIX:', error)
      return null
    }
  }

  const getTipoChaveLabel = (tipo: string) => {
    const labels = {
      cpf: 'CPF',
      cnpj: 'CNPJ', 
      email: 'E-mail',
      telefone: 'Telefone',
      aleatoria: 'Chave Aleatória'
    }
    return labels[tipo as keyof typeof labels] || tipo
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <ClockIcon className="w-4 h-4 text-yellow-500" />
      case 'processando': return <ExclamationTriangleIcon className="w-4 h-4 text-blue-500" />
      case 'aprovado': return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'rejeitado': return <XCircleIcon className="w-4 h-4 text-red-500" />
      case 'concluido': return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      default: return <ClockIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'text-yellow-400'
      case 'processando': return 'text-blue-400'
      case 'aprovado': return 'text-green-400'
      case 'rejeitado': return 'text-red-400'
      case 'concluido': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const saquesFiltrados = saques.filter(saque => {
    if (filter === 'todos') return true
    return saque.status === filter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sss-accent"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Gerenciar Saques - Admin SementesPLAY</title>
        <meta name="description" content="Gerenciar solicitações de saque" />
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
                <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                  <BanknotesIcon className="w-5 h-5 text-sss-accent" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-gray-300">Admin - Gerenciar Saques</p>
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
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-20 h-20 bg-sss-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BanknotesIcon className="w-10 h-10 text-sss-accent" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Gerenciar Saques
              </h2>
              <p className="text-gray-300">
                Aprove, rejeite ou processe solicitações de saque
              </p>
            </div>

            {/* Filtros */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-sss-medium rounded-lg p-6 border border-sss-light"
            >
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setFilter('todos')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'todos' 
                      ? 'bg-sss-accent text-white' 
                      : 'bg-sss-dark text-gray-300 hover:text-white'
                  }`}
                >
                  Todos ({saques.length})
                </button>
                <button
                  onClick={() => setFilter('pendente')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'pendente' 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-sss-dark text-gray-300 hover:text-white'
                  }`}
                >
                  Pendentes ({saques.filter(s => s.status === 'pendente').length})
                </button>
                <button
                  onClick={() => setFilter('processando')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'processando' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-sss-dark text-gray-300 hover:text-white'
                  }`}
                >
                  Processando ({saques.filter(s => s.status === 'processando').length})
                </button>
                <button
                  onClick={() => setFilter('aprovado')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'aprovado' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-sss-dark text-gray-300 hover:text-white'
                  }`}
                >
                  Aprovados ({saques.filter(s => s.status === 'aprovado').length})
                </button>
              </div>
            </motion.div>

            {/* Lista de Saques */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-sss-medium rounded-lg border border-sss-light overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-sss-light">
                  <thead className="bg-sss-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Valor
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
                    {saquesFiltrados.map((saque) => (
                      <tr key={saque.id} className="hover:bg-sss-dark transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-sss-white">{saque.usuario.nome}</div>
                            <div className="text-sm text-gray-400">{saque.usuario.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-sss-white">
                            <div className="font-medium">{formatarMoeda(saque.valor)}</div>
                            <div className="text-gray-400">Taxa: {formatarMoeda(saque.taxa)}</div>
                            <div className="text-green-400">Líquido: {formatarMoeda(saque.valorLiquido)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(saque.status)}
                            <span className={`ml-2 text-sm font-medium capitalize ${getStatusColor(saque.status)}`}>
                              {saque.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatarData(saque.dataSolicitacao)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedSaque(saque)
                                setShowModal(true)
                              }}
                              className="text-blue-400 hover:text-blue-300"
                              title="Ver detalhes"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            {saque.status === 'pendente' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(saque.id, 'aprovado')}
                                  className="text-green-400 hover:text-green-300"
                                  title="Aprovar"
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    const motivo = prompt('Motivo da rejeição:')
                                    if (motivo) {
                                      handleStatusChange(saque.id, 'rejeitado', motivo)
                                    }
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
            </motion.div>
          </motion.div>
        </div>

        {/* Modal de Detalhes */}
        {showModal && selectedSaque && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-sss-medium rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-sss-white">Detalhes do Saque</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Usuário</label>
                    <p className="text-sss-white">{selectedSaque.usuario.nome}</p>
                    <p className="text-gray-400 text-sm">{selectedSaque.usuario.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Valor</label>
                    <p className="text-sss-white font-medium">{formatarMoeda(selectedSaque.valor)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Taxa</label>
                    <p className="text-gray-400">{formatarMoeda(selectedSaque.taxa)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Valor Líquido</label>
                    <p className="text-green-400 font-medium">{formatarMoeda(selectedSaque.valorLiquido)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Status</label>
                    <div className="flex items-center">
                      {getStatusIcon(selectedSaque.status)}
                      <span className={`ml-2 text-sm font-medium capitalize ${getStatusColor(selectedSaque.status)}`}>
                        {selectedSaque.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Data de Solicitação</label>
                    <p className="text-gray-400">{formatarData(selectedSaque.dataSolicitacao)}</p>
                  </div>
                </div>

                {/* Dados Bancários */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Dados Bancários</label>
                  <div className="bg-sss-dark rounded-lg p-4">
                    {(() => {
                      const dados = getDadosPix(selectedSaque.dadosBancarios)
                      if (!dados) {
                        return <p className="text-red-400">Erro ao carregar dados PIX</p>
                      }
                      return (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-400 text-sm">Tipo de Chave:</span>
                            <p className="text-sss-white capitalize">{getTipoChaveLabel(dados.tipoChave)}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Chave PIX:</span>
                            <p className="text-sss-white">{dados.chavePix}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Nome do Titular:</span>
                            <p className="text-sss-white">{dados.nomeTitular}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">CPF/CNPJ:</span>
                            <p className="text-sss-white">{dados.cpfCnpj}</p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Motivo de Rejeição */}
                {selectedSaque.motivoRejeicao && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Motivo da Rejeição</label>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-200">{selectedSaque.motivoRejeicao}</p>
                    </div>
                  </div>
                )}

                {/* Ações */}
                {selectedSaque.status === 'pendente' && (
                  <div className="flex space-x-3 pt-4 border-t border-sss-light">
                    <button
                      onClick={() => handleStatusChange(selectedSaque.id, 'aprovado')}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Aprovar Saque
                    </button>
                    <button
                      onClick={() => {
                        const motivo = prompt('Motivo da rejeição:')
                        if (motivo) {
                          handleStatusChange(selectedSaque.id, 'rejeitado', motivo)
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <XCircleIcon className="w-4 h-4 mr-2" />
                      Rejeitar Saque
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