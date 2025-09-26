import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  WalletIcon,
  ArrowLeftIcon,
  PlusIcon,
  MinusIcon,
  CreditCardIcon,
  QrCodeIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'

interface CarteiraData {
  sementes: number
  totalRecebido: number
  totalSacado: number
}

interface Movimentacao {
  id: string
  tipo: string
  valor: number
  descricao: string
  status: string
  data: Date
}

export default function Carteira() {
  const [user, setUser] = useState<User | null>(null)
  const [carteira, setCarteira] = useState<CarteiraData | null>(null)
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
  const [loading, setLoading] = useState(true)
  const [showPagamento, setShowPagamento] = useState(false)
  const [showSaque, setShowSaque] = useState(false)
  const [valorPagamento, setValorPagamento] = useState('')
  const [valorSaque, setValorSaque] = useState('')
  const [tipoPagamento, setTipoPagamento] = useState('pix')
  const [pixData, setPixData] = useState<any>(null)
  const [loadingPagamento, setLoadingPagamento] = useState(false)
  const [verificandoPagamento, setVerificandoPagamento] = useState(false)
  const [pagamentoAprovado, setPagamentoAprovado] = useState(false)
  const [mensagemPagamento, setMensagemPagamento] = useState('')
  const [savingSaque, setSavingSaque] = useState(false)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    
    setUser(currentUser)
    loadCarteira()
  }, [])

  const loadCarteira = async () => {
    try {
      // Buscar dados do usuário atual
      const userResponse = await fetch('/api/usuario/atual', {
        credentials: 'include' // Incluir cookies na requisição
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setCarteira({
          sementes: userData.usuario.sementes,
          totalRecebido: 0, // Será calculado se necessário
          totalSacado: 0    // Será calculado se necessário
        })
      }
    } catch (error) {
      console.error('Erro ao carregar carteira:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePagamento = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valorPagamento || parseFloat(valorPagamento) < 1) {
      alert('Valor mínimo de R$ 1,00')
      return
    }

    setLoadingPagamento(true)

    try {
      const response = await fetch('/api/pagamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies na requisição
        body: JSON.stringify({
          usuarioId: user?.id,
          tipo: tipoPagamento,
          valor: parseFloat(valorPagamento)
        })
      })

      const data = await response.json()

      if (response.ok) {
        setPixData(data)
        // Iniciar verificação automática do pagamento
        iniciarVerificacaoPagamento(data.paymentId, data.pagamentoId)
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      alert('Erro ao processar pagamento')
    } finally {
      setLoadingPagamento(false)
    }
  }

  const iniciarVerificacaoPagamento = async (paymentId: string, pagamentoId: string) => {
    setVerificandoPagamento(true)
    
    // Verificar a cada 5 segundos por até 5 minutos
    let tentativas = 0
    const maxTentativas = 60 // 5 minutos (60 * 5 segundos)
    
    const verificarPagamento = async () => {
      try {
        const response = await fetch('/api/mercadopago/verificar-pagamento', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Incluir cookies na requisição
          body: JSON.stringify({
            paymentId,
            pagamentoId
          })
        })

        const data = await response.json()

        if (response.ok && data.success) {
          if (data.status === 'aprovado') {
            // Pagamento aprovado!
            setPagamentoAprovado(true)
            setMensagemPagamento(`Pagamento aprovado! Você recebeu ${data.sementesGeradas} sementes.`)
            setVerificandoPagamento(false)
            
            // Atualizar carteira
            await loadCarteira()
            
            // Fechar modal após 3 segundos
            setTimeout(() => {
              setShowPagamento(false)
              setPixData(null)
              setValorPagamento('')
              setPagamentoAprovado(false)
              setMensagemPagamento('')
            }, 3000)
            
            return
          } else if (data.status === 'rejeitado') {
            setMensagemPagamento('Pagamento foi rejeitado.')
            setVerificandoPagamento(false)
            return
          }
        }
        
        tentativas++
        if (tentativas < maxTentativas) {
          // Continuar verificando
          setTimeout(verificarPagamento, 5000)
        } else {
          setMensagemPagamento('Tempo limite excedido. Verifique o status do pagamento manualmente.')
          setVerificandoPagamento(false)
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error)
        tentativas++
        if (tentativas < maxTentativas) {
          setTimeout(verificarPagamento, 5000)
        } else {
          setMensagemPagamento('Erro ao verificar pagamento. Tente novamente.')
          setVerificandoPagamento(false)
        }
      }
    }

    // Iniciar verificação
    verificarPagamento()
  }

  const handleSaque = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valorSaque || parseFloat(valorSaque) < 50) {
      alert('Valor mínimo para saque: R$ 50,00')
      return
    }

    if (!carteira || parseFloat(valorSaque) > carteira.sementes) {
      alert('Sementes insuficientes para o saque')
      return
    }

    // Verificar se tem dados PIX cadastrados
    try {
      const dadosPixResponse = await fetch(`/api/dados-pix?usuarioId=${user?.id}`, {
        credentials: 'include' // Incluir cookies na requisição
      })
      if (!dadosPixResponse.ok) {
        alert('Você precisa cadastrar seus dados PIX antes de solicitar um saque. Redirecionando...')
        window.location.href = '/dados-bancarios'
        return
      }

      const dadosPix = await dadosPixResponse.json()
      if (!dadosPix || !dadosPix.chavePix) {
        alert('Você precisa cadastrar seus dados PIX antes de solicitar um saque. Redirecionando...')
        window.location.href = '/dados-bancarios'
        return
      }

      setSavingSaque(true)
      const response = await fetch('/api/saques', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies na requisição
        body: JSON.stringify({
          valor: parseFloat(valorSaque),
          usuarioId: user?.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCarteira(prev => prev ? { ...prev, sementes: prev.sementes - parseFloat(valorSaque) } : null)
        setValorSaque('')
        setShowSaque(false)
        alert('Saque solicitado com sucesso! Você receberá o pagamento via PIX em até 24 horas.')
        loadCarteira()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao solicitar saque:', error)
      alert('Erro ao solicitar saque')
    } finally {
      setSavingSaque(false)
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'credito': return <PlusIcon className="w-4 h-4 text-green-500" />
      case 'debito': return <MinusIcon className="w-4 h-4 text-red-500" />
      case 'saque': return <BanknotesIcon className="w-4 h-4 text-blue-500" />
      case 'pagamento': return <CreditCardIcon className="w-4 h-4 text-purple-500" />
      default: return <WalletIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processado': return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'pendente': return <ClockIcon className="w-4 h-4 text-yellow-500" />
      case 'cancelado': return <XCircleIcon className="w-4 h-4 text-red-500" />
      default: return <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
    }
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sss-accent"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Carteira Digital - SementesPLAY</title>
        <meta name="description" content="Gerencie sua carteira digital" />
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
                  <WalletIcon className="w-5 h-5 text-sss-accent" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-gray-300">Carteira Digital</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <WalletIcon className="w-10 h-10 text-sss-accent" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Sementes Disponíveis
              </h2>
              <p className="text-gray-300">
                Gerencie suas sementes, pagamentos e saques
              </p>
            </div>

            {/* Sementes Disponíveis */}
            <div className="bg-gradient-to-r from-sss-accent to-red-600 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Sementes Disponíveis</h3>
              <p className="text-4xl font-bold text-white mb-4">
                {carteira ? carteira.sementes.toLocaleString() : '0'} 🌱
              </p>
              <div className="flex justify-center space-x-8 text-white/80">
                                 <div>
                   <p className="text-sm">Valor em Reais</p>
                   <p className="font-semibold">{carteira ? formatarMoeda(carteira.sementes) : 'R$ 0,00'}</p>
                 </div>
                 <div>
                   <p className="text-sm">Taxa de Conversão</p>
                   <p className="font-semibold">1 Real = 1 Semente</p>
                 </div>
              </div>
            </div>

            {/* Ações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-sss-medium rounded-lg p-6 border border-sss-light"
              >
                <h3 className="text-lg font-semibold text-sss-white mb-4 flex items-center">
                  <PlusIcon className="w-5 h-5 mr-2 text-green-500" />
                  Comprar Sementes
                </h3>
                                 <p className="text-gray-400 mb-4">
                   Compre sementes com PIX (1 Real = 1 Semente)
                 </p>
                <button
                  onClick={() => setShowPagamento(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  aria-label="Abrir modal para fazer pagamento"
                >
                  Fazer Pagamento
                </button>
              </motion.div>

              {/* Card de Saque para Criadores */}
              {user?.criador && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-sss-medium rounded-lg p-6 border border-sss-light"
                >
                  <h3 className="text-lg font-semibold text-sss-white mb-4 flex items-center">
                    <BanknotesIcon className="w-5 h-5 mr-2 text-blue-500" />
                    Solicitar Saque
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Converta suas sementes em dinheiro (1 Semente = 1 Real)
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowSaque(true)}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                    >
                      Solicitar Saque
                    </button>
                    
                    <Link
                      href="/dados-bancarios"
                      className="block w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-center text-sm"
                    >
                      Configurar Dados PIX
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Card de Informação para Não-Criadores */}
              {!user?.criador && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-sss-medium rounded-lg p-6 border border-sss-light"
                >
                  <h3 className="text-lg font-semibold text-sss-white mb-4 flex items-center">
                    <BanknotesIcon className="w-5 h-5 mr-2 text-gray-500" />
                    Solicitar Saque
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Apenas criadores podem solicitar saques
                  </p>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-yellow-200 text-sm">
                      ⚠️ Para solicitar saques, você precisa ser um criador aprovado. 
                      <br />
                      <Link href="/candidatura-criador" className="text-blue-400 hover:text-blue-300 underline">
                        Clique aqui para se candidatar
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Histórico */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-sss-medium rounded-lg border border-sss-light overflow-hidden"
            >
              <div className="p-6 border-b border-sss-light">
                <h3 className="text-lg font-semibold text-sss-white flex items-center">
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  Histórico de Movimentações
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-sss-light">
                  <thead className="bg-sss-dark">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-sss-medium divide-y divide-sss-light">
                    {movimentacoes.map((mov) => (
                      <tr key={mov.id} className="hover:bg-sss-dark transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTipoIcon(mov.tipo)}
                            <span className="ml-2 text-sm text-sss-white capitalize">
                              {mov.tipo}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            mov.tipo === 'credito' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {mov.tipo === 'credito' ? '+' : '-'} {formatarMoeda(mov.valor)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-300">{mov.descricao}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(mov.status)}
                            <span className="ml-2 text-sm text-gray-300 capitalize">
                              {mov.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(mov.data).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Modal de Pagamento */}
        {showPagamento && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-sss-medium rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-sss-white">
                  {pagamentoAprovado ? 'Pagamento Aprovado!' : pixData ? 'Pagamento PIX' : 'Fazer Pagamento'}
                </h3>
                <button
                  onClick={() => {
                    setShowPagamento(false)
                    setPixData(null)
                    setValorPagamento('')
                    setPagamentoAprovado(false)
                    setMensagemPagamento('')
                    setVerificandoPagamento(false)
                  }}
                  className="text-gray-400 hover:text-white"
                  aria-label="Fechar modal de pagamento"
                >
                  ✕
                </button>
              </div>

              {pagamentoAprovado ? (
                // Mensagem de confirmação
                <div className="text-center space-y-4">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Pagamento Aprovado!</h4>
                    <p className="text-green-300">{mensagemPagamento}</p>
                  </div>
                  <p className="text-gray-400 text-sm">
                    O modal será fechado automaticamente em alguns segundos...
                  </p>
                </div>
              ) : !pixData ? (
                <form onSubmit={handlePagamento} className="space-y-4">
                  <div>
                    <label htmlFor="valor-pagamento" className="block text-sm font-medium text-gray-300 mb-2">
                      Valor (R$)
                    </label>
                    <input
                      id="valor-pagamento"
                      type="number"
                      step="0.01"
                      min="1"
                      value={valorPagamento}
                      onChange={(e) => setValorPagamento(e.target.value)}
                      className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                      placeholder="1,00"
                      aria-label="Valor do pagamento em reais"
                    />
                  </div>

                  <div>
                    <label htmlFor="tipo-pagamento" className="block text-sm font-medium text-gray-300 mb-2">
                      Forma de Pagamento
                    </label>
                    <div className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white">
                      PIX
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowPagamento(false)}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loadingPagamento}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loadingPagamento ? 'Gerando PIX...' : 'Gerar PIX'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Status do pagamento */}
                  {verificandoPagamento && (
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                        <span className="text-blue-300">Verificando pagamento...</span>
                      </div>
                    </div>
                  )}

                  {mensagemPagamento && !pagamentoAprovado && (
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-yellow-300 text-sm">{mensagemPagamento}</p>
                    </div>
                  )}

                  {/* QR Code */}
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <img 
                        src={pixData.pixCode} 
                        alt="QR Code PIX" 
                        className="w-48 h-48"
                      />
                    </div>
                  </div>

                  {/* Informações do PIX */}
                  <div className="bg-sss-dark rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Valor:</span>
                      <span className="text-white font-semibold">R$ {pixData.valor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Beneficiário:</span>
                      <span className="text-white">{pixData.pixData.beneficiario.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">CPF:</span>
                      <span className="text-white">{pixData.pixData.beneficiario.cpf}</span>
                    </div>
                  </div>

                  {/* Código PIX */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Código PIX
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={pixData.qrCode}
                        readOnly
                        aria-label="Código PIX para copiar"
                        className="flex-1 px-3 py-2 bg-sss-dark border border-sss-light rounded-l-lg text-sss-white text-sm"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(pixData.qrCode)}
                        className="px-3 py-2 bg-sss-accent hover:bg-red-600 text-white rounded-r-lg transition-colors"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  {/* Instruções */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Instruções:</h4>
                    <ul className="space-y-1 text-sm text-gray-400">
                      {pixData.instrucoes.map((instrucao: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-sss-accent mr-2">•</span>
                          {instrucao}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Botões */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowPagamento(false)
                        setPixData(null)
                        setValorPagamento('')
                        setPagamentoAprovado(false)
                        setMensagemPagamento('')
                        setVerificandoPagamento(false)
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Fechar
                    </button>
                    <button
                      onClick={() => {
                        setPixData(null)
                        setValorPagamento('')
                        setPagamentoAprovado(false)
                        setMensagemPagamento('')
                        setVerificandoPagamento(false)
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Novo Pagamento
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Modal de Saque */}
        {showSaque && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-sss-medium rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-sss-white">Solicitar Saque</h3>
                <button
                  onClick={() => setShowSaque(false)}
                  className="text-gray-400 hover:text-white"
                  aria-label="Fechar modal de saque"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaque} className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start">
                    <QrCodeIcon className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-blue-400 font-semibold mb-2">Pagamento via PIX</h4>
                      <p className="text-gray-300 text-sm">
                        O pagamento será enviado para sua chave PIX cadastrada em até 24 horas após a aprovação.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor do Saque (R$)
                  </label>
                  <input
                    type="number"
                    value={valorSaque}
                    onChange={(e) => setValorSaque(e.target.value)}
                    min="50"
                    step="0.01"
                    className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="50.00"
                    required
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    Valor mínimo: R$ 50,00 | Taxa: 10% | Disponível: {carteira?.sementes || 0} sementes
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-blue-200 text-sm">
                    💳 <strong>Dados PIX:</strong> Seus dados PIX serão utilizados para processar o saque.
                    <br />
                    <Link href="/dados-bancarios" className="text-blue-400 hover:text-blue-300 underline">
                      Verificar/Atualizar dados PIX
                    </Link>
                  </p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-yellow-200 text-sm">
                    ⚠️ <strong>Importante:</strong>
                    <br />
                    • Valor mínimo: R$ 50,00
                    <br />
                    • Taxa de 10% será aplicada
                    <br />
                    • Processamento em até 24 horas
                    <br />
                    • Certifique-se de que seus dados PIX estão cadastrados
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowSaque(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingSaque}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {savingSaque ? 'Solicitando Saque...' : 'Solicitar Saque'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </>
  )
} 