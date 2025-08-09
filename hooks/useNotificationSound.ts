import { useCallback, useRef, useEffect } from 'react'

interface NotificationSounds {
  default: string
  donation: string
  mission: string
  chat: string
  success: string
  error: string
  ranking: string
  system: string
}

interface SoundSettings {
  enabled: boolean
  volume: number
  sounds: NotificationSounds
}

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const defaultSounds: NotificationSounds = {
    default: '/sounds/notification-default.mp3',
    donation: '/sounds/notification-donation.mp3',
    mission: '/sounds/notification-mission.mp3',
    chat: '/sounds/notification-chat.mp3',
    success: '/sounds/notification-success.mp3',
    error: '/sounds/notification-error.mp3',
    ranking: '/sounds/notification-ranking.mp3',
    system: '/sounds/notification-system.mp3'
  }

  const defaultSettings: SoundSettings = {
    enabled: true,
    volume: 0.5,
    sounds: defaultSounds
  }

  // Carregar configurações do localStorage
  const loadSettings = useCallback((): SoundSettings => {
    try {
      const stored = localStorage.getItem('notification-sound-settings')
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...defaultSettings, ...parsed }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de som:', error)
    }
    return defaultSettings
  }, [])

  // Salvar configurações no localStorage
  const saveSettings = useCallback((settings: SoundSettings) => {
    try {
      localStorage.setItem('notification-sound-settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Erro ao salvar configurações de som:', error)
    }
  }, [])

  // Reproduzir som
  const playSound = useCallback((type: keyof NotificationSounds = 'default') => {
    const settings = loadSettings()
    
    if (!settings.enabled) return

    try {
      // Se já existe um áudio tocando, pare-o
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // Criar novo elemento de áudio
      const audio = new Audio()
      audioRef.current = audio

      // Configurar áudio
      audio.volume = settings.volume
      audio.preload = 'auto'
      
      // Tentar carregar o som específico, ou usar padrão como fallback
      const soundPath = settings.sounds[type] || settings.sounds.default
      audio.src = soundPath

      // Reproduzir com promise para melhor controle de erro
      const playPromise = audio.play()
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`Som de notificação '${type}' reproduzido com sucesso`)
          })
          .catch(error => {
            console.warn(`Erro ao reproduzir som '${type}':`, error)
            // Tentar som padrão como fallback se não for o padrão
            if (type !== 'default') {
              try {
                const fallbackAudio = new Audio()
                fallbackAudio.volume = settings.volume
                fallbackAudio.src = settings.sounds.default
                fallbackAudio.play().catch(err => {
                  console.warn('Erro ao reproduzir som padrão:', err)
                })
              } catch (fallbackError) {
                console.warn('Erro no fallback de som:', fallbackError)
              }
            }
          })
      }
    } catch (error) {
      console.error(`Erro ao configurar som '${type}':`, error)
    }
  }, [loadSettings])

  // Atualizar configurações
  const updateSettings = useCallback((newSettings: Partial<SoundSettings>) => {
    const currentSettings = loadSettings()
    const updatedSettings = { ...currentSettings, ...newSettings }
    saveSettings(updatedSettings)
  }, [loadSettings, saveSettings])

  // Habilitar/desabilitar sons
  const toggleSounds = useCallback((enabled: boolean) => {
    updateSettings({ enabled })
  }, [updateSettings])

  // Ajustar volume
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    updateSettings({ volume: clampedVolume })
  }, [updateSettings])

  // Reproduzir som de teste
  const playTestSound = useCallback((type: keyof NotificationSounds = 'default') => {
    playSound(type)
  }, [playSound])

  // Obter configurações atuais
  const getSettings = useCallback(() => {
    return loadSettings()
  }, [loadSettings])

  // Cleanup quando componente desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return {
    playSound,
    playTestSound,
    toggleSounds,
    setVolume,
    updateSettings,
    getSettings,
    soundTypes: defaultSounds
  }
}

// Hook mais simples para uso básico
export function useSimpleNotificationSound() {
  const { playSound } = useNotificationSound()
  
  return {
    playNotification: playSound,
    playDonation: () => playSound('donation'),
    playMission: () => playSound('mission'),
    playChat: () => playSound('chat'),
    playSuccess: () => playSound('success'),
    playError: () => playSound('error'),
    playRanking: () => playSound('ranking'),
    playSystem: () => playSound('system')
  }
}
