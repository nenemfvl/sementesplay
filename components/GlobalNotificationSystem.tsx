import React from 'react'
import { useGlobalNotifications } from '../hooks/useGlobalNotifications'
import { auth } from '../lib/auth'

interface GlobalNotificationSystemProps {
  children: React.ReactNode
}

export default function GlobalNotificationSystem({ children }: GlobalNotificationSystemProps) {
  const user = auth.getUser()
  const { notificacoes, loading } = useGlobalNotifications(user?.id || null)

  // Log simples para debug (remover em produção)
  if (!loading && user && notificacoes.length > 0) {
    const naoLidas = notificacoes.filter(n => !n.lida).length
    if (naoLidas > 0) {
      console.log(`📱 Sistema de notificações ativo - ${naoLidas} não lidas`)
    }
  }

  return <>{children}</>
}
