import { useRouter } from 'next/router'
import { useState, useCallback } from 'react'

interface NavigationState {
  isNavigating: boolean
  targetPath: string | null
}

export function useNavigation() {
  const router = useRouter()
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    targetPath: null
  })

  const navigateTo = useCallback(async (path: string) => {
    // Se já estiver navegando, não fazer nada
    if (navigationState.isNavigating) return

    setNavigationState({
      isNavigating: true,
      targetPath: path
    })

    try {
      // Aguardar a navegação ser concluída
      await router.push(path)
      
      // Aguardar um pouco mais para garantir que a página carregou completamente
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error('Erro na navegação:', error)
    } finally {
      // Limpar o estado de navegação
      setNavigationState({
        isNavigating: false,
        targetPath: null
      })
    }
  }, [router, navigationState.isNavigating])

  const isNavigating = navigationState.isNavigating
  const targetPath = navigationState.targetPath

  return {
    navigateTo,
    isNavigating,
    targetPath
  }
} 