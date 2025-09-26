import React from 'react'
import { useGlobalNotifications } from '../hooks/useGlobalNotifications'
import { auth } from '../lib/auth'

interface GlobalNotificationSystemProps {
  children: React.ReactNode
}

export default function GlobalNotificationSystem({ children }: GlobalNotificationSystemProps) {
  const user = auth.getUser()
  const { notificacoes, loading } = useGlobalNotifications(user?.id || null)


  return <>{children}</>
}
