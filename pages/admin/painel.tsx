import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  CheckIcon, 
  XMarkIcon, 
  GiftIcon, 
  CurrencyDollarIcon, 
  FlagIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  BanknotesIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import Notificacoes from '../../components/Notificacoes'
import { auth } from '../../lib/auth'
import Navbar from '../../components/Navbar'

export default function PainelAdmin() {
  const [dados, setDados] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [distribuindo, setDistribuindo] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Simulação: buscar usuário admin logado
    const currentUser = auth.getUser && auth.getUser()
    setUser(currentUser)
    if (!currentUser || Number(currentUser.nivel) < 5) {
      window.location.href = '/login'
      return
    }
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/painel')
    const data = await res.json()
    setDados(data)
    setLoading(false)
  }

  const aprovarRepasse = async (repasseId: string) => {
    if (!window.confirm('Aprovar este repasse?')) return
    await fetch('/api/admin/aprovar-repasse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repasseId })
    })
    carregarDados()
  }

  const rejeitarRepasse = async (repasseId: string) => {
    if (!window.confirm('Rejeitar este repasse?')) return
    // Aqui pode-se implementar endpoint de rejeição se desejar
    alert('Funcionalidade de rejeição não implementada')
  }

  const distribuirFundo = async () => {
    if (!window.confirm('Distribuir fundo de sementes para criadores e usuários?')) return
    setDistribuindo(true)
    await fetch('/api/admin/distribuir-fundo', { method: 'POST' })
    setDistribuindo(false)
    carregarDados()
  }

  const processarDenuncia = async (denunciaId: string, acao: 'aprovar' | 'rejeitar') => {
    const confirmacao = acao === 'aprovar' 
      ? 'Aprovar esta denúncia? O conteúdo pode ser removido.'
      : 'Rejeitar esta denúncia?'
    
    if (!window.confirm(confirmacao)) return

    try {
      const response = await fetch('/api/admin/denuncias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ denunciaId, acao })
      })

      if (response.ok) {
        alert(`Denúncia ${acao === 'aprovar' ? 'aprovada' : 'rejeitada'} com sucesso!`)
        carregarDados()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao processar denúncia:', error)
      alert('Erro ao processar denúncia')
    }
  }

  const verConteudo = (denuncia: any) => {
    // Redirecionar diretamente para a plataforma externa do conteúdo
    if (denuncia.conteudo && denuncia.conteudo.url) {
      // Conteúdo de criador - abrir URL direta
      window.open(denuncia.conteudo.url, '_blank')
    } else if (denuncia.conteudoParceiro && denuncia.conteudoParceiro.url) {
      // Conteúdo de parceiro - abrir URL direta
      window.open(denuncia.conteudoParceiro.url, '_blank')
    } else {
      alert('URL do conteúdo não encontrada ou já foi removida')
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Painel Admin - SementesPLAY</title>
        </Head>
        <Navbar />
        <div className="min-h-screen bg-sss-dark flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sss-accent mx-auto mb-4"></div>
            <p className="text-sss-white">Carregando painel administrativo...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Painel Admin - SementesPLAY</title>
        <meta name="description" content="Painel administrativo do SementesPLAY" />
      </Head>
      
      <Navbar />

      <div className="min-h-screen bg-sss-dark">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold text-sss-white mb-4">
                <CurrencyDollarIcon className="w-8 h-8 inline mr-2 text-sss-accent" />
                Painel Administrativo
              </h1>
              <p className="text-gray-300">
                Gerencie repasses, fundos e moderação do sistema
              </p>
            </motion.div>

            {/* Fluxo do Sistema */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card mb-8"
            >
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-sss-white mb-3">Fluxo do Sistema</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>• Usuários compram em sites parceiros usando o cupom <span className="font-bold text-sss-accent">sementesplay20</span></p>
                    <p>• Parceiros devem repassar 20% do valor ao SementesPLAY e enviar comprovante</p>
                    <p>• Admin aprova repasses para liberar cashback e alimentar o fundo de sementes</p>
                    <p>• O fundo é distribuído a cada ciclo para criadores e usuários</p>
                    <p>• Dúvidas? Consulte o suporte ou documentação</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {user && <Notificacoes usuarioId={user.id} />}

            <div className="space-y-8">
              {/* Compras Aguardando Repasse */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-xl font-bold text-sss-white">Compras Aguardando Repasse</h2>
                  </div>
                  <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                    {dados.comprasAguardando?.length || 0} pendentes
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sss-light">
                        <th className="text-left p-3 text-gray-400 font-medium">Parceiro</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Valor</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!dados.comprasAguardando || dados.comprasAguardando.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center text-gray-400 p-8">
                            <ClockIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhuma compra aguardando repasse</p>
                          </td>
                        </tr>
                      ) : dados.comprasAguardando.map((compra: any) => (
                        <tr key={compra.id} className="border-b border-sss-light/30 hover:bg-sss-light/20 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <UserGroupIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-sss-white">{compra.parceiro?.nomeCidade || '-'}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-green-400 font-semibold">R$ {compra.valorCompra.toFixed(2)}</span>
                          </td>
                          <td className="p-3 text-gray-300">
                            {new Date(compra.dataCompra).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Repasses Pendentes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <BanknotesIcon className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl font-bold text-sss-white">Repasses Pendentes</h2>
                  </div>
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                    {dados.repassesPendentes?.length || 0} pendentes
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sss-light">
                        <th className="text-left p-3 text-gray-400 font-medium">Parceiro</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Valor</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Compra</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Comprovante</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!dados.repassesPendentes || dados.repassesPendentes.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-gray-400 p-8">
                            <BanknotesIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhum repasse pendente</p>
                          </td>
                        </tr>
                      ) : dados.repassesPendentes.map((repasse: any) => (
                        <tr key={repasse.id} className="border-b border-sss-light/30 hover:bg-sss-light/20 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <UserGroupIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-sss-white">{repasse.parceiro?.nomeCidade || '-'}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-green-400 font-semibold">R$ {repasse.valor.toFixed(2)}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-blue-400">R$ {repasse.compra?.valorCompra.toFixed(2)}</span>
                          </td>
                          <td className="p-3">
                            {repasse.comprovanteUrl ? (
                              <a 
                                href={repasse.comprovanteUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center space-x-1 text-sss-accent hover:text-sss-accent/80 transition-colors"
                              >
                                <EyeIcon className="w-4 h-4" />
                                <span>Ver</span>
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => aprovarRepasse(repasse.id)} 
                                className="btn-primary flex items-center space-x-1 text-sm"
                              >
                                <CheckIcon className="w-4 h-4" />
                                <span>Aprovar</span>
                              </button>
                              <button 
                                onClick={() => rejeitarRepasse(repasse.id)} 
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1 text-sm transition-colors"
                              >
                                <XMarkIcon className="w-4 h-4" />
                                <span>Rejeitar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Fundo de Sementes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <GiftIcon className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-bold text-sss-white">Fundo de Sementes Atual</h2>
                  </div>
                </div>
                
                {dados.fundoAtual ? (
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-500/20 p-4 rounded-lg">
                        <GiftIcon className="w-8 h-8 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Valor Total Disponível</p>
                        <p className="text-3xl font-bold text-sss-white">R$ {dados.fundoAtual.valorTotal.toFixed(2)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={distribuirFundo} 
                      disabled={distribuindo} 
                      className="btn-primary text-lg px-6 py-3 disabled:opacity-50"
                    >
                      {distribuindo ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Distribuindo...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <GiftIcon className="w-5 h-5" />
                          <span>Distribuir Fundo</span>
                        </div>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <GiftIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum fundo de sementes pendente de distribuição</p>
                  </div>
                )}
              </motion.div>

              {/* Denúncias Pendentes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <FlagIcon className="w-6 h-6 text-red-500" />
                    <h2 className="text-xl font-bold text-sss-white">Denúncias Pendentes</h2>
                  </div>
                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                    {dados.denunciasPendentes?.length || 0} pendentes
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sss-light">
                        <th className="text-left p-3 text-gray-400 font-medium">Denunciante</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Tipo</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Conteúdo</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Motivo</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Data</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!dados.denunciasPendentes || dados.denunciasPendentes.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-gray-400 p-8">
                            <FlagIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhuma denúncia pendente</p>
                          </td>
                        </tr>
                      ) : dados.denunciasPendentes.map((denuncia: any) => (
                        <tr key={denuncia.id} className="border-b border-sss-light/30 hover:bg-sss-light/20 transition-colors">
                          <td className="p-3">
                            <div className="text-sm">
                              <div className="text-sss-white font-medium">{denuncia.denunciante?.nome || 'Anônimo'}</div>
                              <div className="text-gray-400 text-xs">{denuncia.denunciante?.email || '-'}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              denuncia.conteudo ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                            }`}>
                              {denuncia.conteudo ? 'Criador' : 'Parceiro'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <div className="text-sss-white font-medium">
                                {denuncia.conteudo?.titulo || denuncia.conteudoParceiro?.titulo || 'Título não disponível'}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {denuncia.conteudo?.criador?.nome || denuncia.conteudoParceiro?.parceiro?.nome || '-'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <div className="text-sss-white font-medium">{denuncia.tipo}</div>
                              <div className="text-gray-400 text-xs">{denuncia.motivo}</div>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-400">
                            {new Date(denuncia.dataCriacao).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => verConteudo(denuncia)} 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1 text-sm transition-colors"
                              >
                                <EyeIcon className="w-4 h-4" />
                                <span>Ver Conteúdo</span>
                              </button>
                              <button 
                                onClick={() => processarDenuncia(denuncia.id, 'aprovar')} 
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1 text-sm transition-colors"
                              >
                                <CheckIcon className="w-4 h-4" />
                                <span>Aprovar</span>
                              </button>
                              <button 
                                onClick={() => processarDenuncia(denuncia.id, 'rejeitar')} 
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1 text-sm transition-colors"
                              >
                                <XMarkIcon className="w-4 h-4" />
                                <span>Rejeitar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>


    </>
  )
} 