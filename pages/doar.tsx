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
import Image from 'next/image'

export default function Doar() {
  const [selectedCreator, setSelectedCreator] = useState('')
  const [valor, setValor] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [creators, setCreators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadUserData()
    loadCreators()
    
    // Verificar se há um criador pré-selecionado na URL
    const urlParams = new URLSearchParams(window.location.search)
    const criadorId = urlParams.get('criador')
    if (criadorId) {
      setSelectedCreator(criadorId)
    }
  }, [])

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/usuario/atual')
      if (response.ok) {
        const data = await response.json()
        setUser(data.usuario)
      } else {
        // Fallback para dados locais se a API falhar
        const currentUser = auth.getUser()
        if (!currentUser) {
          window.location.href = '/login'
          return
        }
        setUser(currentUser)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
      // Fallback para dados locais
      const currentUser = auth.getUser()
      if (!currentUser) {
        window.location.href = '/login'
        return
      }
      setUser(currentUser)
    }
  }

  const loadCreators = async () => {
    try {
      const response = await fetch('/api/criadores')
      const data = await response.json()
      if (response.ok) {
        setCreators(data.criadores || [])
      } else {
        console.error('Erro na resposta da API:', data)
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
                    {loading ? (
                      <div className="col-span-2 text-center py-8">
                        <p className="text-gray-400">Carregando criadores...</p>
                      </div>
                    ) : filteredCreators.length > 0 ? (
                      filteredCreators.map((creator) => (
                        <div
                          key={creator.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedCreator === creator.id.toString()
                              ? 'border-sss-accent bg-sss-accent/10'
                              : 'border-sss-light bg-sss-dark hover:border-sss-accent/50'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-sss-accent/20 flex items-center justify-center flex-shrink-0">
                              {creator.avatar && creator.avatar !== '/avatars/default.jpg' ? (
                                <Image
                                  src={creator.avatar.startsWith('http') ? creator.avatar : `https://sementesplay.vercel.app${creator.avatar}`}
                                  alt={`Avatar de ${creator.nome}`}
                                  width={48}
                                  height={48}
                                  className="rounded-full object-cover w-12 h-12"
                                  onError={(e) => {
                                    // Fallback para emoji se a imagem falhar
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`text-2xl ${creator.avatar && creator.avatar !== '/avatars/default.jpg' ? 'hidden' : ''}`}>
                                👤
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-sss-white truncate">{creator.nome}</h3>
                                <div className="flex items-center space-x-1">
                                  {creator.nivel === 'Ouro' && <StarIcon className="w-4 h-4 text-yellow-500" />}
                                  {creator.nivel === 'Prata' && <StarIcon className="w-4 h-4 text-gray-400" />}
                                  {creator.nivel === 'Bronze' && <StarIcon className="w-4 h-4 text-orange-600" />}
                                </div>
                              </div>
                              <p className="text-sm text-gray-400 mb-1">Nível {creator.nivel}</p>
                              <p className="text-sm text-sss-accent mb-3">{creator.totalSementes || 0} Sementes</p>
                              
                              {/* Redes Sociais */}
                              {(creator.redesSociais?.youtube || creator.redesSociais?.twitch || creator.redesSociais?.instagram) && (
                                <div className="flex items-center space-x-2 mb-3">
                                  {creator.redesSociais?.youtube && (
                                    <a
                                      href={creator.redesSociais.youtube}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-red-500 hover:text-red-400 transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                      </svg>
                                    </a>
                                  )}
                                  {creator.redesSociais?.twitch && (
                                    <a
                                      href={creator.redesSociais.twitch}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-purple-500 hover:text-purple-400 transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                                      </svg>
                                    </a>
                                  )}
                                  {creator.redesSociais?.instagram && (
                                    <a
                                      href={creator.redesSociais.instagram}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-pink-500 hover:text-pink-400 transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                      </svg>
                                    </a>
                                  )}
                                </div>
                              )}
                              
                              {/* Botões de Ação */}
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedCreator(creator.id.toString())}
                                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                                    selectedCreator === creator.id.toString()
                                      ? 'bg-sss-accent text-white'
                                      : 'bg-sss-light text-sss-white hover:bg-sss-accent/20'
                                  }`}
                                >
                                  Selecionar
                                </button>
                                <button
                                  type="button"
                                  className="px-3 py-1.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Implementar funcionalidade de seguir
                                    alert(`Seguindo ${creator.nome}!`);
                                  }}
                                >
                                  Seguir
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
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