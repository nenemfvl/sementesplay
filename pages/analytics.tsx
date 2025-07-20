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

export default function Analytics() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('donations')
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    
    // Verificar se é admin ou nível alto
    if (parseInt(currentUser.nivel) < 3) {
      window.location.href = '/dashboard'
      return
    }
    
    setUser(currentUser)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-sss-white">Carregando Analytics...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Dados mockados para analytics
  const analyticsData = {
    overview: {
      totalDonations: 15420,
      totalUsers: 2847,
      totalCreators: 156,
      totalRevenue: 45230,
      growthRate: 12.5,
      userGrowth: 8.3,
      creatorGrowth: 15.7,
      revenueGrowth: 22.1
    },
    timeRanges: [
      { value: '1d', label: '24h' },
      { value: '7d', label: '7 dias' },
      { value: '30d', label: '30 dias' },
      { value: '90d', label: '90 dias' },
      { value: '1y', label: '1 ano' }
    ],
    metrics: [
      { id: 'donations', label: 'Doações', icon: HeartIcon, color: 'red' },
      { id: 'users', label: 'Usuários', icon: UsersIcon, color: 'blue' },
      { id: 'revenue', label: 'Receita', icon: CurrencyDollarIcon, color: 'green' },
      { id: 'engagement', label: 'Engajamento', icon: EyeIcon, color: 'purple' }
    ]
  }

  return (
    <>
      <Head>
        <title>Analytics - SementesPLAY</title>
        <meta name="description" content="Dashboard de analytics e insights" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">Analytics</h1>
                  <p className="text-sm text-gray-300">Business Intelligence & Insights</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Filtro de período */}
                <div className="flex items-center space-x-2 bg-sss-light rounded-lg p-1">
                  {analyticsData.timeRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setTimeRange(range.value)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        timeRange === range.value
                          ? 'bg-sss-accent text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>

                {/* Botão de exportar */}
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center space-x-2 bg-sss-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>
          </div>
        </header>

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
              value={analyticsData.overview.totalDonations.toLocaleString()}
              change={analyticsData.overview.growthRate}
              icon={HeartIcon}
              color="red"
              trend="up"
            />
            
            <MetricsCard
              title="Usuários Ativos"
              value={analyticsData.overview.totalUsers.toLocaleString()}
              change={analyticsData.overview.userGrowth}
              icon={UsersIcon}
              color="blue"
              trend="up"
            />
            
            <MetricsCard
              title="Criadores"
              value={analyticsData.overview.totalCreators.toLocaleString()}
              change={analyticsData.overview.creatorGrowth}
              icon={TrophyIcon}
              color="yellow"
              trend="up"
            />
            
            <MetricsCard
              title="Receita Total"
              value={`R$ ${analyticsData.overview.totalRevenue.toLocaleString()}`}
              change={analyticsData.overview.revenueGrowth}
              icon={CurrencyDollarIcon}
              color="green"
              trend="up"
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
                  {analyticsData.metrics.map((metric) => (
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
              
              <TopPerformers />
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
              
              <InsightsPanel />
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