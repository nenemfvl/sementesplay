import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { usePWA } from '../hooks/usePWA'

export default function OfflineIndicator() {
  const { isOnline } = usePWA()
  const [isClient, setIsClient] = useState(false)
  React.useEffect(() => { setIsClient(true) }, [])
  if (!isClient) return null

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-40 bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Offline</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 