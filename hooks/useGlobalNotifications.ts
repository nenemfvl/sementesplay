import { useCallback, useEffect, useRef, useState } from 'react'

interface NotificacaoGlobal {
  id: string
  tipo: string
  titulo: string
  mensagem: string
  data: string
  lida: boolean
}

export function useGlobalNotifications(userId: string | null) {
  const [notificacoes, setNotificacoes] = useState<NotificacaoGlobal[]>([])
  const [loading, setLoading] = useState(true)
  const lastNotificationCountRef = useRef<number>(0)

  // Carregar notificações
  const loadNotificacoes = useCallback(async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/notificacoes?usuarioId=${userId}`)
      const data = await response.json()
      
      if (response.ok && data.notificacoes) {
        const novasNotificacoes = data.notificacoes as NotificacaoGlobal[]
        
        // Detectar novas notificações não lidas
        const notificacaoNaoLidas = novasNotificacoes.filter(n => !n.lida)
        const currentCount = notificacaoNaoLidas.length
        
        // Se há mais notificações não lidas que antes, registrar no console
        if (lastNotificationCountRef.current > 0 && currentCount > lastNotificationCountRef.current) {
          // Encontrar a notificação mais recente
          const maisRecente = novasNotificacoes
            .filter(n => !n.lida)
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]
          
          if (maisRecente) {
            console.log(`📱 Nova notificação: ${maisRecente.titulo}`)
          }
        }
        
        lastNotificationCountRef.current = currentCount
        setNotificacoes(novasNotificacoes)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Inicializar contagem na primeira carga
  useEffect(() => {
    if (userId) {
      loadNotificacoes()
    }
  }, [userId, loadNotificacoes])

  // Polling para detectar novas notificações
  useEffect(() => {
    if (!userId) return

    const interval = setInterval(loadNotificacoes, 5000) // A cada 5 segundos
    return () => clearInterval(interval)
  }, [userId, loadNotificacoes])

  return {
    notificacoes,
    loading,
    refresh: loadNotificacoes
  }
}
