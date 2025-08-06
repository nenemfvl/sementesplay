import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  UserIcon,
  EnvelopeIcon,

  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  StarIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'

interface CandidaturaData {
  nome: string
  email: string
  bio: string
  redesSociais: {
    youtube?: string
    twitch?: string
    instagram?: string
    tiktok?: string
    twitter?: string
    discord?: string
  }
  portfolio: {
    links: string[]
  }
  experiencia: string
  motivacao: string
  metas: string
  disponibilidade: string
}

interface CandidaturaExistente {
  id: string
  status: 'pendente' | 'aprovada' | 'rejeitada'
  dataCandidatura: string
  observacoes?: string
}

export default function CandidaturaCriador() {
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<CandidaturaData>({
    nome: '',
    email: '',
    bio: '',
    redesSociais: {},
    portfolio: {
      links: []
    },
    experiencia: '',
    motivacao: '',
    metas: '',
    disponibilidade: ''
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [portfolioLinks, setPortfolioLinks] = useState([''])
  const [candidaturaExistente, setCandidaturaExistente] = useState<CandidaturaExistente | null>(null)
  const [verificandoCandidatura, setVerificandoCandidatura] = useState(true)
  const [candidaturaEnviada, setCandidaturaEnviada] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)

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
      const response = await fetch(`/api/criadores/candidaturas/status?usuarioId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.candidatura) {
          setCandidaturaExistente(data.candidatura)
          
          // Se foi aprovada, redirecionar para o painel criador
          if (data.candidatura.status === 'aprovada') {
            window.location.href = '/painel-criador'
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

  const handleSocialChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      redesSociais: {
        ...prev.redesSociais,
        [platform]: value
      }
    }))
  }

  const addPortfolioLink = () => {
    setPortfolioLinks(prev => [...prev, ''])
  }

  const removePortfolioLink = (index: number) => {
    setPortfolioLinks(prev => prev.filter((_, i) => i !== index))
  }

  const updatePortfolioLink = (index: number, value: string) => {
    const newLinks = [...portfolioLinks]
    newLinks[index] = value
    setPortfolioLinks(newLinks)
    setFormData(prev => ({
      ...prev,
      portfolio: {
        ...prev.portfolio,
        links: newLinks.filter(link => link.trim() !== '')
      }
    }))
  }

  const nextStep = () => {
    if (currentStep < 4) {
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
    setErroEnvio(null)
    try {
      const response = await fetch('/api/criadores/candidaturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`
        },
        body: JSON.stringify({
          ...formData,
          portfolio: {
            ...formData.portfolio,
            links: portfolioLinks.filter(link => link.trim() !== '')
          }
        })
      })

             if (response.ok) {
         setCandidaturaEnviada(true)
         // Redirecionar após 2 segundos
         setTimeout(() => {
           window.location.href = '/status'
         }, 2000)
       } else {
        const data = await response.json()
        setErroEnvio(data.error || 'Erro ao enviar candidatura')
      }
    } catch (error) {
      console.error('Erro ao enviar candidatura:', error)
      setErroEnvio('Erro ao enviar candidatura. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-sss-white mb-4">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nome-candidatura" className="block text-sm font-medium text-sss-white mb-2">
              Nome Completo
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="nome-candidatura"
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                placeholder="Seu nome completo"
                aria-label="Nome completo do candidato"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email-candidatura" className="block text-sm font-medium text-sss-white mb-2">
              Email
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email-candidatura"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                placeholder="seu@email.com"
                aria-label="Email do candidato"
              />
            </div>
          </div>
        </div>
      </div>

      

      <div>
        <label htmlFor="bio-candidatura" className="block text-sm font-medium text-sss-white mb-2">
          Biografia
        </label>
        <textarea
          id="bio-candidatura"
          rows={4}
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
          placeholder="Conte um pouco sobre você e seu conteúdo..."
          aria-label="Biografia do candidato"
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-sss-white mb-4">Redes Sociais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="youtube-candidatura" className="block text-sm font-medium text-sss-white mb-2">
              YouTube
            </label>
            <input
              id="youtube-candidatura"
              type="url"
              value={formData.redesSociais.youtube || ''}
              onChange={(e) => handleSocialChange('youtube', e.target.value)}
              className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
              placeholder="https://youtube.com/@seucanal"
              aria-label="Link do canal do YouTube"
            />
          </div>
          
          <div>
            <label htmlFor="twitch-candidatura" className="block text-sm font-medium text-sss-white mb-2">
              Twitch
            </label>
            <input
              id="twitch-candidatura"
              type="url"
              value={formData.redesSociais.twitch || ''}
              onChange={(e) => handleSocialChange('twitch', e.target.value)}
              className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
              placeholder="https://twitch.tv/seucanal"
              aria-label="Link do canal da Twitch"
            />
          </div>
          
          <div>
            <label htmlFor="instagram-candidatura" className="block text-sm font-medium text-sss-white mb-2">
              Instagram
            </label>
            <input
              id="instagram-candidatura"
              type="url"
              value={formData.redesSociais.instagram || ''}
              onChange={(e) => handleSocialChange('instagram', e.target.value)}
              className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
              placeholder="https://instagram.com/seuperfil"
              aria-label="Link do perfil do Instagram"
            />
          </div>
          
          <div>
            <label htmlFor="tiktok-candidatura" className="block text-sm font-medium text-sss-white mb-2">
              TikTok
            </label>
            <input
              id="tiktok-candidatura"
              type="url"
              value={formData.redesSociais.tiktok || ''}
              onChange={(e) => handleSocialChange('tiktok', e.target.value)}
              className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
              placeholder="https://tiktok.com/@seuperfil"
              aria-label="Link do perfil do TikTok"
            />
          </div>
          <div>
            <label htmlFor="discord-candidatura" className="block text-sm font-medium text-sss-white mb-2">
              Discord
            </label>
            <input
              id="discord-candidatura"
              type="url"
              value={formData.redesSociais.discord || ''}
              onChange={(e) => handleSocialChange('discord', e.target.value)}
              className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
              placeholder="https://discord.gg/seuserver"
              aria-label="Link do servidor do Discord"
            />
          </div>
        </div>
      </div>

      
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-sss-white mb-4">Experiência e Motivação</h3>
        
        <div className="mb-4">
          <label htmlFor="experiencia-candidatura" className="block text-sm font-medium text-sss-white mb-2">
            Experiência em Criação de Conteúdo
          </label>
          <textarea
            id="experiencia-candidatura"
            rows={3}
            value={formData.experiencia}
            onChange={(e) => handleInputChange('experiencia', e.target.value)}
            className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
            placeholder="Conte sobre sua experiência criando conteúdo..."
            aria-label="Experiência em criação de conteúdo"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="motivacao-candidatura" className="block text-sm font-medium text-sss-white mb-2">
            Por que você quer ser um criador no SementesPLAY?
          </label>
          <textarea
            id="motivacao-candidatura"
            rows={3}
            value={formData.motivacao}
            onChange={(e) => handleInputChange('motivacao', e.target.value)}
            className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
            placeholder="Explique sua motivação..."
            aria-label="Motivação para ser criador"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="metas-candidatura" className="block text-sm font-medium text-sss-white mb-2">
            Metas como Criador
          </label>
          <textarea
            id="metas-candidatura"
            rows={3}
            value={formData.metas}
            onChange={(e) => handleInputChange('metas', e.target.value)}
            className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
            placeholder="Quais são suas metas e objetivos?"
            aria-label="Metas como criador"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-sss-white mb-2">
            Disponibilidade para Criação
          </label>
          <textarea
            rows={2}
            value={formData.disponibilidade}
            onChange={(e) => handleInputChange('disponibilidade', e.target.value)}
            className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
            placeholder="Quantas horas por semana você pode dedicar?"
          />
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-sss-white mb-4">Critérios de Aprovação</h3>
        
        <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
          <h4 className="text-md font-semibold text-sss-white mb-4">Para ser aprovado como criador, você deve:</h4>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sss-white font-medium">Ter pelo menos 100 seguidores</p>
                <p className="text-gray-400 text-sm">Em pelo menos uma rede social</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sss-white font-medium">Criar conteúdo regularmente</p>
                <p className="text-gray-400 text-sm">Pelo menos 1 post/vídeo por semana</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sss-white font-medium">Ter conteúdo de qualidade</p>
                <p className="text-gray-400 text-sm">Original e relevante para a comunidade</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sss-white font-medium">Seguir as diretrizes da comunidade</p>
                <p className="text-gray-400 text-sm">Conteúdo apropriado e sem violações</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="text-yellow-400 font-semibold">Processo de Aprovação</h4>
              <p className="text-yellow-200 text-sm mt-1">
                Sua candidatura será revisada pela nossa equipe em até 7 dias úteis. 
                Você receberá uma notificação por email com o resultado.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
          <h4 className="text-md font-semibold text-sss-white mb-4">Resumo da Candidatura</h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Nome:</span>
              <span className="text-sss-white">{formData.nome}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Redes Sociais:</span>
              <span className="text-sss-white">
                {Object.values(formData.redesSociais).filter(Boolean).length} configuradas
              </span>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )

  const renderStatusCandidatura = () => {
    if (!candidaturaExistente) return null

    const getStatusIcon = () => {
      switch (candidaturaExistente.status) {
        case 'pendente':
          return <ClockIcon className="w-8 h-8 text-yellow-500" />
        case 'aprovada':
          return <CheckCircleIcon className="w-8 h-8 text-green-500" />
        case 'rejeitada':
          return <XCircleIcon className="w-8 h-8 text-red-500" />
        default:
          return <ClockIcon className="w-8 h-8 text-gray-500" />
      }
    }

    const getStatusText = () => {
      switch (candidaturaExistente.status) {
        case 'pendente':
          return 'Candidatura em Análise'
        case 'aprovada':
          return 'Candidatura Aprovada!'
        case 'rejeitada':
          return 'Candidatura Rejeitada'
        default:
          return 'Status Desconhecido'
      }
    }

    const getStatusDescription = () => {
      switch (candidaturaExistente.status) {
        case 'pendente':
          return 'Sua candidatura está sendo analisada pela nossa equipe. Você receberá uma notificação em breve.'
        case 'aprovada':
          return 'Parabéns! Sua candidatura foi aprovada. Você agora tem acesso ao painel criador.'
        case 'rejeitada':
          return candidaturaExistente.observacoes || 'Infelizmente sua candidatura não foi aprovada. Você pode tentar novamente.'
        default:
          return ''
      }
    }

    const getActionButton = () => {
      switch (candidaturaExistente.status) {
        case 'pendente':
          return (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-200 text-sm">
                Aguarde a análise da nossa equipe. Você será notificado por email.
              </p>
            </div>
          )
        case 'aprovada':
          return (
            <Link href="/painel-criador" className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Acessar Painel Criador
            </Link>
          )
        case 'rejeitada':
          return (
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-200 text-sm">
                  {candidaturaExistente.observacoes || 'Sua candidatura não foi aprovada. Revise os critérios e tente novamente.'}
                </p>
              </div>
              <button 
                onClick={() => setCandidaturaExistente(null)}
                className="inline-flex items-center px-6 py-3 bg-sss-accent hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                aria-label="Tentar candidatura novamente"
              >
                Tentar Novamente
              </button>
            </div>
          )
        default:
          return null
      }
    }

    return (
      <div className="bg-sss-medium rounded-lg p-8 border border-sss-light">
        <div className="text-center space-y-4">
          {getStatusIcon()}
          <h2 className="text-2xl font-bold text-sss-white">{getStatusText()}</h2>
          <p className="text-gray-300 max-w-md mx-auto">{getStatusDescription()}</p>
          
          <div className="text-sm text-gray-400">
            Candidatura enviada em: {new Date(candidaturaExistente.dataCandidatura).toLocaleDateString('pt-BR')}
          </div>
          
          <div className="mt-6">
            {getActionButton()}
          </div>
        </div>
      </div>
    )
  }

  if (verificandoCandidatura) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sss-accent mx-auto mb-4"></div>
          <p className="text-sss-white">Verificando candidatura...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sss-accent"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Candidatura para Criador - SementesPLAY</title>
        <meta name="description" content="Candidate-se para ser um criador no SementesPLAY" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/status" className="inline-flex items-center text-sss-accent hover:text-red-400">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🌱</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-gray-300">Candidatura para Criador</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-20 h-20 bg-sss-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="w-10 h-10 text-sss-accent" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Candidatura para Criador
              </h2>
              <p className="text-gray-300">
                Junte-se à nossa comunidade de criadores de conteúdo
              </p>
            </div>

            {/* Progress Bar */}
            <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-sss-white">Progresso</span>
                <span className="text-sm text-gray-400">{currentStep} de 4</span>
              </div>
              <div className="w-full bg-sss-dark rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r from-sss-accent to-red-600 h-2 rounded-full transition-all duration-500 ${
                    currentStep === 1 ? 'w-1/4' :
                    currentStep === 2 ? 'w-1/2' :
                    currentStep === 3 ? 'w-3/4' :
                    'w-full'
                  }`}
                ></div>
              </div>
            </div>

            {/* Mensagens de Confirmação e Erro */}
            {candidaturaEnviada && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-900/20 border border-green-500 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  <div>
                    <h3 className="text-green-400 font-semibold">Candidatura enviada com sucesso! 🎉</h3>
                    <p className="text-green-300 text-sm">Você receberá uma notificação em breve.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {erroEnvio && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/20 border border-red-500 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3">
                  <XCircleIcon className="w-6 h-6 text-red-400" />
                  <div>
                    <h3 className="text-red-400 font-semibold">Erro ao enviar candidatura</h3>
                    <p className="text-red-300 text-sm">{erroEnvio}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Status da Candidatura Existente ou Formulário */}
            {candidaturaExistente ? (
              renderStatusCandidatura()
            ) : (
              <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
                    aria-label="Voltar para o passo anterior"
                  >
                    Anterior
                  </button>
                  
                  {currentStep < 4 ? (
                    <button
                      onClick={nextStep}
                      className="px-6 py-2 bg-sss-accent hover:bg-red-600 text-white rounded-lg transition-colors"
                      aria-label="Ir para o próximo passo"
                    >
                      Próximo
                    </button>
                  ) : (
                    <button
                      onClick={submitCandidatura}
                      disabled={loading}
                      className="px-6 py-2 bg-sss-accent hover:bg-red-600 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                      aria-label="Enviar candidatura"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <span>Enviar Candidatura</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
} 