import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  CogIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TrophyIcon,
  GiftIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../../lib/auth'

interface ConfiguracoesSistema {
  taxaCashback: number
  limiteDoacao: number
  sementesIniciais: number
  nivelMinimoAdmin: number
  maximoCriadores: number
  tempoSessao: number
  manutencao: boolean
  registroPublico: boolean
}

export default function AdminConfiguracoes() {
  const [user, setUser] = useState<User | null>(null)
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesSistema>({
    taxaCashback: 10,
    limiteDoacao: 10000,
    sementesIniciais: 1000,
    nivelMinimoAdmin: 5,
    maximoCriadores: 100,
    tempoSessao: 24,
    manutencao: false,
    registroPublico: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    
    if (Number(currentUser.nivel) < 5) {
      alert('Acesso negado. Apenas administradores podem acessar esta área.')
              window.location.href = '/admin'
      return
    }
    
    setUser(currentUser)
    loadConfiguracoes()
  }, [])

  const loadConfiguracoes = async () => {
    try {
      const response = await fetch('/api/admin/configuracoes')
      if (response.ok) {
        const data = await response.json()
        setConfiguracoes(data.configuracoes)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const salvarConfiguracoes = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/configuracoes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configuracoes)
      })

      if (response.ok) {
        alert('Configurações salvas com sucesso!')
      } else {
        alert('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ConfiguracoesSistema, value: any) => {
    setConfiguracoes(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sss-accent"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Configurações do Sistema - Admin SementesPLAY</title>
        <meta name="description" content="Configurações do sistema" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/admin" className="inline-flex items-center text-sss-accent hover:text-red-400">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Voltar ao Admin
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-red-400">Configurações do Sistema</p>
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
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center">
              <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CogIcon className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Configurações do Sistema
              </h2>
              <p className="text-gray-400">
                Configure parâmetros importantes da plataforma
              </p>
            </div>

            {/* Configurações */}
            <div className="bg-sss-medium rounded-lg border border-sss-light p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sistema de Cashback */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sss-white flex items-center">
                    <GiftIcon className="w-5 h-5 mr-2 text-green-500" />
                    Sistema de Cashback
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Taxa de Cashback (%)
                    </label>
                    <input
                      type="number"
                      value={configuracoes.taxaCashback}
                      onChange={(e) => handleInputChange('taxaCashback', Number(e.target.value))}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                    />
                  </div>
                </div>

                {/* Sistema de Doações */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sss-white flex items-center">
                    <CurrencyDollarIcon className="w-5 h-5 mr-2 text-blue-500" />
                    Sistema de Doações
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Limite de Doação (Sementes)
                    </label>
                    <input
                      type="number"
                      value={configuracoes.limiteDoacao}
                      onChange={(e) => handleInputChange('limiteDoacao', Number(e.target.value))}
                      min="100"
                      max="100000"
                      className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                    />
                  </div>
                </div>

                {/* Usuários */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sss-white flex items-center">
                    <UsersIcon className="w-5 h-5 mr-2 text-purple-500" />
                    Configurações de Usuários
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sementes Iniciais
                    </label>
                    <input
                      type="number"
                      value={configuracoes.sementesIniciais}
                      onChange={(e) => handleInputChange('sementesIniciais', Number(e.target.value))}
                      min="0"
                      max="10000"
                      className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nível Mínimo para Admin
                    </label>
                    <input
                      type="number"
                      value={configuracoes.nivelMinimoAdmin}
                      onChange={(e) => handleInputChange('nivelMinimoAdmin', Number(e.target.value))}
                      min="1"
                      max="10"
                      className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                    />
                  </div>
                </div>

                {/* Criadores */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sss-white flex items-center">
                    <TrophyIcon className="w-5 h-5 mr-2 text-yellow-500" />
                    Sistema de Criadores
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Máximo de Criadores
                    </label>
                    <input
                      type="number"
                      value={configuracoes.maximoCriadores}
                      onChange={(e) => handleInputChange('maximoCriadores', Number(e.target.value))}
                      min="10"
                      max="1000"
                      className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                    />
                  </div>
                </div>

                {/* Sessão */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sss-white flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2 text-cyan-500" />
                    Segurança e Sessão
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tempo de Sessão (horas)
                    </label>
                    <input
                      type="number"
                      value={configuracoes.tempoSessao}
                      onChange={(e) => handleInputChange('tempoSessao', Number(e.target.value))}
                      min="1"
                      max="168"
                      className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                    />
                  </div>
                </div>

                {/* Modo Manutenção */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-sss-white flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-orange-500" />
                    Modo Manutenção
                  </h3>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="manutencao"
                      checked={configuracoes.manutencao}
                      onChange={(e) => handleInputChange('manutencao', e.target.checked)}
                      className="w-4 h-4 text-sss-accent bg-sss-dark border-sss-light rounded focus:ring-sss-accent"
                    />
                    <label htmlFor="manutencao" className="text-sm text-gray-300">
                      Ativar modo manutenção
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="registroPublico"
                      checked={configuracoes.registroPublico}
                      onChange={(e) => handleInputChange('registroPublico', e.target.checked)}
                      className="w-4 h-4 text-sss-accent bg-sss-dark border-sss-light rounded focus:ring-sss-accent"
                    />
                    <label htmlFor="registroPublico" className="text-sm text-gray-300">
                      Permitir registro público
                    </label>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => setConfiguracoes({
                    taxaCashback: 10,
                    limiteDoacao: 10000,
                    sementesIniciais: 1000,
                    nivelMinimoAdmin: 5,
                    maximoCriadores: 100,
                    tempoSessao: 24,
                    manutencao: false,
                    registroPublico: true
                  })}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Restaurar Padrões
                </button>
                
                <button
                  onClick={salvarConfiguracoes}
                  disabled={saving}
                  className="px-6 py-2 bg-sss-accent hover:bg-red-600 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <span>Salvar Configurações</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Avisos */}
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="text-yellow-400 font-semibold">Aviso Importante</h4>
                  <p className="text-yellow-200 text-sm mt-1">
                    As alterações nas configurações do sistema podem afetar o funcionamento da plataforma. 
                    Certifique-se de que as mudanças são necessárias antes de salvar.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 