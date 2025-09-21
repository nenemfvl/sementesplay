import { useState, useEffect } from 'react'
import { auth } from '../lib/auth'

interface Notification {
  id: string
  titulo: string
  mensagem: string
  tipo: string
  lida: boolean
  data: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const user = auth.getUser()
      if (!user) return

      const response = await fetch(`/api/notificacoes?usuarioId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notificacoes || [])
        
        // Contar notificações não lidas
        const unread = (data.notificacoes || []).filter((n: Notification) => !n.lida).length
        setUnreadCount(unread)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao buscar notificações:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    // Optimistic update - atualizar UI imediatamente
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, lida: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      const response = await fetch(`/api/notificacoes/${notificationId}/ler`, {
        method: 'PUT'
      })
      
      if (!response.ok) {
        // Reverter mudanças se API falhar
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, lida: false } : n
          )
        )
        setUnreadCount(prev => prev + 1)
        
        if (process.env.NODE_ENV === 'development') {
          console.error('Erro ao marcar notificação como lida:', response.statusText)
        }
      }
    } catch (error) {
      // Reverter mudanças se houver erro de rede
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, lida: false } : n
        )
      )
      setUnreadCount(prev => prev + 1)
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao marcar notificação como lida:', error)
      }
    }
  }

  const markAllAsRead = async () => {
    const user = auth.getUser()
    if (!user) return

    // Salvar estado anterior para possível rollback
    const previousNotifications = notifications
    const previousUnreadCount = unreadCount

    // Optimistic update - atualizar UI imediatamente
    setNotifications(prev => 
      prev.map(n => ({ ...n, lida: true }))
    )
    setUnreadCount(0)

    try {
      const response = await fetch(`/api/notificacoes/ler-todas`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuarioId: user.id })
      })
      
      if (!response.ok) {
        // Reverter mudanças se API falhar
        setNotifications(previousNotifications)
        setUnreadCount(previousUnreadCount)
        
        if (process.env.NODE_ENV === 'development') {
          console.error('Erro ao marcar todas as notificações como lidas:', response.statusText)
        }
      }
    } catch (error) {
      // Reverter mudanças se houver erro de rede
      setNotifications(previousNotifications)
      setUnreadCount(previousUnreadCount)
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao marcar todas as notificações como lidas:', error)
      }
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Atualizar notificações a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}
