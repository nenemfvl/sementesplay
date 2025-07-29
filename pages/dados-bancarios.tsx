import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  CreditCardIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BanknotesIcon
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
    loadDadosBancarios()
  }, [])

  const loadDadosBancarios = async () => {
    try {
      const response = await fetch(`/api/dados-bancarios?usuarioId=${user?.id}`)
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
        loadDadosBancarios()
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
        <meta name="description" content="Cadastre seus dados bancários" />
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
                  <BanknotesIcon className="w-5 h-5 text-sss-accent" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-gray-300">Dados Bancários</p>
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
                  <CreditCardIcon className="w-10 h-10 text-sss-accent" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Dados Bancários
              </h2>
              <p className="text-gray-300">
                Cadastre suas informações bancárias para receber saques
              </p>
            </div>

            {/* Status */}
            {dadosBancarios && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className={`rounded-lg p-4 border ${
                  dadosBancarios.validado 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-yellow-500/10 border-yellow-500/20'
                }`}
              >
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
                      : 'Dados bancários pendentes de validação'
                    }
                  </span>
                </div>
              </motion.div>
            )}

            {/* Formulário */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-sss-medium rounded-lg p-8 border border-sss-light"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Banco *
                    </label>
                    <input
                      type="text"
                      name="banco"
                      value={formData.banco}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                      placeholder="Ex: Banco do Brasil"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Agência *
                    </label>
                    <input
                      type="text"
                      name="agencia"
                      value={formData.agencia}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                      placeholder="Ex: 1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Conta *
                    </label>
                    <input
                      type="text"
                      name="conta"
                      value={formData.conta}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                      placeholder="Ex: 12345-6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Conta *
                    </label>
                    <select
                      name="tipoConta"
                      aria-label="Tipo de conta"
                      value={formData.tipoConta}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                    >
                      <option value="corrente">Conta Corrente</option>
                      <option value="poupanca">Conta Poupança</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CPF/CNPJ *
                    </label>
                    <input
                      type="text"
                      name="cpfCnpj"
                      value={formData.cpfCnpj}
                      onChange={handleCPFCNPJChange}
                      required
                      className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                      placeholder="Ex: 123.456.789-00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome do Titular *
                    </label>
                    <input
                      type="text"
                      name="nomeTitular"
                      value={formData.nomeTitular}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                      placeholder="Nome completo do titular"
                    />
                  </div>
                </div>

                {/* Segurança */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-blue-400 font-medium mb-1">Segurança</h4>
                      <p className="text-blue-300 text-sm">
                        Seus dados bancários são criptografados e armazenados com segurança. 
                        Utilizamos as melhores práticas de proteção de dados pessoais.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-sss-accent hover:bg-red-600 disabled:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      dadosBancarios ? 'Atualizar Dados' : 'Salvar Dados'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Informações */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-sss-medium rounded-lg p-6 border border-sss-light"
            >
              <h3 className="text-lg font-semibold text-sss-white mb-4">
                Informações Importantes
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Os dados bancários são necessários para processar saques</li>
                <li>• A validação dos dados pode levar até 24 horas</li>
                <li>• Saques são processados em até 2 dias úteis</li>
                <li>• Taxa de 2% é aplicada sobre o valor do saque</li>
                <li>• Valor mínimo para saque: R$ 50,00</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 