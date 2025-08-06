import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { PlusIcon, BuildingOfficeIcon, EyeIcon } from '@heroicons/react/24/outline'
import Navbar from '../components/Navbar'
import { FaTwitch, FaYoutube, FaTiktok, FaInstagram, FaHeart, FaRegHeart, FaBuilding } from 'react-icons/fa'
import { useRouter } from 'next/router'
import { auth } from '../lib/auth'

const categoriasParceiros = [
  { id: 'geral', nome: 'Geral', icone: '🏢', descricao: 'Todos os Parceiros' },
  { id: 'vendas', nome: 'Vendas', icone: '💰', descricao: 'Por Total de Vendas' },
  { id: 'codigos', nome: 'Códigos', icone: '🎫', descricao: 'Por Códigos Gerados' },
]

export default function TodosParceiros() {
  const [parceiros, setParceiros] = useState<any[]>([])
  const [categoriaRanking, setCategoriaRanking] = useState('geral')
  const [loadingRanking, setLoadingRanking] = useState(false)
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<any>(null)
  const [candidaturaStatus, setCandidaturaStatus] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Carregar dados do usuário usando o sistema de autenticação
    const currentUser = auth.getUser()
    
    if (currentUser) {
      setUser(currentUser)
      verificarCandidatura(currentUser.id)
    } else {
      // Tentar buscar da API como fallback
      fetch('/api/usuario/atual', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.usuario) {
            setUser(data.usuario)
            verificarCandidatura(data.usuario.id)
            // Salvar no sistema de autenticação
            auth.setUser(data.usuario)
          }
        })
        .catch(error => {
          console.error('Erro ao buscar usuário da API:', error)
        })
    }

    loadParceiros()
  }, [])

  useEffect(() => {
    loadRankingParceiros()
  }, [categoriaRanking])

  const verificarCandidatura = async (usuarioId: string) => {
    try {
      // Primeiro buscar o usuário para obter o email
      const userResponse = await fetch(`/api/usuario/atual?id=${usuarioId}`)
      if (userResponse.ok) {
        const userData = await userResponse.json()
        const email = userData.email
        
        // Agora verificar a candidatura usando o email
        const response = await fetch(`/api/parceiros/candidaturas?email=${email}`)
        if (response.ok) {
          const data = await response.json()
          if (data.candidatura) {
            setCandidaturaStatus(data.candidatura.status)
          } else {
            setCandidaturaStatus('nenhuma')
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar candidatura:', error)
      setCandidaturaStatus('nenhuma')
    }
  }

  const loadParceiros = async () => {
    try {
      const response = await fetch('/api/parceiros/ranking')
      const data = await response.json()
      if (response.ok && data.success) {
        setParceiros(data.parceiros || [])
      }
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error)
    }
  }

  const loadRankingParceiros = async () => {
    setLoadingRanking(true)
    try {
      const response = await fetch(`/api/parceiros/ranking?categoria=${categoriaRanking}`)
      const data = await response.json()
      if (response.ok && data.success) {
        setParceiros(data.parceiros || [])
      }
    } catch (error) {
      console.error('Erro ao carregar ranking de parceiros:', error)
    } finally {
      setLoadingRanking(false)
    }
  }

  // Carregar favoritos do localStorage
  useEffect(() => {
    if (parceiros.length === 0) {
      return
    }

    const favoritosSalvos = localStorage.getItem('parceirosFavoritos')
    if (favoritosSalvos) {
      try {
        const favoritosArray = JSON.parse(favoritosSalvos)
        const favoritosSet = new Set(favoritosArray)
        
        // Validar se os IDs ainda existem nos parceiros carregados
        const parceirosIds = new Set(parceiros.map(p => p.id))
        const favoritosValidos = favoritosArray.filter((id: string) => parceirosIds.has(id))
        
        setFavoritos(new Set(favoritosValidos))
        
        // Atualizar localStorage com apenas os favoritos válidos
        if (favoritosValidos.length !== favoritosArray.length) {
          localStorage.setItem('parceirosFavoritos', JSON.stringify(favoritosValidos))
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error)
        localStorage.removeItem('parceirosFavoritos')
      }
    }
  }, [parceiros])

  const toggleFavorito = (parceiroId: string) => {
    const novosFavoritos = new Set(favoritos)
    if (novosFavoritos.has(parceiroId)) {
      novosFavoritos.delete(parceiroId)
    } else {
      novosFavoritos.add(parceiroId)
    }
    setFavoritos(novosFavoritos)
    localStorage.setItem('parceirosFavoritos', JSON.stringify(Array.from(novosFavoritos)))
  }

  const formatarNumero = (numero: number) => {
    if (numero >= 1000000) {
      return (numero / 1000000).toFixed(1) + 'M'
    } else if (numero >= 1000) {
      return (numero / 1000).toFixed(1) + 'K'
    }
    return numero.toString()
  }

  const parceirosFiltrados = parceiros.filter(parceiro => {
    // Aqui você pode adicionar filtros específicos se necessário
    return true
  })

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Todos os Parceiros - SementesPLAY</title>
        <meta name="description" content="Lista completa de todos os parceiros SementesPLAY" />
      </Head>
      <Navbar />
      <div className="min-h-screen bg-sss-dark">
        <main className="flex-1 flex flex-col items-center py-12 px-2 md:px-0">
          {/* Header com estatísticas */}
          <section className="w-full max-w-5xl mx-auto flex flex-col items-center bg-[#1a223a]/90 rounded-2xl shadow-lg py-10 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <BuildingOfficeIcon className="w-12 h-12 text-blue-400" />
              <h1 className="text-4xl font-bold text-sss-white">Todos os Parceiros</h1>
            </div>
            <p className="text-gray-400 text-lg mb-6">Lista completa de todos os nossos parceiros</p>
            
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <div className="bg-sss-medium rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-sss-accent">{parceiros.length}</div>
                <div className="text-gray-400 text-sm">Parceiros Ativos</div>
              </div>
              <div className="bg-sss-medium rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatarNumero(parceiros.reduce((total, p) => total + p.totalVendas, 0))}
                </div>
                <div className="text-gray-400 text-sm">Total de Vendas</div>
              </div>
              <div className="bg-sss-medium rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {formatarNumero(parceiros.reduce((total, p) => total + p.codigosGerados, 0))}
                </div>
                <div className="text-gray-400 text-sm">Códigos Gerados</div>
              </div>
            </div>
          </section>

          {/* Filtros de categoria */}
          <section className="w-full max-w-5xl mx-auto mb-10">
            <div className="flex justify-center mb-6">
              <div className="flex bg-sss-medium rounded-xl p-1">
                {categoriasParceiros.map((categoria) => (
                  <button
                    key={categoria.id}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      categoriaRanking === categoria.id
                        ? 'bg-sss-accent text-white'
                        : 'text-gray-400 hover:text-sss-white'
                    }`}
                    onClick={() => setCategoriaRanking(categoria.id)}
                  >
                    <span className="mr-2">{categoria.icone}</span>
                    {categoria.nome}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Top 3 Destaque */}
          {loadingRanking ? (
            <div className="text-center text-gray-400 py-8">Carregando parceiros...</div>
          ) : parceirosFiltrados.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Nenhum parceiro encontrado.</div>
          ) : (
            <>
              {/* Top 3 Destaque */}
              <section className="w-full max-w-5xl mx-auto mb-10">
                <h2 className="text-2xl font-bold text-sss-white mb-6 text-center">🏆 Top 3 Parceiros</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {parceirosFiltrados.slice(0, 3).map((parceiro, index) => (
                    <Link key={parceiro.id} href={`/parceiro/${parceiro.id}`} className="block">
                      <div className={`bg-gradient-to-br rounded-2xl p-6 shadow-lg cursor-pointer hover:scale-105 transition-transform ${
                        index === 0 ? 'from-yellow-900/60 to-sss-dark border border-yellow-400' :
                        index === 1 ? 'from-gray-700/60 to-sss-dark border border-gray-400' :
                        'from-orange-900/60 to-sss-dark border border-orange-400'
                      }`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl">🏢</span>
                        <span className="text-sm bg-sss-accent text-white px-3 py-1 rounded-full font-bold">
                          {index + 1}º Lugar
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-sss-white mb-2">{parceiro.nome}</h3>
                      <div className="text-sm text-gray-400 mb-3">{parceiro.nomeCidade}</div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Vendas:</span>
                          <span className="text-sss-white">{formatarNumero(parceiro.totalVendas)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Códigos:</span>
                          <span className="text-sss-white">{formatarNumero(parceiro.codigosGerados)}</span>
                        </div>
                        
                        {/* Redes Sociais */}
                        {(parceiro.instagram || parceiro.twitch || parceiro.youtube || parceiro.tiktok || parceiro.discord) && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-600">
                            {parceiro.instagram && (
                              <a 
                                href={parceiro.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-pink-400 hover:text-pink-300 transition-colors"
                                title="Instagram"
                              >
                                <FaInstagram className="w-4 h-4" />
                              </a>
                            )}
                            {parceiro.twitch && (
                              <a 
                                href={parceiro.twitch} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 transition-colors"
                                title="Twitch"
                              >
                                <FaTwitch className="w-4 h-4" />
                              </a>
                            )}
                            {parceiro.youtube && (
                              <a 
                                href={parceiro.youtube} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="YouTube"
                              >
                                <FaYoutube className="w-4 h-4" />
                              </a>
                            )}
                            {parceiro.tiktok && (
                              <a 
                                href={parceiro.tiktok} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                                title="TikTok"
                              >
                                <FaTiktok className="w-4 h-4" />
                              </a>
                            )}
                            {parceiro.discord && (
                              <a 
                                href={parceiro.discord} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-400 transition-colors"
                                title="Discord"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                                </svg>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                      </Link>
                  ))}
                </div>
              </section>

              {/* Lista de Todos os Parceiros */}
              <section className="w-full max-w-5xl mx-auto mb-10">
                <h2 className="text-2xl font-bold text-sss-white mb-6 text-center">📋 Todos os Parceiros</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {parceirosFiltrados.map((parceiro, index) => (
                    <div key={parceiro.id} className="bg-sss-medium rounded-xl p-4 shadow-md">
                      <div className="flex">
                        {/* Conteúdo Principal */}
                        <div className="flex items-center flex-1">
                          <div className="w-12 h-12 rounded-full border-2 border-blue-400 mr-3 bg-sss-dark flex items-center justify-center text-xl">
                            🏢
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-sss-white">{index + 1}º {parceiro.nome}</div>
                            <div className="text-sm text-gray-400">{parceiro.nomeCidade}</div>
                            <div className="text-xs text-gray-500">Vendas: {formatarNumero(parceiro.totalVendas)}</div>
                            
                            {/* Redes Sociais */}
                            {(parceiro.instagram || parceiro.twitch || parceiro.youtube || parceiro.tiktok || parceiro.discord) && (
                              <div className="flex gap-1 mt-2">
                                {parceiro.instagram && (
                                  <a 
                                    href={parceiro.instagram} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-pink-400 hover:text-pink-300 transition-colors"
                                    title="Instagram"
                                  >
                                    <FaInstagram className="w-3 h-3" />
                                  </a>
                                )}
                                {parceiro.twitch && (
                                  <a 
                                    href={parceiro.twitch} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 transition-colors"
                                    title="Twitch"
                                  >
                                    <FaTwitch className="w-3 h-3" />
                                  </a>
                                )}
                                {parceiro.youtube && (
                                  <a 
                                    href={parceiro.youtube} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                    title="YouTube"
                                  >
                                    <FaYoutube className="w-3 h-3" />
                                  </a>
                                )}
                                {parceiro.tiktok && (
                                  <a 
                                    href={parceiro.tiktok} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                                    title="TikTok"
                                  >
                                    <FaTiktok className="w-3 h-3" />
                                  </a>
                                )}
                                {parceiro.discord && (
                                  <a 
                                    href={parceiro.discord} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-400 transition-colors"
                                    title="Discord"
                                  >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                                    </svg>
                                  </a>
                                )}
                              </div>
                            )}
                            

                          </div>
                        </div>
                        {/* Botão Favoritar - Borda Direita */}
                        <div className="flex flex-col items-end gap-2">
                          <button 
                            onClick={() => toggleFavorito(parceiro.id)}
                            className="text-lg hover:scale-110 transition-transform"
                          >
                            {favoritos.has(parceiro.id) ? (
                              <FaHeart className="text-red-500" />
                            ) : (
                              <FaRegHeart className="text-gray-400 hover:text-red-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Botões de Navegação */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              className="flex items-center gap-2 border border-gray-500 rounded-xl px-6 py-3 text-white text-lg font-medium hover:border-sss-accent hover:text-sss-accent transition-colors"
              onClick={() => router.push('/parceiros')}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Voltar ao Ranking
            </button>
            <button
              className="flex items-center gap-2 bg-sss-accent hover:bg-red-600 text-white px-6 py-3 rounded-xl text-lg font-medium transition-colors"
              onClick={() => router.push('/parceiros-favoritos')}
            >
              <FaHeart className="w-5 h-5 mr-2" />
              Parceiros Favoritos ({favoritos.size})
            </button>
          </div>

          {/* Botão Seja Parceiro */}
          {user && user.nivel !== 'parceiro' && candidaturaStatus !== 'pendente' && candidaturaStatus !== 'aprovada' && (
            <div className="fixed bottom-6 right-6">
              <button
                onClick={() => router.push('/candidatura-parceiro')}
                className="bg-sss-accent hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-lg transition-colors flex items-center gap-2"
              >
                <FaBuilding className="w-5 h-5" />
                Seja Parceiro
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  )
} 