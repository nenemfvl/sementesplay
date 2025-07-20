import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LightBulbIcon, 
  ArrowTrendingUpIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface Insight {
  id: string
  type: 'positive' | 'warning' | 'info' | 'trend'
  title: string
  description: string
  value?: string
  trend?: number
  priority: 'high' | 'medium' | 'low'
  timestamp: Date
}

export default function InsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular geração de insights
    const generateInsights = () => {
      const mockInsights: Insight[] = [
        {
          id: '1',
          type: 'positive',
          title: 'Crescimento Recorde',
          description: 'Doações aumentaram 25% esta semana, o maior crescimento dos últimos 3 meses.',
          value: '+25%',
          trend: 25,
          priority: 'high',
          timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 min atrás
        },
        {
          id: '2',
          type: 'trend',
          title: 'Horário de Pico Identificado',
          description: 'Maior atividade entre 20h e 22h. Considere programar eventos neste horário.',
          value: '20h-22h',
          priority: 'medium',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2h atrás
        },
        {
          id: '3',
          type: 'warning',
          title: 'Retenção de Usuários',
          description: 'Taxa de retenção caiu 8% este mês. Recomenda-se revisar estratégias de engajamento.',
          value: '-8%',
          trend: -8,
          priority: 'high',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4h atrás
        },
        {
          id: '4',
          type: 'info',
          title: 'Novo Criador em Destaque',
          description: 'AnaArt recebeu 150% mais doações que a média. Considere destacar em campanhas.',
          value: '+150%',
          trend: 150,
          priority: 'medium',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6h atrás
        },
        {
          id: '5',
          type: 'positive',
          title: 'Missões Efetivas',
          description: 'Sistema de missões aumentou engajamento em 40%. Continue incentivando participação.',
          value: '+40%',
          trend: 40,
          priority: 'medium',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8h atrás
        }
      ]

      setInsights(mockInsights)
      setLoading(false)
    }

    // Simular delay de processamento
    setTimeout(generateInsights, 2000)
  }, [])

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
      case 'info':
        return <LightBulbIcon className="w-5 h-5 text-blue-400" />
      case 'trend':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-purple-400" />
    }
  }

  const getPriorityColor = (priority: Insight['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-400'
      case 'medium':
        return 'border-l-yellow-400'
      case 'low':
        return 'border-l-green-400'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 1000 / 60)
    const hours = Math.floor(minutes / 60)
    
    if (minutes < 60) return `${minutes}m atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${Math.floor(hours / 24)}d atrás`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-sss-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400">Analisando dados...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="w-5 h-5 text-sss-accent" />
          <span className="text-sm text-gray-400">Últimas 24h</span>
        </div>
        <button className="text-sss-accent hover:text-red-400 text-sm font-medium transition-colors">
          Ver todos
        </button>
      </div>

      {/* Lista de insights */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-4 bg-sss-dark rounded-lg border-l-4 ${getPriorityColor(insight.priority)} hover:bg-sss-light transition-colors`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getInsightIcon(insight.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sss-white text-sm">
                    {insight.title}
                  </h3>
                  {insight.value && (
                    <span className={`text-sm font-bold ${
                      insight.trend && insight.trend > 0 ? 'text-green-400' : 
                      insight.trend && insight.trend < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {insight.value}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-400 mb-2">
                  {insight.description}
                </p>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <ClockIcon className="w-3 h-3" />
                  <span>{formatTime(insight.timestamp)}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    insight.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {insight.priority === 'high' ? 'Alta' : 
                     insight.priority === 'medium' ? 'Média' : 'Baixa'} prioridade
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-500">
          Insights gerados automaticamente com base nos dados da plataforma
        </p>
      </div>
    </div>
  )
} 