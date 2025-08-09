// Sistema simples de notificações toast para substituir alerts

interface ToastOptions {
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  position?: 'top' | 'bottom'
}

export function showToast(message: string, options: ToastOptions = {}) {
  const {
    type = 'info',
    duration = 3000,
    position = 'top'
  } = options

  // Evitar criar múltiplos toasts
  const existingToast = document.getElementById('sementesplay-toast')
  if (existingToast) {
    existingToast.remove()
  }

  // Criar elemento do toast
  const toast = document.createElement('div')
  toast.id = 'sementesplay-toast'
  toast.style.cssText = `
    position: fixed;
    ${position}: 20px;
    right: 20px;
    background: ${getBackgroundColor(type)};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    max-width: 400px;
    word-break: break-word;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
  `
  
  toast.textContent = message

  // Adicionar ao DOM
  document.body.appendChild(toast)

  // Animar entrada
  setTimeout(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateX(0)'
  }, 10)

  // Auto-remover
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, duration)

  // Remover ao clicar
  toast.addEventListener('click', () => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  })
}

function getBackgroundColor(type: string): string {
  switch (type) {
    case 'success':
      return '#10b981' // green-500
    case 'error':
      return '#ef4444' // red-500
    case 'warning':
      return '#f59e0b' // amber-500
    case 'info':
    default:
      return '#3b82f6' // blue-500
  }
}

// Funções de conveniência
export const toast = {
  success: (message: string, duration?: number) => 
    showToast(message, { type: 'success', duration }),
  error: (message: string, duration?: number) => 
    showToast(message, { type: 'error', duration }),
  warning: (message: string, duration?: number) => 
    showToast(message, { type: 'warning', duration }),
  info: (message: string, duration?: number) => 
    showToast(message, { type: 'info', duration })
}
