import { useState, useEffect } from 'react'
import { useNotificationSound } from '../hooks/useNotificationSound'
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline'

export default function NotificationSoundSettings() {
  const { 
    getSettings, 
    updateSettings, 
    toggleSounds, 
    setVolume, 
    playTestSound,
    soundTypes 
  } = useNotificationSound()
  
  const [settings, setSettings] = useState(() => getSettings())
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setSettings(getSettings())
  }, [getSettings])

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    setSettings(prev => ({ ...prev, volume: newVolume }))
  }

  const handleToggleSounds = () => {
    const newEnabled = !settings.enabled
    toggleSounds(newEnabled)
    setSettings(prev => ({ ...prev, enabled: newEnabled }))
  }

  const handleTestSound = (type: keyof typeof soundTypes) => {
    playTestSound(type)
  }

  const soundTypeLabels = {
    default: 'Padrão',
    donation: 'Doações',
    mission: 'Missões',
    chat: 'Chat',
    success: 'Sucesso',
    error: 'Erro',
    ranking: 'Ranking',
    system: 'Sistema'
  }

  return (
    <div className="relative">
      {/* Botão para abrir configurações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          settings.enabled 
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
        }`}
        title="Configurações de Som"
      >
        {settings.enabled ? (
          <SpeakerWaveIcon className="w-5 h-5" />
        ) : (
          <SpeakerXMarkIcon className="w-5 h-5" />
        )}
      </button>

      {/* Modal de configurações */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="absolute right-0 top-12 w-80 bg-sss-dark border border-sss-light rounded-lg shadow-xl z-50">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-sss-white">
                  🔊 Configurações de Som
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-sss-white"
                >
                  ✕
                </button>
              </div>

              {/* Toggle geral */}
              <div className="flex items-center justify-between mb-4 p-3 bg-sss-medium rounded-lg">
                <div>
                  <div className="font-medium text-sss-white">Sons Habilitados</div>
                  <div className="text-sm text-gray-400">
                    Ativar/desativar todos os sons
                  </div>
                </div>
                <button
                  onClick={handleToggleSounds}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.enabled ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Controle de volume */}
              {settings.enabled && (
                <div className="mb-4 p-3 bg-sss-medium rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-sss-white">Volume</label>
                    <span className="text-sm text-gray-400">
                      {Math.round(settings.volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}

              {/* Teste de sons */}
              {settings.enabled && (
                <div className="mb-4">
                  <h4 className="font-medium text-sss-white mb-3">Testar Sons</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(soundTypeLabels).map(([type, label]) => (
                      <button
                        key={type}
                        onClick={() => handleTestSound(type as keyof typeof soundTypes)}
                        className="px-3 py-2 bg-sss-medium hover:bg-sss-light text-sm text-sss-white rounded-lg transition-colors"
                      >
                        🎵 {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Informações */}
              <div className="text-xs text-gray-400 space-y-1">
                <p>• Sons são reproduzidos quando você recebe notificações</p>
                <p>• Cada tipo de notificação tem seu próprio som</p>
                <p>• As configurações são salvas no seu navegador</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CSS para o slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: 2px solid #fff;
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: 2px solid #fff;
        }
      `}</style>
    </div>
  )
}
