import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'

interface Parceiro {
  id: string
  nomeCidade: string
  usuario: {
    nome: string
    email: string
  }
}

export default function RegistrarCompra() {
  const [user, setUser] = useState<User | null>(null)
  const [parceiros, setParceiros] = useState<Parceiro[]>([])
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [formData, setFormData] = useState({
    parceiroId: '',
    valorCompra: '',
    dataCompra: '',
    comprovante: null as File | null
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    setUser(currentUser)
    loadParceiros()
  }, [])

  const loadParceiros = async () => {
    try {
      const response = await fetch('/api/parceiros')
      if (response.ok) {
        const data = await response.json()
        setParceiros(data.parceiros)
      }
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setErrors({ comprovante: 'Apenas imagens (JPG, PNG, GIF) e PDF são aceitos' })
        return
      }
      
      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ comprovante: 'Arquivo muito grande. Máximo 5MB' })
        return
      }
      
      setFormData({ ...formData, comprovante: file })
      setErrors({ ...errors, comprovante: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    // Validações
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.parceiroId) {
      newErrors.parceiroId = 'Selecione um parceiro'
    }
    
    if (!formData.valorCompra || parseFloat(formData.valorCompra) <= 0) {
      newErrors.valorCompra = 'Valor da compra é obrigatório e deve ser maior que zero'
    }
    
    if (!formData.dataCompra) {
      newErrors.dataCompra = 'Data da compra é obrigatória'
    }
    
    if (!formData.comprovante) {
      newErrors.comprovante = 'Comprovante de compra é obrigatório'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setEnviando(true)
    
    try {
      // Upload do comprovante (simulado - em produção usar Cloudinary ou similar)
      const comprovanteUrl = formData.comprovante ? URL.createObjectURL(formData.comprovante) : ''
      
      const response = await fetch('/api/compras-parceiro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId: user?.id,
          parceiroId: formData.parceiroId,
          valorCompra: parseFloat(formData.valorCompra),
          dataCompra: formData.dataCompra,
          comprovanteUrl
        })
      })
      
      if (response.ok) {
        setSuccess(true)
        setFormData({
          parceiroId: '',
          valorCompra: '',
          dataCompra: '',
          comprovante: null
        })
        // Limpar input de arquivo
        const fileInput = document.getElementById('comprovante') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        const data = await response.json()
        setErrors({ submit: data.error || 'Erro ao registrar compra' })
      }
    } catch (error) {
      console.error('Erro ao registrar compra:', error)
      setErrors({ submit: 'Erro interno do servidor' })
    } finally {
      setEnviando(false)
    }
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
        <title>Registrar Compra - SementesPLAY</title>
        <meta name="description" content="Registre suas compras com parceiros e receba cashback" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/" className="inline-flex items-center text-sss-accent hover:text-red-400">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Voltar ao Início
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-sss-accent" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-gray-300">Registrar Compra</p>
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
                  <CurrencyDollarIcon className="w-10 h-10 text-sss-accent" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Registrar Compra
              </h2>
              <p className="text-gray-300">
                Registre suas compras com parceiros e receba cashback em Sementes
              </p>
            </div>

            {/* Instruções */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-6"
            >
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Como funciona:</h3>
                  <ul className="text-blue-300 space-y-1 text-sm">
                    <li>• Use o cupom <strong>sementesplay10</strong> na compra</li>
                    <li>• Registre a compra aqui com o comprovante</li>
                    <li>• O parceiro fará o repasse de 10%</li>
                    <li>• Você receberá 5% em Sementes automaticamente</li>
                    <li>• 2,5% vai para o sistema e 2,5% para o fundo de distribuição</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Formulário */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-sss-medium rounded-lg p-6 border border-sss-light"
            >
              {success ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-sss-white mb-2">
                    Compra Registrada com Sucesso!
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Sua compra foi registrada e está aguardando o repasse do parceiro.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="bg-sss-accent hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Registrar Nova Compra
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Parceiro */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Parceiro *
                    </label>
                    <select
                      value={formData.parceiroId}
                      onChange={(e) => setFormData({ ...formData, parceiroId: e.target.value })}
                      className={`w-full bg-sss-dark border rounded-lg px-4 py-3 text-sss-white ${
                        errors.parceiroId ? 'border-red-500' : 'border-sss-light'
                      } focus:border-sss-accent focus:outline-none`}
                      aria-label="Selecione um parceiro"
                    >
                      <option value="">Selecione um parceiro</option>
                      {parceiros.map((parceiro) => (
                        <option key={parceiro.id} value={parceiro.id}>
                          {parceiro.nomeCidade} - {parceiro.usuario.nome}
                        </option>
                      ))}
                    </select>
                    {errors.parceiroId && (
                      <p className="text-red-400 text-sm mt-1">{errors.parceiroId}</p>
                    )}
                  </div>

                  {/* Valor da Compra */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Valor da Compra (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valorCompra}
                      onChange={(e) => setFormData({ ...formData, valorCompra: e.target.value })}
                      className={`w-full bg-sss-dark border rounded-lg px-4 py-3 text-sss-white ${
                        errors.valorCompra ? 'border-red-500' : 'border-sss-light'
                      } focus:border-sss-accent focus:outline-none`}
                      placeholder="0,00"
                    />
                    {errors.valorCompra && (
                      <p className="text-red-400 text-sm mt-1">{errors.valorCompra}</p>
                    )}
                  </div>

                  {/* Data da Compra */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Data da Compra *
                    </label>
                    <input
                      type="date"
                      value={formData.dataCompra}
                      onChange={(e) => setFormData({ ...formData, dataCompra: e.target.value })}
                      className={`w-full bg-sss-dark border rounded-lg px-4 py-3 text-sss-white ${
                        errors.dataCompra ? 'border-red-500' : 'border-sss-light'
                      } focus:border-sss-accent focus:outline-none`}
                    />
                    {errors.dataCompra && (
                      <p className="text-red-400 text-sm mt-1">{errors.dataCompra}</p>
                    )}
                  </div>

                  {/* Comprovante */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Comprovante de Compra *
                    </label>
                    <div className="border-2 border-dashed border-sss-light rounded-lg p-6 text-center hover:border-sss-accent transition-colors">
                      <input
                        id="comprovante"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        aria-label="Selecionar comprovante de compra"
                      />
                      <label htmlFor="comprovante" className="cursor-pointer">
                        <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sss-white font-medium mb-2">
                          Clique para selecionar o comprovante
                        </p>
                        <p className="text-gray-400 text-sm">
                          JPG, PNG, GIF ou PDF (máximo 5MB)
                        </p>
                      </label>
                    </div>
                    {formData.comprovante && (
                      <div className="mt-3 flex items-center space-x-2 text-green-400">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span className="text-sm">{formData.comprovante.name}</span>
                      </div>
                    )}
                    {errors.comprovante && (
                      <p className="text-red-400 text-sm mt-1">{errors.comprovante}</p>
                    )}
                  </div>

                  {/* Erro geral */}
                  {errors.submit && (
                    <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <XCircleIcon className="w-5 h-5 text-red-400" />
                        <span className="text-red-400">{errors.submit}</span>
                      </div>
                    </div>
                  )}

                  {/* Botão Submit */}
                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-sss-accent hover:bg-red-600 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    {enviando ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Registrando...</span>
                      </>
                    ) : (
                      <>
                        <CurrencyDollarIcon className="w-5 h-5" />
                        <span>Registrar Compra</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 