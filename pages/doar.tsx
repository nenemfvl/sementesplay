import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  HeartIcon, 
  ArrowLeftIcon, 
  UserIcon, 
  CurrencyDollarIcon,
  StarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'
import Navbar from '../components/Navbar'

export default function Doar() {
  const [selectedCreator, setSelectedCreator] = useState('')
  const [valor, setValor] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [creators, setCreators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    setUser(currentUser)
    loadCreators()
  }, [])

  const loadCreators = async () => {
    try {
      const response = await fetch('/api/criadores')
      const data = await response.json()
      if (response.ok) {
        setCreators(data.criadores)
      }
    } catch (error) {
      console.error('Erro ao carregar criadores:', error)
    } finally {
      setLoading(false)
    }
  }

  const valorOptions = [50, 100, 200, 500, 1000]

  // Filtrar criadores baseado na pesquisa
  const filteredCreators = creators.filter(creator =>
    creator.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.nivel.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCreator || !valor) {
      alert('Por favor, selecione um criador e um valor!')
      return
    }

    if (!user) {
      alert('Usuário não encontrado!')
      return
    }

    const valorNum = parseInt(valor)
    if (valorNum > user.sementes) {
      alert('Você não tem Sementes suficientes!')
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
          criadorId: selectedCreator,
          quantidade: valorNum,
          mensagem: mensagem || null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Atualizar sementes do usuário
        auth.updateUser({ sementes: user.sementes - valorNum })
        alert('Doação realizada com sucesso! 🌱')
        window.location.href = '/dashboard'
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao fazer doação:', error)
      alert('Erro ao realizar doação. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-sss-white">Carregando criadores...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Doar Sementes - SementesPLAY</title>
        <meta name="description" content="Faça uma doação para seus criadores favoritos" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Navbar */}
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-20 h-20 bg-sss-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeartIcon className="w-10 h-10 text-sss-accent" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Doar Sementes
              </h2>
              <p className="text-gray-300">
                Apoie seus criadores favoritos com Sementes
              </p>
            </div>

            {/* Donation Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleSubmit}
              className="bg-sss-medium rounded-lg p-6 shadow-lg border border-sss-light"
            >
              <div className="space-y-6">
                {/* Creator Selection */}
                <div>
                  <label className="block text-sm font-medium text-sss-white mb-4">
                    Selecione um Criador
                  </label>
                  
                  {/* Barra de Pesquisa */}
                  <div className="mb-4">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Pesquisar criadores por nome ou nível..."
                        className="w-full pl-10 pr-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    {searchTerm && (
                      <p className="text-sm text-gray-400 mt-2">
                        {filteredCreators.length} criador{filteredCreators.length !== 1 ? 'es' : ''} encontrado{filteredCreators.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCreators.length > 0 ? (
                      filteredCreators.map((creator) => (
                        <button
                          key={creator.id}
                          type="button"
                          onClick={() => setSelectedCreator(creator.id.toString())}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedCreator === creator.id.toString()
                              ? 'border-sss-accent bg-sss-accent/10'
                              : 'border-sss-light bg-sss-dark hover:border-sss-accent/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{creator.avatar}</div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-sss-white">{creator.nome}</h3>
                                <div className="flex items-center space-x-1">
                                  {creator.nivel === 'Ouro' && <StarIcon className="w-4 h-4 text-yellow-500" />}
                                  {creator.nivel === 'Prata' && <StarIcon className="w-4 h-4 text-gray-400" />}
                                  {creator.nivel === 'Bronze' && <StarIcon className="w-4 h-4 text-orange-600" />}
                                </div>
                              </div>
                              <p className="text-sm text-gray-400">Nível {creator.nivel}</p>
                              <p className="text-sm text-sss-accent">{creator.sementes} Sementes</p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8">
                        <p className="text-gray-400">Nenhum criador encontrado para "{searchTerm}"</p>
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="mt-2 text-sss-accent hover:text-red-400 transition-colors"
                        >
                          Limpar pesquisa
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Value Selection */}
                <div>
                  <label className="block text-sm font-medium text-sss-white mb-4">
                    Valor da Doação
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {valorOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setValor(option.toString())}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          valor === option.toString()
                            ? 'border-sss-accent bg-sss-accent text-white'
                            : 'border-sss-light bg-sss-dark text-sss-white hover:border-sss-accent/50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-semibold">{option}</div>
                          <div className="text-xs text-gray-400">Sementes</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Value */}
                  <div className="mt-4">
                    <label htmlFor="customValue" className="block text-sm font-medium text-sss-white mb-2">
                      Ou digite um valor personalizado
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="customValue"
                        type="number"
                        min="1"
                        placeholder="Digite o valor"
                        className="w-full pl-10 pr-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent focus:border-transparent"
                        value={valorOptions.includes(parseInt(valor) || 0) ? '' : valor}
                        onChange={(e) => setValor(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="mensagem" className="block text-sm font-medium text-sss-white mb-2">
                    Mensagem (opcional)
                  </label>
                  <textarea
                    id="mensagem"
                    rows={3}
                    placeholder="Deixe uma mensagem para o criador..."
                    className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent focus:border-transparent"
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-sss-accent hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <HeartIcon className="w-5 h-5" />
                  <span>Fazer Doação</span>
                </button>
              </div>
            </motion.form>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-sss-light rounded-lg p-4 border border-sss-medium"
            >
              <h3 className="text-sss-white font-semibold mb-2">ℹ️ Como funciona</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• O criador recebe 90% do valor da doação</li>
                <li>• 10% é retido para manutenção da plataforma</li>
                <li>• Sua doação aparece no perfil do criador</li>
                <li>• Você pode acompanhar suas doações no dashboard</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
} 