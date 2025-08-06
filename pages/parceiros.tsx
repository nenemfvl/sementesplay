import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, PlusIcon, BuildingOfficeIcon, CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import Navbar from '../components/Navbar'
import ConteudosParceiros from '../components/ConteudosParceiros';
import { FaTwitch, FaYoutube, FaTiktok, FaInstagram, FaHeart, FaRegHeart, FaBuilding } from 'react-icons/fa'
import { useRouter } from 'next/router'
import { auth, User } from '../lib/auth'
import { PageLoader, CardLoader } from '../components/Loader'
import { useNavigation } from '../hooks/useNavigation'

const categoriasParceiros = [
  { id: 'geral', nome: 'Geral', icone: '🏢', descricao: 'Todos os Parceiros' },
  { id: 'vendas', nome: 'Vendas', icone: '💰', descricao: 'Por Total de Vendas' },
  { id: 'codigos', nome: 'Códigos', icone: '🎫', descricao: 'Por Códigos Gerados' },
]

export default function Parceiros() {
  const [parceiros, setParceiros] = useState<any[]>([])
  const [categoriaRanking, setCategoriaRanking] = useState('geral')
  const [loadingRanking, setLoadingRanking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<any>(null)
  const [candidaturaStatus, setCandidaturaStatus] = useState<string | null>(null)
  const router = useRouter()
  const { navigateTo, isNavigating } = useNavigation()

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
    setLoading(true)
    try {
      const response = await fetch('/api/parceiros/ranking')
      const data = await response.json()
      if (response.ok && data.success) {
        setParceiros(data.parceiros || [])
      }
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error)
    } finally {
      setLoading(false)
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

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const parceirosFiltrados = parceiros.filter(parceiro => {
    // Aqui você pode adicionar filtros específicos se necessário
    return true
  })

  const top1 = parceirosFiltrados[0]
  const outros = parceirosFiltrados.slice(1)

  if (!user) {
    return null
  }

  if (loading) {
    return <PageLoader />
  }

    return (
      <>
        <Head>
          <title>Parceiros - SementesPLAY</title>
        <meta name="description" content="Descubra nossos parceiros e suas ofertas" />
        </Head>
          <Navbar />
      <div className="min-h-screen bg-sss-dark">
        <main className="flex-1 flex flex-col items-center py-12 px-2 md:px-0">
          {/* Header com estatísticas */}
          <section className="w-full max-w-5xl mx-auto flex flex-col items-center bg-[#1a223a]/90 rounded-2xl shadow-lg py-10 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <BuildingOfficeIcon className="w-12 h-12 text-blue-400" />
              <h1 className="text-4xl font-bold text-sss-white">Parceiros</h1>
            </div>
            <p className="text-gray-400 text-lg mb-6">Descubra nossos parceiros e aproveite as melhores ofertas</p>
            
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <div className="bg-sss-medium rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-sss-accent">{parceiros.length}</div>
                <div className="text-gray-400 text-sm">Parceiros Ativos</div>
                </div>
              <div className="bg-sss-medium rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatarNumero(parceiros.reduce((total, p) => total + (p.totalVendas || 0), 0))}
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

          {/* Botão Seja Parceiro - Lateral Direita Flutuante */}
          {user && user.nivel !== 'parceiro' && candidaturaStatus !== 'pendente' && candidaturaStatus !== 'aprovada' && (
            <div className="fixed top-1/2 right-6 transform -translate-y-1/2 z-50">
              <button
                onClick={() => navigateTo('/candidatura-parceiro')}
                disabled={isNavigating}
                className="bg-sss-accent hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaBuilding className="w-5 h-5" />
                {isNavigating ? 'Carregando...' : 'Seja Parceiro'}
              </button>
            </div>
          )}

          {/* Conteúdos dos Parceiros */}
          <section className="w-full max-w-6xl mx-auto mb-20">
            <ConteudosParceiros />
          </section>

          {/* Ranking de Parceiros */}
          <section className="w-full max-w-6xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-sss-white mb-6 text-center">🏆 Ranking de Parceiros</h2>
            
            {/* Filtros de categoria */}
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

            {loadingRanking ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <CardLoader key={i} />
                ))}
              </div>
            ) : parceirosFiltrados.length === 0 ? (
              <div className="text-center text-gray-400 py-8">Nenhum parceiro encontrado.</div>
            ) : (
                        <div className="space-y-4">
                {/* Top 3 Destaque */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {parceirosFiltrados.slice(0, 3).map((parceiro, index) => (
                    <div key={parceiro.id} className={`bg-gradient-to-br rounded-2xl p-6 shadow-lg ${
                      index === 0 ? 'from-blue-900/60 to-sss-dark border border-blue-400' :
                      index === 1 ? 'from-gray-700/60 to-sss-dark border border-gray-400' :
                      'from-orange-900/60 to-sss-dark border border-orange-400'
                    }`}>
                        <div className="flex items-center justify-between mb-4">
                        {/* Foto do perfil do parceiro */}
                        {parceiro.avatar ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                            <img 
                              src={parceiro.avatar} 
                              alt={`Foto de ${parceiro.nome}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full bg-sss-accent/20 flex items-center justify-center text-2xl" style={{ display: 'none' }}>
                              🏢
                            </div>
                          </div>
                        ) : (
                          <span className="text-2xl">🏢</span>
                        )}
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
                        {(parceiro.instagram || parceiro.twitch || parceiro.youtube || parceiro.tiktok) && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-600 justify-center">
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
                          </div>
                        )}
                        </div>
                      </div>
                    ))}
                  </div>

                {/* Lista dos demais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {parceirosFiltrados.slice(3).map((parceiro) => (
                    <div key={parceiro.id} className="bg-sss-medium rounded-xl p-4 shadow-md">
                      <div className="flex items-center gap-3 mb-3">
                        {/* Foto do perfil do parceiro */}
                        {parceiro.avatar ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
                            <img 
                              src={parceiro.avatar} 
                              alt={`Foto de ${parceiro.nome}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full bg-sss-accent/20 flex items-center justify-center text-lg" style={{ display: 'none' }}>
                              🏢
                            </div>
                          </div>
                        ) : (
                          <span className="text-xl">🏢</span>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-sss-white">{parceiro.posicao}º {parceiro.nome}</h4>
                          <p className="text-sm text-gray-400">{parceiro.nomeCidade}</p>
                    </div>
                </div>
                      
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Vendas:</span>
                          <span className="text-sss-white">{formatarNumero(parceiro.totalVendas)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Códigos:</span>
                          <span className="text-sss-white">{formatarNumero(parceiro.codigosGerados)}</span>
                        </div>
                        
                        {/* Redes Sociais */}
                        {(parceiro.instagram || parceiro.twitch || parceiro.youtube || parceiro.tiktok) && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-600 justify-center">
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
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}
          </section>

          {/* Lista de Parceiros */}
          {parceirosFiltrados.length === 0 ? (
            <div className="w-full max-w-5xl mx-auto text-center text-gray-400 py-8">Nenhum parceiro encontrado.</div>
          ) : (
            <div className="w-full max-w-5xl mx-auto">
              {/* Destaque Top 1 */}
              {top1 && (
                <div className="flex bg-gradient-to-br from-blue-900/60 to-sss-dark rounded-2xl p-6 mb-8 shadow-lg">
                  {/* Conteúdo Principal */}
                  <div className="flex items-center flex-1">
                    {/* Foto do perfil do parceiro */}
                    {top1.avatar ? (
                      <div className="w-24 h-24 rounded-full border-4 border-blue-400 shadow-md mr-6 overflow-hidden">
                        <img 
                          src={top1.avatar} 
                          alt={`Foto de ${top1.nome}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-sss-medium flex items-center justify-center text-4xl" style={{ display: 'none' }}>
                          🏢
                        </div>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full border-4 border-blue-400 shadow-md mr-6 bg-sss-medium flex items-center justify-center text-4xl">
                        🏢
                      </div>
                    )}
                    <div className="flex-1 flex flex-col items-start h-full justify-between">
                      <div>
                        <span className="text-xs bg-blue-400 text-white px-3 py-1 rounded-full mb-2 font-bold">1º Lugar</span>
                        <h2 className="text-2xl font-bold text-sss-white mb-2">{top1.nome}</h2>
                        <p className="text-gray-400 mb-2">{top1.nomeCidade}</p>
                        <div className="flex gap-4 text-sm text-gray-300">
                          <span>Vendas: {formatarNumero(top1.totalVendas)}</span>
                          <span>Códigos: {formatarNumero(top1.codigosGerados)}</span>
                        </div>
                      </div>
                      
                      <div className="w-full">
                        {/* Redes Sociais */}
                        {(top1.instagram || top1.twitch || top1.youtube || top1.tiktok) && (
                          <div className="flex gap-4 w-full justify-center mb-4">
                            {top1.instagram && (
                              <a 
                                href={top1.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-pink-400 hover:text-pink-300 transition-colors"
                                title="Instagram"
                              >
                                <FaInstagram className="w-7 h-7" />
                              </a>
                            )}
                            {top1.twitch && (
                              <a 
                                href={top1.twitch} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 transition-colors"
                                title="Twitch"
                              >
                                <FaTwitch className="w-7 h-7" />
                              </a>
                            )}
                            {top1.youtube && (
                              <a 
                                href={top1.youtube} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="YouTube"
                              >
                                <FaYoutube className="w-7 h-7" />
                              </a>
                            )}
                            {top1.tiktok && (
                              <a 
                                href={top1.tiktok} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                                title="TikTok"
                              >
                                <FaTiktok className="w-7 h-7" />
                              </a>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => router.push(`/parceiro/${top1.id}`)}
                          className="bg-sss-accent hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors w-full"
                        >
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
          </div>
                  {/* Botão Favoritar - Canto Superior Direito */}
                  <div className="flex flex-col items-end gap-4">
                <button
                      onClick={() => toggleFavorito(top1.id)}
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      {favoritos.has(top1.id) ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart className="text-gray-400 hover:text-red-500" />
                      )}
                </button>
              </div>
          </div>
        )}

              {/* Lista dos demais parceiros */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {outros.map((parceiro, i) => (
                  <div key={parceiro.id} className="bg-sss-medium rounded-xl p-4 shadow-md">
                    <div className="flex">
                      {/* Conteúdo Principal */}
                      <div className="flex items-center flex-1">
                        <div className="w-12 h-12 rounded-full border-2 border-blue-400 mr-3 bg-sss-dark flex items-center justify-center text-xl">
                          🏢
            </div>
                        <div className="flex-1">
                          <div className="font-bold text-sss-white">{i + 2}º {parceiro.nome}</div>
                          <div className="text-sm text-gray-400">{parceiro.nomeCidade}</div>
                          <div className="text-xs text-gray-500">Vendas: {formatarNumero(parceiro.totalVendas)}</div>
                          
                          {/* Redes Sociais */}
                          {(parceiro.instagram || parceiro.twitch || parceiro.youtube || parceiro.tiktok) && (
                            <div className="flex gap-1 mt-2 justify-center">
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
              </div>
          )}

          {/* Botões de Navegação */}
          <div className="flex justify-center gap-4 mt-8">
                      <button
              className="flex items-center gap-2 border border-gray-500 rounded-xl px-6 py-3 text-white text-lg font-medium hover:border-sss-accent hover:text-sss-accent transition-colors"
              onClick={() => router.push('/todos-parceiros')}
                      >
              <PlusIcon className="w-5 h-5 mr-2" />
              Ver Parceiros
                      </button>
                      <button
              className="flex items-center gap-2 bg-sss-accent hover:bg-red-600 text-white px-6 py-3 rounded-xl text-lg font-medium transition-colors"
              onClick={() => router.push('/parceiros-favoritos')}
                      >
              <FaHeart className="w-5 h-5 mr-2" />
              Parceiros Favoritos ({favoritos.size})
                      </button>
                    </div>


        </main>
      </div>
    </>
  )
} 