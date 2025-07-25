import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  UserIcon, 
  ArrowLeftIcon, 
  HeartIcon,
  GiftIcon,
  TrophyIcon,
  ChartBarIcon,
  CalendarIcon,
  StarIcon,
  CogIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'
import Image from 'next/image'

export default function Perfil() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    setUser(currentUser)
    setAvatarUrl((currentUser as any).avatarUrl || null)
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/perfil/stats?usuarioId=${user?.id}`)
      const data = await response.json()
      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNivelIcon = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'supremo':
        return <StarIcon className="w-6 h-6 text-yellow-500" />
      case 'parceiro':
        return <StarIcon className="w-6 h-6 text-gray-400" />
      case 'comum':
        return <StarIcon className="w-6 h-6 text-orange-600" />
      default:
        return <UserIcon className="w-6 h-6 text-gray-400" />
    }
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'supremo':
        return 'text-yellow-500'
      case 'parceiro':
        return 'text-gray-400'
      case 'comum':
        return 'text-orange-600'
      default:
        return 'text-gray-400'
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('avatar', file)
    formData.append('usuarioId', user.id)
    setUploading(true)
    try {
      const res = await fetch('/api/usuario/avatar', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.avatarUrl) {
        setAvatarUrl(data.avatarUrl)
        setUser({ ...(user as any), avatarUrl: data.avatarUrl })
      }
    } catch (err) {
      alert('Erro ao fazer upload do avatar')
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: ChartBarIcon },
    { id: 'doacoes', label: 'Histórico de Doações', icon: HeartIcon },
    { id: 'cashback', label: 'Histórico de Cashback', icon: GiftIcon },
    { id: 'conquistas', label: 'Conquistas', icon: TrophyIcon }
  ]

  return (
    <>
      <Head>
        <title>Perfil - SementesPLAY</title>
        <meta name="description" content="Seu perfil SementesPLAY" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="inline-flex items-center text-sss-accent hover:text-red-400">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🌱</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-gray-300">Perfil</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Profile Header */}
            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-sss-accent/20 rounded-full flex items-center justify-center relative group">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar do usuário"
                      width={80}
                      height={80}
                      className="rounded-full object-cover w-20 h-20"
                    />
                  ) : (
                    <UserIcon className="w-10 h-10 text-sss-accent" />
                  )}
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-sss-accent text-white rounded-full p-1 cursor-pointer shadow-lg group-hover:scale-110 transition-transform" title="Alterar foto">
                    <PencilIcon className="w-5 h-5" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={uploading}
                    />
                  </label>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-sss-white">{user.nome}</h2>
                    {getNivelIcon(user.nivel)}
                    <span className={`text-sm font-medium ${getNivelColor(user.nivel)}`}>
                      Nível {user.nivel}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 mb-2">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    Membro desde {new Date(user.dataCriacao || Date.now()).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-sss-accent">{user.sementes}</div>
                  <div className="text-sm text-gray-400">Sementes</div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sss-accent mx-auto"></div>
                <p className="text-gray-400 mt-2">Carregando estatísticas...</p>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Total Doações</p>
                      <p className="text-2xl font-bold text-sss-white">
                        {stats?.totalDoacoes || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <HeartIcon className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Criadores Apoiados</p>
                      <p className="text-2xl font-bold text-sss-white">
                        {stats?.criadoresApoiados || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Cashbacks Resgatados</p>
                      <p className="text-2xl font-bold text-sss-white">
                        {stats?.cashbacksResgatados || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <GiftIcon className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Pontuação</p>
                      <p className="text-2xl font-bold text-sss-white">
                        {user.pontuacao}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <TrophyIcon className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tabs */}
            <div className="bg-sss-medium rounded-lg border border-sss-light">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-sss-white mb-4">Atividade Recente</h3>
                        <div className="space-y-3">
                          {stats?.atividadesRecentes?.map((atividade: any, index: number) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-sss-dark rounded-lg">
                              <div className="w-8 h-8 bg-sss-accent/20 rounded-full flex items-center justify-center">
                                <CalendarIcon className="w-4 h-4 text-sss-accent" />
                              </div>
                              <div>
                                <p className="text-sss-white text-sm">{atividade.descricao}</p>
                                <p className="text-gray-400 text-xs">{atividade.data}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-sss-white mb-4">Próximas Conquistas</h3>
                        <div className="space-y-3">
                          {stats?.proximasConquistas?.map((conquista: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                              <div>
                                <p className="text-sss-white text-sm">{conquista.nome}</p>
                                <p className="text-gray-400 text-xs">{conquista.descricao}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-400">{conquista.progresso}%</div>
                                <div className="w-16 h-2 bg-gray-600 rounded-full">
                                  <div 
                                    className="h-2 bg-sss-accent rounded-full" 
                                    style={{ width: `${conquista.progresso}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'doacoes' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Histórico de Doações</h3>
                    <div className="space-y-3">
                      {stats?.historicoDoacoes?.map((doacao: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                          <div className="flex items-center space-x-3">
                            <HeartIcon className="w-5 h-5 text-red-500" />
                            <div>
                              <p className="text-sss-white">{doacao.criador}</p>
                              <p className="text-gray-400 text-sm">{doacao.data}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sss-accent font-semibold">{doacao.valor} Sementes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'cashback' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Histórico de Cashback</h3>
                    <div className="space-y-3">
                      {stats?.historicoCashback?.map((cashback: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                          <div className="flex items-center space-x-3">
                            <GiftIcon className="w-5 h-5 text-green-500" />
                            <div>
                              <p className="text-sss-white">{cashback.codigo}</p>
                              <p className="text-gray-400 text-sm">{cashback.data}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-green-500 font-semibold">+{cashback.valor} Sementes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'conquistas' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Conquistas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stats?.conquistas?.map((conquista: any, index: number) => (
                        <div key={index} className={`p-4 rounded-lg border ${
                          conquista.desbloqueada 
                            ? 'bg-sss-accent/10 border-sss-accent' 
                            : 'bg-sss-dark border-sss-light'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <TrophyIcon className={`w-6 h-6 ${
                              conquista.desbloqueada ? 'text-yellow-500' : 'text-gray-400'
                            }`} />
                            <div>
                              <p className={`font-semibold ${
                                conquista.desbloqueada ? 'text-sss-white' : 'text-gray-400'
                              }`}>
                                {conquista.nome}
                              </p>
                              <p className="text-gray-400 text-sm">{conquista.descricao}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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