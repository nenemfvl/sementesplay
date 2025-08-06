import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  QrCodeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  UserIcon,
  IdentificationIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'

interface DadosPixType {
  id: string
  chavePix: string
  tipoChave: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria'
  nomeTitular: string
  cpfCnpj: string
  validado: boolean
}

export default function DadosPix() {
  const [user, setUser] = useState<User | null>(null)
  const [dadosPix, setDadosPix] = useState<DadosPixType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isCriador, setIsCriador] = useState(false)
  const [formData, setFormData] = useState({
    chavePix: '',
    tipoChave: 'cpf' as 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria',
    nomeTitular: '',
    cpfCnpj: ''
  })

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    
    setUser(currentUser)
    checkCriadorStatus(currentUser.id)
    loadDadosPix(currentUser.id)
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

  const loadDadosPix = async (userId: string) => {
    try {
      const response = await fetch(`/api/dados-pix?usuarioId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setDadosPix(data)
        if (data) {
          setFormData({
            chavePix: data.chavePix,
            tipoChave: data.tipoChave,
            nomeTitular: data.nomeTitular,
            cpfCnpj: data.cpfCnpj
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados PIX:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/dados-pix', {
        method: dadosPix ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          usuarioId: user?.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDadosPix(data)
        alert('Dados PIX salvos com sucesso!')
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao salvar dados PIX:', error)
      alert('Erro ao salvar dados PIX')
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

  const getTipoChaveLabel = (tipo: string) => {
    const labels = {
      cpf: 'CPF',
      cnpj: 'CNPJ', 
      email: 'E-mail',
      telefone: 'Telefone',
      aleatoria: 'Chave Aleatória'
    }
    return labels[tipo as keyof typeof labels] || tipo
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sss-white mt-4">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Dados PIX - SementesPLAY</title>
        <meta name="description" content="Cadastre seus dados PIX para receber saques" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <div className="bg-sss-medium border-b border-sss-light">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/carteira" className="text-gray-400 hover:text-white transition-colors">
                  <ArrowLeftIcon className="w-6 h-6" />
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">Dados PIX</h1>
                  <p className="text-gray-400 text-sm">Configure seus dados para receber saques</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Card Principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-sss-medium rounded-lg p-6 border border-sss-light"
          >
            <div className="flex items-center mb-6">
              <QrCodeIcon className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-sss-white">Dados PIX para Saques</h2>
                <p className="text-gray-400">Configure sua chave PIX para receber pagamentos</p>
              </div>
            </div>

            {/* Informações */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <ShieldCheckIcon className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-blue-400 font-semibold mb-2">Informações Importantes</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Seus dados PIX são criptografados e seguros</li>
                    <li>• Apenas administradores podem visualizar seus dados</li>
                    <li>• Os saques são processados em até 24 horas</li>
                    <li>• Valor mínimo para saque: R$ 50,00</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Chave */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Chave PIX
                </label>
                <select
                  name="tipoChave"
                  value={formData.tipoChave}
                  onChange={handleInputChange}
                  className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="telefone">Telefone</option>
                  <option value="aleatoria">Chave Aleatória</option>
                </select>
              </div>

              {/* Chave PIX */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chave PIX
                </label>
                <input
                  type="text"
                  name="chavePix"
                  value={formData.chavePix}
                  onChange={handleInputChange}
                  placeholder={`Digite sua ${getTipoChaveLabel(formData.tipoChave)}`}
                  className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-gray-400 text-sm mt-1">
                  Digite sua {getTipoChaveLabel(formData.tipoChave)} exatamente como está cadastrada no banco
                </p>
              </div>

              {/* Nome do Titular */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Titular
                </label>
                <input
                  type="text"
                  name="nomeTitular"
                  value={formData.nomeTitular}
                  onChange={handleInputChange}
                  placeholder="Nome completo do titular da conta"
                  className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* CPF/CNPJ */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CPF/CNPJ do Titular
                </label>
                <input
                  type="text"
                  name="cpfCnpj"
                  value={formData.cpfCnpj}
                  onChange={handleCPFCNPJChange}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  className="w-full bg-sss-dark border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Botão Salvar */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      {dadosPix ? 'Atualizar Dados PIX' : 'Salvar Dados PIX'}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Dados Salvos */}
            {dadosPix && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-green-900/20 border border-green-500/30 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3" />
                  <div>
                    <h3 className="text-green-400 font-semibold">Dados PIX Configurados</h3>
                    <p className="text-gray-300 text-sm">
                      Sua chave PIX está configurada e pronta para receber saques
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
} 