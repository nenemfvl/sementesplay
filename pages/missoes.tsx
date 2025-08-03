import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

interface Usuario {
  id: string
  nome: string
  xp: number
  nivel: string
  nivelUsuario: number
}

export default function Missoes() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sementesplay_token')
    if (!token) {
      router.push('/login')
      return
    }

    loadUsuario()
  }, [router])

  const loadUsuario = async () => {
    try {
      const token = localStorage.getItem('sementesplay_token')
      if (!token) return

      const response = await fetch(`/api/usuario/atual`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

             if (response.ok) {
         const data = await response.json()
         setUsuario(data.usuario)
       }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularProgressoNivel = () => {
    if (!usuario) return 0
    const xpAtual = usuario.xp
    const nivelAtual = usuario.nivelUsuario
    const xpNecessario = nivelAtual * 100
    const xpAnterior = (nivelAtual - 1) * 100
    const progresso = ((xpAtual - xpAnterior) / (xpNecessario - xpAnterior)) * 100
    return Math.min(100, Math.max(0, progresso))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar dados do usuário</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>XP e Níveis - SementesPLAY</title>
        <meta name="description" content="Sistema de XP e níveis" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Voltar"
                  title="Voltar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">XP e Níveis</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Card do Usuário */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{usuario.nome}</h2>
                <p className="text-gray-600">Nível {usuario.nivelUsuario}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{usuario.xp}</div>
                <div className="text-sm text-gray-500">XP Total</div>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progresso do Nível</span>
                <span>{Math.round(calcularProgressoNivel())}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${calcularProgressoNivel()}%` }}
                ></div>
              </div>
            </div>

            {/* XP para próximo nível */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {usuario.nivelUsuario * 100 - usuario.xp} XP para o próximo nível
              </p>
            </div>
          </div>

          {/* Sistema Simplificado */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Como Ganhar XP</h3>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl">💝</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">Fazer Doações</h4>
                  <p className="text-gray-600">Ganhe 10 XP por cada doação realizada</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-lg font-semibold text-blue-600">+10 XP</div>
                  <div className="text-sm text-gray-500">por doação</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Sistema Simplificado
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      O sistema de missões foi simplificado. Agora você ganha XP diretamente por fazer doações, 
                      sem precisar completar missões complexas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}