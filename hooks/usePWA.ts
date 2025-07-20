import { useState, useEffect } from 'react'

interface PWAState {
  isInstalled: boolean
  isOnline: boolean
  isUpdateAvailable: boolean
  isInstallPromptSupported: boolean
  deferredPrompt: any
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
    isInstallPromptSupported: false,
    deferredPrompt: null
  })

  useEffect(() => {
    // Verificar se o PWA está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setPwaState(prev => ({ ...prev, isInstalled: true }))
      }
    }

    // Verificar suporte ao prompt de instalação
    const checkInstallSupport = () => {
      const isSupported = 'BeforeInstallPromptEvent' in window
      setPwaState(prev => ({ ...prev, isInstallPromptSupported: isSupported }))
    }

    // Verificar status da conexão
    const updateOnlineStatus = () => {
      setPwaState(prev => ({ ...prev, isOnline: navigator.onLine }))
    }

    // Service Worker para atualizações
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          
          // Verificar atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setPwaState(prev => ({ ...prev, isUpdateAvailable: true }))
                }
              })
            }
          })

          // Atualizar quando nova versão estiver pronta
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            setPwaState(prev => ({ ...prev, isUpdateAvailable: false }))
          })

        } catch (error) {
          console.error('Erro ao registrar Service Worker:', error)
        }
      }
    }

    // Capturar prompt de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setPwaState(prev => ({ 
        ...prev, 
        deferredPrompt: e,
        isInstallPromptSupported: true 
      }))
    }

    // Verificar se já está instalado
    const handleAppInstalled = () => {
      setPwaState(prev => ({ ...prev, isInstalled: true }))
    }

    // Inicializar
    checkIfInstalled()
    checkInstallSupport()
    registerServiceWorker()

    // Event listeners
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Função para instalar o PWA
  const installPWA = async () => {
    if (pwaState.deferredPrompt) {
      pwaState.deferredPrompt.prompt()
      const { outcome } = await pwaState.deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setPwaState(prev => ({ 
          ...prev, 
          isInstalled: true,
          deferredPrompt: null 
        }))
      }
    }
  }

  // Função para atualizar o PWA
  const updatePWA = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
      })
    }
  }

  // Função para solicitar permissão de notificações
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Função para enviar notificação
  const sendNotification = (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      })
    }
    return null
  }

  // Função para sincronizar dados em background
  const syncInBackground = () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        (registration as any).sync?.register('background-sync')
      })
    }
  }

  return {
    ...pwaState,
    installPWA,
    updatePWA,
    requestNotificationPermission,
    sendNotification,
    syncInBackground
  }
} 