import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  HeartIcon, 
  ArrowLeftIcon, 
  StarIcon,
  UserIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth } from '../../lib/auth'

interface Doacao {
  id: string
  usuario: string
  valor: number
  data: string
  mensagem: string | null
  avatarUrl?: string
}

interface Criador {
  id: string
  nome: string
  nivel: string
  avatar?: string
  bio?: string
  sementes: number // Sementes disponíveis
  sementesRecebidas?: number // Total de sementes recebidas em doações
  apoiadores: number
  doacoes: number
  posicao: number
  redesSociais?: {
    youtube?: string
    twitch?: string
    instagram?: string
  }
}

export default function PerfilCriador() {
  const router = useRouter()
  const { id } = router.query
  const [valorDoacao, setValorDoacao] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [criador, setCriador] = useState<Criador | null>(null)
  const [doacoesRecentes, setDoacoesRecentes] = useState<Doacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchCriadorData()
      fetchDoacoesRecentes()
    }
  }, [id])

  const fetchCriadorData = async () => {
    try {
      const response = await fetch(`/api/criador/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCriador(data.criador)
      } else {
        console.error('Erro ao buscar dados do criador')
      }
    } catch (error) {
      console.error('Erro ao buscar dados do criador:', error)
    }
  }

  const fetchDoacoesRecentes = async () => {
    try {
      const response = await fetch(`/api/criador/${id}/doacoes`)
      if (response.ok) {
        const data = await response.json()
        setDoacoesRecentes(data.doacoes)
      } else {
        console.error('Erro ao buscar doações recentes')
      }
    } catch (error) {
      console.error('Erro ao buscar doações recentes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDoacao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valorDoacao) {
      alert('Por favor, digite um valor!')
      return
    }

    // Verificar se o usuário está logado
    const user = auth.getUser()
    if (!user) {
      alert('Você precisa estar logado para fazer uma doação!')
      window.location.href = '/login'
      return
    }
    
    try {
      const response = await fetch('/api/doacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doadorId: user.id,
          criadorId: id,
          quantidade: parseInt(valorDoacao),
          mensagem: mensagem || null
        })
      })

      if (response.ok) {
        alert('Doação realizada com sucesso! 🌱')
        setValorDoacao('')
        setMensagem('')
        // Recarregar as doações recentes
        fetchDoacoesRecentes()
        // Recarregar dados do criador para atualizar estatísticas
        fetchCriadorData()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erro ao realizar doação. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao fazer doação:', error)
      alert('Erro ao realizar doação. Tente novamente.')
    }
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Supremo': return 'text-yellow-500'
      case 'Parceiro': return 'text-gray-400'
      case 'Comum': return 'text-orange-600'
      default: return 'text-gray-300'
    }
  }

  const getNivelBg = (nivel: string) => {
    switch (nivel) {
      case 'Supremo': return 'bg-yellow-500/20'
      case 'Parceiro': return 'bg-gray-500/20'
      case 'Comum': return 'bg-orange-500/20'
      default: return 'bg-gray-500/20'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-sss-white text-xl">Carregando...</div>
      </div>
    )
  }

  if (!criador) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-sss-white text-xl mb-4">Criador não encontrado</div>
          <div className="text-gray-400 text-sm mb-4">
            ID buscado: {id}
          </div>
          <div className="text-gray-400 text-sm">
            <button 
              onClick={() => {
                console.log('Debug: ID do criador não encontrado:', id)
                console.log('Debug: Router query:', router.query)
                console.log('Debug: Router asPath:', router.asPath)
              }}
              className="px-4 py-2 bg-sss-accent text-white rounded-lg"
            >
              Ver logs no console
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{criador.nome} - SementesPLAY</title>
        <meta name="description" content={`Perfil do criador ${criador.nome}`} />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/ranking" className="inline-flex items-center text-sss-accent hover:text-red-400">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Voltar ao Ranking
                </Link>
              </div>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-sss-accent">SementesPLAY</h1>
                <p className="text-gray-400">Perfil do Criador</p>
              </div>
              
              <div className="w-20"></div> {/* Espaçador */}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-sss-medium rounded-2xl p-8 border border-sss-light mb-8"
            >
              <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 bg-sss-accent/20 rounded-full flex items-center justify-center text-4xl">
                    {criador.avatar || '🎮'}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-sss-accent text-white text-xs px-2 py-1 rounded-full font-bold">
                    #{criador.posicao}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
                    <h1 className="text-3xl font-bold text-sss-white">{criador.nome}</h1>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getNivelBg(criador.nivel)} ${getNivelColor(criador.nivel)}`}>
                        {criador.nivel}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-sss-accent/20 text-sss-accent">
                        #{criador.posicao}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6 max-w-2xl">
                    {criador.bio || 'Criador de conteúdo focado em FiveM e RP. Sempre trazendo o melhor conteúdo para a comunidade!'}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-sss-accent">{criador.sementes.toLocaleString()}</div>
                      <div className="text-gray-400">Sementes Disponíveis</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-sss-accent">{criador.apoiadores}</div>
                      <div className="text-gray-400">Apoiadores</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-sss-accent">{criador.doacoes}</div>
                      <div className="text-gray-400">Doações</div>
                    </div>
                  </div>

                  {/* Social Links */}
                  {criador.redesSociais && (
                    <div className="flex justify-center lg:justify-start gap-4">
                      {criador.redesSociais.youtube && (
                        <a href={criador.redesSociais.youtube} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400">
                          YouTube
                        </a>
                      )}
                      {criador.redesSociais.twitch && (
                        <a href={criador.redesSociais.twitch} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-400">
                          Twitch
                        </a>
                      )}
                      {criador.redesSociais.instagram && (
                        <a href={criador.redesSociais.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-400">
                          Instagram
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Donation Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Donation Form */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-sss-medium rounded-lg p-6 border border-sss-light sticky top-8"
                >
                  <h3 className="text-lg font-semibold text-sss-white mb-4">Fazer Doação</h3>
                  <form onSubmit={handleDoacao} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-sss-white mb-2">
                        Valor (Sementes)
                      </label>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {[100, 500, 1000].map((valor) => (
                          <button
                            key={valor}
                            type="button"
                            onClick={() => setValorDoacao(valor.toString())}
                            className={`p-2 rounded border-2 transition-colors ${
                              valorDoacao === valor.toString()
                                ? 'border-sss-accent bg-sss-accent text-white'
                                : 'border-sss-light bg-sss-dark text-sss-white hover:border-sss-accent/50'
                            }`}
                          >
                            {valor}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        placeholder="Valor personalizado"
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                        value={valorDoacao}
                        onChange={(e) => setValorDoacao(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-sss-white mb-2">
                        Mensagem (opcional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Deixe uma mensagem..."
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-sss-accent hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <HeartIcon className="w-5 h-5" />
                      <span>Doar Sementes</span>
                    </button>
                  </form>
                </motion.div>
              </div>

              {/* Recent Donations */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-sss-medium rounded-lg p-6 border border-sss-light"
                >
                  <h3 className="text-lg font-semibold text-sss-white mb-4">Doações Recentes</h3>
                  <div className="space-y-4">
                    {doacoesRecentes.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        Nenhuma doação ainda. Seja o primeiro a apoiar este criador! 🌱
                      </div>
                    ) : (
                      doacoesRecentes.map((doacao) => (
                        <div key={doacao.id} className="flex items-center justify-between p-4 bg-sss-dark rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                              {doacao.avatarUrl ? (
                                <img src={doacao.avatarUrl} alt={doacao.usuario} className="w-10 h-10 rounded-full" />
                              ) : (
                                <UserIcon className="w-5 h-5 text-sss-accent" />
                              )}
                            </div>
                            <div>
                              <p className="text-sss-white font-medium">{doacao.usuario}</p>
                              <p className="text-gray-400 text-sm">{doacao.data}</p>
                              {doacao.mensagem && (
                                <p className="text-gray-300 text-sm mt-1">"{doacao.mensagem}"</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sss-accent font-semibold">{doacao.valor} Sementes</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 