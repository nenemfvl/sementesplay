import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  TrophyIcon,
  GiftIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BanknotesIcon,
  FlagIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../../lib/auth'


interface AdminStats {
  totalUsuarios: number
  totalCriadores: number
  totalDoacoes: number
  totalSementes: number
  doacoesHoje: number
  novosUsuariosHoje: number
  cashbacksResgatados: number
  missoesCompletadas: number
}

interface RecentActivity {
  id: string
  tipo: string
  descricao: string
  timestamp: Date
  usuario?: string
  valor?: number
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

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
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include' }),
        fetch('/api/admin/atividade-recente', { credentials: 'include' })
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData.atividades)
      }
    } catch (error) {
      console.error('Erro ao carregar dados admin:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: ChartBarIcon },
    { id: 'usuarios', label: 'Usuários', icon: UsersIcon },
    { id: 'criadores', label: 'Criadores', icon: TrophyIcon },
    { id: 'doacoes', label: 'Doações', icon: CurrencyDollarIcon },
    { id: 'missoes', label: 'Missões', icon: TrophyIcon },
    { id: 'chat', label: 'Chat', icon: ChatBubbleLeftIcon },
    { id: 'configuracoes', label: 'Configurações', icon: CogIcon }
  ]

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
        <title>Painel Administrativo - SementesPLAY</title>
        <meta name="description" content="Painel administrativo completo" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Bem-vindo, {user.nome}! 👋
                  </h2>
                  <p className="text-red-100">
                    Painel de controle completo do SementesPLAY
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-200">Nível de Acesso</p>
                  <p className="text-2xl font-bold">{user.nivel}</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-sss-medium rounded-lg p-6 border border-sss-light"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total de Usuários</p>
                      <p className="text-2xl font-bold text-sss-white">{stats.totalUsuarios}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <UsersIcon className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-500">+{stats.novosUsuariosHoje}</span>
                    <span className="text-gray-400 ml-1">hoje</span>
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
                      <p className="text-gray-400 text-sm">Total de Criadores</p>
                      <p className="text-2xl font-bold text-sss-white">{stats.totalCriadores}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <TrophyIcon className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-500">Ativos</span>
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
                      <p className="text-gray-400 text-sm">Total de Doações</p>
                      <p className="text-2xl font-bold text-sss-white">{stats.totalDoacoes}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-500">+{stats.doacoesHoje}</span>
                    <span className="text-gray-400 ml-1">hoje</span>
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
                      <p className="text-gray-400 text-sm">Sementes em Circulação</p>
                      <p className="text-2xl font-bold text-sss-white">{stats.totalSementes.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-sss-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-lg">🌱</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-500">Ativas</span>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="bg-sss-medium rounded-lg border border-sss-light">
              <div className="border-b border-sss-light">
                <nav className="flex flex-wrap space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-sss-accent text-sss-accent'
                          : 'border-transparent text-gray-300 hover:text-sss-white'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Quick Actions */}
                    <div>
                      <h3 className="text-lg font-semibold text-sss-white mb-4">Ações Rápidas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/admin/usuarios" className="flex items-center space-x-3 p-4 bg-sss-dark rounded-lg hover:bg-sss-light transition-colors">
                          <UsersIcon className="w-6 h-6 text-blue-500" />
                          <div>
                            <p className="text-sss-white font-medium">Gerenciar Usuários</p>
                            <p className="text-gray-400 text-sm">Ver, editar e banir usuários</p>
                          </div>
                        </Link>
                        
                        <Link href="/admin/saques" className="flex items-center space-x-3 p-4 bg-sss-dark rounded-lg hover:bg-sss-light transition-colors">
                          <BanknotesIcon className="w-6 h-6 text-green-500" />
                          <div>
                            <p className="text-sss-white font-medium">Gerenciar Saques</p>
                            <p className="text-gray-400 text-sm">Aprovar solicitações de saque</p>
                          </div>
                        </Link>
                        
                        <Link href="/admin/candidaturas" className="flex items-center space-x-3 p-4 bg-sss-dark rounded-lg hover:bg-sss-light transition-colors">
                          <DocumentTextIcon className="w-6 h-6 text-blue-500" />
                          <div>
                            <p className="text-sss-white font-medium">Candidaturas Criadores</p>
                            <p className="text-gray-400 text-sm">Revisar candidaturas pendentes</p>
                          </div>
                        </Link>
                        
                        <Link href="/admin/criadores" className="flex items-center space-x-3 p-4 bg-sss-dark rounded-lg hover:bg-sss-light transition-colors">
                          <TrophyIcon className="w-6 h-6 text-yellow-500" />
                          <div>
                            <p className="text-sss-white font-medium">Gerenciar Criadores</p>
                            <p className="text-gray-400 text-sm">Aprovar e gerenciar criadores</p>
                          </div>
                        </Link>
                        
                        <Link href="/admin/candidaturas-parceiros" className="flex items-center space-x-3 p-4 bg-sss-dark rounded-lg hover:bg-sss-light transition-colors">
                          <DocumentTextIcon className="w-6 h-6 text-purple-500" />
                          <div>
                            <p className="text-sss-white font-medium">Candidaturas Parceiros</p>
                            <p className="text-gray-400 text-sm">Revisar candidaturas de parceiros</p>
                          </div>
                        </Link>
                        
                        <Link href="/admin/parceiros" className="flex items-center space-x-3 p-4 bg-sss-dark rounded-lg hover:bg-sss-light transition-colors">
                          <UserGroupIcon className="w-6 h-6 text-indigo-500" />
                          <div>
                            <p className="text-sss-white font-medium">Gerenciar Parceiros</p>
                            <p className="text-gray-400 text-sm">Aprovar e gerenciar parceiros</p>
                          </div>
                        </Link>
                        

                        
                        <Link href="/admin/missoes" className="flex items-center space-x-3 p-4 bg-sss-dark rounded-lg hover:bg-sss-light transition-colors">
                          <TrophyIcon className="w-6 h-6 text-purple-500" />
                          <div>
                            <p className="text-sss-white font-medium">Sistema de Missões</p>
                            <p className="text-gray-400 text-sm">Configurar missões e recompensas</p>
                          </div>
                        </Link>
                        
                        <Link href="/admin/relatorios" className="flex items-center space-x-3 p-4 bg-sss-dark rounded-lg hover:bg-sss-light transition-colors">
                          <ChartBarIcon className="w-6 h-6 text-cyan-500" />
                          <div>
                            <p className="text-sss-white font-medium">Relatórios</p>
                            <p className="text-gray-400 text-sm">Análises e estatísticas</p>
                          </div>
                        </Link>
                        
                        <Link href="/admin/configuracoes" className="flex items-center space-x-3 p-4 bg-sss-dark rounded-lg hover:bg-sss-light transition-colors">
                          <CogIcon className="w-6 h-6 text-gray-400" />
                          <div>
                            <p className="text-sss-white font-medium">Configurações</p>
                            <p className="text-gray-400 text-sm">Configurações do sistema</p>
                          </div>
                        </Link>
                        
                        <Link href="/admin/logs" className="flex items-center space-x-3 p-4 bg-sss-dark rounded-lg hover:bg-sss-light transition-colors">
                          <DocumentTextIcon className="w-6 h-6 text-orange-500" />
                          <div>
                            <p className="text-sss-white font-medium">Logs de Auditoria</p>
                            <p className="text-gray-400 text-sm">Registro de atividades</p>
                          </div>
                        </Link>
                        
                        <Link href="/admin/painel" className="flex items-center space-x-3 p-4 bg-sss-dark rounded-lg hover:bg-sss-light transition-colors">
                          <FlagIcon className="w-6 h-6 text-red-500" />
                          <div>
                            <p className="text-sss-white font-medium">Verificar Denúncias</p>
                            <p className="text-gray-400 text-sm">Aprovar ou rejeitar denúncias</p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-lg font-semibold text-sss-white mb-4">Atividade Recente</h3>
                      <div className="space-y-3">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-sss-accent/20 rounded-full flex items-center justify-center">
                                {activity.tipo === 'doacao' && <CurrencyDollarIcon className="w-4 h-4 text-green-500" />}
                                {activity.tipo === 'usuario' && <UsersIcon className="w-4 h-4 text-blue-500" />}
                                {activity.tipo === 'criador' && <TrophyIcon className="w-4 h-4 text-yellow-500" />}
                                {activity.tipo === 'cashback' && <GiftIcon className="w-4 h-4 text-purple-500" />}
                              </div>
                              <div>
                                <p className="text-sss-white text-sm">{activity.descricao}</p>
                                {activity.usuario && (
                                  <p className="text-gray-400 text-xs">por {activity.usuario}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-400 text-xs">
                                {new Date(activity.timestamp).toLocaleString('pt-BR')}
                              </p>
                              {activity.valor && (
                                <p className="text-sss-accent text-sm font-medium">
                                  {activity.valor} Sementes
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'usuarios' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-12"
                  >
                    <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-sss-white mb-2">Gerenciamento de Usuários</h3>
                    <p className="text-gray-400">Em breve...</p>
                    <Link href="/admin/usuarios" className="inline-block mt-4 bg-sss-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                      Ver Usuários
                    </Link>
                  </motion.div>
                )}

                {activeTab === 'criadores' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-12"
                  >
                    <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-sss-white mb-2">Gerenciamento de Criadores</h3>
                    <p className="text-gray-400">Em breve...</p>
                    <Link href="/admin/candidaturas" className="inline-block mt-4 bg-sss-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                      Ver Criadores
                    </Link>
                  </motion.div>
                )}

                {activeTab === 'doacoes' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-12"
                  >
                    <CurrencyDollarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-sss-white mb-2">Histórico de Doações</h3>
                    <p className="text-gray-400">Em breve...</p>
                    <Link href="/admin/usuarios" className="inline-block mt-4 bg-sss-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                      Ver Doações
                    </Link>
                  </motion.div>
                )}



                {activeTab === 'missoes' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-12"
                  >
                    <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-sss-white mb-2">Sistema de Missões</h3>
                    <p className="text-gray-400">Em breve...</p>
                    <Link href="/admin/usuarios" className="inline-block mt-4 bg-sss-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                      Gerenciar Missões
                    </Link>
                  </motion.div>
                )}

                {activeTab === 'chat' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-12"
                  >
                    <ChatBubbleLeftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-sss-white mb-2">Suporte e Chat</h3>
                    <p className="text-gray-400">Gerencie conversas de suporte e moderação</p>
                    <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center">
                      <Link href="/admin/suporte" className="inline-block bg-sss-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                        Suporte
                      </Link>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'configuracoes' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-12"
                  >
                    <CogIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-sss-white mb-2">Configurações do Sistema</h3>
                    <p className="text-gray-400">Em breve...</p>
                    <Link href="/admin/configuracoes" className="inline-block mt-4 bg-sss-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                      Configurações
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 