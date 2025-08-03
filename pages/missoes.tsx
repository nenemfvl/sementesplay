import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { auth } from '../lib/auth'

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
    const currentUser = auth.getUser()
    if (!currentUser) {
      router.push('/login')
      return
    }

    // Usar dados do usuário já carregados
    setUsuario({
      id: currentUser.id,
      nome: currentUser.nome,
      xp: currentUser.xp || 0,
      nivel: currentUser.nivel || '1',
      nivelUsuario: parseInt(currentUser.nivel) || 1
    })
    setLoading(false)
  }, [router])

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
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sss-accent mx-auto"></div>
          <p className="mt-4 text-gray-300">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">Erro ao carregar dados do usuário</p>
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

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <div className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-4 p-2 rounded-lg hover:bg-sss-dark transition-colors text-sss-accent"
                  aria-label="Voltar"
                  title="Voltar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-sss-white">XP e Níveis</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Card do Usuário */}
          <div className="bg-sss-medium rounded-lg shadow-lg border border-sss-light p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-sss-white">{usuario.nome}</h2>
                <p className="text-gray-300">Nível {usuario.nivelUsuario}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-sss-accent">{usuario.xp}</div>
                <div className="text-sm text-gray-400">XP Total</div>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Progresso do Nível</span>
                <span>{Math.round(calcularProgressoNivel())}%</span>
              </div>
              <div className="w-full bg-sss-dark rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-sss-accent to-red-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${calcularProgressoNivel()}%` }}
                ></div>
              </div>
            </div>

            {/* XP para próximo nível */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                {usuario.nivelUsuario * 100 - usuario.xp} XP para o próximo nível
              </p>
            </div>
          </div>

          {/* Sistema Simplificado */}
          <div className="bg-sss-medium rounded-lg shadow-lg border border-sss-light p-6">
            <h3 className="text-lg font-semibold text-sss-white mb-4">Como Ganhar XP</h3>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-sss-dark rounded-lg border border-sss-light">
                <div className="flex-shrink-0 w-12 h-12 bg-sss-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-sss-accent text-xl">💝</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-sss-white">Fazer Doações</h4>
                  <p className="text-gray-300">Ganhe 10 XP por cada doação realizada</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-lg font-semibold text-sss-accent">+10 XP</div>
                  <div className="text-sm text-gray-400">por doação</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-300">
                    Sistema Simplificado
                  </h3>
                  <div className="mt-2 text-sm text-yellow-200">
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