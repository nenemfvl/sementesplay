import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function RedefinirSenha() {
  const router = useRouter()
  const { token } = router.query
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    senha: '',
    confirmarSenha: ''
  })
  const [loading, setLoading] = useState(false)
  const [senhaAlterada, setSenhaAlterada] = useState(false)
  const [tokenValido, setTokenValido] = useState(true)

  useEffect(() => {
    if (token) {
      // Em produção, você validaria o token aqui
      // Por simplicidade, vamos assumir que é válido
      setTokenValido(true)
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (formData.senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/redefinir-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          novaSenha: formData.senha
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSenhaAlterada(true)
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      alert('Erro ao redefinir senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!tokenValido) {
    return (
      <>
        <Head>
          <title>Token Inválido - SementesPLAY</title>
          <meta name="description" content="Token de recuperação inválido" />
        </Head>

        <div className="min-h-screen bg-sss-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircleIcon className="w-8 h-8 text-red-500" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Token Inválido
              </h2>
              <p className="text-gray-300 mb-6">
                O link de recuperação é inválido ou expirou.
              </p>
              
              <Link 
                href="/esqueci-senha"
                className="w-full bg-sss-accent hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 inline-block text-center"
              >
                Solicitar Novo Link
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (senhaAlterada) {
    return (
      <>
        <Head>
          <title>Senha Alterada - SementesPLAY</title>
          <meta name="description" content="Senha alterada com sucesso" />
        </Head>

        <div className="min-h-screen bg-sss-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Senha Alterada!
              </h2>
              <p className="text-gray-300 mb-6">
                Sua senha foi alterada com sucesso.
              </p>
              
              <Link 
                href="/login"
                className="w-full bg-sss-accent hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 inline-block text-center"
              >
                Fazer Login
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Redefinir Senha - SementesPLAY</title>
        <meta name="description" content="Redefina sua senha do SementesPLAY" />
      </Head>

      <div className="min-h-screen bg-sss-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href="/login" className="inline-flex items-center text-sss-accent hover:text-red-400 mb-6">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Voltar ao login
            </Link>
            
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-sss-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
            </motion.div>
            
            <h2 className="text-3xl font-bold text-sss-white mb-2">
              Redefinir Senha
            </h2>
            <p className="text-gray-300">
              Digite sua nova senha
            </p>
          </div>

          {/* Form */}
          <motion.form 
            className="mt-8 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSubmit}
          >
            <div className="bg-sss-medium rounded-lg p-6 shadow-lg border border-sss-light">
              <div className="space-y-4">
                {/* Nova Senha */}
                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-sss-white mb-2">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      id="senha"
                      name="senha"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full px-3 py-2 pr-10 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent focus:border-transparent"
                      placeholder="Digite sua nova senha"
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label htmlFor="confirmarSenha" className="block text-sm font-medium text-sss-white mb-2">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="w-full px-3 py-2 pr-10 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent focus:border-transparent"
                      placeholder="Confirme sua nova senha"
                      value={formData.confirmarSenha}
                      onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sss-accent hover:bg-red-600 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Alterando...
                    </>
                  ) : (
                    'Alterar Senha'
                  )}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="text-center">
              <p className="text-gray-300 text-sm">
                Lembrou sua senha?{' '}
                <Link href="/login" className="text-sss-accent hover:text-red-400 font-medium">
                  Fazer login
                </Link>
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </>
  )
} 