import React, { useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  CogIcon, 
  ArrowLeftIcon, 
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('perfil')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    nome: 'João Silva',
    email: 'joao@email.com',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  })

  const [notificacoes, setNotificacoes] = useState({
    doacoes: true,
    cashback: true,
    novosCriadores: false,
    ranking: true,
    email: true
  })

  const [privacidade, setPrivacidade] = useState({
    perfilPublico: true,
    mostrarDoacoes: true,
    mostrarNivel: true,
    permitirMensagens: true
  })

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: UserIcon },
    { id: 'notificacoes', label: 'Notificações', icon: BellIcon },
    { id: 'privacidade', label: 'Privacidade', icon: ShieldCheckIcon }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Configurações salvas:', { formData, notificacoes, privacidade })
    alert('Configurações salvas com sucesso! ✅')
  }

  const toggleNotificacao = (key: string) => {
    setNotificacoes(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }

  const togglePrivacidade = (key: string) => {
    setPrivacidade(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }

  return (
    <>
      <Head>
        <title>Configurações - SementesPLAY</title>
        <meta name="description" content="Configurações da sua conta SementesPLAY" />
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
                  <p className="text-sm text-gray-300">Configurações</p>
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
                  <CogIcon className="w-10 h-10 text-sss-accent" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Configurações
              </h2>
              <p className="text-gray-300">
                Gerencie suas preferências e configurações
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-sss-medium rounded-lg border border-sss-light">
              <div className="border-b border-sss-light">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-sss-accent text-sss-accent'
                          : 'border-transparent text-gray-300 hover:text-sss-white'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'perfil' && (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-sss-white mb-2">
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sss-white mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="border-t border-sss-light pt-6">
                      <h3 className="text-lg font-semibold text-sss-white mb-4">Alterar Senha</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-sss-white mb-2">
                            Senha Atual
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              className="w-full pl-3 pr-10 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                              placeholder="Digite sua senha atual"
                              value={formData.senhaAtual}
                              onChange={(e) => setFormData({ ...formData, senhaAtual: e.target.value })}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                              ) : (
                                <EyeIcon className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-sss-white mb-2">
                              Nova Senha
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                className="w-full pl-3 pr-10 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                                placeholder="Nova senha"
                                value={formData.novaSenha}
                                onChange={(e) => setFormData({ ...formData, novaSenha: e.target.value })}
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? (
                                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <EyeIcon className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-sss-white mb-2">
                              Confirmar Nova Senha
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="w-full pl-3 pr-10 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                                placeholder="Confirme a nova senha"
                                value={formData.confirmarSenha}
                                onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <EyeIcon className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.form>
                )}

                {activeTab === 'notificacoes' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Preferências de Notificação</h3>
                    
                    <div className="space-y-4">
                      {Object.entries(notificacoes).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-sss-dark rounded-lg">
                          <div>
                            <h4 className="text-sss-white font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {key === 'doacoes' && 'Receber notificações sobre suas doações'}
                              {key === 'cashback' && 'Alertas sobre códigos de cashback disponíveis'}
                              {key === 'novosCriadores' && 'Novos criadores que se juntam à plataforma'}
                              {key === 'ranking' && 'Mudanças no ranking dos criadores'}
                              {key === 'email' && 'Notificações por email'}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleNotificacao(key)}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              value ? 'bg-sss-accent' : 'bg-sss-light'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'privacidade' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Configurações de Privacidade</h3>
                    
                    <div className="space-y-4">
                      {Object.entries(privacidade).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-sss-dark rounded-lg">
                          <div>
                            <h4 className="text-sss-white font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {key === 'perfilPublico' && 'Seu perfil pode ser visto por outros usuários'}
                              {key === 'mostrarDoacoes' && 'Suas doações aparecem no perfil dos criadores'}
                              {key === 'mostrarNivel' && 'Seu nível é visível para outros usuários'}
                              {key === 'permitirMensagens' && 'Outros usuários podem enviar mensagens'}
                            </p>
                          </div>
                          <button
                            onClick={() => togglePrivacidade(key)}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              value ? 'bg-sss-accent' : 'bg-sss-light'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Save Button */}
                <div className="border-t border-sss-light pt-6">
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-sss-accent hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckIcon className="w-5 h-5" />
                    <span>Salvar Configurações</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 