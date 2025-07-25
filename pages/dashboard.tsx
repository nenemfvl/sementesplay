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
import PainelParceiro from './painel-parceiro';
import Navbar from '../components/Navbar';
import Notificacoes from '../components/Notificacoes'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [topCreators, setTopCreators] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [criadores, setCriadores] = useState<any[]>([])
  const [cashbackData, setCashbackData] = useState<any>(null)
  const [criadorId, setCriadorId] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    setUser(currentUser)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!user) return
    setLoadingData(true)
    
    // Buscar dados do criador se o usuário for um criador
    const fetchCriadorData = async () => {
      try {
        console.log('Buscando dados do criador para usuário:', user.id)
        
        // Primeiro, usar a API de debug para verificar
        const debugResponse = await fetch(`/api/debug/criador?usuarioId=${user.id}`)
        console.log('Debug response status:', debugResponse.status)
        
        if (debugResponse.ok) {
          const debugData = await debugResponse.json()
          console.log('Debug data:', debugData)
          
          if (debugData.existeCriador && debugData.criador) {
            console.log('Criador encontrado via debug:', debugData.criador)
            setCriadorId(debugData.criador.id)
            return
          } else if (debugData.usuario && debugData.usuario.nivel === 'criador') {
            console.log('Usuário tem nível criador mas não existe na tabela Criador. Criando...')
            
            // Criar o registro de criador automaticamente
            const criarResponse = await fetch('/api/criador/criar', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ usuarioId: user.id })
            })
            
            if (criarResponse.ok) {
              const criarData = await criarResponse.json()
              console.log('Criador criado com sucesso:', criarData)
              console.log('ID do criador criado:', criarData.criador.id)
              setCriadorId(criarData.criador.id)
              console.log('criadorId definido como:', criarData.criador.id)
              return
            } else {
              console.error('Erro ao criar criador:', criarResponse.status)
            }
          }
        }
        
        // Fallback para a API original
        const response = await fetch(`/api/criadores?usuarioId=${user.id}`)
        console.log('Resposta da API criadores:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Dados recebidos:', data)
          
          if (data.criadores && data.criadores.length > 0) {
            console.log('Criador encontrado:', data.criadores[0])
            setCriadorId(data.criadores[0].id)
          } else {
            console.log('Nenhum criador encontrado para este usuário')
          }
        } else {
          console.error('Erro na resposta da API:', response.status)
        }
      } catch (error) {
        console.error('Erro ao buscar dados do criador:', error)
      }
    }

    const fetchData = async () => {
      try {
        const [statsData, performersData, criadoresData] = await Promise.all([
          fetch(`/api/perfil/stats?usuarioId=${user.id}`).then(r => r.json()),
          fetch('/api/analytics/performers?period=7d').then(r => r.json()),
          fetch('/api/criadores').then(r => r.json())
        ])
        
        setStats(statsData)
        setTopCreators(performersData.creators || [])
        setCriadores(criadoresData.criadores || [])
        
        // Buscar dados do criador separadamente
        await fetchCriadorData()
        
        setLoadingData(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setStats(null)
        setTopCreators([])
        setCriadores([])
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user])

  useEffect(() => {
    if (user) {
      fetch(`/api/usuario/cashback?usuarioId=${user.id}`)
        .then(res => res.json())
        .then(data => setCashbackData(data))
        .catch(() => setCashbackData(null))
    }
  }, [user])

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-sss-white">Carregando...</div>
      </div>
    )
  }

  if (!user || !stats) {
    return null
  }

  const userStats = {
    sementes: user.sementes,
    doacoesEnviadas: stats.totalDoacoes || 0,
    criadoresApoiados: stats.criadoresApoiados || 0,
    nivel: user.nivel,
    ranking: 0 // TODO: Calcular ranking se necessário
  }

  const recentDonations = stats.historicoDoacoes || []

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
        <Navbar />
        {user && <Notificacoes usuarioId={user.id} />}
        {/* Conteúdo centralizado zerado */}
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

            {user.nivel === 'parceiro' && (
              <Link href="/painel-parceiro" className="bg-sss-medium hover:bg-sss-light border border-sss-light text-sss-white p-4 rounded-lg text-center transition-colors">
                <BuildingOfficeIcon className="w-8 h-8 mx-auto mb-2 text-sss-accent" />
                <h3 className="font-semibold">Painel Parceiro</h3>
                <p className="text-sm text-gray-400">Gerencie sua cidade</p>
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
                      {recentDonations.length === 0 ? (
                        <div className="text-gray-400 text-sm">Nenhuma doação recente.</div>
                      ) : recentDonations.map((donation: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
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
                      {topCreators.length === 0 ? (
                        <div className="text-gray-400 text-sm">Nenhum criador em destaque.</div>
                      ) : topCreators.slice(0, 3).map((creator: any, index: number) => (
                        <div key={creator.id} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center text-sm font-bold text-yellow-500">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sss-white font-medium">{creator.name}</p>
                              <p className="text-sm text-gray-400">{creator.category || 'Nível 1'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sss-white font-semibold">{creator.value}</p>
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
                      {(user.nivel === 'criador' || criadorId) ? (
                        <div className="flex items-center space-x-3 p-3 bg-sss-dark rounded-lg">
                          <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                            <StarIcon className="w-5 h-5 text-sss-accent" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sss-white font-medium">Você é um Criador!</p>
                            <p className="text-gray-400 text-sm">Gerencie seu perfil e receba doações</p>
                          </div>
                          {criadorId ? (
                            <Link href={`/criador/${criadorId}`} className="text-sss-accent hover:text-red-400">
                              Ver perfil
                            </Link>
                          ) : (
                            <span className="text-gray-400">Carregando...</span>
                          )}
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
                <div>
                  <h3 className="text-lg font-semibold text-sss-white mb-4">Histórico de Doações</h3>
                  <div className="space-y-3">
                    {recentDonations.length === 0 ? (
                      <div className="text-gray-400 text-sm">Nenhuma doação encontrada.</div>
                    ) : recentDonations.map((donation: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
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
              )}

              {activeTab === 'creators' && (
                <div>
                  <h3 className="text-lg font-semibold text-sss-white mb-4">Criadores</h3>
                  <div className="space-y-3">
                    {criadores.length === 0 ? (
                      <div className="text-gray-400 text-sm">Nenhum criador encontrado.</div>
                    ) : criadores.slice(0, 10).map((criador: any) => (
                      <div key={criador.id} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-sss-accent" />
                          </div>
                          <div>
                            <p className="text-sss-white font-medium">{criador.nome}</p>
                            <p className="text-sm text-gray-400">{criador.categoria}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sss-white font-semibold">{criador.totalSementes}</p>
                          <p className="text-sm text-gray-400">Sementes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'cashback' && (
                <div>
                  <div className="bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded mb-4 text-blue-200">
                    <strong>Como funciona:</strong><br />
                    • Use o cupom <b>sementesplay20</b> ao comprar em sites parceiros.<br />
                    • Após a compra, aguarde o parceiro repassar 20% do valor para liberar seu cashback.<br />
                    • Você recebe 10% em sementes, 2% vai para o fundo de sementes (distribuído a cada ciclo).<br />
                    • Veja aqui o status das suas compras e seus ganhos do fundo.<br />
                    • Dúvidas? Fale com o suporte.
                  </div>
                  <h3 className="text-lg font-semibold text-sss-white mb-4">Cashback e Fundo de Sementes</h3>
                  {!cashbackData ? (
                    <div className="text-gray-400 text-sm">Carregando cashback...</div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <h4 className="text-md font-bold text-sss-accent mb-2">Compras com Cupom sementesplay20</h4>
                        <div className="space-y-3">
                          {cashbackData.compras.length === 0 ? (
                            <div className="text-gray-400 text-sm">Nenhuma compra registrada com o cupom.</div>
                          ) : cashbackData.compras.map((compra: any) => (
                            <div key={compra.id} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                  <GiftIcon className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                  <p className="text-sss-white font-medium">R$ {compra.valorCompra.toFixed(2)}</p>
                                  <p className="text-sm text-gray-400">{new Date(compra.dataCompra).toLocaleDateString('pt-BR')}</p>
                                  <p className="text-xs text-gray-400">Status: {compra.status.replace('_', ' ')}</p>
                                  {compra.comprovanteUrl && (
                                    <a href={compra.comprovanteUrl} target="_blank" rel="noopener noreferrer" className="text-sss-accent underline text-xs">Ver comprovante</a>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sss-white font-semibold">{compra.status === 'cashback_liberado' ? '+Sementes' : ''}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mb-6">
                        <h4 className="text-md font-bold text-sss-accent mb-2">Ganhos do Fundo de Sementes</h4>
                        <div className="space-y-3">
                          {cashbackData.ganhosFundo.length === 0 ? (
                            <div className="text-gray-400 text-sm">Nenhum ganho de fundo registrado.</div>
                          ) : cashbackData.ganhosFundo.map((ganho: any) => (
                            <div key={ganho.id} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                  <GiftIcon className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                  <p className="text-sss-white font-medium">+{ganho.valor.toFixed(2)} Sementes</p>
                                  <p className="text-sm text-gray-400">{new Date(ganho.data).toLocaleDateString('pt-BR')}</p>
                                  <p className="text-xs text-gray-400">Ciclo do Fundo</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mb-6">
                        <h4 className="text-md font-bold text-sss-accent mb-2">Totais Recebidos</h4>
                        <div className="flex flex-col gap-2">
                          <span className="text-sss-white">Total de compras: {cashbackData.compras.length}</span>
                          <span className="text-sss-white">Total de sementes do fundo: {cashbackData.ganhosFundo.reduce((acc: number, g: any) => acc + g.valor, 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}
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
      {/* Footer minimalista centralizado */}
      <footer className="bg-black border-t border-sss-light mt-16">
        <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col items-center">
          {/* Logo e nome */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold text-sss-white">SementesPLAY</span>
          </div>
          {/* Redes sociais */}
          <div className="flex gap-4 mb-4">
            <a href="#" title="Discord" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.07.07 0 0 0-.073.035c-.211.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.164-.393-.405-.874-.617-1.249a.07.07 0 0 0-.073-.035A19.736 19.736 0 0 0 3.677 4.369a.064.064 0 0 0-.03.027C.533 9.09-.32 13.579.099 18.021a.08.08 0 0 0 .031.056c2.052 1.507 4.042 2.422 5.992 3.029a.077.077 0 0 0 .084-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.104c-.652-.247-1.27-.549-1.872-.892a.077.077 0 0 1-.008-.127c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.198.372.292a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.891.076.076 0 0 0-.04.105c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028c1.961-.607 3.951-1.522 6.003-3.029a.077.077 0 0 0 .031-.055c.5-5.177-.838-9.637-3.548-13.625a.061.061 0 0 0-.03-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z"/></svg>
            </a>
            <a href="#" title="Instagram" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.98.98-1.274 2.092-1.334 3.374C2.013 5.741 2 6.151 2 12c0 5.849.013 6.259.072 7.54.06 1.282.354 2.394 1.334 3.374.98.98 2.092 1.274 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.06 2.394-.354 3.374-1.334.98-.98 1.274-2.092 1.334-3.374.059-1.281.072-1.691.072-7.54 0-5.849-.013-6.259-.072-7.54-.06-1.282-.354-2.394-1.334-3.374-.98-.98-2.092-1.274-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
            </a>
            <a href="#" title="TikTok" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12.75 2v14.25a2.25 2.25 0 1 1-2.25-2.25h.75V12h-.75a4.5 4.5 0 1 0 4.5 4.5V7.5a5.25 5.25 0 0 0 5.25 5.25V9.75A3.75 3.75 0 0 1 16.5 6V2h-3.75z"/></svg>
            </a>
            <a href="#" title="YouTube" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.692 3.5 12 3.5 12 3.5s-7.692 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.88 0 12 0 12s0 4.12.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.308 20.5 12 20.5 12 20.5s7.692 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 16.12 24 12 24 12s0-4.12-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
            </a>
            <a href="#" title="Twitter" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.116 2.813 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
            </a>
          </div>
          {/* Links horizontais */}
          <div className="flex flex-wrap justify-center gap-4 mb-4 text-gray-400 text-sm">
            <a href="/termos" className="hover:text-sss-accent">Termos de Uso</a>
            <span>|</span>
            <a href="/privacidade" className="hover:text-sss-accent">Política de Privacidade</a>
            <span>|</span>
            <a href="/ajuda" className="hover:text-sss-accent">Ajuda</a>
            <span>|</span>
            <a href="/ranking" className="hover:text-sss-accent">Ranking de Criadores</a>
          </div>
          {/* Copyright */}
          <div className="text-gray-500 text-xs text-center">
            &copy; {new Date().getFullYear()} SementesPLAY. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </>
  )
} 