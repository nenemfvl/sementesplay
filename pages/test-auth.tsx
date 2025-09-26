import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { auth, User } from '../lib/auth'

export default function TestAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [sessionStatus, setSessionStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    setLoading(true)
    
    // Verificar localStorage
    const localUser = auth.getUser()
    console.log('📱 Usuario do localStorage:', localUser)
    setUser(localUser)
    
    // Verificar sessão no servidor
    try {
      const response = await fetch('/api/debug/session-status', {
        credentials: 'include'
      })
      const data = await response.json()
      console.log('🔍 Status da sessão:', data)
      setSessionStatus(data)
    } catch (error) {
      console.error('Erro ao verificar sessão:', error)
    }
    
    setLoading(false)
  }

  const testApiCall = async () => {
    try {
      const response = await fetch('/api/usuario/atual', {
        credentials: 'include'
      })
      const data = await response.json()
      console.log('📡 Teste API /usuario/atual:', response.status, data)
      alert(`API Response: ${response.status} - ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      console.error('Erro na API:', error)
      alert('Erro na API: ' + error)
    }
  }

  const forceLogin = () => {
    window.location.href = '/login'
  }

  const clearAuth = () => {
    auth.logout()
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      Carregando...
    </div>
  }

  return (
    <>
      <Head>
        <title>Teste de Autenticação - SementesPLAY</title>
      </Head>

      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">🧪 Teste de Autenticação</h1>
          
          {/* Status do Usuario Local */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">📱 Usuario Local (localStorage)</h2>
            {user ? (
              <div className="text-green-400">
                <p><strong>✅ Logado:</strong></p>
                <p>ID: {user.id}</p>
                <p>Nome: {user.nome}</p>
                <p>Email: {user.email}</p>
                <p>Tipo: {user.tipo}</p>
              </div>
            ) : (
              <p className="text-red-400">❌ Não logado</p>
            )}
          </div>

          {/* Status da Sessão no Servidor */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">🔍 Status da Sessão (Servidor)</h2>
            {sessionStatus ? (
              <div className="text-green-400">
                <p><strong>Cookies recebidos:</strong> {sessionStatus.debug.cookiesReceived.join(', ')}</p>
                <p><strong>Cookie sementesplay_user:</strong> {sessionStatus.debug.hasSementsplayUser ? '✅ Existe' : '❌ Não existe'}</p>
                <p><strong>Cookie token:</strong> {sessionStatus.debug.hasToken ? '✅ Existe' : '❌ Não existe'}</p>
                <p><strong>Usuario decodificado:</strong> {sessionStatus.debug.userDecoded ? '✅ Sim' : '❌ Não'}</p>
                {sessionStatus.debug.userData && (
                  <div className="mt-2">
                    <p><strong>Dados do usuario:</strong></p>
                    <p>ID: {sessionStatus.debug.userData.id}</p>
                    <p>Nome: {sessionStatus.debug.userData.nome}</p>
                    <p>Email: {sessionStatus.debug.userData.email}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-red-400">❌ Erro ao verificar</p>
            )}
          </div>

          {/* Ações */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">🎮 Ações de Teste</h2>
            <div className="space-y-4">
              <button
                onClick={checkAuth}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                🔄 Atualizar Status
              </button>
              
              <button
                onClick={testApiCall}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                🧪 Testar API /usuario/atual
              </button>
              
              <button
                onClick={forceLogin}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                🔑 Ir para Login
              </button>
              
              <button
                onClick={clearAuth}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                🗑️ Limpar Autenticação
              </button>
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-gray-800 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-white mb-4">🔍 Debug Console</h2>
            <p className="text-gray-400 text-sm">
              Abra o DevTools (F12) e vá na aba Console para ver logs detalhados.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
