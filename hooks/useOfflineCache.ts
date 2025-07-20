import { useState, useEffect } from 'react'

interface CacheItem {
  id: string
  url: string
  method: string
  headers: Record<string, string>
  body?: string
  timestamp: number
}

export function useOfflineCache() {
  const [offlineData, setOfflineData] = useState<CacheItem[]>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Carregar dados offline salvos
    loadOfflineData()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Carregar dados offline do localStorage
  const loadOfflineData = () => {
    try {
      const saved = localStorage.getItem('sementesplay-offline-data')
      if (saved) {
        setOfflineData(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Erro ao carregar dados offline:', error)
    }
  }

  // Salvar dados offline no localStorage
  const saveOfflineData = (data: CacheItem[]) => {
    try {
      localStorage.setItem('sementesplay-offline-data', JSON.stringify(data))
      setOfflineData(data)
    } catch (error) {
      console.error('Erro ao salvar dados offline:', error)
    }
  }

  // Adicionar item ao cache offline
  const addToOfflineCache = (item: Omit<CacheItem, 'id' | 'timestamp'>) => {
    const newItem: CacheItem = {
      ...item,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now()
    }

    const updatedData = [...offlineData, newItem]
    saveOfflineData(updatedData)
  }

  // Remover item do cache offline
  const removeFromOfflineCache = (id: string) => {
    const updatedData = offlineData.filter(item => item.id !== id)
    saveOfflineData(updatedData)
  }

  // Limpar cache offline
  const clearOfflineCache = () => {
    saveOfflineData([])
  }

  // Sincronizar dados offline quando voltar online
  const syncOfflineData = async () => {
    if (!isOnline || offlineData.length === 0) return

    const itemsToSync = [...offlineData]
    
    for (const item of itemsToSync) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body
        })

        if (response.ok) {
          removeFromOfflineCache(item.id)
        }
      } catch (error) {
        console.error('Erro ao sincronizar item:', error)
      }
    }
  }

  // Executar requisição com fallback offline
  const fetchWithOfflineFallback = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    if (isOnline) {
      try {
        const response = await fetch(url, options)
        return response
      } catch (error) {
        // Se falhar online, salva para sincronizar depois
        addToOfflineCache({
          url,
          method: options.method || 'GET',
          headers: options.headers as Record<string, string> || {},
          body: options.body as string
        })
        throw error
      }
    } else {
      // Offline - salva para sincronizar depois
      addToOfflineCache({
        url,
        method: options.method || 'GET',
        headers: options.headers as Record<string, string> || {},
        body: options.body as string
      })

      // Retorna resposta mock para continuar funcionando offline
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Operação salva para sincronização offline' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  // Sincronizar automaticamente quando voltar online
  useEffect(() => {
    if (isOnline && offlineData.length > 0) {
      syncOfflineData()
    }
  }, [isOnline])

  return {
    offlineData,
    isOnline,
    addToOfflineCache,
    removeFromOfflineCache,
    clearOfflineCache,
    syncOfflineData,
    fetchWithOfflineFallback
  }
} 