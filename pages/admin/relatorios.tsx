import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  GiftIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../../lib/auth'

interface RelatorioData {
  periodo: string
  novosUsuarios: number
  doacoes: number
  sementesCirculacao: number
  cashbacksResgatados: number
  criadoresAtivos: number
  receitaTotal: number
  crescimentoUsuarios: number
  crescimentoDoacoes: number
}

interface TopDados {
  topDoadores: Array<{ nome: string; valor: number; quantidade: number }>
  topCriadores: Array<{ nome: string; recebido: number; doacoes: number }>
  topCashbacks: Array<{ codigo: string; usos: number; valor: number }>
}

export default function AdminRelatorios() {
  const [user, setUser] = useState<User | null>(null)
  const [periodo, setPeriodo] = useState('7d')
  const [relatorioData, setRelatorioData] = useState<RelatorioData | null>(null)
  const [topDados, setTopDados] = useState<TopDados | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    
    if (Number(currentUser.nivel) < 5) {
      alert('Acesso negado. Apenas administradores podem acessar esta área.')
      window.location.href = '/dashboard'
      return
    }
    
    setUser(currentUser)
    loadRelatorios()
  }, [periodo])

  const loadRelatorios = async () => {
    try {
      const [relatorioResponse, topResponse] = await Promise.all([
        fetch(`/api/admin/relatorios?periodo=${periodo}`),
        fetch(`/api/admin/relatorios/top-dados?periodo=${periodo}`)
      ])

      if (relatorioResponse.ok) {
        const data = await relatorioResponse.json()
        setRelatorioData(data)
      }

      if (topResponse.ok) {
        const data = await topResponse.json()
        setTopDados(data)
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportarRelatorio = async (formato: 'pdf' | 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/admin/relatorios/exportar?periodo=${periodo}&formato=${formato}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `relatorio-sementesplay-${periodo}.${formato}`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      alert('Erro ao exportar relatório')
    }
  }

  const formatarNumero = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const getCrescimentoIcon = (crescimento: number) => {
    return crescimento >= 0 ? (
      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
    )
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
        <title>Relatórios - Admin SementesPLAY</title>
        <meta name="description" content="Relatórios e analytics" />
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
                  <p className="text-sm text-red-400">Relatórios e Analytics</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-sss-white">Relatórios e Analytics</h2>
                <p className="text-gray-400">Análises detalhadas da plataforma</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="px-4 py-2 bg-sss-medium border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                >
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                  <option value="1y">Último ano</option>
                </select>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => exportarRelatorio('pdf')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => exportarRelatorio('csv')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Métricas Principais */}
            {relatorioData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-sss-medium rounded-lg p-6 border border-sss-light"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Novos Usuários</p>
                      <p className="text-2xl font-bold text-sss-white">{formatarNumero(relatorioData.novosUsuarios)}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <UsersIcon className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    {getCrescimentoIcon(relatorioData.crescimentoUsuarios)}
                    <span className={`ml-1 ${relatorioData.crescimentoUsuarios >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {relatorioData.crescimentoUsuarios >= 0 ? '+' : ''}{relatorioData.crescimentoUsuarios}%
                    </span>
                    <span className="text-gray-400 ml-1">vs período anterior</span>
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
                      <p className="text-gray-400 text-sm">Total de Doações</p>
                      <p className="text-2xl font-bold text-sss-white">{formatarNumero(relatorioData.doacoes)}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    {getCrescimentoIcon(relatorioData.crescimentoDoacoes)}
                    <span className={`ml-1 ${relatorioData.crescimentoDoacoes >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {relatorioData.crescimentoDoacoes >= 0 ? '+' : ''}{relatorioData.crescimentoDoacoes}%
                    </span>
                    <span className="text-gray-400 ml-1">vs período anterior</span>
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
                      <p className="text-gray-400 text-sm">Sementes em Circulação</p>
                      <p className="text-2xl font-bold text-sss-white">{formatarNumero(relatorioData.sementesCirculacao)}</p>
                    </div>
                    <div className="w-12 h-12 bg-sss-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-lg">🌱</span>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-400">
                    Total ativo na plataforma
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
                      <p className="text-gray-400 text-sm">Receita Total</p>
                      <p className="text-2xl font-bold text-sss-white">{formatarMoeda(relatorioData.receitaTotal)}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <ArrowTrendingUpIcon className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-400">
                    Valor total movimentado
                  </div>
                </motion.div>
              </div>
            )}

            {/* Top Rankings */}
            {topDados && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Doadores */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-sss-medium rounded-lg border border-sss-light"
                >
                  <div className="p-6 border-b border-sss-light">
                    <h3 className="text-lg font-semibold text-sss-white flex items-center">
                      <UsersIcon className="w-5 h-5 mr-2 text-blue-500" />
                      Top Doadores
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {topDados.topDoadores.map((doador, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-bold text-blue-500">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sss-white font-medium">{doador.nome}</p>
                            <p className="text-gray-400 text-sm">{doador.quantidade} doações</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sss-accent font-semibold">{formatarNumero(doador.valor)} 🌱</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Top Criadores */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-sss-medium rounded-lg border border-sss-light"
                >
                  <div className="p-6 border-b border-sss-light">
                    <h3 className="text-lg font-semibold text-sss-white flex items-center">
                      <TrophyIcon className="w-5 h-5 mr-2 text-yellow-500" />
                      Top Criadores
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {topDados.topCriadores.map((criador, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center text-sm font-bold text-yellow-500">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sss-white font-medium">{criador.nome}</p>
                            <p className="text-gray-400 text-sm">{criador.doacoes} doações recebidas</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sss-accent font-semibold">{formatarNumero(criador.recebido)} 🌱</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Top Cashbacks */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="bg-sss-medium rounded-lg border border-sss-light"
                >
                  <div className="p-6 border-b border-sss-light">
                    <h3 className="text-lg font-semibold text-sss-white flex items-center">
                      <GiftIcon className="w-5 h-5 mr-2 text-green-500" />
                      Top Cashbacks
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {topDados.topCashbacks.map((cashback, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-sm font-bold text-green-500">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sss-white font-medium">{cashback.codigo}</p>
                            <p className="text-gray-400 text-sm">{cashback.usos} resgates</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sss-accent font-semibold">{formatarNumero(cashback.valor)} 🌱</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Estatísticas Adicionais */}
            {relatorioData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-sss-medium rounded-lg border border-sss-light p-6"
              >
                <h3 className="text-lg font-semibold text-sss-white mb-4">Estatísticas Adicionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-sss-accent">{formatarNumero(relatorioData.cashbacksResgatados)}</p>
                    <p className="text-gray-400 text-sm">Cashbacks Resgatados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-sss-accent">{formatarNumero(relatorioData.criadoresAtivos)}</p>
                    <p className="text-gray-400 text-sm">Criadores Ativos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-sss-accent">{relatorioData.periodo}</p>
                    <p className="text-gray-400 text-sm">Período Analisado</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
} 