import React, { createContext, useContext, useState, ReactNode } from 'react'

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  setPageLoading: (loading: boolean) => void
  pageLoading: boolean
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)

  return (
    <LoadingContext.Provider value={{
      isLoading,
      setIsLoading,
      pageLoading,
      setPageLoading
    }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading deve ser usado dentro de um LoadingProvider')
  }
  return context
} 