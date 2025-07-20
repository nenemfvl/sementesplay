import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowDownTrayIcon,
  XMarkIcon,
  DevicePhoneMobileIcon,
  WifiIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline'
import { usePWA } from '../hooks/usePWA'

export default function PWABanner() {
  const [isClient, setIsClient] = useState(false)
  const {
    isInstallPromptSupported,
    isInstalled,
    isUpdateAvailable,
    installPWA,
    updatePWA
  } = usePWA()
  const [isVisible, setIsVisible] = useState(true)
  const [isInstalling, setIsInstalling] = useState(false)

  // Garante que só renderiza no cliente
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  // Não mostrar se já está instalado ou não suporta instalação
  if (isInstalled || !isInstallPromptSupported) {
    return null
  }

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      await installPWA()
    } catch (error) {
      console.error('Erro ao instalar PWA:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const handleUpdate = () => {
    updatePWA()
    window.location.reload()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-sss-accent to-red-600 text-white shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DevicePhoneMobileIcon className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold text-sm">
                    {isUpdateAvailable ? 'Nova versão disponível!' : 'Instalar SementesPLAY'}
                  </h3>
                  <p className="text-xs opacity-90">
                    {isUpdateAvailable 
                      ? 'Atualize para a versão mais recente com novos recursos'
                      : 'Instale como app e tenha acesso offline'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={isUpdateAvailable ? handleUpdate : handleInstall}
                  disabled={isInstalling}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isInstalling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Instalando...</span>
                    </>
                  ) : isUpdateAvailable ? (
                    <>
                      <CloudArrowDownIcon className="w-4 h-4" />
                      <span>Atualizar</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span>Instalar</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 