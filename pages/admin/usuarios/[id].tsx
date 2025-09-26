import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ClockIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import { auth, User } from '../../../lib/auth'

interface UsuarioDetalhes {
  id: string
  nome: string
  email: string
  tipo: string
  nivel: string
  sementes: number
  pontuacao: number
  dataCriacao: Date
  ultimoLogin: Date | null
  xp: number
  nivelUsuario: number
  streakLogin: number
  titulo: string | null
  avatarUrl: string | null
  suspenso: boolean
  dataSuspensao: Date | null
  motivoSuspensao: string | null
  status: 'ativo' | 'banido' | 'pendente' | 'suspenso'
}

interface Estatisticas {
  totalDoacoesFeitas: number
  totalDoacoesRecebidas: number
  valorTotalDoacoesFeitas: number
  valorTotalDoacoesRecebidas: number
  totalConteudos: number
  totalComentarios: number
  totalMissoesConcluidas: number
  eCriador: boolean
}

export default function DetalhesUsuario() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState<User | null>(null)
  const [usuario, setUsuario] = useState<UsuarioDetalhes | null>(null)
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    
    if (Number(currentUser.nivel) < 5) {
      alert('Acesso negado. Apenas administradores podem acessar esta área.')
      router.push('/admin')
      return
    }
    
    setUser(currentUser)
  }, [router])

  useEffect(() => {
    if (user && id) {
      loadUsuarioDetalhes()
    }
  }, [user, id])

  const loadUsuarioDetalhes = async () => {
    try {
      setLoading(true)
      
      // Preparar headers com autenticação
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (user) {
        const authToken = encodeURIComponent(JSON.stringify(user))
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch(`/api/admin/usuarios/${id}/detalhes`, {
        credentials: 'include',
        headers
      })

      if (response.ok) {
        const data = await response.json()
        setUsuario(data.usuario)
        setEstatisticas(data.estatisticas)
      } else {
        const errorText = await response.text()
        console.error('Erro na resposta:', response.status, errorText)
        if (response.status === 404) {
          alert('Usuário não encontrado.')
          router.push('/admin/usuarios')
        }
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'text-green-500 bg-green-500/10'
      case 'banido': return 'text-red-500 bg-red-500/10'
      case 'suspenso': return 'text-yellow-500 bg-yellow-500/10'
      case 'pendente': return 'text-blue-500 bg-blue-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'criador-supremo': return 'text-purple-500 bg-purple-500/10'
      case 'criador-parceiro': return 'text-blue-500 bg-blue-500/10'
      case 'criador-comum': return 'text-green-500 bg-green-500/10'
      case 'criador-iniciante': return 'text-yellow-500 bg-yellow-500/10'
      case 'comum': return 'text-gray-500 bg-gray-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const formatarData = (data: Date | string | null) => {
    if (!data) return 'Nunca'
    const date = new Date(data)
    return date.toLocaleString('pt-BR')
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sss-accent"></div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-sss-white mb-2">Usuário não encontrado</h1>
          <p className="text-gray-400 mb-4">O usuário solicitado não foi encontrado no sistema.</p>
          <Link href="/admin/usuarios" className="bg-sss-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg">
            Voltar para Usuários
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Detalhes do Usuário - {usuario.nome} - SementesPLAY</title>
        <meta name="description" content={`Detalhes do usuário ${usuario.nome}`} />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/admin/usuarios" className="p-2 bg-sss-medium rounded-lg hover:bg-sss-light transition-colors">
                  <ArrowLeftIcon className="w-5 h-5 text-sss-white" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-sss-white">Detalhes do Usuário</h1>
                  <p className="text-gray-400">{usuario.nome}</p>
                </div>
              </div>
            </div>

            {/* Informações Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Perfil do Usuário */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-1 bg-sss-medium rounded-lg p-6 border border-sss-light"
              >
                <div className="text-center">
                  <div className="w-24 h-24 bg-sss-accent rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                    {usuario.avatarUrl ? (
                      <Image 
                        src={usuario.avatarUrl} 
                        alt={usuario.nome}
                        width={96}
                        height={96}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-sss-white">{usuario.nome}</h2>
                  <p className="text-gray-400 mb-4">{usuario.email}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(usuario.status)}`}>
                        {usuario.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Nível:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNivelColor(usuario.nivel)}`}>
                        {usuario.nivel}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Tipo:</span>
                      <span className="text-sss-white">{usuario.tipo}</span>
                    </div>

                    {usuario.titulo && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Título:</span>
                        <span className="text-sss-white">{usuario.titulo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Estatísticas */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-2 space-y-6"
              >
                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Sementes</p>
                        <p className="text-xl font-bold text-yellow-500">{usuario.sementes.toLocaleString()}</p>
                      </div>
                      <CurrencyDollarIcon className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>

                  <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">XP</p>
                        <p className="text-xl font-bold text-blue-500">{usuario.xp.toLocaleString()}</p>
                      </div>
                      <TrophyIcon className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Pontuação</p>
                        <p className="text-xl font-bold text-green-500">{usuario.pontuacao.toLocaleString()}</p>
                      </div>
                      <ShieldCheckIcon className="w-8 h-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Streak</p>
                        <p className="text-xl font-bold text-orange-500">{usuario.streakLogin}</p>
                      </div>
                      <ClockIcon className="w-8 h-8 text-orange-500" />
                    </div>
                  </div>
                </div>

                {/* Informações Detalhadas */}
                <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                  <h3 className="text-lg font-medium text-sss-white mb-4">Informações Detalhadas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">Data de Cadastro:</span>
                        <span className="text-sss-white">{formatarData(usuario.dataCriacao)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">Último Login:</span>
                        <span className="text-sss-white">{formatarData(usuario.ultimoLogin)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">Nível Numérico:</span>
                        <span className="text-sss-white">Nível {usuario.nivelUsuario}</span>
                      </div>
                    </div>

                    {estatisticas && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CurrencyDollarIcon className="w-4 h-4 text-green-400" />
                            <span className="text-gray-400">Doações Feitas:</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sss-white">{estatisticas.totalDoacoesFeitas} doações</div>
                            <div className="text-sm text-green-400">{estatisticas.valorTotalDoacoesFeitas.toLocaleString()} sementes</div>
                          </div>
                        </div>
                        
                        {estatisticas.eCriador && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <CurrencyDollarIcon className="w-4 h-4 text-blue-400" />
                              <span className="text-gray-400">Doações Recebidas:</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sss-white">{estatisticas.totalDoacoesRecebidas} doações</div>
                              <div className="text-sm text-blue-400">{estatisticas.valorTotalDoacoesRecebidas.toLocaleString()} sementes</div>
                            </div>
                          </div>
                        )}
                        
                        {estatisticas.eCriador && (
                          <div className="flex items-center space-x-2">
                            <EyeIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Conteúdos Criados:</span>
                            <span className="text-sss-white">{estatisticas.totalConteudos}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <TrophyIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">Missões Concluídas:</span>
                          <span className="text-sss-white">{estatisticas.totalMissoesConcluidas}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Suspensão (se aplicável) */}
                {usuario.suspenso && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-red-400 mb-4">Informações de Suspensão</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-red-300">Data da Suspensão:</span>
                        <span className="text-red-100">{formatarData(usuario.dataSuspensao)}</span>
                      </div>
                      {usuario.motivoSuspensao && (
                        <div className="flex items-start space-x-2">
                          <span className="text-red-300">Motivo:</span>
                          <span className="text-red-100">{usuario.motivoSuspensao}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
