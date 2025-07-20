import React, { useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  QrCodeIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  ArrowLeftIcon,
  PlusIcon,
  DocumentTextIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Parceiro() {
  const [activeTab, setActiveTab] = useState('overview')

  // Dados mockados do parceiro
  const partnerStats = {
    sementesGeradas: 50000,
    cashbackResgatado: 25000,
    usuariosAtivos: 150,
    codigosGerados: 45,
    statusPagamento: 'Ativo',
    proximoPagamento: '2024-02-01'
  }

  const recentCodes = [
    { id: 1, codigo: 'CASH001', valor: 1000, usado: true, data: '2024-01-15' },
    { id: 2, codigo: 'CASH002', valor: 500, usado: false, data: '2024-01-14' },
    { id: 3, codigo: 'CASH003', valor: 2000, usado: true, data: '2024-01-13' }
  ]

  const cityStats = [
    { nome: 'Los Santos', usuarios: 85, sementes: 25000 },
    { nome: 'San Fierro', usuarios: 45, sementes: 15000 },
    { nome: 'Las Venturas', usuarios: 20, sementes: 10000 }
  ]

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: ChartBarIcon },
    { id: 'cashback', label: 'Cashback', icon: QrCodeIcon },
    { id: 'cidades', label: 'Minhas Cidades', icon: BuildingOfficeIcon },
    { id: 'relatorios', label: 'Relatórios', icon: DocumentTextIcon }
  ]

  return (
    <>
      <Head>
        <title>Painel Parceiro - SementesPLAY</title>
        <meta name="description" content="Painel de parceiros SementesPLAY" />
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
                  <span className="text-lg">🏢</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-gray-300">Painel Parceiro</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-300 hover:text-sss-accent">
                  <BellIcon className="w-6 h-6" />
                </button>
                <button className="p-2 text-gray-300 hover:text-sss-accent">
                  <CogIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-sss-accent rounded-full flex items-center justify-center">
                    <BuildingOfficeIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sss-white font-medium">Parceiro</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Sementes Geradas</p>
                  <p className="text-2xl font-bold text-sss-white">{partnerStats.sementesGeradas.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-sss-accent/20 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="w-6 h-6 text-sss-accent" />
                </div>
              </div>
            </div>

            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Cashback Resgatado</p>
                  <p className="text-2xl font-bold text-sss-white">{partnerStats.cashbackResgatado.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <QrCodeIcon className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-sss-white">{partnerStats.usuariosAtivos}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Status</p>
                  <p className="text-2xl font-bold text-green-500">{partnerStats.statusPagamento}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="bg-sss-medium rounded-lg border border-sss-light mb-8">
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
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Payment Status */}
                  <div className="bg-sss-dark rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-sss-white mb-2">Status de Pagamento</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300">Próximo pagamento: {partnerStats.proximoPagamento}</p>
                        <p className="text-sss-accent font-medium">Valor: R$ 500,00</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-500">
                          Ativo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* City Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Estatísticas por Cidade</h3>
                    <div className="space-y-3">
                      {cityStats.map((city, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-sss-accent/20 rounded-full flex items-center justify-center">
                              <BuildingOfficeIcon className="w-4 h-4 text-sss-accent" />
                            </div>
                            <div>
                              <p className="text-sss-white font-medium">{city.nome}</p>
                              <p className="text-gray-400 text-sm">{city.usuarios} usuários ativos</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sss-accent font-semibold">{city.sementes.toLocaleString()} Sementes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'cashback' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Generate Code */}
                  <div className="bg-sss-dark rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Gerar Código de Cashback</h3>
                    <div className="flex space-x-4">
                      <input
                        type="number"
                        placeholder="Valor em Sementes"
                        className="flex-1 px-3 py-2 bg-sss-medium border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                      />
                      <button className="bg-sss-accent hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2">
                        <QrCodeIcon className="w-5 h-5" />
                        <span>Gerar</span>
                      </button>
                    </div>
                  </div>

                  {/* Recent Codes */}
                  <div>
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Códigos Recentes</h3>
                    <div className="space-y-3">
                      {recentCodes.map((code) => (
                        <div key={code.id} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-sss-accent/20 rounded-full flex items-center justify-center">
                              <QrCodeIcon className="w-4 h-4 text-sss-accent" />
                            </div>
                            <div>
                              <p className="text-sss-white font-medium">{code.codigo}</p>
                              <p className="text-gray-400 text-sm">{code.data}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sss-accent font-semibold">{code.valor} Sementes</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              code.usado 
                                ? 'bg-red-500/20 text-red-500' 
                                : 'bg-green-500/20 text-green-500'
                            }`}>
                              {code.usado ? 'Usado' : 'Disponível'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'cidades' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-12"
                >
                  <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sss-white mb-2">Gerenciar Cidades</h3>
                  <p className="text-gray-400">Em breve...</p>
                </motion.div>
              )}

              {activeTab === 'relatorios' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-12"
                >
                  <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sss-white mb-2">Relatórios</h3>
                  <p className="text-gray-400">Em breve...</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <motion.div 
            className="bg-sss-medium rounded-lg p-6 border border-sss-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-sss-white mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center space-x-2 bg-sss-accent hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors">
                <QrCodeIcon className="w-5 h-5" />
                <span>Gerar Código</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-sss-light hover:bg-sss-medium text-white py-3 px-4 rounded-lg transition-colors">
                <DocumentTextIcon className="w-5 h-5" />
                <span>Ver Relatórios</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-sss-light hover:bg-sss-medium text-white py-3 px-4 rounded-lg transition-colors">
                <CogIcon className="w-5 h-5" />
                <span>Configurações</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 