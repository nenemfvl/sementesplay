import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  CreditCardIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  UserIcon,
  BuildingLibraryIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'

interface DadosBancariosType {
  id: string
  banco: string
  agencia: string
  conta: string
  tipoConta: string
  cpfCnpj: string
  nomeTitular: string
  validado: boolean
}

export default function DadosBancarios() {
  const [user, setUser] = useState<User | null>(null)
  const [dadosBancarios, setDadosBancarios] = useState<DadosBancariosType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isCriador, setIsCriador] = useState(false)
  const [formData, setFormData] = useState({
    banco: '',
    agencia: '',
    conta: '',
    tipoConta: 'corrente',
    cpfCnpj: '',
    nomeTitular: ''
  })

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    
    setUser(currentUser)
    checkCriadorStatus(currentUser.id)
    loadDadosBancarios(currentUser.id)
  }, [])

  const checkCriadorStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/criador/${userId}`)
      if (response.ok) {
        setIsCriador(true)
      }
    } catch (error) {
      console.error('Erro ao verificar status de criador:', error)
    }
  }

  const loadDadosBancarios = async (userId: string) => {
    try {
      const response = await fetch(`/api/dados-bancarios?usuarioId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setDadosBancarios(data)
        if (data) {
          setFormData({
            banco: data.banco,
            agencia: data.agencia,
            conta: data.conta,
            tipoConta: data.tipoConta,
            cpfCnpj: data.cpfCnpj,
            nomeTitular: data.nomeTitular
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados bancários:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/dados-bancarios', {
        method: dadosBancarios ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId: user?.id,
          ...formData
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Dados bancários salvos com sucesso!')
        loadDadosBancarios(user?.id || '')
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao salvar dados bancários:', error)
      alert('Erro ao salvar dados bancários')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatarCPFCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
  }

  const handleCPFCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarCPFCNPJ(e.target.value)
    setFormData(prev => ({
      ...prev,
      cpfCnpj: formatted
    }))
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
        <title>Dados Bancários - SementesPLAY</title>
        <meta name="description" content="Cadastre seus dados bancários para solicitar saques" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/carteira" className="inline-flex items-center text-sss-accent hover:text-red-400">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Voltar à Carteira
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                  <CreditCardIcon className="w-5 h-5 text-sss-accent" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">Dados Bancários</h1>
                  <p className="text-sm text-gray-300">Cadastre suas informações para saques</p>
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
                className="inline-flex items-center justify-center w-16 h-16 bg-sss-accent/20 rounded-full mb-4"
              >
                <CreditCardIcon className="w-8 h-8 text-sss-accent" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Dados Bancários
              </h2>
              <p className="text-gray-300">
                {isCriador 
                  ? 'Cadastre seus dados bancários para solicitar saques'
                  : 'Apenas criadores podem cadastrar dados bancários para solicitar saques'
                }
              </p>
            </div>

            {/* Aviso para não-criadores */}
            {!isCriador && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6"
              >
                <div className="flex items-center mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mr-3" />
                  <h3 className="text-lg font-semibold text-yellow-200">
                    Acesso Restrito
                  </h3>
                </div>
                <p className="text-yellow-200 mb-4">
                  Para cadastrar dados bancários e solicitar saques, você precisa ser um criador aprovado.
                </p>
                <Link 
                  href="/candidatura-criador"
                  className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  Candidatar-se como Criador
                </Link>
              </motion.div>
            )}

            {/* Formulário de Dados Bancários */}
            {isCriador && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-sss-medium rounded-lg p-8 border border-sss-light"
              >
                <div className="flex items-center mb-6">
                  <ShieldCheckIcon className="w-6 h-6 text-sss-accent mr-3" />
                  <h3 className="text-xl font-semibold text-sss-white">
                    {dadosBancarios ? 'Atualizar Dados Bancários' : 'Cadastrar Dados Bancários'}
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Banco */}
                    <div>
                      <label htmlFor="banco" className="block text-sm font-medium text-gray-300 mb-2">
                        <BuildingLibraryIcon className="w-4 h-4 inline mr-2" />
                        Banco
                      </label>
                      <input
                        type="text"
                        id="banco"
                        name="banco"
                        value={formData.banco}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                        placeholder="Ex: Banco do Brasil"
                        required
                      />
                    </div>

                    {/* Agência */}
                    <div>
                      <label htmlFor="agencia" className="block text-sm font-medium text-gray-300 mb-2">
                        Agência
                      </label>
                      <input
                        type="text"
                        id="agencia"
                        name="agencia"
                        value={formData.agencia}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                        placeholder="Ex: 1234"
                        required
                      />
                    </div>

                    {/* Conta */}
                    <div>
                      <label htmlFor="conta" className="block text-sm font-medium text-gray-300 mb-2">
                        Conta
                      </label>
                      <input
                        type="text"
                        id="conta"
                        name="conta"
                        value={formData.conta}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                        placeholder="Ex: 12345-6"
                        required
                      />
                    </div>

                    {/* Tipo de Conta */}
                    <div>
                      <label htmlFor="tipoConta" className="block text-sm font-medium text-gray-300 mb-2">
                        Tipo de Conta
                      </label>
                      <select
                        id="tipoConta"
                        name="tipoConta"
                        value={formData.tipoConta}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                        required
                      >
                        <option value="corrente">Conta Corrente</option>
                        <option value="poupanca">Conta Poupança</option>
                      </select>
                    </div>

                    {/* CPF/CNPJ */}
                    <div>
                      <label htmlFor="cpfCnpj" className="block text-sm font-medium text-gray-300 mb-2">
                        <IdentificationIcon className="w-4 h-4 inline mr-2" />
                        CPF/CNPJ
                      </label>
                      <input
                        type="text"
                        id="cpfCnpj"
                        name="cpfCnpj"
                        value={formData.cpfCnpj}
                        onChange={handleCPFCNPJChange}
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                        placeholder="Ex: 123.456.789-00"
                        required
                      />
                    </div>

                    {/* Nome do Titular */}
                    <div>
                      <label htmlFor="nomeTitular" className="block text-sm font-medium text-gray-300 mb-2">
                        <UserIcon className="w-4 h-4 inline mr-2" />
                        Nome do Titular
                      </label>
                      <input
                        type="text"
                        id="nomeTitular"
                        name="nomeTitular"
                        value={formData.nomeTitular}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                        placeholder="Nome completo do titular"
                        required
                      />
                    </div>
                  </div>

                  {/* Status de Validação */}
                  {dadosBancarios && (
                    <div className={`p-4 rounded-lg border ${
                      dadosBancarios.validado 
                        ? 'bg-green-500/10 border-green-500/20' 
                        : 'bg-yellow-500/10 border-yellow-500/20'
                    }`}>
                      <div className="flex items-center">
                        {dadosBancarios.validado ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                        ) : (
                          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                        )}
                        <span className={`font-medium ${
                          dadosBancarios.validado ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {dadosBancarios.validado 
                            ? 'Dados bancários validados' 
                            : 'Dados bancários aguardando validação'
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Botões */}
                  <div className="flex justify-end space-x-4">
                    <Link
                      href="/carteira"
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Cancelar
                    </Link>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-sss-accent hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <ShieldCheckIcon className="w-4 h-4 mr-2" />
                          {dadosBancarios ? 'Atualizar' : 'Cadastrar'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Informações Importantes */}
            {isCriador && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-sss-medium rounded-lg p-6 border border-sss-light"
              >
                <h3 className="text-lg font-semibold text-sss-white mb-4 flex items-center">
                  <BanknotesIcon className="w-5 h-5 mr-2 text-sss-accent" />
                  Informações Importantes
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-sss-accent mr-2">•</span>
                    Os dados bancários são necessários para processar saques
                  </li>
                  <li className="flex items-start">
                    <span className="text-sss-accent mr-2">•</span>
                    A validação dos dados pode levar até 24 horas
                  </li>
                  <li className="flex items-start">
                    <span className="text-sss-accent mr-2">•</span>
                    Saques são processados em até 2 dias úteis
                  </li>
                  <li className="flex items-start">
                    <span className="text-sss-accent mr-2">•</span>
                    Taxa de 2% é aplicada sobre o valor do saque
                  </li>
                  <li className="flex items-start">
                    <span className="text-sss-accent mr-2">•</span>
                    Valor mínimo para saque: R$ 50,00
                  </li>
                  <li className="flex items-start">
                    <span className="text-sss-accent mr-2">•</span>
                    Seus dados são protegidos e criptografados
                  </li>
                </ul>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
} 