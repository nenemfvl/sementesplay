import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  UserIcon, 
  CurrencyDollarIcon, 
  HeartIcon, 
  GiftIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  ArrowRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowLeftOnRectangleIcon,
  TrophyIcon,
  ChatBubbleLeftIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  StarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'
import PainelCriador from './painel-criador';
import PainelParceiro from './parceiro';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    setUser(currentUser)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-sss-white">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Dados do usuário logado
  const userStats = {
    sementes: user.sementes,
    doacoesEnviadas: 0, // TODO: Buscar do banco
    criadoresApoiados: 0, // TODO: Buscar do banco
    nivel: user.nivel,
    ranking: 0 // TODO: Calcular ranking
  }

  const recentDonations = [
    { id: 1, criador: 'JoãoGamer', valor: 100, data: '2024-01-15' },
    { id: 2, criador: 'MariaStream', valor: 50, data: '2024-01-14' },
    { id: 3, criador: 'PedroFiveM', valor: 200, data: '2024-01-13' }
  ]

  const topCreators = [
    { id: 1, nome: 'JoãoGamer', sementes: 2500, nivel: 'Ouro' },
    { id: 2, nome: 'MariaStream', sementes: 1800, nivel: 'Prata' },
    { id: 3, nome: 'PedroFiveM', sementes: 1200, nivel: 'Bronze' }
  ]

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: ChartBarIcon },
    { id: 'donations', label: 'Minhas Doações', icon: HeartIcon },
    { id: 'creators', label: 'Criadores', icon: UserIcon },
    { id: 'cashback', label: 'Cashback', icon: GiftIcon },
    { id: 'painel-criador', label: 'Painel Criador', icon: StarIcon },
    { id: 'painel-parceiro', label: 'Painel Parceiro', icon: BuildingOfficeIcon },
  ]

  return (
    <>
      <Head>
        <title>Dashboard - SementesPLAY</title>
        <meta name="description" content="Seu dashboard SementesPLAY" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header/Navbar igual ao da home */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-gradient">
                    🌱 SementesPLAY
                  </h1>
                </div>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/" className="text-sss-white hover:text-sss-accent">Início</a>
                <a href="/status" className="text-sss-white hover:text-sss-accent">Status</a>
                <a href="/salao" className="text-sss-white hover:text-sss-accent">Salão</a>
                <a href="/criadores" className="text-sss-white hover:text-sss-accent">Criadores</a>
                <a href="/#parceiros" className="text-sss-white hover:text-sss-accent">Parceiros</a>
                <a href="/dashboard" className="text-sss-white hover:text-sss-accent">Dashboard</a>
              </nav>
              <div className="flex space-x-4 items-center">
                {user ? (
                  <>
                    <span className="text-sss-white font-medium">{user.nome}</span>
                    <button onClick={() => { auth.logout(); window.location.reload(); }} title="Sair" className="p-2 text-gray-300 hover:text-red-400">
                      <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                    </button>
                  </>
                ) : (
                  <>
                    <a href="/login" className="btn-outline">Entrar</a>
                    <a href="/registro" className="btn-primary">Cadastrar</a>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-sss-medium rounded-lg p-4 lg:p-6 border border-sss-light">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs lg:text-sm">Sementes</p>
                  <p className="text-lg lg:text-2xl font-bold text-sss-white">{userStats.sementes}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-sss-accent/20 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 lg:w-6 lg:h-6 text-sss-accent" />
                </div>
              </div>
            </div>

            <div className="bg-sss-medium rounded-lg p-4 lg:p-6 border border-sss-light">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs lg:text-sm">Doações</p>
                  <p className="text-lg lg:text-2xl font-bold text-sss-white">{userStats.doacoesEnviadas}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <HeartIcon className="w-5 h-5 lg:w-6 lg:h-6 text-red-500" />
                </div>
              </div>
            </div>

            <div className="bg-sss-medium rounded-lg p-4 lg:p-6 border border-sss-light">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs lg:text-sm">Criadores</p>
                  <p className="text-lg lg:text-2xl font-bold text-sss-white">{userStats.criadoresApoiados}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-sss-medium rounded-lg p-4 lg:p-6 border border-sss-light">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs lg:text-sm">Nível</p>
                  <p className="text-lg lg:text-2xl font-bold text-sss-white">{userStats.nivel}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <GiftIcon className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/doar" className="bg-sss-accent hover:bg-red-600 text-white p-4 rounded-lg text-center transition-colors">
              <HeartIcon className="w-6 h-8 mx-auto mb-2" />
              <h3 className="font-semibold text-sm lg:text-base">Fazer Doação</h3>
              <p className="text-xs lg:text-sm opacity-90 hidden lg:block">Apoie seus criadores favoritos</p>
            </Link>
            
            <Link href="/cashback" className="bg-sss-medium hover:bg-sss-light border border-sss-light text-sss-white p-4 rounded-lg text-center transition-colors">
              <GiftIcon className="w-6 h-8 mx-auto mb-2 text-sss-accent" />
              <h3 className="font-semibold text-sm lg:text-base">Cashback</h3>
              <p className="text-xs lg:text-sm text-gray-400 hidden lg:block">Ganhe Sementes extras</p>
            </Link>
            
            <Link href="/carteira" className="bg-sss-medium hover:bg-sss-light border border-sss-light text-sss-white p-4 rounded-lg text-center transition-colors">
              <CurrencyDollarIcon className="w-6 h-8 mx-auto mb-2 text-sss-accent" />
              <h3 className="font-semibold text-sm lg:text-base">Carteira</h3>
              <p className="text-xs lg:text-sm text-gray-400 hidden lg:block">Gerencie pagamentos</p>
            </Link>
            
            <Link href="/ranking" className="bg-sss-medium hover:bg-sss-light border border-sss-light text-sss-white p-4 rounded-lg text-center transition-colors">
              <TrophyIcon className="w-8 h-8 mx-auto mb-2 text-sss-accent" />
              <h3 className="font-semibold">Ver Ranking</h3>
              <p className="text-sm text-gray-400">Top doadores e criadores</p>
            </Link>
            
            <Link href="/perfil" className="bg-sss-medium hover:bg-sss-light border border-sss-light text-sss-white p-4 rounded-lg text-center transition-colors">
              <UserIcon className="w-8 h-8 mx-auto mb-2 text-sss-accent" />
              <h3 className="font-semibold">Meu Perfil</h3>
              <p className="text-sm text-gray-400">Estatísticas e conquistas</p>
            </Link>
            
            <Link href="/missoes" className="bg-sss-medium hover:bg-sss-light border border-sss-light text-sss-white p-4 rounded-lg text-center transition-colors">
              <TrophyIcon className="w-8 h-8 mx-auto mb-2 text-sss-accent" />
              <h3 className="font-semibold">Missões</h3>
              <p className="text-sm text-gray-400">Complete e ganhe recompensas</p>
            </Link>
            
            <Link href="/chat" className="bg-sss-medium hover:bg-sss-light border border-sss-light text-sss-white p-4 rounded-lg text-center transition-colors">
              <ChatBubbleLeftIcon className="w-8 h-8 mx-auto mb-2 text-sss-accent" />
              <h3 className="font-semibold">Chat</h3>
              <p className="text-sm text-gray-400">Converse com a comunidade</p>
            </Link>
            
            <Link href="/amigos" className="bg-sss-medium hover:bg-sss-light border border-sss-light text-sss-white p-4 rounded-lg text-center transition-colors">
              <UserGroupIcon className="w-8 h-8 mx-auto mb-2 text-sss-accent" />
              <h3 className="font-semibold">Amigos</h3>
              <p className="text-sm text-gray-400">Gerencie seus amigos</p>
            </Link>
            
            <Link href="/notificacoes-tempo-real" className="bg-sss-medium hover:bg-sss-light border border-sss-light text-sss-white p-4 rounded-lg text-center transition-colors">
              <BellIcon className="w-8 h-8 mx-auto mb-2 text-sss-accent" />
              <h3 className="font-semibold">Notificações</h3>
              <p className="text-sm text-gray-400">Tempo real</p>
            </Link>
            
            {Number(user.nivel) >= 3 && (
              <Link href="/criadores" className="bg-sss-medium hover:bg-sss-light border border-sss-light text-sss-white p-4 rounded-lg text-center transition-colors">
                <TrophyIcon className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <h3 className="font-semibold">Painel Criadores</h3>
                <p className="text-sm text-gray-400">Gerenciar criadores</p>
              </Link>
            )}
            
            {Number(user.nivel) >= 4 && (
              <Link href="/moderacao" className="bg-sss-medium hover:bg-sss-light border border-sss-light text-sss-white p-4 rounded-lg text-center transition-colors">
                <ShieldCheckIcon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold">Moderação</h3>
                <p className="text-sm text-gray-400">Denúncias e suporte</p>
              </Link>
            )}
            
            {Number(user.nivel) >= 3 && (
              <Link href="/analytics" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-lg text-center transition-colors">
                <ChartBarIcon className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm opacity-90">Business Intelligence</p>
              </Link>
            )}
          </motion.div>

          {/* Tabs */}
          <div className="bg-sss-medium rounded-lg border border-sss-light mb-8">
            <div className="border-b border-sss-light">
              <nav className="flex space-x-8 px-6">
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
                  {/* Recent Donations */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-sss-white">Doações Recentes</h3>
                      <Link href="/doar" className="text-sss-accent hover:text-red-400 text-sm flex items-center">
                        Fazer doação <ArrowRightIcon className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {recentDonations.map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                              <HeartIcon className="w-5 h-5 text-sss-accent" />
                            </div>
                            <div>
                              <p className="text-sss-white font-medium">{donation.criador}</p>
                              <p className="text-sm text-gray-400">{donation.data}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sss-white font-semibold">R$ {donation.valor}</p>
                            <p className="text-sm text-gray-400">Doação</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Creators */}
                  <div>
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Top Criadores</h3>
                    <div className="space-y-3">
                      {topCreators.map((creator, index) => (
                        <div key={creator.id} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center text-sm font-bold text-yellow-500">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sss-white font-medium">{creator.nome}</p>
                              <p className="text-sm text-gray-400">Nível {creator.nivel}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sss-white font-semibold">{creator.sementes}</p>
                            <p className="text-sm text-gray-400">Sementes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Criadores */}
                  <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-sss-white">Criadores</h3>
                      <Link href="/criadores" className="text-sss-accent hover:text-red-400 text-sm">
                        Ver todos
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {user.tipo === 'criador' ? (
                        <div className="flex items-center space-x-3 p-3 bg-sss-dark rounded-lg">
                          <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                            <StarIcon className="w-5 h-5 text-sss-accent" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sss-white font-medium">Você é um Criador!</p>
                            <p className="text-gray-400 text-sm">Gerencie seu perfil e receba doações</p>
                          </div>
                          <Link href={`/criador/${user.id}`} className="text-sss-accent hover:text-red-400">
                            Ver perfil
                          </Link>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-sss-dark rounded-lg">
                          <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                            <StarIcon className="w-5 h-5 text-yellow-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sss-white font-medium">Torne-se um Criador</p>
                            <p className="text-gray-400 text-sm">Receba doações da comunidade</p>
                          </div>
                          <Link href="/candidatura-criador" className="px-3 py-1 bg-sss-accent hover:bg-red-600 text-white rounded-lg text-sm transition-colors">
                            Candidatar-se
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'donations' && (
                <div className="text-center py-8">
                  <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sss-white mb-2">Histórico de Doações</h3>
                  <p className="text-gray-400">Em breve você poderá ver seu histórico completo de doações.</p>
                </div>
              )}

              {activeTab === 'creators' && (
                <div className="text-center py-8">
                  <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sss-white mb-2">Criadores Favoritos</h3>
                  <p className="text-gray-400">Gerencie seus criadores favoritos e veja estatísticas.</p>
                </div>
              )}

              {activeTab === 'cashback' && (
                <div className="text-center py-8">
                  <GiftIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sss-white mb-2">Sistema de Cashback</h3>
                  <p className="text-gray-400">Resgate seus códigos de cashback e ganhe Sementes extras.</p>
                </div>
              )}
              {activeTab === 'painel-criador' && (
                <div className="bg-white rounded-lg p-2">
                  <PainelCriador />
                </div>
              )}
              {activeTab === 'painel-parceiro' && (
                <div className="bg-white rounded-lg p-2">
                  <PainelParceiro />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 