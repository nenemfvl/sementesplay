import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CreditCardIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { auth, User } from '../lib/auth'
import Navbar from '../components/Navbar'
import Notificacoes from '../components/Notificacoes'

interface Parceiro {
  id: string
  usuarioId: string
  nomeCidade: string
  comissaoMensal: number
  totalVendas: number
  codigosGerados: number
  usuario?: User
}

interface CodigoCashback {
  id: string
  codigo: string
  valor: number
  usado: boolean
  dataGeracao: string
  dataUso?: string
}

interface Transacao {
  id: string
  valor: number
  codigoParceiro: string
  status: string
  data: string
  usuario?: {
    nome: string
    email: string
  }
}

interface Estatisticas {
  totalVendas: number
  totalComissoes: number
  codigosAtivos: number
  codigosUsados: number
  transacoesMes: number
  usuariosAtivos: number
}

export default function PainelParceiro() {
  const [parceiro, setParceiro] = useState<Parceiro | null>(null)
  const [codigos, setCodigos] = useState<CodigoCashback[]>([])
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showGerarCodigo, setShowGerarCodigo] = useState(false)
  const [novoCodigo, setNovoCodigo] = useState({ valor: '', quantidade: '1' })
  const [salvando, setSalvando] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [painelDados, setPainelDados] = useState<any>(null)
  const [abaPainel, setAbaPainel] = useState('dashboard')
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    
    if (currentUser.nivel !== 'parceiro') {
      alert('Acesso negado. Apenas parceiros podem acessar esta área.')
              window.location.href = '/perfil'
      return
    }
    
    setUser(currentUser)
  }, [])

  useEffect(() => {
    if (user) {
      loadParceiroData()
      loadPainelDados()
    }
  }, [user])

  const loadParceiroData = async () => {
    try {
      console.log('Carregando dados do parceiro para usuário:', user?.id)
      
      const [parceiroRes, codigosRes, transacoesRes, statsRes] = await Promise.all([
        fetch(`/api/parceiros/perfil?usuarioId=${user?.id}`),
        fetch(`/api/parceiros/codigos?usuarioId=${user?.id}`),
        fetch(`/api/parceiros/transacoes?usuarioId=${user?.id}`),
        fetch(`/api/parceiros/estatisticas?usuarioId=${user?.id}`)
      ])

      console.log('Resposta da API de perfil:', parceiroRes.status)
      
      if (parceiroRes.ok) {
        const parceiroData = await parceiroRes.json()
        console.log('Dados do parceiro:', parceiroData)
        setParceiro(parceiroData)
      } else {
        const errorData = await parceiroRes.json()
        console.error('Erro na API de perfil:', errorData)
      }

      if (codigosRes.ok) {
        const codigosData = await codigosRes.json()
        setCodigos(codigosData)
      }

      if (transacoesRes.ok) {
        const transacoesData = await transacoesRes.json()
        setTransacoes(transacoesData)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setEstatisticas(statsData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do parceiro:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPainelDados = async () => {
    try {
      const res = await fetch(`/api/parceiros/painel?usuarioId=${user?.id}`)
      if (res.ok) {
        const data = await res.json()
        setPainelDados(data)
      }
    } catch (error) {
      console.error('Erro ao carregar painel do parceiro:', error)
    }
  }

  const gerarCodigo = async () => {
    if (!novoCodigo.valor || !novoCodigo.quantidade) {
      alert('Preencha todos os campos')
      return
    }

    setSalvando(true)
    try {
      const res = await fetch('/api/parceiros/gerar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: parseFloat(novoCodigo.valor),
          quantidade: parseInt(novoCodigo.quantidade),
          usuarioId: user?.id
        })
      })

      if (res.ok) {
        const data = await res.json()
        setCodigos(prev => [...data.codigos, ...prev])
        setNovoCodigo({ valor: '', quantidade: '1' })
        setShowGerarCodigo(false)
        alert('Códigos gerados com sucesso!')
        loadParceiroData()
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao gerar códigos')
      }
    } catch (error) {
      alert('Erro ao gerar códigos')
    } finally {
      setSalvando(false)
    }
  }

  const copiarCodigo = async (codigo: string) => {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(codigo)
      setTimeout(() => setCopiado(null), 2000)
    } catch (error) {
      alert('Erro ao copiar código')
    }
  }

  const enviarComprovanteRepasse = async (compraId: string, valor: number, file: File) => {
    setUploading(compraId)
    // Simulação de upload, idealmente usar um serviço de storage
    const comprovanteUrl = URL.createObjectURL(file)
    try {
      const res = await fetch('/api/repasses-parceiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parceiroId: parceiro?.id,
          compraId,
          valor,
          comprovanteUrl
        })
      })
      if (res.ok) {
        alert('Comprovante enviado com sucesso! Aguarde aprovação.')
        loadPainelDados()
      } else {
        alert('Erro ao enviar comprovante')
      }
    } catch (error) {
      alert('Erro ao enviar comprovante')
    } finally {
      setUploading(null)
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'codigos', label: 'Códigos Cashback', icon: CreditCardIcon },
    { id: 'transacoes', label: 'Transações', icon: DocumentTextIcon },
    { id: 'relatorios', label: 'Relatórios', icon: ArrowTrendingUpIcon },
    { id: 'cashback', label: 'Cashback & Repasse', icon: CurrencyDollarIcon },
    { id: 'configuracoes', label: 'Configurações', icon: CogIcon }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-sss-white">Carregando painel do parceiro...</div>
      </div>
    )
  }

  if (!parceiro) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-sss-white">Perfil de parceiro não encontrado</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Painel Parceiro - SementesPLAY</title>
        <meta name="description" content="Painel exclusivo para parceiros SementesPLAY" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        <Navbar />
        {user && <Notificacoes usuarioId={user.id} />}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-sss-white">Painel Parceiro</h1>
                <p className="text-gray-400 mt-2">Gerencie sua cidade: {parceiro.nomeCidade}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Comissão Mensal</p>
                  <p className="text-xl font-bold text-sss-accent">R$ {parceiro.comissaoMensal.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-sss-accent/20 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-sss-accent" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex space-x-1 bg-sss-medium rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-sss-accent text-white'
                      : 'text-gray-400 hover:text-sss-white hover:bg-sss-light'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total de Vendas</p>
                        <p className="text-2xl font-bold text-sss-white">
                          R$ {estatisticas?.totalVendas.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Comissões</p>
                        <p className="text-2xl font-bold text-sss-white">
                          R$ {estatisticas?.totalComissoes.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <ChartBarIcon className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Códigos Ativos</p>
                        <p className="text-2xl font-bold text-sss-white">
                          {estatisticas?.codigosAtivos || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <CreditCardIcon className="w-6 h-6 text-yellow-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Usuários Ativos</p>
                        <p className="text-2xl font-bold text-sss-white">
                          {estatisticas?.usuariosAtivos || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-sss-medium rounded-lg border border-sss-light">
                  <div className="p-6 border-b border-sss-light">
                    <h3 className="text-lg font-semibold text-sss-white">Transações Recentes</h3>
                  </div>
                  <div className="p-6">
                    {transacoes.length > 0 ? (
                      <div className="space-y-4">
                        {transacoes.slice(0, 5).map((transacao) => (
                          <div key={transacao.id} className="flex items-center justify-between p-4 bg-sss-dark rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                                <CurrencyDollarIcon className="w-5 h-5 text-sss-accent" />
                              </div>
                              <div>
                                <p className="text-sss-white font-medium">
                                  Código: {transacao.codigoParceiro}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {transacao.usuario?.nome || 'Usuário'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sss-white font-semibold">
                                R$ {transacao.valor.toFixed(2)}
                              </p>
                              <p className={`text-sm ${
                                transacao.status === 'aprovada' ? 'text-green-500' : 
                                transacao.status === 'pendente' ? 'text-yellow-500' : 'text-red-500'
                              }`}>
                                {transacao.status}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-8">Nenhuma transação encontrada</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'codigos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-sss-white">Códigos de Cashback</h2>
                  <button
                    onClick={() => setShowGerarCodigo(true)}
                    className="bg-sss-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center space-x-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Gerar Códigos</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {codigos.map((codigo) => (
                    <div key={codigo.id} className="bg-sss-medium rounded-lg border border-sss-light p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <CreditCardIcon className="w-5 h-5 text-sss-accent" />
                          <span className="text-sss-white font-medium">Código</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          codigo.usado 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {codigo.usado ? 'Usado' : 'Ativo'}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-400">Código</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-lg font-mono text-sss-white">{codigo.codigo}</p>
                            <button
                              onClick={() => copiarCodigo(codigo.codigo)}
                              className="text-sss-accent hover:text-sss-white transition"
                            >
                              {copiado === codigo.codigo ? (
                                <CheckIcon className="w-4 h-4" />
                              ) : (
                                <ClipboardDocumentIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">Valor</p>
                          <p className="text-lg font-bold text-sss-accent">
                            R$ {codigo.valor.toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="text-gray-400">Gerado em</p>
                            <p className="text-sss-white">
                              {new Date(codigo.dataGeracao).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          {codigo.dataUso && (
                            <div>
                              <p className="text-gray-400">Usado em</p>
                              <p className="text-sss-white">
                                {new Date(codigo.dataUso).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {codigos.length === 0 && (
                  <div className="text-center py-12">
                    <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum código gerado ainda</p>
                    <button
                      onClick={() => setShowGerarCodigo(true)}
                      className="mt-4 bg-sss-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Gerar Primeiro Código
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'transacoes' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-sss-white">Histórico de Transações</h2>
                
                <div className="bg-sss-medium rounded-lg border border-sss-light">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-sss-light">
                          <th className="text-left p-4 text-gray-400 font-medium">Código</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Usuário</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Valor</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transacoes.map((transacao) => (
                          <tr key={transacao.id} className="border-b border-sss-light/50">
                            <td className="p-4">
                              <span className="font-mono text-sss-white">{transacao.codigoParceiro}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-sss-white">{transacao.usuario?.nome || 'N/A'}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-sss-accent font-semibold">
                                R$ {transacao.valor.toFixed(2)}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                transacao.status === 'aprovada' ? 'bg-green-500/20 text-green-400' : 
                                transacao.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400' : 
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {transacao.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-gray-400">
                                {new Date(transacao.data).toLocaleDateString('pt-BR')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {transacoes.length === 0 && (
                    <div className="text-center py-12">
                      <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Nenhuma transação encontrada</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'relatorios' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-sss-white">Relatórios</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-sss-medium rounded-lg border border-sss-light p-6">
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Relatório de Vendas</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total de Vendas</span>
                        <span className="text-sss-white font-semibold">
                          R$ {estatisticas?.totalVendas.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Comissões</span>
                        <span className="text-sss-accent font-semibold">
                          R$ {estatisticas?.totalComissoes.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Transações este mês</span>
                        <span className="text-sss-white font-semibold">
                          {estatisticas?.transacoesMes || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-sss-medium rounded-lg border border-sss-light p-6">
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Relatório de Códigos</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Códigos Gerados</span>
                        <span className="text-sss-white font-semibold">
                          {parceiro.codigosGerados}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Códigos Ativos</span>
                        <span className="text-green-400 font-semibold">
                          {estatisticas?.codigosAtivos || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Códigos Usados</span>
                        <span className="text-blue-400 font-semibold">
                          {estatisticas?.codigosUsados || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cashback' && painelDados && (
              <div className="space-y-6">
                <div className="bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded mb-4 text-blue-200">
                  <strong>Instruções:</strong><br />
                  • O cupom obrigatório para compras é <b>sementesplay20</b>.<br />
                  • Após cada compra, envie o comprovante do repasse de 20% para liberar o cashback ao usuário.<br />
                  • O comprovante deve ser imagem ou PDF, até 5MB.<br />
                  • O saldo devedor é atualizado automaticamente após aprovação do repasse.<br />
                  • Dúvidas? Entre em contato com o suporte.
                </div>
                <div className="bg-sss-medium rounded-lg border border-sss-light p-6">
                  <h2 className="text-xl font-bold text-sss-white mb-4">Cashback & Repasse</h2>
                  <div className="mb-6">
                    <span className="text-gray-400">Saldo Devedor:</span>
                    <span className="text-2xl font-bold text-red-400 ml-2">R$ {painelDados.saldoDevedor?.toFixed(2) || '0,00'}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-sss-white mb-2">Compras com Cupom sementesplay20</h3>
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-sss-light">
                          <th className="text-left p-2 text-gray-400 font-medium">Usuário</th>
                          <th className="text-left p-2 text-gray-400 font-medium">Valor</th>
                          <th className="text-left p-2 text-gray-400 font-medium">Data</th>
                          <th className="text-left p-2 text-gray-400 font-medium">Status</th>
                          <th className="text-left p-2 text-gray-400 font-medium">Comprovante</th>
                        </tr>
                      </thead>
                      <tbody>
                        {painelDados.compras.map((compra: any) => (
                          <tr key={compra.id} className="border-b border-sss-light/50">
                            <td className="p-2">{compra.usuarioId}</td>
                            <td className="p-2">R$ {compra.valorCompra.toFixed(2)}</td>
                            <td className="p-2">{new Date(compra.dataCompra).toLocaleDateString('pt-BR')}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                compra.status === 'aguardando_repasse' ? 'bg-yellow-500/20 text-yellow-400' :
                                compra.status === 'repasse_confirmado' ? 'bg-blue-500/20 text-blue-400' :
                                compra.status === 'cashback_liberado' ? 'bg-green-500/20 text-green-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {compra.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-2">
                              {compra.status === 'aguardando_repasse' ? (
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    disabled={uploading === compra.id}
                                    onChange={e => {
                                      if (e.target.files && e.target.files[0]) {
                                        enviarComprovanteRepasse(compra.id, compra.valorCompra, e.target.files[0])
                                      }
                                    }}
                                  />
                                  <span className="bg-sss-accent text-white px-3 py-1 rounded-lg font-semibold hover:bg-green-700 transition cursor-pointer">
                                    {uploading === compra.id ? 'Enviando...' : 'Enviar Comprovante'}
                                  </span>
                                </label>
                              ) : compra.comprovanteUrl ? (
                                <a href={compra.comprovanteUrl} target="_blank" rel="noopener noreferrer" className="text-sss-accent underline">Ver</a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <h3 className="text-lg font-semibold text-sss-white mb-2">Histórico de Repasses</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-sss-light">
                          <th className="text-left p-2 text-gray-400 font-medium">Valor</th>
                          <th className="text-left p-2 text-gray-400 font-medium">Data</th>
                          <th className="text-left p-2 text-gray-400 font-medium">Status</th>
                          <th className="text-left p-2 text-gray-400 font-medium">Comprovante</th>
                        </tr>
                      </thead>
                      <tbody>
                        {painelDados.repasses.map((repasse: any) => (
                          <tr key={repasse.id} className="border-b border-sss-light/50">
                            <td className="p-2">R$ {repasse.valor.toFixed(2)}</td>
                            <td className="p-2">{new Date(repasse.dataRepasse).toLocaleDateString('pt-BR')}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                repasse.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400' :
                                repasse.status === 'confirmado' ? 'bg-green-500/20 text-green-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {repasse.status}
                              </span>
                            </td>
                            <td className="p-2">
                              {repasse.comprovanteUrl ? (
                                <a href={repasse.comprovanteUrl} target="_blank" rel="noopener noreferrer" className="text-sss-accent underline">Ver</a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'configuracoes' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-sss-white">Configurações</h2>
                
                <div className="bg-sss-medium rounded-lg border border-sss-light p-6">
                  <h3 className="text-lg font-semibold text-sss-white mb-4">Informações da Cidade</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Nome da Cidade
                      </label>
                      <input
                        type="text"
                        value={parceiro.nomeCidade}
                        disabled
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white disabled:opacity-50"
                        title="Nome da cidade do parceiro"
                        aria-label="Nome da cidade do parceiro"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Comissão Mensal
                      </label>
                      <input
                        type="text"
                        value={`R$ ${parceiro.comissaoMensal.toFixed(2)}`}
                        disabled
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white disabled:opacity-50"
                        title="Comissão mensal do parceiro"
                        aria-label="Comissão mensal do parceiro"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal Gerar Código */}
      {showGerarCodigo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-sss-medium rounded-lg p-6 w-full max-w-md border border-sss-light"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-sss-white">Gerar Códigos de Cashback</h3>
              <button
                onClick={() => setShowGerarCodigo(false)}
                className="text-gray-400 hover:text-sss-white"
                aria-label="Fechar modal"
                title="Fechar"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Valor do Código (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={novoCodigo.valor}
                  onChange={(e) => setNovoCodigo(prev => ({ ...prev, valor: e.target.value }))}
                  className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                  placeholder="10.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Quantidade de Códigos
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={novoCodigo.quantidade}
                  onChange={(e) => setNovoCodigo(prev => ({ ...prev, quantidade: e.target.value }))}
                  className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                  placeholder="1"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowGerarCodigo(false)}
                className="flex-1 px-4 py-2 border border-sss-light text-sss-white rounded-lg hover:bg-sss-light transition"
              >
                Cancelar
              </button>
              <button
                onClick={gerarCodigo}
                disabled={salvando}
                className="flex-1 px-4 py-2 bg-sss-accent text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {salvando ? 'Gerando...' : 'Gerar Códigos'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
} 