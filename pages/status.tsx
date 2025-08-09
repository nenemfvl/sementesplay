import React, { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, PlusIcon } from '@heroicons/react/24/outline'
import Navbar from '../components/Navbar'
import Noticias from '../components/Noticias';
import { FaTwitch, FaYoutube, FaTiktok, FaInstagram, FaHeart, FaRegHeart } from 'react-icons/fa'
import { useRouter } from 'next/router'
import { auth } from '../lib/auth'
import { PageLoader, CardLoader } from '../components/Loader'
import { useNavigation } from '../hooks/useNavigation'

const redes = [
  { nome: 'Todos', valor: 'todos', icon: null },
  { nome: 'Twitch', valor: 'twitch', icon: <FaTwitch /> },
  { nome: 'YouTube', valor: 'youtube', icon: <FaYoutube /> },
  { nome: 'TikTok', valor: 'tiktok', icon: <FaTiktok /> },
  { nome: 'Instagram', valor: 'instagram', icon: <FaInstagram /> },
  { nome: 'Discord', valor: 'discord', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/></svg> },
]

const categoriasRanking = [
  { id: 'geral', nome: 'Geral', icone: '🏆', descricao: 'Doações + Pontos' },
  { id: 'doacoes', nome: 'Doações', icone: '💝', descricao: 'Sementes Doadas' },
  { id: 'pontos', nome: 'Pontos', icone: '⭐', descricao: 'Pontuação Total' },
]

function getStatusIcon(status: string) {
  if (status === 'ok') return <CheckCircleIcon className="w-6 h-6 text-green-500" />
  if (status === 'instavel') return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
  return <XCircleIcon className="w-6 h-6 text-red-500" />
}

