import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

export default function MobileGestures({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const touchStartRef = useRef<TouchPoint | null>(null)
  const touchEndRef = useRef<TouchPoint | null>(null)
  const minSwipeDistance = 50
  const maxSwipeTime = 300

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0]
      touchEndRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      }

      if (touchStartRef.current && touchEndRef.current) {
        const swipeDistance = Math.sqrt(
          Math.pow(touchEndRef.current.x - touchStartRef.current.x, 2) +
          Math.pow(touchEndRef.current.y - touchStartRef.current.y, 2)
        )

        const swipeTime = touchEndRef.current.timestamp - touchStartRef.current.timestamp

        if (swipeDistance > minSwipeDistance && swipeTime < maxSwipeTime) {
          const deltaX = touchEndRef.current.x - touchStartRef.current.x
          const deltaY = touchEndRef.current.y - touchStartRef.current.y

          // Swipe horizontal (esquerda/direita)
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
              // Swipe direita - voltar
              if (window.history.length > 1) {
                router.back()
              }
            } else {
              // Swipe esquerda - próximo
              // Pode ser implementado para navegação específica
            }
          }
          // Swipe vertical (cima/baixo)
          else {
            if (deltaY > 0) {
              // Swipe baixo - pull to refresh
              window.location.reload()
            } else {
              // Swipe cima - scroll to top
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }
        }
      }

      // Reset
      touchStartRef.current = null
      touchEndRef.current = null
    }

    // Adicionar listeners apenas em dispositivos móveis
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true })
      document.addEventListener('touchend', handleTouchEnd, { passive: true })
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [router])

  return <>{children}</>
} 