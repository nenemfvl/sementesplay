import React, { useState } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface DenunciaModalProps {
  isOpen: boolean
  onClose: () => void
  conteudoId?: string
  conteudoParceiroId?: string
  tituloConteudo: string
  tipoConteudo: 'criador' | 'parceiro'
}

export default function DenunciaModal({
  isOpen,
  onClose,
  conteudoId,
  conteudoParceiroId,
  tituloConteudo,
  tipoConteudo
}: DenunciaModalProps) {
  const [tipo, setTipo] = useState('')
  const [motivo, setMotivo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [status, setStatus] = useState<'idle' | 'enviando' | 'enviado' | 'erro'>('idle')

  const tiposDenuncia = [
    { valor: 'conteudo_inadequado', label: 'Conteúdo Inadequado', descricao: 'Conteúdo que não é apropriado para a plataforma' },
    { valor: 'spam', label: 'Spam', descricao: 'Conteúdo repetitivo ou promocional excessivo' },
    { valor: 'violencia', label: 'Violência', descricao: 'Conteúdo que promove ou glorifica violência' },
    { valor: 'assedio', label: 'Assédio', descricao: 'Conteúdo que assedia ou intimida outros usuários' },
    { valor: 'direitos_autorais', label: 'Violação de Direitos Autorais', descricao: 'Conteúdo que viola direitos autorais' },
    { valor: 'outros', label: 'Outros', descricao: 'Outro motivo não listado acima' }
  ]

  const motivosPorTipo = {
    conteudo_inadequado: [
      'Linguagem inadequada',
      'Conteúdo sexualmente explícito',
      'Conteúdo ofensivo',
      'Conteúdo impróprio para menores'
    ],
    spam: [
      'Promoção excessiva',
      'Conteúdo repetitivo',
      'Links suspeitos',
      'Publicidade não autorizada'
    ],
    violencia: [
      'Promoção de violência',
      'Conteúdo gráfico violento',
      'Ameaças',
      'Glorificação de atos violentos'
    ],
    assedio: [
      'Bullying',
      'Assédio sexual',
      'Intimidação',
      'Perseguição'
    ],
    direitos_autorais: [
      'Uso não autorizado de material protegido',
      'Plágio',
      'Reprodução ilegal',
      'Violação de marca registrada'
    ],
    outros: [
      'Outro motivo'
    ]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tipo || !motivo) {
      alert('Por favor, selecione o tipo e motivo da denúncia')
      return
    }

    setEnviando(true)
    setStatus('enviando')

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      if (!user.id) {
        alert('Você precisa estar logado para denunciar conteúdo')
        return
      }
      
      console.log('Dados da denúncia:', {
        denuncianteId: user.id,
        conteudoId: tipoConteudo === 'criador' ? conteudoId : null,
        conteudoParceiroId: tipoConteudo === 'parceiro' ? conteudoParceiroId : null,
        tipo,
        motivo,
        descricao
      })
      
      const response = await fetch('/api/denuncias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          denuncianteId: user.id,
          conteudoId: tipoConteudo === 'criador' ? conteudoId : null,
          conteudoParceiroId: tipoConteudo === 'parceiro' ? conteudoParceiroId : null,
          tipo,
          motivo,
          descricao
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('enviado')
        setTimeout(() => {
          onClose()
          setStatus('idle')
          setTipo('')
          setMotivo('')
          setDescricao('')
        }, 2000)
      } else {
        setStatus('erro')
        alert(data.error || 'Erro ao enviar denúncia')
      }
    } catch (error) {
      console.error('Erro ao enviar denúncia:', error)
      setStatus('erro')
      alert('Erro ao enviar denúncia')
    } finally {
      setEnviando(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-sss-dark border border-sss-light rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400 mr-2" />
              <h3 className="text-lg font-semibold text-sss-white">Denunciar Conteúdo</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Conteúdo sendo denunciado */}
          <div className="bg-sss-medium rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-1">Conteúdo:</p>
            <p className="text-sss-white font-medium">{tituloConteudo}</p>
          </div>

          {/* Status de envio */}
          {status === 'enviado' && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
              <p className="text-green-400 text-center">✅ Denúncia enviada com sucesso!</p>
            </div>
          )}

          {status === 'erro' && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-center">❌ Erro ao enviar denúncia. Tente novamente.</p>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de denúncia */}
            <div>
              <label className="block text-sm font-medium text-sss-white mb-3">
                Tipo de Denúncia *
              </label>
              <div className="space-y-2">
                {tiposDenuncia.map((tipoOption) => (
                  <label key={tipoOption.valor} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="tipo"
                      value={tipoOption.valor}
                      checked={tipo === tipoOption.valor}
                      onChange={(e) => setTipo(e.target.value)}
                      className="mt-1 text-sss-accent focus:ring-sss-accent"
                    />
                    <div className="flex-1">
                      <p className="text-sss-white font-medium">{tipoOption.label}</p>
                      <p className="text-sm text-gray-400">{tipoOption.descricao}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Motivo específico */}
            {tipo && (
              <div>
                <label className="block text-sm font-medium text-sss-white mb-3">
                  Motivo Específico *
                </label>
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full bg-sss-medium border border-sss-light rounded-lg px-4 py-2 text-sss-white focus:border-sss-accent focus:outline-none"
                  required
                >
                  <option value="">Selecione um motivo</option>
                  {motivosPorTipo[tipo as keyof typeof motivosPorTipo]?.map((motivoOption) => (
                    <option key={motivoOption} value={motivoOption}>
                      {motivoOption}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Descrição adicional */}
            <div>
              <label className="block text-sm font-medium text-sss-white mb-3">
                Descrição Adicional (Opcional)
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Forneça mais detalhes sobre a denúncia..."
                rows={4}
                className="w-full bg-sss-medium border border-sss-light rounded-lg px-4 py-2 text-sss-white focus:border-sss-accent focus:outline-none resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando || !tipo || !motivo}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
              >
                {enviando ? 'Enviando...' : 'Enviar Denúncia'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
