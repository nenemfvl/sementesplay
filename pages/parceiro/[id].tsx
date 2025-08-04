import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon, 
  TrophyIcon,
  StarIcon,
  FireIcon,
  CalendarIcon,
  ChartBarIcon,
  UserIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  ShareIcon,
  CreditCardIcon,
  DocumentTextIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'
import { auth, User } from '../../lib/auth'
import Navbar from '../../components/Navbar'

interface ParceiroDetalhes {
  id: string
  nome: string
  nomeCidade: string
  totalVendas: number
  usuarioId: string
  usuario: {
    id: string
    nome: string
    email: string
    tipo: string
    nivel: string
  }
}

interface ConteudoParceiro {
  id: string
  titulo: string
  tipo: string
  categoria: string
  descricao?: string
  url: string
  cidade: string
  endereco?: string
  dataEvento?: string
  preco?: string
  vagas?: number
  visualizacoes: number
  curtidas: number
  dislikes: number
  compartilhamentos: number
  comentarios: number
  dataPublicacao: string
  fixado: boolean
}

interface Transacao {
  id: string
  valor: number
  codigoParceiro: string
  status: string
  data: string
  usuario?: {
    nome: string
    email: string
  }
}

interface CodigoCashback {
  id: string
  codigo: string
  valor: number
  usado: boolean
  dataGeracao: string
  dataUso?: string
}

