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
      const userResponse = await fetch('/api/usuario/atual')
      
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
        body: JSON.stringify({
          usuarioId: user?.id,
          tipo: tipoPagamento,
          valor: parseFloat(valorPagamento)
        })
      })

      const data = await response.json()

      if (response.ok) {
        setPixData(data)
        // Não fechar o modal, mostrar o QR Code
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

    try {
      const response = await fetch('/api/saques', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId: user?.id,
          valor: parseFloat(valorSaque)
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Solicitação de saque enviada com sucesso!')
        setShowSaque(false)
        setValorSaque('')
        loadCarteira()
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao solicitar saque:', error)
      alert('Erro ao solicitar saque')
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

              {/* Card de Saque - Apenas para Criadores */}
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
                  <button
                    onClick={() => setShowSaque(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    aria-label="Abrir modal para solicitar saque"
                  >
                    Solicitar Saque
                  </button>
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
                  {pixData ? 'Pagamento PIX' : 'Fazer Pagamento'}
                </h3>
                <button
                  onClick={() => {
                    setShowPagamento(false)
                    setPixData(null)
                    setValorPagamento('')
                  }}
                  className="text-gray-400 hover:text-white"
                  aria-label="Fechar modal de pagamento"
                >
                  ✕
                </button>
              </div>

              {!pixData ? (
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
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Fechar
                    </button>
                    <button
                      onClick={() => {
                        setPixData(null)
                        setValorPagamento('')
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
              className="bg-sss-medium rounded-lg p-6 max-w-md w-full mx-4"
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
                <div>
                  <label htmlFor="valor-saque" className="block text-sm font-medium text-gray-300 mb-2">
                    Valor (R$)
                  </label>
                  <input
                    id="valor-saque"
                    type="number"
                    step="0.01"
                    min="50"
                    max={carteira?.sementes || 0}
                    value={valorSaque}
                    onChange={(e) => setValorSaque(e.target.value)}
                    className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                    placeholder="50,00"
                    aria-label="Valor do saque em reais"
                  />
                                     <p className="text-xs text-gray-400 mt-1">
                     Sementes disponíveis: {carteira ? carteira.sementes.toLocaleString() : '0'} (Valor máximo: {carteira ? formatarMoeda(carteira.sementes) : 'R$ 0,00'})
                   </p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-yellow-200 text-sm">
                    ⚠️ Certifique-se de que seus dados bancários estão cadastrados antes de solicitar o saque.
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
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Solicitar
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