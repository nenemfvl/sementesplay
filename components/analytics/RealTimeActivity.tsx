import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartIcon, UserIcon, GiftIcon, TrophyIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

interface Activity {
  id: string
  tipo: 'doacao' | 'usuario' | 'cashback' | 'transacao'
  descricao: string
  timestamp: string
  usuario: string
  valor?: number
}

export default function RealTimeActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout
    let abort = false
    async function fetchActivities() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/atividade-recente')
        const data = await res.json()
        if (!abort) {
          setActivities(data.atividades || [])
          setIsConnected(true)
        }
      } catch {
        if (!abort) setIsConnected(false)
      }
      setLoading(false)
    }
    fetchActivities()
    interval = setInterval(fetchActivities, 10000)
    return () => {
      abort = true
      clearInterval(interval)
    }
  }, [])

  const getActivityIcon = (tipo: Activity['tipo']) => {
    switch (tipo) {
      case 'doacao':
        return <HeartIcon className="w-4 h-4 text-red-400" />
      case 'usuario':
        return <UserIcon className="w-4 h-4 text-blue-400" />
      case 'cashback':
        return <GiftIcon className="w-4 h-4 text-green-400" />
      case 'transacao':
        return <CurrencyDollarIcon className="w-4 h-4 text-yellow-400" />
      default:
        return null
    }
  }

  const getActivityColor = (tipo: Activity['tipo']) => {
    switch (tipo) {
      case 'doacao':
        return 'border-l-red-400'
      case 'usuario':
        return 'border-l-blue-400'
      case 'cashback':
        return 'border-l-green-400'
      case 'transacao':
        return 'border-l-yellow-400'
      default:
        return ''
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    if (seconds < 60) return 'agora'
    if (minutes < 60) return `${minutes}m atrás`
    return `${Math.floor(minutes / 60)}h atrás`
  }

  return (
    <div className="space-y-4">
      {/* Status de conexão */}
      <div className="flex items-center space-x-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
        <span className="text-sm text-gray-400">
          {isConnected ? 'Conectado' : 'Reconectando...'}
        </span>
      </div>

      {/* Lista de atividades */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Carregando atividades...</div>
        ) : (
          <AnimatePresence>
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-start space-x-3 p-3 bg-sss-dark rounded-lg border-l-4 ${getActivityColor(activity.tipo)}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-sss-white">
                    {activity.descricao}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {activities.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-sss-light rounded-full flex items-center justify-center mx-auto mb-3">
              <UserIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm">Aguardando atividades...</p>
          </div>
        )}
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-sss-light">
        <div className="text-center">
          <div className="text-lg font-bold text-sss-white">
            {activities.filter(a => a.tipo === 'doacao').length}
          </div>
          <div className="text-xs text-gray-400">Doações 24h</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-sss-white">
            {activities.filter(a => a.tipo === 'usuario').length}
          </div>
          <div className="text-xs text-gray-400">Novos usuários</div>
        </div>
      </div>
    </div>
  )
} 