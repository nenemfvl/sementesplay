import React, { useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth } from '../lib/auth'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Tentando fazer login...');
    e.preventDefault();
    console.log('Depois do preventDefault');
    setError(null);
    console.log('Antes do fetch');

    // Log para garantir que está no navegador
    console.log('window:', typeof window, window ? 'existe' : 'NÃO existe');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          senha: formData.password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Salvar usuário na sessão (garante que sempre salva algo)
        if (typeof window !== 'undefined') {
          if (data.usuario && data.token) {
            auth.setUser(data.usuario, data.token)
            console.log('Usuário salvo no localStorage:', data.usuario)
            const userLS = localStorage.getItem('sementesplay_user');
            console.log('Usuário no localStorage após login:', userLS);
            window.location.href = '/';
          } else {
            auth.setUser(data)
            console.log('Usuário salvo no localStorage (fallback):', data)
            const userLS = localStorage.getItem('sementesplay_user');
            console.log('Usuário no localStorage após login:', userLS);
            window.location.href = '/';
          }
        } else {
          console.log('Tentativa de salvar usuário fora do navegador!')
        }
      } else {
        setError(data.error || 'Erro ao fazer login. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      setError('Erro ao fazer login. Tente novamente.')
    }
  }

  return (
    <>
      <Head>
        <title>Login - SementesPLAY</title>
        <meta name="description" content="Faça login no SementesPLAY" />
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
              Bem-vindo de volta
            </h2>
            <p className="text-gray-300">
              Entre na sua conta SementesPLAY
            </p>
          </div>

          {/* Login Form */}
          <motion.form 
            className="mt-8 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-500" />
                <span>
                  {error.includes('inválidos') ? (
                    <>
                      Email ou senha inválidos.<br />
                      <span className="text-sm">Não tem conta? <Link href="/registro" className="underline text-blue-600 hover:text-blue-800">Crie uma conta grátis</Link></span>
                    </>
                  ) : error}
                </span>
              </div>
            )}
            <div className="bg-sss-medium rounded-lg p-6 shadow-lg border border-sss-light">
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-sss-white mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent focus:border-transparent"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-sss-white mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full px-3 py-2 pr-10 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent focus:border-transparent"
                      placeholder="Sua senha"
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-sss-accent focus:ring-sss-accent border-sss-light rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                      Lembrar de mim
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link href="/esqueci-senha" className="text-sss-accent hover:text-red-400">
                      Esqueceu a senha?
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-sss-accent hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Entrar
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-300">
                Não tem uma conta?{' '}
                <Link href="/registro" className="text-sss-accent hover:text-red-400 font-medium">
                  Criar conta grátis
                </Link>
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </>
  )
} 