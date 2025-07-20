import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartIcon, UserIcon, GiftIcon, TrophyIcon } from '@heroicons/react/24/outline'

interface Activity {
  id: string
  type: 'donation' | 'user' | 'mission' | 'achievement'
  user: string
  action: string
  value?: number
  timestamp: Date
}

export default function RealTimeActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    // Simular atividades em tempo real
    const generateActivity = (): Activity => {
      const types: Activity['type'][] = ['donation', 'user', 'mission', 'achievement']
      const type = types[Math.floor(Math.random() * types.length)]
      
      const users = ['JoãoGamer', 'MariaStream', 'PedroFiveM', 'AnaArt', 'CarlosTech', 'DoadorVIP']
      const user = users[Math.floor(Math.random() * users.length)]
      
      const actions = {
        donation: 'fez uma doação de',
        user: 'se registrou na plataforma',
        mission: 'completou a missão',
        achievement: 'desbloqueou conquista'
      }
      
      const value = type === 'donation' ? Math.floor(Math.random() * 500) + 10 : undefined
      
      return {
        id: Date.now().toString(),
        type,
        user,
        action: actions[type],
        value,
        timestamp: new Date()
      }
    }

    // Adicionar atividade a cada 3-8 segundos
    const interval = setInterval(() => {
      const newActivity = generateActivity()
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]) // Manter apenas 10 atividades
    }, Math.random() * 5000 + 3000)

    // Simular desconexão/reconexão
    const connectionInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance de desconectar
        setIsConnected(false)
        setTimeout(() => setIsConnected(true), 2000)
      }
    }, 10000)

    return () => {
      clearInterval(interval)
      clearInterval(connectionInterval)
    }
  }, [])

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'donation':
        return <HeartIcon className="w-4 h-4 text-red-400" />
      case 'user':
        return <UserIcon className="w-4 h-4 text-blue-400" />
      case 'mission':
        return <GiftIcon className="w-4 h-4 text-green-400" />
      case 'achievement':
        return <TrophyIcon className="w-4 h-4 text-yellow-400" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'donation':
        return 'border-l-red-400'
      case 'user':
        return 'border-l-blue-400'
      case 'mission':
        return 'border-l-green-400'
      case 'achievement':
        return 'border-l-yellow-400'
    }
  }

  const formatTime = (date: Date) => {
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
        <AnimatePresence>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-start space-x-3 p-3 bg-sss-dark rounded-lg border-l-4 ${getActivityColor(activity.type)}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-sss-white">
                  <span className="font-medium">{activity.user}</span>
                  {' '}{activity.action}
                  {activity.value && (
                    <span className="font-medium text-sss-accent">
                      {' '}R$ {activity.value}
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTime(activity.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {activities.length === 0 && (
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
            {activities.filter(a => a.type === 'donation').length}
          </div>
          <div className="text-xs text-gray-400">Doações hoje</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-sss-white">
            {activities.filter(a => a.type === 'user').length}
          </div>
          <div className="text-xs text-gray-400">Novos usuários</div>
        </div>
      </div>
    </div>
  )
} 