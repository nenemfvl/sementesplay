import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MobileSplashProps {
  children: React.ReactNode
}

export default function MobileSplash({ children }: MobileSplashProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Verificar se é dispositivo móvel
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Simular tempo de carregamento
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  if (!isMobile) {
    return <>{children}</>
  }

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-sss-dark flex items-center justify-center"
          >
            <div className="text-center">
              {/* Logo animado */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="mb-8"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-sss-accent to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🌱</span>
                </div>
                <h1 className="text-2xl font-bold text-sss-white">SementesPLAY</h1>
                <p className="text-gray-400 text-sm">Streamer Supporting System</p>
              </motion.div>

              {/* Loading spinner */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div className="w-8 h-8 border-2 border-gray-600 rounded-full"></div>
                  <motion.div
                    className="absolute top-0 left-0 w-8 h-8 border-2 border-sss-accent rounded-full border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              </motion.div>

              {/* Status de carregamento */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-2"
              >
                <p className="text-gray-400 text-sm">Carregando...</p>
                <div className="flex items-center justify-center space-x-1">
                  <motion.div
                    className="w-2 h-2 bg-sss-accent rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-sss-accent rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-sss-accent rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </motion.div>

              {/* Versão */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-8 left-0 right-0 text-center"
              >
                <p className="text-gray-500 text-xs">v1.0.0</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conteúdo principal */}
      <AnimatePresence>
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 