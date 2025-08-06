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

  // Executar requisição com fallback offline e retry
  const fetchWithRetry = async (
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3
  ): Promise<Response> => {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            ...options.headers
          }
        })
        
        if (response.ok) {
          return response
        }
        
        // Se não for 200, mas também não for erro de rede, retornar
        if (response.status >= 400 && response.status < 500) {
          return response
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      } catch (error) {
        lastError = error as Error
        console.warn(`Tentativa ${attempt} falhou para ${url}:`, error)
        
        // Aguardar antes da próxima tentativa (backoff exponencial)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }
    
    // Se todas as tentativas falharam e estamos offline, salvar para sincronização
    if (!isOnline) {
      addToOfflineCache({
        url,
        method: options.method || 'GET',
        headers: options.headers as Record<string, string> || {},
        body: options.body as string
      })
    }
    
    throw lastError || new Error('Falha na requisição após todas as tentativas')
  }

  // Sincronizar automaticamente quando voltar online
  useEffect(() => {
    if (isOnline && offlineData.length > 0) {
      syncOfflineData()
    }
  }, [isOnline])

  return {
    isOnline,
    offlineData,
    fetchWithRetry,
    addToOfflineCache,
    removeFromOfflineCache,
    clearOfflineCache,
    syncOfflineData
  }
} 