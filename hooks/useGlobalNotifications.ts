import { useCallback, useEffect, useRef, useState } from 'react'
import { useNotificationSound } from './useNotificationSound'

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
  const { playSound } = useNotificationSound()

  // Mapear tipos de notificação para tipos de som
  const mapearTipoParaSom = (tipo: string): string => {
    const mapeamento: Record<string, string> = {
      'doacao': 'donation',
      'doacao_recebida': 'donation',
      'missao': 'mission',
      'missao_completa': 'mission',
      'chat': 'chat',
      'mensagem': 'chat',
      'ranking': 'ranking',
      'nivel_up': 'success',
      'fundo': 'success',
      'cashback': 'success',
      'erro': 'error',
      'sistema': 'system',
      'solicitacao_compra': 'system',
      'repasse_confirmado': 'system'
    }
    
    return mapeamento[tipo] || 'default'
  }

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
        
        // Se há mais notificações não lidas que antes, tocar som
        if (lastNotificationCountRef.current > 0 && currentCount > lastNotificationCountRef.current) {
          // Encontrar a notificação mais recente
          const maisRecente = novasNotificacoes
            .filter(n => !n.lida)
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]
          
          if (maisRecente) {
            const tipoSom = mapearTipoParaSom(maisRecente.tipo)
            playSound(tipoSom as any)
            console.log(`🔊 Nova notificação: ${maisRecente.titulo} (som: ${tipoSom})`)
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
  }, [userId, playSound])

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
