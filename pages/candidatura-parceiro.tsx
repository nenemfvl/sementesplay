import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  StarIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'

interface CandidaturaData {
  nome: string
  email: string
  telefone: string
  nomeCidade: string
  siteCidade: string
  descricao: string
  experiencia: string
  expectativa: string
  investimento: string
  publico: string
  estrategia: string
  redesSociais: {
    instagram?: string
    twitch?: string
    youtube?: string
    tiktok?: string
    discord?: string
  }
}

interface CandidaturaExistente {
  id: string
  status: 'pendente' | 'aprovada' | 'rejeitada'
  dataCandidatura: string
  observacoes?: string
}

export default function CandidaturaParceiro() {
  const [, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<CandidaturaData>({
    nome: '',
    email: '',
    telefone: '',
    nomeCidade: '',
    siteCidade: '',
    descricao: '',
    experiencia: '',
    expectativa: '',
    investimento: '',
    publico: '',
    estrategia: '',
    redesSociais: {
      instagram: '',
      twitch: '',
      youtube: '',
      tiktok: '',
      discord: ''
    }
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [candidaturaExistente, setCandidaturaExistente] = useState<CandidaturaExistente | null>(null)
  const [verificandoCandidatura, setVerificandoCandidatura] = useState(true)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    
    setUser(currentUser)
    setFormData(prev => ({
      ...prev,
      nome: currentUser.nome,
      email: currentUser.email
    }))

    // Verificar se já existe uma candidatura
    verificarCandidaturaExistente(currentUser.id)
  }, [])

  const verificarCandidaturaExistente = async (userId: string) => {
    try {
      const response = await fetch(`/api/parceiros/candidaturas/status?usuarioId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.candidatura) {
          setCandidaturaExistente(data.candidatura)
          
          // Se foi aprovada, redirecionar para o painel parceiro
          if (data.candidatura.status === 'aprovada') {
            window.location.href = '/painel-parceiro'
            return
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar candidatura:', error)
    } finally {
      setVerificandoCandidatura(false)
    }
  }

  const handleInputChange = (field: keyof CandidaturaData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitCandidatura = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/parceiros/candidaturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Candidatura enviada com sucesso! Aguarde a análise da nossa equipe.')
        window.location.href = '/parceiros'
      } else {
        const error = await response.json()
        alert(`Erro: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro ao enviar candidatura:', error)
      alert('Erro ao enviar candidatura. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <BuildingOfficeIcon className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-sss-white mb-2">Informações Básicas</h2>
        <p className="text-gray-400">Vamos começar com suas informações pessoais e da cidade</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
            placeholder="Digite seu nome completo"
            aria-label="Nome completo"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
            placeholder="seu@email.com"
            aria-label="Email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Telefone *
          </label>
          <input
            type="tel"
            value={formData.telefone}
            onChange={(e) => handleInputChange('telefone', e.target.value)}
            className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
            placeholder="(11) 99999-9999"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nome da Cidade *
          </label>
          <input
            type="text"
            value={formData.nomeCidade}
            onChange={(e) => handleInputChange('nomeCidade', e.target.value)}
            className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
            placeholder="Ex: São Paulo"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Site da Cidade
          </label>
          <input
            type="url"
            value={formData.siteCidade}
            onChange={(e) => handleInputChange('siteCidade', e.target.value)}
            className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
            placeholder="https://www.suacidade.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descrição da Cidade *
          </label>
          <textarea
            value={formData.descricao}
            onChange={(e) => handleInputChange('descricao', e.target.value)}
            rows={4}
            className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
            placeholder="Conte-nos sobre sua cidade, público-alvo, características especiais..."
            required
          />
        </div>

        {/* Redes Sociais */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-sss-white mb-4">Redes Sociais (Opcional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={formData.redesSociais.instagram || ''}
                onChange={(e) => handleInputChange('redesSociais', { ...formData.redesSociais, instagram: e.target.value })}
                className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
                placeholder="https://instagram.com/seu-usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Twitch
              </label>
              <input
                type="url"
                value={formData.redesSociais.twitch || ''}
                onChange={(e) => handleInputChange('redesSociais', { ...formData.redesSociais, twitch: e.target.value })}
                className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
                placeholder="https://twitch.tv/seu-canal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                YouTube
              </label>
              <input
                type="url"
                value={formData.redesSociais.youtube || ''}
                onChange={(e) => handleInputChange('redesSociais', { ...formData.redesSociais, youtube: e.target.value })}
                className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
                placeholder="https://youtube.com/@seu-canal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                TikTok
              </label>
              <input
                type="url"
                value={formData.redesSociais.tiktok || ''}
                onChange={(e) => handleInputChange('redesSociais', { ...formData.redesSociais, tiktok: e.target.value })}
                className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
                placeholder="https://tiktok.com/@seu-usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Discord
              </label>
              <input
                type="url"
                value={formData.redesSociais.discord || ''}
                onChange={(e) => handleInputChange('redesSociais', { ...formData.redesSociais, discord: e.target.value })}
                className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
                placeholder="https://discord.gg/seuserver"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CurrencyDollarIcon className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-sss-white mb-2">Experiência e Expectativas</h2>
        <p className="text-gray-400">Conte-nos sobre sua experiência e o que espera da parceria</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Experiência com FiveM *
          </label>
          <textarea
            value={formData.experiencia}
            onChange={(e) => handleInputChange('experiencia', e.target.value)}
            rows={4}
            className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
            placeholder="Conte-nos sobre sua experiência com FiveM, tempo de atividade, público..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            O que espera da parceria? *
          </label>
          <textarea
            value={formData.expectativa}
            onChange={(e) => handleInputChange('expectativa', e.target.value)}
            rows={4}
            className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
            placeholder="Quais são suas expectativas com a parceria SementesPLAY?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Investimento Mensal Estimado *
          </label>
          <textarea
            value={formData.investimento}
            onChange={(e) => handleInputChange('investimento', e.target.value)}
            rows={3}
            className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
            placeholder="Qual o investimento mensal que pretende fazer em cashback?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Público-Alvo *
          </label>
          <textarea
            value={formData.publico}
            onChange={(e) => handleInputChange('publico', e.target.value)}
            rows={3}
            className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
            placeholder="Descreva o perfil do seu público-alvo..."
            required
          />
        </div>
      </div>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <StarIcon className="w-10 h-10 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold text-sss-white mb-2">Estratégia e Revisão</h2>
        <p className="text-gray-400">Como pretende implementar o cashback e revisão final</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Estratégia de Implementação *
          </label>
          <textarea
            value={formData.estrategia}
            onChange={(e) => handleInputChange('estrategia', e.target.value)}
            rows={6}
            className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:border-blue-500 focus:outline-none"
            placeholder="Como pretende implementar o sistema de cashback em sua cidade? Quais estratégias de marketing?"
            required
          />
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">📋 Resumo da Candidatura</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Nome:</span>
              <span className="text-sss-white">{formData.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cidade:</span>
              <span className="text-sss-white">{formData.nomeCidade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Telefone:</span>
              <span className="text-sss-white">{formData.telefone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-sss-white">{formData.email}</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="text-yellow-400 font-semibold mb-2">Importante</h4>
              <p className="text-gray-300 text-sm">
                • A análise da candidatura pode levar até 48 horas<br/>
                • Você receberá uma notificação por email sobre o resultado<br/>
                • Como parceiro, você deverá repassar 10% das vendas para o sistema<br/>
                • O cupom será <strong>sementesplay10</strong> para seus jogadores
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderStatusCandidatura = () => {
    if (!candidaturaExistente) return null

    const getStatusIcon = () => {
      switch (candidaturaExistente.status) {
        case 'aprovada':
          return <CheckCircleIcon className="w-8 h-8 text-green-500" />
        case 'pendente':
          return <ClockIcon className="w-8 h-8 text-yellow-500" />
        case 'rejeitada':
          return <XCircleIcon className="w-8 h-8 text-red-500" />
        default:
          return <ClockIcon className="w-8 h-8 text-gray-500" />
      }
    }

    const getStatusText = () => {
      switch (candidaturaExistente.status) {
        case 'aprovada':
          return 'Candidatura Aprovada!'
        case 'pendente':
          return 'Candidatura em Análise'
        case 'rejeitada':
          return 'Candidatura Rejeitada'
        default:
          return 'Status Desconhecido'
      }
    }

    const getStatusDescription = () => {
      switch (candidaturaExistente.status) {
        case 'aprovada':
          return 'Parabéns! Sua candidatura foi aprovada. Você já pode acessar o painel de parceiro.'
        case 'pendente':
          return 'Sua candidatura está sendo analisada pela nossa equipe. Aguarde o resultado.'
        case 'rejeitada':
          return candidaturaExistente.observacoes || 'Sua candidatura não foi aprovada no momento.'
        default:
          return 'Status da candidatura não disponível.'
      }
    }

    const getActionButton = () => {
      switch (candidaturaExistente.status) {
        case 'aprovada':
          return (
            <Link
              href="/painel-parceiro"
              className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Acessar Painel
            </Link>
          )
        case 'rejeitada':
          return (
            <button
              onClick={() => setCandidaturaExistente(null)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Nova Candidatura
            </button>
          )
        default:
          return null
      }
    }

    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-sss-medium rounded-lg p-8 border border-sss-light">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <h2 className="text-2xl font-bold text-sss-white mb-4">
            {getStatusText()}
          </h2>
          <p className="text-gray-400 mb-6">
            {getStatusDescription()}
          </p>
          {getActionButton()}
        </div>
      </div>
    )
  }

  if (verificandoCandidatura) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando candidatura...</p>
        </div>
      </div>
    )
  }

  if (candidaturaExistente) {
    return (
      <>
        <Head>
          <title>Candidatura Parceiro - SementesPLAY</title>
          <meta name="description" content="Status da candidatura para parceiro" />
        </Head>

        <div className="min-h-screen bg-sss-dark">
          <header className="bg-sss-medium shadow-lg border-b border-sss-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <Link href="/parceiros" className="inline-flex items-center text-sss-accent hover:text-blue-400">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Voltar aos Parceiros
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <BuildingOfficeIcon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                    <p className="text-sm text-gray-300">Candidatura Parceiro</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {renderStatusCandidatura()}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Candidatura Parceiro - SementesPLAY</title>
        <meta name="description" content="Candidate-se para ser parceiro SementesPLAY" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link href="/parceiros" className="inline-flex items-center text-sss-accent hover:text-blue-400">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Voltar aos Parceiros
              </Link>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-gray-300">Candidatura Parceiro</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Passo {currentStep} de 3</span>
              <span className="text-sm text-gray-400">{Math.round((currentStep / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-sss-medium rounded-full h-2">
                          <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            ></div>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-sss-medium rounded-lg p-8 border border-sss-light">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                Anterior
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Próximo
                </button>
              ) : (
                <button
                  onClick={submitCandidatura}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? 'Enviando...' : 'Enviar Candidatura'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 