import React, { useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon, UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth } from '../lib/auth'

export default function Registro() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipoConta: 'usuario' // usuario, criador, parceiro
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem!')
      return
    }

    if (formData.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!')
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.password,
          tipo: formData.tipoConta
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Salvar usuário na sessão
        auth.setUser(data.usuario)
        alert('Conta criada com sucesso! 🎉')
        // Redirecionar para o dashboard
        window.location.href = '/dashboard'
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      alert('Erro ao criar conta. Tente novamente.')
    }
  }

  return (
    <>
      <Head>
        <title>Criar Conta - SementesPLAY</title>
        <meta name="description" content="Crie sua conta no SementesPLAY" />
      </Head>

      <div className="min-h-screen bg-sss-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-sss-accent hover:text-red-400 mb-6">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Voltar ao início
            </Link>
            
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-sss-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
            </motion.div>
            
            <h2 className="text-3xl font-bold text-sss-white mb-2">
              Criar Conta
            </h2>
            <p className="text-gray-300">
              Junte-se ao SementesPLAY
            </p>
          </div>

          {/* Registration Form */}
          <form 
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-sss-medium rounded-lg p-6 shadow-lg border border-sss-light">
                <div className="space-y-4">
                  {/* Account Type */}
                  <div>
                    <label className="block text-sm font-medium text-sss-white mb-3">
                      Tipo de Conta
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'usuario', label: 'Usuário', icon: '👤' },
                        { value: 'criador', label: 'Criador', icon: '🎬' },
                        { value: 'parceiro', label: 'Parceiro', icon: '🏢' }
                      ].map((tipo) => (
                        <button
                          key={tipo.value}
                          type="button"
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            formData.tipoConta === tipo.value
                              ? 'border-sss-accent bg-sss-accent/10 text-sss-accent'
                              : 'border-sss-light bg-sss-dark text-gray-300 hover:border-sss-accent/50'
                          }`}
                          onClick={() => setFormData({ ...formData, tipoConta: tipo.value })}
                        >
                          <div className="text-lg mb-1">{tipo.icon}</div>
                          <div className="text-xs font-medium">{tipo.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-sss-white mb-2">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="nome"
                        name="nome"
                        type="text"
                        required
                        className="w-full pl-10 pr-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent focus:border-transparent"
                        placeholder="Seu nome completo"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-sss-white mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full pl-10 pr-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent focus:border-transparent"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-sss-white mb-2">
                      Senha
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="w-full pl-10 pr-10 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent focus:border-transparent"
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-sss-white mb-2">
                      Confirmar Senha
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        className="w-full pl-10 pr-10 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent focus:border-transparent"
                        placeholder="Confirme sua senha"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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

                  {/* Terms */}
                  <div className="flex items-start">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 mt-1 text-sss-accent focus:ring-sss-accent border-sss-light rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                      Concordo com os{' '}
                      <a href="#" className="text-sss-accent hover:text-red-400">
                        Termos de Uso
                      </a>{' '}
                      e{' '}
                      <a href="#" className="text-sss-accent hover:text-red-400">
                        Política de Privacidade
                      </a>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-sss-accent hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Criar Conta
                  </button>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-300">
                  Já tem uma conta?{' '}
                  <Link href="/login" className="text-sss-accent hover:text-red-400 font-medium">
                    Fazer login
                  </Link>
                </p>
              </div>
            </motion.div>
          </form>
        </div>
      </div>
    </>
  )
} 