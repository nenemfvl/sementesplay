import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  TrophyIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../../lib/auth'
import Navbar from '../../components/Navbar'

interface Missao {
  id: string
  titulo: string
  descricao: string
  objetivo: string
  recompensa: number
  tipo: string
  ativa: boolean
  dataCriacao: string
  emblema?: string
}

export default function AdminMissoes() {
  const [user, setUser] = useState<User | null>(null)
  const [missoes, setMissoes] = useState<Missao[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingMissao, setEditingMissao] = useState<Missao | null>(null)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    objetivo: '',
    recompensa: 0,
    tipo: 'diaria',
    emblema: ''
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
      window.location.href = '/'
      return
    }
    
    setUser(currentUser)
    loadMissoes()
  }, [])

  const loadMissoes = async () => {
    try {
      const response = await fetch('/api/missoes')
      if (response.ok) {
        const data = await response.json()
        setMissoes(data.missoes || [])
      }
    } catch (error) {
      console.error('Erro ao carregar missões:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleMissaoStatus = async (missaoId: string, ativa: boolean) => {
    try {
      const response = await fetch(`/api/missoes/${missaoId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativa: !ativa }),
      })

      if (response.ok) {
        loadMissoes() // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao alterar status da missão:', error)
    }
  }

  const deleteMissao = async (missaoId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta missão?')) return

    try {
      const response = await fetch(`/api/missoes/${missaoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        loadMissoes() // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao excluir missão:', error)
    }
  }

  const openCreateModal = () => {
    setFormData({
      titulo: '',
      descricao: '',
      objetivo: '',
      recompensa: 0,
      tipo: 'diaria',
      emblema: ''
    })
    setEditingMissao(null)
    setShowCreateModal(true)
  }

  const openEditModal = (missao: Missao) => {
    setFormData({
      titulo: missao.titulo,
      descricao: missao.descricao,
      objetivo: missao.objetivo,
      recompensa: missao.recompensa,
      tipo: missao.tipo,
      emblema: missao.emblema || ''
    })
    setEditingMissao(missao)
    setShowCreateModal(true)
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setEditingMissao(null)
    setFormData({
      titulo: '',
      descricao: '',
      objetivo: '',
      recompensa: 0,
      tipo: 'diaria',
      emblema: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingMissao 
        ? `/api/missoes/${editingMissao.id}` 
        : '/api/missoes'
      
      const method = editingMissao ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        closeModal()
        loadMissoes() // Recarregar lista
      } else {
        const error = await response.json()
        alert(`Erro: ${error.message || 'Falha ao salvar missão'}`)
      }
    } catch (error) {
      console.error('Erro ao salvar missão:', error)
      alert('Erro ao salvar missão. Tente novamente.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'recompensa' ? Number(value) : value
    }))
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
        <title>Gerenciar Missões - SementesPLAY</title>
        <meta name="description" content="Gerenciamento de missões e recompensas" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-sss-white">Sistema de Missões</h1>
                <p className="text-gray-400 mt-2">Gerencie missões e recompensas da plataforma</p>
              </div>
              <button
                onClick={openCreateModal}
                className="bg-sss-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Nova Missão</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total de Missões</p>
                    <p className="text-2xl font-bold text-sss-white">{missoes.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <TrophyIcon className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Missões Ativas</p>
                    <p className="text-2xl font-bold text-sss-white">
                      {missoes.filter(m => m.ativa).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Missões Inativas</p>
                    <p className="text-2xl font-bold text-sss-white">
                      {missoes.filter(m => !m.ativa).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <XMarkIcon className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Missões List */}
            <div className="bg-sss-medium rounded-lg border border-sss-light">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-sss-white mb-6">Lista de Missões</h2>
                
                {missoes.length === 0 ? (
                  <div className="text-center py-12">
                    <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-sss-white mb-2">Nenhuma missão encontrada</h3>
                    <p className="text-gray-400 mb-4">Crie sua primeira missão para começar</p>
                    <button
                      onClick={openCreateModal}
                      className="bg-sss-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Criar Missão
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {missoes.map((missao) => (
                      <motion.div
                        key={missao.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-sss-dark rounded-lg p-4 border border-sss-light"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                              {missao.emblema ? (
                                <span className="text-2xl">{missao.emblema}</span>
                              ) : (
                                <TrophyIcon className="w-6 h-6 text-purple-500" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-sss-white">{missao.titulo}</h3>
                              <p className="text-gray-400 text-sm">{missao.descricao}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                  {missao.tipo}
                                </span>
                                <span className="text-xs bg-green-700 text-green-300 px-2 py-1 rounded">
                                  {missao.recompensa} Sementes
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  missao.ativa 
                                    ? 'bg-green-700 text-green-300' 
                                    : 'bg-red-700 text-red-300'
                                }`}>
                                  {missao.ativa ? 'Ativa' : 'Inativa'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditModal(missao)}
                              className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                              title="Editar"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            
                            <button
                              onClick={() => toggleMissaoStatus(missao.id, missao.ativa)}
                              className={`p-2 transition-colors ${
                                missao.ativa 
                                  ? 'text-red-400 hover:text-red-300' 
                                  : 'text-green-400 hover:text-green-300'
                              }`}
                              title={missao.ativa ? 'Desativar' : 'Ativar'}
                            >
                              {missao.ativa ? <XMarkIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
                            </button>
                            
                            <button
                              onClick={() => deleteMissao(missao.id)}
                              className="p-2 text-red-400 hover:text-red-300 transition-colors"
                              title="Excluir"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal de Criar/Editar Missão */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-sss-medium rounded-lg p-6 w-full max-w-md mx-4 border border-sss-light"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-sss-white">
                {editingMissao ? 'Editar Missão' : 'Nova Missão'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white"
                title="Fechar modal"
                aria-label="Fechar modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  placeholder="Digite o título da missão"
                  title="Título da missão"
                  className="w-full bg-sss-dark border border-sss-light rounded-lg px-3 py-2 text-sss-white focus:outline-none focus:border-sss-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descreva a missão"
                  title="Descrição da missão"
                  className="w-full bg-sss-dark border border-sss-light rounded-lg px-3 py-2 text-sss-white focus:outline-none focus:border-sss-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Objetivo
                </label>
                <textarea
                  name="objetivo"
                  value={formData.objetivo}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Digite o objetivo da missão"
                  title="Objetivo da missão"
                  className="w-full bg-sss-dark border border-sss-light rounded-lg px-3 py-2 text-sss-white focus:outline-none focus:border-sss-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recompensa (Sementes)
                </label>
                <input
                  type="number"
                  name="recompensa"
                  value={formData.recompensa}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                  title="Recompensa em sementes"
                  className="w-full bg-sss-dark border border-sss-light rounded-lg px-3 py-2 text-sss-white focus:outline-none focus:border-sss-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  title="Tipo de missão"
                  className="w-full bg-sss-dark border border-sss-light rounded-lg px-3 py-2 text-sss-white focus:outline-none focus:border-sss-accent"
                >
                  <option value="diaria">Diária</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                  <option value="unica">Única</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Emblema (Emoji)
                </label>
                <input
                  type="text"
                  name="emblema"
                  value={formData.emblema}
                  onChange={handleInputChange}
                  placeholder="🏆"
                  className="w-full bg-sss-dark border border-sss-light rounded-lg px-3 py-2 text-sss-white focus:outline-none focus:border-sss-accent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sss-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingMissao ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  )
} 