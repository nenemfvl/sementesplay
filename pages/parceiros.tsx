import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, PlusIcon, BuildingOfficeIcon, CurrencyDollarIcon, ChartBarIcon, EyeIcon } from '@heroicons/react/24/outline'

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
      verificarCandidatura(currentUser)
    }
    // Remover chamada da API como fallback para evitar erro 401

    loadParceiros()
  }, [])

  useEffect(() => {
    loadRankingParceiros()
  }, [categoriaRanking])

  const verificarCandidatura = async (usuario: any) => {
    try {
      // Usar o email do usuário já carregado
      const email = usuario.email
      
      if (!email) {
        setCandidaturaStatus('nenhuma')
        return
      }
        
      // Verificar a candidatura usando o email
      const response = await fetch(`/api/parceiros/candidaturas?email=${email}`)
      if (response.ok) {
        const data = await response.json()
        if (data.candidatura) {
          setCandidaturaStatus(data.candidatura.status)
        } else {
          setCandidaturaStatus('nenhuma')
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

          {/* Seção do Cupom Especial */}
          <section className="w-full max-w-5xl mx-auto mb-10">
            <div className="bg-gradient-to-r from-sss-accent/20 via-purple-600/20 to-sss-accent/20 border border-sss-accent/30 rounded-2xl p-8 shadow-lg">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <span className="text-3xl">🎁</span>
                  <h2 className="text-2xl font-bold text-sss-white">Cupom Especial</h2>
                  <span className="text-3xl">💎</span>
                </div>
                <div className="bg-sss-dark/50 rounded-xl p-6 mb-4 border border-sss-accent/20">
                  <p className="text-sss-white text-lg mb-2">
                    Use o cupom <span className="font-bold text-sss-accent text-2xl">sementesplay10</span>
                  </p>
                  <p className="text-gray-300 mb-3">
                    em qualquer um de nossos parceiros e receba cashback
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                    <span>🔄 Transforme compras em apoio</span>
                    <span>•</span>
                    <span>💝 Doe para seus criadores favoritos</span>
                  </div>
                </div>
                <p className="text-sss-accent font-semibold">
                  ✨ Cada compra é uma oportunidade de apoiar a comunidade ✨
                </p>
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
                        {parceiro.avatar && parceiro.avatar !== '🏢' && (parceiro.avatar.startsWith('http') || parceiro.avatar.startsWith('/')) ? (
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
                          <div className="w-12 h-12 rounded-full bg-sss-accent/20 flex items-center justify-center text-2xl border-2 border-white/20">
                            🏢
                          </div>
                        )}
                        <span className="text-sm bg-sss-accent text-white px-3 py-1 rounded-full font-bold">
                          {index + 1}º Lugar
                        </span>
                          </div>
                      <h3 className="text-xl font-bold text-sss-white mb-2">{parceiro.nome}</h3>
                      <div className="text-sm text-gray-400 mb-3">{parceiro.nomeCidade}</div>
                      
                      {/* URL do Connect */}
                      {parceiro.urlConnect && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between bg-sss-dark/50 rounded-lg p-2">
                            <span className="text-xs text-gray-400">Connect:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-blue-400 truncate max-w-32">
                                {parceiro.urlConnect}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(parceiro.urlConnect);
                                  // Mostrar toast ou feedback
                                  const button = e.currentTarget;
                                  const originalText = button.textContent;
                                  button.textContent = 'Copiado!';
                                  button.className = 'text-xs text-green-400 hover:text-green-300 transition-colors';
                                  setTimeout(() => {
                                    button.textContent = originalText;
                                    button.className = 'text-xs text-sss-accent hover:text-red-400 transition-colors';
                                  }, 2000);
                                }}
                                className="text-xs text-sss-accent hover:text-red-400 transition-colors"
                                title="Copiar URL do Connect"
                              >
                                Copiar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
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
                                className="text-red-600 hover:text-red-500 transition-colors"
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
                                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                                </svg>
                              </a>
                            )}
                          </div>
                        )}
                        
                        {/* Botão Ver Detalhes */}
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <Link
                            href={`/parceiro/${parceiro.id}`}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <EyeIcon className="w-4 h-4" />
                            Ver Detalhes
                          </Link>
                        </div>
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
                        {parceiro.avatar && parceiro.avatar !== '🏢' && (parceiro.avatar.startsWith('http') || parceiro.avatar.startsWith('/')) ? (
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
                          <div className="w-10 h-10 rounded-full bg-sss-accent/20 flex items-center justify-center text-xl border-2 border-white/20 flex-shrink-0">
                            🏢
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-sss-white">{parceiro.posicao}º {parceiro.nome}</h4>
                          <p className="text-sm text-gray-400">{parceiro.nomeCidade}</p>
                        </div>
                      </div>
                      
                      {/* URL do Connect */}
                      {parceiro.urlConnect && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between bg-sss-dark/50 rounded-lg p-1.5">
                            <span className="text-xs text-gray-400">Connect:</span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-blue-400 truncate max-w-24">
                                {parceiro.urlConnect}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(parceiro.urlConnect);
                                  const button = e.currentTarget;
                                  const originalText = button.textContent;
                                  button.textContent = 'Copiado!';
                                  button.className = 'text-xs text-green-400 hover:text-green-300 transition-colors';
                                  setTimeout(() => {
                                    button.textContent = originalText;
                                    button.className = 'text-xs text-sss-accent hover:text-red-400 transition-colors';
                                  }, 2000);
                                }}
                                className="text-xs text-sss-accent hover:text-red-400 transition-colors"
                                title="Copiar URL do Connect"
                              >
                                Copiar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
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
                        {(parceiro.instagram || parceiro.twitch || parceiro.youtube || parceiro.tiktok || parceiro.discord) && (
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
                                className="text-red-600 hover:text-red-500 transition-colors"
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
                                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                                </svg>
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
                <Link href={`/parceiro/${top1.id}`} className="block">
                  <div className="flex bg-gradient-to-br from-blue-900/60 to-sss-dark rounded-2xl p-6 mb-8 shadow-lg cursor-pointer hover:scale-105 transition-transform">
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
                        {(top1.instagram || top1.twitch || top1.youtube || top1.tiktok || top1.discord) && (
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
                                className="text-red-600 hover:text-red-500 transition-colors"
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
                            {top1.discord && (
                              <a 
                                href={top1.discord} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-400 transition-colors"
                                title="Discord"
                              >
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                                </svg>
                              </a>
                            )}
                          </div>
                        )}
                        

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
                  </Link>
        )}

              {/* Lista dos demais parceiros */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {outros.map((parceiro, i) => (
                  <Link key={parceiro.id} href={`/parceiro/${parceiro.id}`} className="block">
                    <div className="bg-sss-medium rounded-xl p-4 shadow-md cursor-pointer hover:scale-105 transition-transform">
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
                          {(parceiro.instagram || parceiro.twitch || parceiro.youtube || parceiro.tiktok || parceiro.discord) && (
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
                                  className="text-red-600 hover:text-red-500 transition-colors"
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
                                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
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
                  </Link>
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

        {/* Footer minimalista centralizado */}
        <footer className="bg-black border-t border-sss-light mt-16">
          <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col items-center">
            {/* Logo e nome */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold text-sss-white">SementesPLAY</span>
            </div>
            {/* Redes sociais */}
            <div className="flex gap-4 mb-4">
              <a href="https://discord.gg/7vtVZYvR" title="Discord" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.07.07 0 0 0-.073.035c-.211.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.164-.393-.405-.874-.617-1.249a.07.07 0 0 0-.073-.035A19.736 19.736 0 0 0 3.677 4.369a.064.064 0 0 0-.03.027C.533 9.09-.32 13.579.099 18.021a.08.08 0 0 0 .031.056c2.052 1.507 4.042 2.422 5.992 3.029a.077.077 0 0 0 .084-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.104c-.652-.247-1.27-.549-1.872-.892a.077.077 0 0 1-.008-.127c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.198.372.292a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.891.076.076 0 0 0-.04.105c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028c1.961-.607 3.951-1.522 6.003-3.029a.077.077 0 0 0 .031-.055c.5-5.177-.838-9.637-3.548-13.625a.061.061 0 0 0-.03-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z"/></svg>
              </a>
              <a href="https://www.instagram.com/sementesplay/" title="Instagram" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.98.98-1.274 2.092-1.334 3.374C2.013 5.741 2 6.151 2 12c0 5.849.013 6.259.072 7.54.06 1.282.354 2.394 1.334 3.374.98.98 2.092 1.274 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.06 2.394-.354 3.374-1.334.98-.98 1.274-2.092 1.334-3.374.059-1.281.072-1.691.072-7.54 0-5.849-.013-6.259-.072-7.54-.06-1.282-.354-2.394-1.334-3.374-.98-.98-2.092-1.274-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
              </a>
              <a 
                href="https://www.tiktok.com/@sementesplay" 
                title="TikTok" 
                className="text-gray-400 hover:text-sss-accent" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open('https://www.tiktok.com/@sementesplay', '_blank', 'noopener,noreferrer');
                }}
              >
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12.75 2v14.25a2.25 2.25 0 1 1-2.25-2.25h.75V12h-.75a4.5 4.5 0 1 0 4.5 4.5V7.5a5.25 5.25 0 0 0 5.25 5.25V9.75A3.75 3.75 0 0 1 16.5 6V2h-3.75z"/></svg>
              </a>
              <a href="https://www.youtube.com/@SementesPLAY" title="YouTube" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.692 3.5 12 3.5 12 3.5s-7.692 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.88 0 12 0 12s0 4.12.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.308 20.5 12 20.5 12 20.5s7.692 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 16.12 24 12 24 12s0-4.12-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
              </a>
              <a href="https://x.com/SementesPLAY" title="Twitter" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.116 2.813 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
              </a>
            </div>
            {/* Links horizontais */}
            <div className="flex flex-wrap justify-center gap-4 mb-4 text-gray-400 text-sm">
              <Link href="/termos" className="hover:text-sss-accent">Termos de Uso</Link>
              <span>|</span>
              <Link href="/privacidade" className="hover:text-sss-accent">Política de Privacidade</Link>
              <span>|</span>
              <Link href="/ajuda" className="hover:text-sss-accent">Ajuda</Link>
            </div>
            {/* Copyright */}
            <div className="text-gray-500 text-xs text-center">
              &copy; {new Date().getFullYear()} SementesPLAY. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 