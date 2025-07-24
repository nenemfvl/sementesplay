import React from 'react'
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
  timestamp: string
}

interface InsightsPanelProps {
  insights?: Insight[]
}

export default function InsightsPanel({ insights = [] }: InsightsPanelProps) {
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

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 1000 / 60)
    const hours = Math.floor(minutes / 60)
    if (minutes < 60) return `${minutes}m atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${Math.floor(hours / 24)}d atrás`
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-gray-400">Nenhum insight disponível.</span>
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