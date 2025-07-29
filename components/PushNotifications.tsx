import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BellIcon, 
  BellSlashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { usePWA } from '../hooks/usePWA'

interface NotificationSettings {
  donations: boolean
  missions: boolean
  ranking: boolean
  chat: boolean
  updates: boolean
}

export default function PushNotifications() {
  const [isOpen, setIsOpen] = useState(false)
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default')
  const [settings, setSettings] = useState<NotificationSettings>({
    donations: true,
    missions: true,
    ranking: true,
    chat: true,
    updates: true
  })
  const [loading, setLoading] = useState(false)

  const { requestNotificationPermission, sendNotification } = usePWA()

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const handleRequestPermission = async () => {
    setLoading(true)
    try {
      const granted = await requestNotificationPermission()
      if (granted) {
        setPermission('granted')
        
        // Enviar notificação de teste
        sendNotification('Notificações ativadas!', {
          body: 'Você receberá notificações sobre doações, missões e mais.',
          tag: 'permission-granted'
        })
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSetting = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))

    // Salvar no localStorage
    localStorage.setItem('notification-settings', JSON.stringify({
      ...settings,
      [key]: !settings[key]
    }))
  }

  const handleTestNotification = () => {
    sendNotification('Notificação de teste!', {
      body: 'Esta é uma notificação de teste do SementesPLAY.',
      tag: 'test-notification',
      requireInteraction: true
    })
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Ativadas', color: 'text-green-400', icon: CheckCircleIcon }
      case 'denied':
        return { text: 'Bloqueadas', color: 'text-red-400', icon: ExclamationTriangleIcon }
      default:
        return { text: 'Não configuradas', color: 'text-yellow-400', icon: BellSlashIcon }
    }
  }

  const status = getPermissionStatus()
  const StatusIcon = status.icon

  return (
    <>
      {/* Botão de notificações */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-300 hover:text-sss-accent transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {permission === 'granted' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
        )}
      </button>

      {/* Modal de configurações */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-sss-medium rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-sss-white">Notificações</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-white"
                  aria-label="Fechar modal de notificações"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Status atual */}
              <div className="flex items-center space-x-3 mb-6 p-4 bg-sss-dark rounded-lg">
                <StatusIcon className={`w-5 h-5 ${status.color}`} />
                <div>
                  <p className="text-sss-white font-medium">Status: {status.text}</p>
                  <p className="text-sm text-gray-400">
                    {permission === 'granted' 
                      ? 'Você receberá notificações push'
                      : permission === 'denied'
                      ? 'Permissão negada pelo navegador'
                      : 'Configure as notificações'
                    }
                  </p>
                </div>
              </div>

              {/* Solicitar permissão */}
              {permission !== 'granted' && (
                <div className="mb-6">
                  <button
                    onClick={handleRequestPermission}
                    disabled={loading || permission === 'denied'}
                    className="w-full bg-sss-accent hover:bg-red-600 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Solicitando...' : 'Ativar Notificações'}
                  </button>
                  {permission === 'denied' && (
                    <p className="text-sm text-red-400 mt-2">
                      Permissão negada. Ative manualmente nas configurações do navegador.
                    </p>
                  )}
                </div>
              )}

              {/* Configurações */}
              {permission === 'granted' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sss-white">Configurações</h3>
                  
                  {Object.entries(settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sss-white font-medium capitalize">
                          {key === 'donations' && 'Doações'}
                          {key === 'missions' && 'Missões'}
                          {key === 'ranking' && 'Ranking'}
                          {key === 'chat' && 'Chat'}
                          {key === 'updates' && 'Atualizações'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {key === 'donations' && 'Novas doações recebidas'}
                          {key === 'missions' && 'Missões completadas'}
                          {key === 'ranking' && 'Mudanças no ranking'}
                          {key === 'chat' && 'Novas mensagens'}
                          {key === 'updates' && 'Atualizações do app'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleSetting(key as keyof NotificationSettings)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          value ? 'bg-sss-accent' : 'bg-gray-600'
                        }`}
                        aria-label={`${value ? 'Desativar' : 'Ativar'} notificações de ${key}`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}

                  {/* Teste de notificação */}
                  <button
                    onClick={handleTestNotification}
                    className="w-full bg-sss-dark hover:bg-sss-light text-sss-white py-2 px-4 rounded-lg font-medium transition-colors mt-4"
                  >
                    Enviar Notificação de Teste
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 