export default function ParceiroPerfil() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState<User | null>(null)
  const [parceiro, setParceiro] = useState<ParceiroDetalhes | null>(null)
  const [conteudos, setConteudos] = useState<ConteudoParceiro[]>([])
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [codigos, setCodigos] = useState<CodigoCashback[]>([])
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState<'conteudos' | 'transacoes' | 'codigos'>('conteudos')
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [likes, setLikes] = useState<Set<string>>(new Set())
  const [dislikes, setDislikes] = useState<Set<string>>(new Set())

  useEffect(() => {
    const currentUser = auth.getUser()
    if (currentUser) {
      setUser(currentUser)
    }

    // Carregar favoritos do localStorage
    const favoritosSalvos = localStorage.getItem('parceirosFavoritos')
    if (favoritosSalvos) {
      setFavoritos(new Set(JSON.parse(favoritosSalvos)))
    }
  }, [])

  useEffect(() => {
    if (id && typeof id === 'string') {
      carregarDetalhesParceiro(id)
    }
  }, [id])

  const carregarDetalhesParceiro = async (parceiroId: string) => {
    setLoading(true)
    try {
      // Carregar dados do parceiro
      const response = await fetch(`/api/parceiros/perfil?parceiroId=${parceiroId}`)
      if (response.ok) {
        const data = await response.json()
        setParceiro(data)
        
        // Só carregar outros dados se o parceiro existir
        // Carregar conteúdos do parceiro
        const conteudosResponse = await fetch(`/api/parceiros/conteudos?parceiroId=${parceiroId}`)
        if (conteudosResponse.ok) {
          const conteudosData = await conteudosResponse.json()
          setConteudos(Array.isArray(conteudosData.conteudos) ? conteudosData.conteudos : [])
        }

        // Carregar transações do parceiro
        const transacoesResponse = await fetch(`/api/parceiros/transacoes?parceiroId=${parceiroId}`)
        if (transacoesResponse.ok) {
          const transacoesData = await transacoesResponse.json()
          setTransacoes(Array.isArray(transacoesData) ? transacoesData : [])
        }

        // Carregar códigos do parceiro
        const codigosResponse = await fetch(`/api/parceiros/codigos?parceiroId=${parceiroId}`)
        if (codigosResponse.ok) {
          const codigosData = await codigosResponse.json()
          setCodigos(Array.isArray(codigosData) ? codigosData : [])
        }
      } else if (response.status === 404) {
        // Parceiro não encontrado - não carregar outros dados
        setParceiro(null)
      }

    } catch (error) {
      console.error('Erro ao carregar dados do parceiro:', error)
      setParceiro(null)
    } finally {
      setLoading(false)
    }
  }

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

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  // Função para registrar visualização
  const registrarVisualizacao = async (conteudoId: string) => {
    try {
      const response = await fetch(`/api/conteudos/${conteudoId}/visualizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Atualizar contador local apenas se a visualização foi registrada
        if (data.success) {
          setConteudos(prev => prev.map(conteudo => 
            conteudo.id === conteudoId 
              ? { ...conteudo, visualizacoes: data.visualizacoes }
              : conteudo
          ));
        }
      }
    } catch (error) {
      console.error('Erro ao registrar visualização:', error);
    }
  };

    // Função para curtir conteúdo
  const curtirConteudo = async (conteudoId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que o clique propague para o card
    
    if (!user?.id) {
      alert('Você precisa estar logado para curtir conteúdos');
      return;
    }
    
    try {
      const response = await fetch(`/api/conteudos/${conteudoId}/curtir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Atualizar estado local
        setConteudos(prev => prev.map(conteudo => 
          conteudo.id === conteudoId 
            ? { ...conteudo, curtidas: data.curtidas }
            : conteudo
        ));
        
        // Atualizar likes/dislikes do usuário
        if (data.curtido) {
          setLikes(prev => new Set(Array.from(prev).concat(conteudoId)));
          setDislikes(prev => {
            const newDislikes = new Set(prev);
            newDislikes.delete(conteudoId);
            return newDislikes;
          });
        } else {
          setLikes(prev => {
            const newLikes = new Set(prev);
            newLikes.delete(conteudoId);
            return newLikes;
          });
        }
      }
    } catch (error) {
      console.error('Erro ao curtir conteúdo:', error);
    }
  };

    // Função para dar dislike no conteúdo
  const dislikeConteudo = async (conteudoId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que o clique propague para o card
    
    if (!user?.id) {
      alert('Você precisa estar logado para dar dislike em conteúdos');
      return;
    }
    
    try {
      const response = await fetch(`/api/conteudos/${conteudoId}/dislike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Atualizar estado local
        setConteudos(prev => prev.map(conteudo => 
          conteudo.id === conteudoId 
            ? { ...conteudo, dislikes: data.dislikes }
            : conteudo
        ));
        
        // Atualizar dislikes/likes do usuário
        if (data.disliked) {
          setDislikes(prev => new Set(Array.from(prev).concat(conteudoId)));
          setLikes(prev => {
            const newLikes = new Set(prev);
            newLikes.delete(conteudoId);
            return newLikes;
          });
        } else {
          setDislikes(prev => {
            const newDislikes = new Set(prev);
            newDislikes.delete(conteudoId);
            return newDislikes;
          });
        }
      }
    } catch (error) {
      console.error('Erro ao dar dislike no conteúdo:', error);
    }
  };

  // Função para obter informações do YouTube
  function getYoutubeInfo(url: string) {
    const yt = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (yt) {
      const id = yt[1];
      return {
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        link: `https://www.youtube.com/watch?v=${id}`
      };
    }
    return null;
  }

  // Função para obter thumbnail do conteúdo
  function getThumbnail(url: string) {
    if (!url) return null;
    
    // YouTube
    const yt = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (yt) {
      return {
        src: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`,
        platform: 'YouTube',
        icon: '🎥',
        color: 'from-red-500 to-red-600'
      };
    }
    
    // Twitch - Stream ao vivo
    const twLive = url.match(/twitch\.tv\/([^/?]+)/);
    if (twLive && !url.includes('/videos/')) {
      return {
        src: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${twLive[1]}.jpg`,
        platform: 'Twitch Live',
        icon: '📺',
        color: 'from-purple-600 to-pink-600',
        fallback: true
      };
    }
    
    // Twitch - Vídeo
    const twVideo = url.match(/twitch\.tv\/videos\/(\d+)/);
    if (twVideo) {
      return {
        src: `https://static-cdn.jtvnw.net/videos_capture/${twVideo[1]}.jpg`,
        platform: 'Twitch Video',
        icon: '📺',
        color: 'from-purple-500 to-purple-600',
        fallback: true
      };
    }
    
    // Instagram
    if (url.includes('instagram.com')) {
      return {
        src: null,
        platform: 'Instagram',
        icon: '📷',
        color: 'from-pink-500 via-purple-500 to-orange-500'
      };
    }
    
    // TikTok
    if (url.includes('tiktok.com')) {
      return {
        src: null,
        platform: 'TikTok',
        icon: '🎵',
        color: 'from-black via-gray-800 to-gray-600'
      };
    }
    
    // Links gerais
    return {
      src: null,
      platform: 'Link',
      icon: '🔗',
      color: 'from-blue-500 to-blue-600'
    };
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Carregando... - SementesPLAY</title>
        </Head>
        <div className="min-h-screen bg-sss-dark flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-gray-400">Carregando perfil do parceiro...</div>
          </main>
        </div>
      </>
    )
  }

  if (!parceiro) {
    return (
      <>
        <Head>
          <title>Parceiro não encontrado - SementesPLAY</title>
        </Head>
        <div className="min-h-screen bg-sss-dark flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🏢</div>
              <h1 className="text-2xl font-bold text-sss-white mb-2">Parceiro não encontrado</h1>
              <p className="text-gray-400 mb-4">O parceiro que você está procurando não existe ou foi removido.</p>
              <button
                onClick={() => router.push('/parceiros')}
                className="bg-sss-accent hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Voltar aos Parceiros
              </button>
            </div>
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{parceiro.nome} - Parceiro SementesPLAY</title>
      </Head>
      <div className="min-h-screen bg-sss-dark">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header do Parceiro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-sss-medium rounded-lg p-6 mb-8 border border-sss-light"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-6">
                  <BuildingOfficeIcon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-sss-white mb-2">{parceiro.nome}</h1>
                  <p className="text-gray-400 mb-1">🏢 Parceiro</p>
                  <p className="text-gray-400 mb-4">{parceiro.nomeCidade}</p>
                  
                  {/* Estatísticas */}
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{formatarMoeda(parceiro.totalVendas)}</div>
                      <div className="text-sm text-gray-400">Total de Vendas</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botões de ação */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => toggleFavorito(parceiro.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  {favoritos.has(parceiro.id) ? (
                    <>
                      <HeartIcon className="w-5 h-5" />
                      Favoritado
                    </>
                  ) : (
                    <>
                      <HeartIcon className="w-5 h-5" />
                      Favoritar
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => router.push('/parceiros')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Voltar
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6 border-b border-sss-light">
            <button 
              className={`px-4 py-2 rounded-t-lg transition-colors ${aba === 'conteudos' ? 'bg-sss-accent text-white' : 'bg-sss-dark text-gray-400 hover:text-sss-white'}`} 
              onClick={() => setAba('conteudos')}
            >
              <DocumentTextIcon className="w-5 h-5 inline mr-2" /> Conteúdos
            </button>
            <button 
              className={`px-4 py-2 rounded-t-lg transition-colors ${aba === 'transacoes' ? 'bg-sss-accent text-white' : 'bg-sss-dark text-gray-400 hover:text-sss-white'}`} 
              onClick={() => setAba('transacoes')}
            >
              <CreditCardIcon className="w-5 h-5 inline mr-2" /> Transações
            </button>
            <button 
              className={`px-4 py-2 rounded-t-lg transition-colors ${aba === 'codigos' ? 'bg-sss-accent text-white' : 'bg-sss-dark text-gray-400 hover:text-sss-white'}`} 
              onClick={() => setAba('codigos')}
            >
              <DocumentTextIcon className="w-5 h-5 inline mr-2" /> Códigos
            </button>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
            {aba === 'conteudos' && (
              <div>
                <h3 className="text-xl font-semibold text-sss-white mb-4">Conteúdos do Parceiro</h3>
                {conteudos.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum conteúdo encontrado.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {conteudos.map((conteudo) => (
                                             <div key={conteudo.id} className="bg-sss-dark rounded-lg overflow-hidden border border-sss-light hover:border-gray-500 transition-all duration-300 group cursor-pointer"
                            onClick={() => {
                              registrarVisualizacao(conteudo.id);
                              window.open(conteudo.url, '_blank', 'noopener,noreferrer');
                            }}>
                        
                        {/* Prévia visual do conteúdo */}
                        {(() => {
                          const thumbnail = getThumbnail(conteudo.url);
                          if (thumbnail && thumbnail.src) {
                            // YouTube com thumbnail real
                            return (
                              <div className="relative">
                                <img src={thumbnail.src} alt={conteudo.titulo} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                  <div className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                                    Assistir no YouTube
                                  </div>
                                </div>
                              </div>
                            );
                          } else if (thumbnail && thumbnail.fallback) {
                            // Twitch com fallback
                            return (
                              <div className="relative">
                                <img src={thumbnail.src} alt={conteudo.titulo} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                                     onError={(e) => {
                                       const target = e.currentTarget as HTMLImageElement;
                                       target.style.display = 'none';
                                       const nextSibling = target.nextElementSibling as HTMLElement;
                                       if (nextSibling) {
                                         nextSibling.style.display = 'flex';
                                       }
                                     }} />
                                <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300" style={{display: 'none'}}>
                                  <div className="text-center">
                                    <span className="text-4xl mb-2 block">{thumbnail.icon}</span>
                                    <p className="text-white font-semibold">{thumbnail.platform}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          } else {
                            // Outras plataformas com gradiente
                            return (
                              <div className={`w-full h-48 bg-gradient-to-br ${thumbnail?.color || 'from-blue-500 to-blue-600'} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                                <div className="text-center">
                                  <span className="text-4xl mb-2 block">{thumbnail?.icon || '🔗'}</span>
                                  <p className="text-white font-semibold">{thumbnail?.platform || 'Link'}</p>
                                </div>
                              </div>
                            );
                          }
                        })()}
                        
                                                 {/* Informações do conteúdo */}
                         <div className="p-4">
                           <h4 className="font-semibold text-sss-white mb-2 truncate">{conteudo.titulo}</h4>
                           <p className="text-sm text-gray-400 mb-2">{conteudo.tipo} • {conteudo.categoria}</p>
                           
                                                       {/* Estatísticas e botões de interação */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>👁️ {formatarNumero(conteudo.visualizacoes)}</span>
                              </div>
                              
                              {/* Botões de like/dislike */}
                              <div className="flex items-center gap-2">
                               <button
                                 onClick={(e) => curtirConteudo(conteudo.id, e)}
                                 className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                                   likes.has(conteudo.id)
                                     ? 'text-green-400 bg-green-400/10'
                                     : 'text-gray-400 hover:text-green-400'
                                 }`}
                                 title="Curtir"
                               >
                                 <HandThumbUpIcon className="w-3 h-3" />
                                 <span>{formatarNumero(conteudo.curtidas)}</span>
                               </button>
                               
                               <button
                                 onClick={(e) => dislikeConteudo(conteudo.id, e)}
                                 className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                                   dislikes.has(conteudo.id)
                                     ? 'text-red-400 bg-red-400/10'
                                     : 'text-gray-400 hover:text-red-400'
                                 }`}
                                 title="Não curtir"
                               >
                                 <HandThumbDownIcon className="w-3 h-3" />
                                 <span>{formatarNumero(conteudo.dislikes)}</span>
                               </button>
                             </div>
                           </div>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {aba === 'transacoes' && (
              <div>
                <h3 className="text-xl font-semibold text-sss-white mb-4">Transações</h3>
                {transacoes.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhuma transação encontrada.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-sss-light">
                          <th className="text-left py-3 px-4 text-sss-white">Código</th>
                          <th className="text-left py-3 px-4 text-sss-white">Usuário</th>
                          <th className="text-left py-3 px-4 text-sss-white">Valor</th>
                          <th className="text-left py-3 px-4 text-sss-white">Status</th>
                          <th className="text-left py-3 px-4 text-sss-white">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transacoes.map((transacao) => (
                          <tr key={transacao.id} className="border-b border-sss-light">
                            <td className="py-3 px-4 text-sss-white font-mono">{transacao.codigoParceiro}</td>
                            <td className="py-3 px-4 text-sss-white">{transacao.usuario?.nome || 'N/A'}</td>
                            <td className="py-3 px-4 text-green-400 font-medium">{formatarMoeda(transacao.valor)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                transacao.status === 'aprovada' ? 'bg-green-600 text-white' :
                                transacao.status === 'pendente' ? 'bg-yellow-600 text-white' :
                                'bg-red-600 text-white'
                              }`}>
                                {transacao.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-400">{formatarData(transacao.data)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {aba === 'codigos' && (
              <div>
                <h3 className="text-xl font-semibold text-sss-white mb-4">Códigos de Cashback</h3>
                {codigos.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum código encontrado.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-sss-light">
                          <th className="text-left py-3 px-4 text-sss-white">Código</th>
                          <th className="text-left py-3 px-4 text-sss-white">Valor</th>
                          <th className="text-left py-3 px-4 text-sss-white">Status</th>
                          <th className="text-left py-3 px-4 text-sss-white">Data Geração</th>
                        </tr>
                      </thead>
                      <tbody>
                        {codigos.map((codigo) => (
                          <tr key={codigo.id} className="border-b border-sss-light">
                            <td className="py-3 px-4 text-sss-white font-mono">{codigo.codigo}</td>
                            <td className="py-3 px-4 text-green-400 font-medium">{formatarMoeda(codigo.valor)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${codigo.usado ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                                {codigo.usado ? 'Usado' : 'Ativo'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-400">{formatarData(codigo.dataGeracao)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
} 