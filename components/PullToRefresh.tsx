import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
}

export default function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80 
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number>(0)
  const currentYRef = useRef<number>(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      // Só ativar se estiver no topo da página
      if (window.scrollY === 0) {
        startYRef.current = e.touches[0].clientY
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return

      currentYRef.current = e.touches[0].clientY
      const distance = Math.max(0, currentYRef.current - startYRef.current)
      
      // Limitar o pull para não ficar muito longo
      const limitedDistance = Math.min(distance * 0.5, threshold * 2)
      setPullDistance(limitedDistance)
    }

    const handleTouchEnd = async () => {
      if (!isPulling) return

      if (pullDistance >= threshold) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } catch (error) {
          console.error('Erro ao atualizar:', error)
        } finally {
          setIsRefreshing(false)
        }
      }

      setIsPulling(false)
      setPullDistance(0)
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPulling, pullDistance, threshold, onRefresh])

  return (
    <div ref={containerRef} className="relative">
      <AnimatePresence>
        {isPulling && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-0 right-0 z-10 flex justify-center items-center py-4"
            style={{ transform: `translateY(${pullDistance}px)` }}
          >
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
              >
                <ArrowPathIcon className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-white text-sm font-medium">
                {isRefreshing ? 'Atualizando...' : 'Puxe para atualizar'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{ 
          transform: `translateY(${isPulling ? pullDistance : 0}px)` 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  )
} 