export default function Status() {
  const [totalSementes, setTotalSementes] = useState<number | null>(null)
  const [displaySementes, setDisplaySementes] = useState(0)
  const [filtroRede, setFiltroRede] = useState('todos')
  const [criadores, setCriadores] = useState<any[]>([])
  const [rankingMissoesConquistas, setRankingMissoesConquistas] = useState<any[]>([])
  const [categoriaRanking, setCategoriaRanking] = useState('geral')
  const [loadingRanking, setLoadingRanking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<any>(null)
  const [ciclosInfo, setCiclosInfo] = useState<any>(null)
  const router = useRouter()
  const { navigateTo, isNavigating } = useNavigation()
  const [progressWidthCiclo, setProgressWidthCiclo] = useState(0)
  const [progressWidthSeason, setProgressWidthSeason] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Carregar dados do usuário usando o sistema de autenticação
        const currentUser = auth.getUser()
        
        if (currentUser) {
          setUser(currentUser)
        } else {
          // Tentar buscar da API como fallback
          const userResponse = await fetch('/api/usuario/atual', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          })
          const userData = await userResponse.json()
          if (userData.usuario) {
            setUser(userData.usuario)
            // Salvar no sistema de autenticação
            auth.setUser(userData.usuario)
          }
        }

        // Carregar estatísticas
        const statsResponse = await fetch('/api/admin/stats')
        const statsData = await statsResponse.json()
        if (typeof statsData.totalSementes === 'number') {
          setTotalSementes(statsData.totalSementes)
        }

        // Carregar informações dos ciclos
        const ciclosResponse = await fetch('/api/ranking/ciclos')
        const ciclosData = await ciclosResponse.json()
        setCiclosInfo(ciclosData)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    fetch('/api/ranking/criadores')
      .then(res => res.json())
      .then(data => setCriadores(data.criadores || []))
  }, [])

  const loadRankingMissoesConquistas = useCallback(async () => {
    setLoadingRanking(true)
    try {
      const response = await fetch(`/api/ranking/missoes-conquistas?tipo=${categoriaRanking}`)
      if (response.ok) {
        const data = await response.json()
        setRankingMissoesConquistas(data.ranking || [])
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error)
    } finally {
      setLoadingRanking(false)
    }
  }, [categoriaRanking])

  useEffect(() => {
    loadRankingMissoesConquistas()
  }, [loadRankingMissoesConquistas])

  useEffect(() => {
    if (ciclosInfo) {
      const cicloWidth = Math.max(0, Math.min(100, ((15 - ciclosInfo.diasRestantesCiclo) / 15) * 100))
      const seasonWidth = Math.max(0, Math.min(100, ((90 - ciclosInfo.diasRestantesSeason) / 90) * 100))
      setProgressWidthCiclo(cicloWidth)
      setProgressWidthSeason(seasonWidth)
    }
  }, [ciclosInfo])

  // Carregar favoritos do localStorage
  useEffect(() => {
    // Só validar favoritos se os criadores já foram carregados
    if (criadores.length === 0) {
      return
    }

    const favoritosSalvos = localStorage.getItem('criadoresFavoritos')
    if (favoritosSalvos) {
      try {
        const favoritosArray = JSON.parse(favoritosSalvos)
        
        // Verificar se os IDs dos favoritos ainda existem nos criadores
        const favoritosValidos = favoritosArray.filter((id: string) => 
          criadores.some(criador => criador.id === id)
        )
        
        setFavoritos(new Set(favoritosValidos))
        
        // Atualizar localStorage com apenas favoritos válidos
        if (favoritosValidos.length !== favoritosArray.length) {
          localStorage.setItem('criadoresFavoritos', JSON.stringify(favoritosValidos))
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error)
        localStorage.removeItem('criadoresFavoritos')
        setFavoritos(new Set())
      }
    }
  }, [criadores])

  // Função para filtrar criadores pela rede social
  const criadoresFiltrados = filtroRede === 'todos'
    ? criadores
    : criadores.filter(c => {
        if (!c.redesSociais) return false
        const redes = typeof c.redesSociais === 'string' ? JSON.parse(c.redesSociais) : c.redesSociais
        return redes[filtroRede] && redes[filtroRede].trim() !== ''
      })

  // Top 1
  const top1 = criadoresFiltrados[0]
  // Restante
  const outros = criadoresFiltrados.slice(1)

  // Remover animação de contagem crescente
  // useEffect do contador removida

  const getProgressWidthClass = (percentage: number) => {
    const width = Math.round(percentage);
    return `w-[${width}%]`;
  };

  const toggleFavorito = (criadorId: string) => {
    setFavoritos(prev => {
      const novosFavoritos = new Set(prev)
      if (novosFavoritos.has(criadorId)) {
        novosFavoritos.delete(criadorId)
      } else {
        novosFavoritos.add(criadorId)
      }
      // Salvar no localStorage
      localStorage.setItem('criadoresFavoritos', JSON.stringify(Array.from(novosFavoritos)))
      return novosFavoritos
    })
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <>
      <Head>
        <title>Status do Sistema - SementesPLAY</title>
      </Head>
      <div className="min-h-screen bg-sss-dark flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-black shadow-lg border-b border-sss-light sticky top-0 z-50 relative">
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-6 focus:outline-none bg-transparent border-none cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Ir para o topo"
          >
            <span className="text-2xl text-sss-accent">🌱</span>
            <span className="text-xl font-bold text-sss-accent">SementesPLAY</span>
          </button>
          <Navbar />
        </header>
        
                {/* Botão Fixo "Seja Criador" - Lateral Direita (apenas para usuários que não são criadores) */}
        {user && !user.criador && (
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
            <button
              onClick={() => router.push('/candidatura-criador')}
              className="bg-gradient-to-r from-sss-accent to-red-600 hover:from-red-600 hover:to-sss-accent text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 hover:scale-105"
            >
              <span className="text-xl">⭐</span>
              <span className="hidden sm:inline">Seja Criador</span>
              <span className="sm:hidden">Criador</span>
            </button>
          </div>
        )}
        
        
        
        <main className="flex-1 flex flex-col items-center py-12 px-2 md:px-0">
          {/* Contador de Sementes - bloco destacado */}
          <section className="w-full max-w-5xl mx-auto flex flex-col items-center bg-[#1a223a]/90 rounded-2xl shadow-lg py-10 mb-10">
            <span className="text-gray-400 text-base mb-2">Sementes em circulação</span>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-7xl md:text-8xl font-extrabold text-[#e94560] transition-all duration-700">
                {totalSementes === null ? '...' : totalSementes.toLocaleString('pt-BR')}
              </span>
              <span className="text-5xl md:text-6xl">🌱</span>
            </div>
            
            {/* Informações dos Ciclos */}
            {ciclosInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {/* Ciclo Atual */}
                <div className="bg-sss-dark/50 rounded-xl p-6 border border-sss-light">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-sss-white">🔄 Ciclo Atual</h3>
                    <span className="text-2xl font-bold text-blue-400">#{ciclosInfo.numeroCiclo}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Dias restantes:</span>
                      <span className={`text-xl font-bold ${ciclosInfo.diasRestantesCiclo <= 3 ? 'text-red-400' : 'text-green-400'}`}>
                        {ciclosInfo.diasRestantesCiclo} dias
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-blue-500 h-2 rounded-full transition-all duration-300 ${getProgressWidthClass(progressWidthCiclo)}`}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Reset automático a cada 15 dias
                    </p>
                  </div>
                </div>

                {/* Season Atual */}
                <div className="bg-sss-dark/50 rounded-xl p-6 border border-sss-light">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-sss-white">🏆 Season Atual</h3>
                    <span className="text-2xl font-bold text-purple-400">S{ciclosInfo.numeroSeason}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Dias restantes:</span>
                      <span className={`text-xl font-bold ${ciclosInfo.diasRestantesSeason <= 7 ? 'text-red-400' : 'text-purple-400'}`}>
                        {ciclosInfo.diasRestantesSeason} dias
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-purple-500 h-2 rounded-full transition-all duration-300 ${getProgressWidthClass(progressWidthSeason)}`}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Reset automático a cada 3 meses
                    </p>
                  </div>
                </div>
              </div>
            )}
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
                    em nossos parceiros e transforme suas compras em apoio aos criadores
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
                    <span>🔄 Receba cashback automático</span>
                    <span>💝 Doe para criadores favoritos</span>
                    <span>🌟 Apoie a comunidade</span>
                  </div>
                </div>
                <p className="text-sss-accent font-semibold">
                  ✨ Cada compra é uma oportunidade de fazer a diferença ✨
                </p>
              </div>
            </div>
          </section>

          {/* Notícias alinhadas à esquerda, como no exemplo */}
          <section className="w-full max-w-5xl mx-auto mb-10">
            <Noticias />
          </section>

          {/* Ranking de Doadores e Criadores */}
          <section className="w-full max-w-5xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-sss-white mb-6 text-center">🏆 Ranking de Doadores e Criadores</h2>
            
            {/* Filtros de categoria */}
            <div className="flex justify-center mb-6">
              <div className="flex bg-sss-medium rounded-xl p-1">
                {categoriasRanking.map((categoria) => (
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
              <div className="text-center text-gray-400 py-8">Carregando ranking...</div>
            ) : rankingMissoesConquistas.length === 0 ? (
              <div className="text-center text-gray-400 py-8">Nenhum ranking disponível.</div>
            ) : (
              <div className="space-y-4">
                {/* Top 3 Destaque */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {rankingMissoesConquistas.slice(0, 3).map((item, index) => (
                    <div key={item.id} className={`bg-gradient-to-br rounded-2xl p-6 shadow-lg ${
                      index === 0 ? 'from-yellow-900/60 to-sss-dark border border-yellow-400' :
                      index === 1 ? 'from-gray-700/60 to-sss-dark border border-gray-400' :
                      'from-orange-900/60 to-sss-dark border border-orange-400'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-2xl ${item.cor}`}>{item.icone}</span>
                        <span className="text-sm bg-sss-accent text-white px-3 py-1 rounded-full font-bold">
                          {index + 1}º Lugar
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-sss-white mb-2">{item.nome}</h3>
                      <div className="text-sm text-gray-400 mb-3">{item.badge}</div>
                      
                      {categoriaRanking === 'geral' && (
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Doações:</span>
                            <span className="text-sss-white">{item.doacoes}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Pontos:</span>
                            <span className="text-sss-white">{item.pontos}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span className="text-gray-400">Total:</span>
                            <span className="text-sss-accent">{item.total}</span>
                          </div>
                        </div>
                      )}
                      
                      {categoriaRanking === 'doacoes' && (
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Doações:</span>
                            <span className="text-sss-accent font-bold">{item.totalDoacoes}</span>
                          </div>
                        </div>
                      )}
                      
                      {categoriaRanking === 'pontos' && (
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Pontos:</span>
                            <span className="text-sss-accent font-bold">{item.totalPontos}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Lista dos demais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rankingMissoesConquistas.slice(3).map((item) => (
                    <div key={item.id} className="bg-sss-medium rounded-xl p-4 shadow-md">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-xl ${item.cor}`}>{item.icone}</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-sss-white">{item.posicao}º {item.nome}</h4>
                          <p className="text-sm text-gray-400">{item.badge}</p>
                        </div>
                      </div>
                      
                      {categoriaRanking === 'geral' && (
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Doações:</span>
                            <span className="text-sss-white">{item.doacoes}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Pontos:</span>
                            <span className="text-sss-white">{item.pontos}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span className="text-gray-400">Total:</span>
                            <span className="text-sss-accent">{item.total}</span>
                          </div>
                        </div>
                      )}
                      
                      {categoriaRanking === 'doacoes' && (
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Doações:</span>
                            <span className="text-sss-accent font-bold">{item.totalDoacoes}</span>
                          </div>
                        </div>
                      )}
                      
                      {categoriaRanking === 'pontos' && (
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Pontos:</span>
                            <span className="text-sss-accent font-bold">{item.totalPontos}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Barra de filtro de redes sociais */}
          <div className="w-full max-w-5xl mx-auto mt-8 mb-6">
            <div className="flex border-b border-blue-900">
              {redes.map((rede) => (
                <button
                  key={rede.valor}
                  className={`px-4 py-2 font-semibold transition-colors ${
                    filtroRede === rede.valor
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400'
                  }`}
                  onClick={() => setFiltroRede(rede.valor)}
                >
                  {rede.icon && <span className="inline-block mr-2 align-middle">{rede.icon}</span>}
                  {rede.nome}
                </button>
              ))}
            </div>
          </div>
          {/* Aqui virá o ranking real de criadores filtrado */}
          {criadoresFiltrados.length === 0 ? (
            <div className="w-full max-w-5xl mx-auto text-center text-gray-400 py-8">Nenhum criador encontrado para este filtro.</div>
          ) : (
            <div className="w-full max-w-5xl mx-auto">
                             {/* Destaque Top 1 */}
               {top1 && (
                                   <div className="flex bg-gradient-to-br from-blue-900/60 to-sss-dark rounded-2xl p-6 mb-8 shadow-lg">
                    {/* Conteúdo Principal */}
                    <div className="flex items-center flex-1">
                      <img src={top1.avatar || '/default-avatar.png'} alt={top1.nome} className="w-24 h-24 rounded-full border-4 border-blue-400 shadow-md mr-6" />
                      <div className="flex-1 flex flex-col items-start">
                        <span className="text-xs bg-blue-400 text-white px-3 py-1 rounded-full mb-2 font-bold">1º Lugar</span>
                        <h2 className="text-2xl font-bold text-sss-white mb-2">{top1.nome}</h2>
                        <button 
                          onClick={() => navigateTo('/doar')}
                          disabled={isNavigating}
                          className="bg-sss-accent hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isNavigating ? 'Carregando...' : 'Doar'}
                        </button>
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
                                             {/* Redes Sociais - Borda Direita */}
                       {top1.redesSociais && (top1.redesSociais.twitch || top1.redesSociais.youtube || top1.redesSociais.tiktok || top1.redesSociais.instagram || top1.redesSociais.discord) && (
                         <div className="flex flex-row gap-3 mt-8">
                         {top1.redesSociais.twitch && <a href={top1.redesSociais.twitch} target="_blank" rel="noopener noreferrer" className="text-[#9147ff] text-2xl hover:scale-110 transition-transform" title="Twitch"><FaTwitch /></a>}
                         {top1.redesSociais.youtube && <a href={top1.redesSociais.youtube} target="_blank" rel="noopener noreferrer" className="text-[#ff0000] text-2xl hover:scale-110 transition-transform" title="YouTube"><FaYoutube /></a>}
                         {top1.redesSociais.tiktok && <a href={top1.redesSociais.tiktok} target="_blank" rel="noopener noreferrer" className="text-[#000] text-2xl hover:scale-110 transition-transform" title="TikTok"><FaTiktok /></a>}
                         {top1.redesSociais.instagram && <a href={top1.redesSociais.instagram} target="_blank" rel="noopener noreferrer" className="text-[#e1306c] text-2xl hover:scale-110 transition-transform" title="Instagram"><FaInstagram /></a>}
                         {top1.redesSociais.discord && <a href={top1.redesSociais.discord} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-2xl hover:scale-110 transition-transform" title="Discord"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/></svg></a>}
                       </div>
                      )}
                    </div>
                 </div>
               )}
                             {/* Lista dos demais criadores */}
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {outros.map((c, i) => (
                                       <div key={c.id} className="bg-sss-medium rounded-xl p-4 shadow-md">
                      <div className="flex">
                        {/* Conteúdo Principal */}
                        <div className="flex items-center flex-1">
                          <img src={c.avatar || '/default-avatar.png'} alt={c.nome} className="w-12 h-12 rounded-full border-2 border-blue-400 mr-3" />
                          <div className="flex-1">
                            <div className="font-bold text-sss-white">{i + 2}º {c.nome}</div>
                            <div className="text-sm text-gray-400">{c.sementes || 0} sementes</div>
                          </div>
                        </div>
                        {/* Botão Favoritar e Redes Sociais - Borda Direita */}
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => toggleFavorito(c.id)}
                            className="text-lg hover:scale-110 transition-transform"
                          >
                            {favoritos.has(c.id) ? (
                              <FaHeart className="text-red-500" />
                            ) : (
                              <FaRegHeart className="text-gray-400 hover:text-red-500" />
                            )}
                          </button>
                                                     {/* Redes Sociais */}
                           {c.redesSociais && (c.redesSociais.twitch || c.redesSociais.youtube || c.redesSociais.tiktok || c.redesSociais.instagram || c.redesSociais.discord) && (
                             <div className="flex flex-row gap-2 mt-4">
                             {c.redesSociais.twitch && <a href={c.redesSociais.twitch} target="_blank" rel="noopener noreferrer" className="text-[#9147ff] text-lg hover:scale-110 transition-transform" title="Twitch"><FaTwitch /></a>}
                             {c.redesSociais.youtube && <a href={c.redesSociais.youtube} target="_blank" rel="noopener noreferrer" className="text-[#ff0000] text-lg hover:scale-110 transition-transform" title="YouTube"><FaYoutube /></a>}
                             {c.redesSociais.tiktok && <a href={c.redesSociais.tiktok} target="_blank" rel="noopener noreferrer" className="text-[#000] text-lg hover:scale-110 transition-transform" title="TikTok"><FaTiktok /></a>}
                             {c.redesSociais.instagram && <a href={c.redesSociais.instagram} target="_blank" rel="noopener noreferrer" className="text-[#e1306c] text-lg hover:scale-110 transition-transform" title="Instagram"><FaInstagram /></a>}
                             {c.redesSociais.discord && <a href={c.redesSociais.discord} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-lg hover:scale-110 transition-transform" title="Discord"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/></svg></a>}
                           </div>
                          )}
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
               onClick={() => router.push('/criadores')}
             >
               <PlusIcon className="w-5 h-5 mr-2" />
               Ver Classificação
             </button>
             <button
               className="flex items-center gap-2 bg-sss-accent hover:bg-red-600 text-white px-6 py-3 rounded-xl text-lg font-medium transition-colors"
               onClick={() => router.push('/criadores-favoritos')}
             >
               <FaHeart className="w-5 h-5 mr-2" />
               Criadores Favoritos ({favoritos.size})
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
                {/* SVG Discord */}
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.07.07 0 0 0-.073.035c-.211.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.164-.393-.405-.874-.617-1.249a.07.07 0 0 0-.073-.035A19.736 19.736 0 0 0 3.677 4.369a.064.064 0 0 0-.03.027C.533 9.09-.32 13.579.099 18.021a.08.08 0 0 0 .031.056c2.052 1.507 4.042 2.422 5.992 3.029a.077.077 0 0 0 .084-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.104c-.652-.247-1.27-.549-1.872-.892a.077.077 0 0 1-.008-.127c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.198.372.292a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.891.076.076 0 0 0-.04.105c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028c1.961-.607 3.951-1.522 6.003-3.029a.077.077 0 0 0 .031-.055c.5-5.177-.838-9.637-3.548-13.625a.061.061 0 0 0-.03-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z"/></svg>
              </a>
              <a href="https://www.instagram.com/sementesplay/" title="Instagram" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                {/* SVG Instagram */}
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
                {/* SVG TikTok */}
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12.75 2v14.25a2.25 2.25 0 1 1-2.25-2.25h.75V12h-.75a4.5 4.5 0 1 0 4.5 4.5V7.5a5.25 5.25 0 0 0 5.25 5.25V9.75A3.75 3.75 0 0 1 16.5 6V2h-3.75z"/></svg>
              </a>
              <a href="https://www.youtube.com/@SementesPLAY" title="YouTube" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                {/* SVG YouTube */}
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.692 3.5 12 3.5 12 3.5s-7.692 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.88 0 12 0 12s0 4.12.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.308 20.5 12 20.5 12 20.5s7.692 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 16.12 24 12 24 12s0-4.12-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
              </a>
              <a href="https://x.com/SementesPLAY" title="Twitter" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                {/* SVG Twitter */}
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