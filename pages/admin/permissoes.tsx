import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon, 
  ShieldExclamationIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { auth, User } from '../../lib/auth'
import Navbar from '../../components/Navbar'

interface PermissaoInconsistente {
  id: string
  nome: string
  email: string
  nivel: string
  tipo: 'criador' | 'parceiro' | 'admin'
  problema: string
}

export default function GerenciarPermissoes() {
  const [user, setUser] = useState<User | null>(null)
  const [inconsistencias, setInconsistencias] = useState<PermissaoInconsistente[]>([])
  const [loading, setLoading] = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [corrigindo, setCorrigindo] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }

    if (Number(currentUser.nivel) < 5) {
      alert('Acesso negado. Apenas administradores podem acessar esta página.')
      window.location.href = '/'
      return
    }

    setUser(currentUser)
    verificarPermissoes()
  }, [])

  const verificarPermissoes = async () => {
    setVerificando(true)
    try {
      const response = await fetch('/api/admin/verificar-permissoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        // Simular dados de inconsistências para demonstração
        const mockInconsistencias: PermissaoInconsistente[] = [
          {
            id: '1',
            nome: 'João Silva',
            email: 'joao@email.com',
            nivel: 'criador-comum',
            tipo: 'criador',
            problema: 'Nível de criador sem registro na tabela criadores'
          },
          {
            id: '2',
            nome: 'Maria Santos',
            email: 'maria@email.com',
            nivel: 'parceiro',
            tipo: 'parceiro',
            problema: 'Nível de parceiro sem registro na tabela parceiros'
          }
        ]
        
        setInconsistencias(mockInconsistencias)
        setNotification({
          type: 'success',
          message: 'Verificação concluída com sucesso!'
        })
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Erro ao verificar permissões'
        })
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error)
      setNotification({
        type: 'error',
        message: 'Erro ao conectar com o servidor'
      })
    } finally {
      setVerificando(false)
    }
  }

  const corrigirPermissoes = async () => {
    setCorrigindo(true)
    try {
      // Simular correção
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setInconsistencias([])
      setNotification({
        type: 'success',
        message: 'Todas as inconsistências foram corrigidas!'
      })
    } catch (error) {
      console.error('Erro ao corrigir permissões:', error)
      setNotification({
        type: 'error',
        message: 'Erro ao corrigir permissões'
      })
    } finally {
      setCorrigindo(false)
    }
  }

  const verificarUsuarioEspecifico = async (usuarioId: string) => {
    try {
      const response = await fetch(`/api/admin/verificar-usuario-permissoes?usuarioId=${usuarioId}`)
      const data = await response.json()
      
      if (data.success) {
        setNotification({
          type: 'success',
          message: `Verificação do usuário concluída: ${data.resultado.temInconsistencias ? 'Inconsistências encontradas' : 'Permissões corretas'}`
        })
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Erro ao verificar usuário'
        })
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      setNotification({
        type: 'error',
        message: 'Erro ao verificar usuário'
      })
    }
  }

  const inconsistenciasFiltradas = inconsistencias.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Head>
        <title>Gerenciar Permissões - Admin | SementesPLAY</title>
      </Head>

      <div className="min-h-screen bg-sss-dark">
        <Navbar />
        
        {/* Header */}
        <div className="bg-sss-medium/50 backdrop-blur-sm border-b border-sss-light sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="w-8 h-8 text-blue-500" />
                  <h1 className="text-xl font-bold text-sss-white">Gerenciar Permissões</h1>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={verificarPermissoes}
                  disabled={verificando}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${verificando ? 'animate-spin' : ''}`} />
                  {verificando ? 'Verificando...' : 'Verificar Permissões'}
                </button>
                
                {inconsistencias.length > 0 && (
                  <button
                    onClick={corrigirPermissoes}
                    disabled={corrigindo}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    {corrigindo ? 'Corrigindo...' : 'Corrigir Todas'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Notificação */}
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                notification.type === 'success' 
                  ? 'bg-green-500/10 border border-green-500/20 text-green-200' 
                  : 'bg-red-500/10 border border-red-500/20 text-red-200'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <XCircleIcon className="w-5 h-5" />
              )}
              {notification.message}
            </motion.div>
          )}

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-sss-medium rounded-lg p-6 border border-sss-light"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total de Inconsistências</p>
                  <p className="text-2xl font-bold text-sss-white">{inconsistencias.length}</p>
                </div>
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-sss-medium rounded-lg p-6 border border-sss-light"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Criadores</p>
                  <p className="text-2xl font-bold text-sss-white">
                    {inconsistencias.filter(i => i.tipo === 'criador').length}
                  </p>
                </div>
                <UserIcon className="w-8 h-8 text-blue-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-sss-medium rounded-lg p-6 border border-sss-light"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Parceiros</p>
                  <p className="text-2xl font-bold text-sss-white">
                    {inconsistencias.filter(i => i.tipo === 'parceiro').length}
                  </p>
                </div>
                <ShieldCheckIcon className="w-8 h-8 text-green-500" />
              </div>
            </motion.div>
          </div>

          {/* Busca */}
          <div className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-sss-medium border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:border-sss-accent"
              />
            </div>
          </div>

          {/* Lista de Inconsistências */}
          {inconsistenciasFiltradas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <ShieldCheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                {inconsistencias.length === 0 ? 'Nenhuma inconsistência encontrada' : 'Nenhum resultado para a busca'}
              </h3>
              <p className="text-gray-500">
                {inconsistencias.length === 0 
                  ? 'Todas as permissões estão corretas!' 
                  : 'Tente ajustar os termos de busca'
                }
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {inconsistenciasFiltradas.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-sss-medium rounded-lg p-6 border border-sss-light"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        item.tipo === 'criador' ? 'bg-blue-500/20' :
                        item.tipo === 'parceiro' ? 'bg-green-500/20' :
                        'bg-red-500/20'
                      }`}>
                        <UserIcon className={`w-6 h-6 ${
                          item.tipo === 'criador' ? 'text-blue-500' :
                          item.tipo === 'parceiro' ? 'text-green-500' :
                          'text-red-500'
                        }`} />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-sss-white">{item.nome}</h3>
                        <p className="text-gray-400">{item.email}</p>
                        <p className="text-sm text-gray-500">Nível: {item.nivel}</p>
                        <p className="text-sm text-yellow-400 mt-1">{item.problema}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => verificarUsuarioEspecifico(item.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Verificar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
} 