import React, { useEffect } from 'react'
import { useGlobalNotifications } from '../hooks/useGlobalNotifications'
import { useNotificationSound } from '../hooks/useNotificationSound'
import { auth } from '../lib/auth'

interface GlobalNotificationSystemProps {
  children: React.ReactNode
}

export default function GlobalNotificationSystem({ children }: GlobalNotificationSystemProps) {
  const user = auth.getUser()
  const { notificacoes, loading } = useGlobalNotifications(user?.id || null)
  const { playSound } = useNotificationSound()

  // Listener para eventos personalizados de som de notificação
  useEffect(() => {
    const handlePlayNotificationSound = (event: Event) => {
      const customEvent = event as CustomEvent
      const { type } = customEvent.detail
      playSound(type)
      console.log(`🔊 Reproduzindo som de notificação: ${type}`)
    }

    window.addEventListener('playNotificationSound', handlePlayNotificationSound)

    return () => {
      window.removeEventListener('playNotificationSound', handlePlayNotificationSound)
    }
  }, [playSound])

  // Log para debug (remover em produção)
  useEffect(() => {
    if (!loading && user) {
      const naoLidas = notificacoes.filter(n => !n.lida).length
      console.log(`📱 Sistema de notificações ativo - ${naoLidas} não lidas`)
    }
  }, [notificacoes, loading, user])

  return <>{children}</>
}
