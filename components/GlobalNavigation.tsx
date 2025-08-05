import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useLoading } from '../contexts/LoadingContext'
import { PageLoader } from './Loader'

export default function GlobalNavigation() {
  const router = useRouter()
  const { pageLoading, setPageLoading } = useLoading()

  useEffect(() => {
    const handleStart = () => {
      setPageLoading(true)
    }

    const handleComplete = () => {
      // Aguardar um pouco mais para garantir que a página carregou completamente
      setTimeout(() => {
        setPageLoading(false)
      }, 300)
    }

    const handleError = () => {
      setPageLoading(false)
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleError)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleError)
    }
  }, [router, setPageLoading])

  if (!pageLoading) return null

  return <PageLoader />
} 