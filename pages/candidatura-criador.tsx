import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  UserIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'

interface CandidaturaData {
  nome: string
  email: string
  bio: string
  categoria: string
  redesSociais: {
    youtube?: string
    twitch?: string
    instagram?: string
    tiktok?: string
    twitter?: string
  }
  portfolio: {
    descricao: string
    links: string[]
  }
  experiencia: string
  motivacao: string
  metas: string
  disponibilidade: string
}

export default function CandidaturaCriador() {
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<CandidaturaData>({
    nome: '',
    email: '',
    bio: '',
    categoria: '',
    redesSociais: {},
    portfolio: {
      descricao: '',
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

  const categorias = [
    'Gaming/FiveM',
    'Streaming',
    'Educativo',
    'Entretenimento',
    'Tecnologia',
    'Lifestyle',
    'Outros'
  ]

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
  }, [])

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
    try {
      const response = await fetch('/api/criadores/candidaturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        alert('Candidatura enviada com sucesso! 🎉\nVocê receberá uma notificação em breve.')
        window.location.href = '/dashboard'
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao enviar candidatura:', error)
      alert('Erro ao enviar candidatura. Tente novamente.')
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
            <label className="block text-sm font-medium text-sss-white mb-2">
              Nome Completo
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                placeholder="Seu nome completo"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-sss-white mb-2">
              Email
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                placeholder="seu@email.com"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-sss-white mb-2">
          Categoria Principal
        </label>
        <select
          value={formData.categoria}
          onChange={(e) => handleInputChange('categoria', e.target.value)}
          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map(categoria => (
            <option key={categoria} value={categoria}>{categoria}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-sss-white mb-2">
          Biografia
        </label>
        <textarea
          rows={4}
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
          placeholder="Conte um pouco sobre você e seu conteúdo..."
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
            <label className="block text-sm font-medium text-sss-white mb-2">
              YouTube
            </label>
            <input
              type="url"
              value={formData.redesSociais.youtube || ''}
              onChange={(e) => handleSocialChange('youtube', e.target.value)}
              className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
              placeholder="https://youtube.com/@seucanal"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-sss-white mb-2">
              Twitch
            </label>
            <input
              type="url"
              value={formData.redesSociais.twitch || ''}
              onChange={(e) => handleSocialChange('twitch', e.target.value)}
              className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
              placeholder="https://twitch.tv/seucanal"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-sss-white mb-2">
              Instagram
            </label>
            <input
              type="url"
              value={formData.redesSociais.instagram || ''}
              onChange={(e) => handleSocialChange('instagram', e.target.value)}
              className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
              placeholder="https://instagram.com/seuperfil"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-sss-white mb-2">
              TikTok
            </label>
            <input
              type="url"
              value={formData.redesSociais.tiktok || ''}
              onChange={(e) => handleSocialChange('tiktok', e.target.value)}
              className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
              placeholder="https://tiktok.com/@seuperfil"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-sss-white mb-2">
          Descrição do Portfólio
        </label>
        <textarea
          rows={3}
          value={formData.portfolio.descricao}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            portfolio: { ...prev.portfolio, descricao: e.target.value }
          }))}
          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
          placeholder="Descreva seus melhores trabalhos e conquistas..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-sss-white mb-2">
          Links do Portfólio
        </label>
        <div className="space-y-2">
          {portfolioLinks.map((link, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="url"
                value={link}
                onChange={(e) => updatePortfolioLink(index, e.target.value)}
                className="flex-1 px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                placeholder="https://exemplo.com/seutrabalho"
              />
              {portfolioLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePortfolioLink(index)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addPortfolioLink}
            className="px-4 py-2 bg-sss-accent hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Adicionar Link
          </button>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-sss-white mb-4">Experiência e Motivação</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-sss-white mb-2">
            Experiência em Criação de Conteúdo
          </label>
          <textarea
            rows={3}
            value={formData.experiencia}
            onChange={(e) => handleInputChange('experiencia', e.target.value)}
            className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
            placeholder="Conte sobre sua experiência criando conteúdo..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-sss-white mb-2">
            Por que você quer ser um criador no SementesPLAY?
          </label>
          <textarea
            rows={3}
            value={formData.motivacao}
            onChange={(e) => handleInputChange('motivacao', e.target.value)}
            className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
            placeholder="Explique sua motivação..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-sss-white mb-2">
            Metas como Criador
          </label>
          <textarea
            rows={3}
            value={formData.metas}
            onChange={(e) => handleInputChange('metas', e.target.value)}
            className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
            placeholder="Quais são suas metas e objetivos?"
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
              <span className="text-gray-400">Categoria:</span>
              <span className="text-sss-white">{formData.categoria}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Redes Sociais:</span>
              <span className="text-sss-white">
                {Object.values(formData.redesSociais).filter(Boolean).length} configuradas
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Links do Portfólio:</span>
              <span className="text-sss-white">{portfolioLinks.filter(link => link.trim() !== '').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

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
                <Link href="/dashboard" className="inline-flex items-center text-sss-accent hover:text-red-400">
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
                  className="bg-gradient-to-r from-sss-accent to-red-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form */}
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
                >
                  Anterior
                </button>
                
                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-2 bg-sss-accent hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Próximo
                  </button>
                ) : (
                  <button
                    onClick={submitCandidatura}
                    disabled={loading}
                    className="px-6 py-2 bg-sss-accent hover:bg-red-600 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
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
          </motion.div>
        </div>
      </div>
    </>
  )
} 