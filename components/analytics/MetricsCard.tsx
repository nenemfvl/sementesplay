import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

interface MetricsCardProps {
  title: string
  value: string
  change: number
  icon: React.ComponentType<{ className?: string }>
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple'
  trend: 'up' | 'down'
}

export default function MetricsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
  trend 
}: MetricsCardProps) {
  const colorClasses = {
    red: 'bg-red-500/20 text-red-500',
    blue: 'bg-blue-500/20 text-blue-500',
    green: 'bg-green-500/20 text-green-500',
    yellow: 'bg-yellow-500/20 text-yellow-500',
    purple: 'bg-purple-500/20 text-purple-500'
  }

  return (
    <motion.div 
      className="bg-sss-medium rounded-lg p-6 border border-sss-light hover:border-sss-accent/50 transition-colors"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-sss-white">{value}</p>
          <div className="flex items-center space-x-1 mt-2">
            {trend === 'up' ? (
              <ArrowUpIcon className="w-4 h-4 text-green-400" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-400' : 'text-red-400'
            }`}>
              {change}%
            </span>
            <span className="text-gray-400 text-sm">vs período anterior</span>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  )
} 