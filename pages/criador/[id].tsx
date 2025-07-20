import React, { useState } from 'react'
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

export default function PerfilCriador() {
  const router = useRouter()
  const { id } = router.query
  const [valorDoacao, setValorDoacao] = useState('')
  const [mensagem, setMensagem] = useState('')

  // Dados mockados do criador
  const criador = {
    id: id || '1',
    nome: 'JoãoGamer',
    nivel: 'Supremo',
    avatar: '🎮',
    bio: 'Criador de conteúdo focado em FiveM e RP. Sempre trazendo o melhor conteúdo para a comunidade!',
    sementes: 25000,
    apoiadores: 150,
    doacoes: 1250,
    posicao: 1,
    redesSociais: {
      youtube: 'https://youtube.com/@joaogamer',
      twitch: 'https://twitch.tv/joaogamer',
      instagram: 'https://instagram.com/joaogamer'
    },
    doacoesRecentes: [
      { id: 1, usuario: 'Maria123', valor: 500, data: '2024-01-15', mensagem: 'Conteúdo incrível!' },
      { id: 2, usuario: 'Pedro456', valor: 200, data: '2024-01-14', mensagem: 'Continue assim!' },
      { id: 3, usuario: 'Ana789', valor: 1000, data: '2024-01-13', mensagem: 'Muito bom!' }
    ]
  }

  const handleDoacao = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valorDoacao) {
      alert('Por favor, digite um valor!')
      return
    }
    
    console.log('Doação:', {
      criador: criador.nome,
      valor: parseInt(valorDoacao),
      mensagem
    })
    
    alert('Doação realizada com sucesso! 🌱')
    setValorDoacao('')
    setMensagem('')
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
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🌱</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-gray-300">Perfil do Criador</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Profile Header */}
            <div className="bg-sss-medium rounded-lg p-8 border border-sss-light">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="w-32 h-32 bg-sss-dark rounded-full flex items-center justify-center text-6xl mb-4">
                    {criador.avatar}
                  </div>
                </motion.div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                    <h1 className="text-3xl font-bold text-sss-white">{criador.nome}</h1>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getNivelBg(criador.nivel)} ${getNivelColor(criador.nivel)}`}>
                      {criador.nivel}
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <StarIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">#{criador.posicao}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6 max-w-2xl">{criador.bio}</p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-sss-white">{criador.sementes.toLocaleString()}</p>
                      <p className="text-gray-400 text-sm">Sementes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-sss-white">{criador.apoiadores}</p>
                      <p className="text-gray-400 text-sm">Apoiadores</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-sss-white">{criador.doacoes}</p>
                      <p className="text-gray-400 text-sm">Doações</p>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center justify-center md:justify-start space-x-4">
                    <a href={criador.redesSociais.youtube} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400">
                      YouTube
                    </a>
                    <a href={criador.redesSociais.twitch} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-400">
                      Twitch
                    </a>
                    <a href={criador.redesSociais.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-400">
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>

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
                    {criador.doacoesRecentes.map((doacao) => (
                      <div key={doacao.id} className="flex items-center justify-between p-4 bg-sss-dark rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-sss-accent" />
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
                    ))}
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