import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TrophyIcon, StarIcon, FireIcon } from '@heroicons/react/24/outline'

interface Performer {
  id: string
  name: string
  type: 'creator' | 'donor'
  value: number
  change: number
  avatar: string
  category: string
}

interface TopPerformersProps {
  creators?: Performer[]
  donors?: Performer[]
}

export default function TopPerformers({ creators = [], donors = [] }: TopPerformersProps) {
  const [activeTab, setActiveTab] = useState<'creators' | 'donors'>('creators')

  const getIcon = (rank: number) => {
    if (rank === 1) return <TrophyIcon className="w-5 h-5 text-yellow-400" />
    if (rank === 2) return <StarIcon className="w-5 h-5 text-gray-300" />
    if (rank === 3) return <FireIcon className="w-5 h-5 text-orange-400" />
    return <span className="text-gray-400 font-bold">{rank}</span>
  }

  const getValueDisplay = (performer: Performer) => {
    if (performer.type === 'creator') {
      return `${performer.value.toLocaleString()} sementes`
    }
    return `R$ ${performer.value.toLocaleString()}`
  }

  const currentData = activeTab === 'creators' ? creators : donors

  return (
    <div>
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-sss-light rounded-lg p-1">
        <button
          onClick={() => setActiveTab('creators')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'creators'
              ? 'bg-sss-accent text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Top Criadores
        </button>
        <button
          onClick={() => setActiveTab('donors')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'donors'
              ? 'bg-sss-accent text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Top Doadores
        </button>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {currentData.map((performer, index) => (
          <motion.div
            key={performer.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center space-x-4 p-3 bg-sss-dark rounded-lg hover:bg-sss-light transition-colors"
          >
            {/* Ranking */}
            <div className="flex items-center justify-center w-8 h-8">
              {getIcon(index + 1)}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-sss-accent to-red-600 rounded-full flex items-center justify-center text-lg">
              {performer.avatar}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sss-white">{performer.name}</h3>
                <span className="text-xs bg-sss-accent/20 text-sss-accent px-2 py-1 rounded-full">
                  {performer.category}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                {getValueDisplay(performer)}
              </p>
            </div>

            {/* Change */}
            <div className="text-right">
              <div className={`text-sm font-medium ${
                performer.change > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {performer.change > 0 ? '+' : ''}{performer.change}%
              </div>
              <div className="text-xs text-gray-400">vs mês anterior</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ver mais */}
      <div className="mt-6 text-center">
        <button className="text-sss-accent hover:text-red-400 text-sm font-medium transition-colors">
          Ver todos os {activeTab === 'creators' ? 'criadores' : 'doadores'}
        </button>
      </div>
    </div>
  )
} 