import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  HeartIcon,
  GiftIcon,
  TrophyIcon,
  CogIcon,
  DocumentArrowDownIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { auth, User } from '../lib/auth'
import AnalyticsChart from '../components/analytics/AnalyticsChart'
import MetricsCard from '../components/analytics/MetricsCard'
import TopPerformers from '../components/analytics/TopPerformers'
import RealTimeActivity from '../components/analytics/RealTimeActivity'
import InsightsPanel from '../components/analytics/InsightsPanel'
import ExportModal from '../components/analytics/ExportModal'

const TIME_RANGES = [
  { value: '1d', label: '24h' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
  { value: '1y', label: '1 ano' }
]

const METRICS = [
  { id: 'donations', label: 'Doações', icon: HeartIcon, color: 'red' },
  { id: 'users', label: 'Usuários', icon: UsersIcon, color: 'blue' },
  { id: 'revenue', label: 'Receita', icon: CurrencyDollarIcon, color: 'green' },
  { id: 'engagement', label: 'Engajamento', icon: EyeIcon, color: 'purple' }
]

export default function Analytics() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('donations')
  const [showExportModal, setShowExportModal] = useState(false)

  // Dados reais
  const [overview, setOverview] = useState<any>(null)
  const [trends, setTrends] = useState<any>(null)
  const [performers, setPerformers] = useState<any>(null)
  const [insights, setInsights] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    if (parseInt(currentUser.nivel) < 3) {
              window.location.href = '/criadores'
      return
    }
    setUser(currentUser)
    setLoading(false)
  }, [])

  // Buscar dados reais
  useEffect(() => {
    async function fetchData() {
      setLoadingData(true)
      try {
        const [overviewRes, trendsRes, performersRes, insightsRes] = await Promise.all([
          fetch(`/api/analytics/overview?period=${timeRange}`),
          fetch(`/api/analytics/trends?metric=${selectedMetric}&timeRange=${timeRange}`),
          fetch(`/api/analytics/performers?period=${timeRange}`),
          fetch(`/api/analytics/insights?period=${timeRange}`)
        ])
        setOverview(await overviewRes.json())
        setTrends(await trendsRes.json())
        setPerformers(await performersRes.json())
        setInsights(await insightsRes.json())
      } catch {
        setOverview(null)
        setTrends(null)
        setPerformers(null)
        setInsights(null)
      }
      setLoadingData(false)
    }
    fetchData()
  }, [timeRange, selectedMetric])

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-sss-white">Carregando Analytics...</div>
      </div>
    )
  }

  if (!user || !overview || !trends || !performers || !insights) {
    return null
  }

  return (
    <>
      <Head>
        <title>Analytics - SementesPLAY</title>
        <meta name="description" content="Dashboard de analytics e insights" />
      </Head>

      <div className="min-h-screen bg-sss-dark">


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Métricas Principais */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <MetricsCard
              title="Total de Doações"
              value={overview.totalDonations?.toLocaleString()}
              change={overview.growthRate}
              icon={HeartIcon}
              color="red"
              trend={overview.growthRate >= 0 ? 'up' : 'down'}
            />
            <MetricsCard
              title="Usuários Ativos"
              value={overview.totalUsers?.toLocaleString()}
              change={overview.userGrowth}
              icon={UsersIcon}
              color="blue"
              trend={overview.userGrowth >= 0 ? 'up' : 'down'}
            />
            <MetricsCard
              title="Criadores"
              value={overview.totalCreators?.toLocaleString()}
              change={overview.creatorGrowth}
              icon={TrophyIcon}
              color="yellow"
              trend={overview.creatorGrowth >= 0 ? 'up' : 'down'}
            />
            <MetricsCard
              title="Receita Total"
              value={`R$ ${overview.totalRevenue?.toLocaleString()}`}
              change={overview.revenueGrowth}
              icon={CurrencyDollarIcon}
              color="green"
              trend={overview.revenueGrowth >= 0 ? 'up' : 'down'}
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gráfico Principal */}
            <motion.div
              className="lg:col-span-2 bg-sss-medium rounded-lg p-6 border border-sss-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-sss-white">Tendências</h2>
                <div className="flex items-center space-x-2">
                  {METRICS.map((metric) => (
                    <button
                      key={metric.id}
                      onClick={() => setSelectedMetric(metric.id)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        selectedMetric === metric.id
                          ? 'bg-sss-accent text-white'
                          : 'bg-sss-light text-gray-300 hover:text-white'
                      }`}
                    >
                      {metric.label}
                    </button>
                  ))}
                </div>
              </div>
              <AnalyticsChart
                metric={selectedMetric}
                timeRange={timeRange}
                height={400}
                data={trends.data}
              />
            </motion.div>

            {/* Atividade em Tempo Real */}
            <motion.div
              className="bg-sss-medium rounded-lg p-6 border border-sss-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-sss-white">Atividade em Tempo Real</h2>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <RealTimeActivity />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Top Performers */}
            <motion.div
              className="bg-sss-medium rounded-lg p-6 border border-sss-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-sss-white">Top Performers</h2>
                <FunnelIcon className="w-5 h-5 text-gray-400" />
              </div>
              <TopPerformers creators={performers.creators} donors={performers.donors} />
            </motion.div>

            {/* Insights */}
            <motion.div
              className="bg-sss-medium rounded-lg p-6 border border-sss-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-sss-white">Insights Automáticos</h2>
                <CogIcon className="w-5 h-5 text-gray-400" />
              </div>
              <InsightsPanel insights={insights.insights} />
            </motion.div>
          </div>
        </div>

        {/* Modal de Exportação */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          timeRange={timeRange}
        />
      </div>
    </>
  )
} 