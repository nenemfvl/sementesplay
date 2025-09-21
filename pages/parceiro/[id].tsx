import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
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
  VideoCameraIcon,
  FlagIcon
} from '@heroicons/react/24/outline'
import { auth, User } from '../../lib/auth'
import { FaInstagram, FaTiktok, FaTwitch } from 'react-icons/fa'

import DenunciaModal from '../../components/DenunciaModal'

interface ParceiroDetalhes {
  id: string
  nome: string
  nomeCidade: string
  totalVendas: number
  usuarioId: string
  urlConnect?: string
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



export default function ParceiroPerfil() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState<User | null>(null)
  const [parceiro, setParceiro] = useState<ParceiroDetalhes | null>(null)
  const [conteudos, setConteudos] = useState<ConteudoParceiro[]>([])
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState<'conteudos'>('conteudos')
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [likes, setLikes] = useState<Set<string>>(new Set())
  const [dislikes, setDislikes] = useState<Set<string>>(new Set())
  const [showDenunciaModal, setShowDenunciaModal] = useState(false)
  const [conteudoParaDenunciar, setConteudoParaDenunciar] = useState<ConteudoParceiro | null>(null)

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

    // Função para curtir conteúdo (atualizada)
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
    
    // YouTube (incluindo Shorts)
    const yt = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
    if (yt) {
      return {
        src: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`,
        platform: 'YouTube',
        icon: '🎥',
        color: 'from-red-500 to-red-600',
        fallback: false
      };
    }
    
    // Twitch - Stream ao vivo
    const twLive = url.match(/twitch\.tv\/([^/?]+)/);
    if (twLive && !url.includes('/videos/')) {
      const channelName = twLive[1];
      return {
        src: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channelName}.jpg`,
        platform: 'Twitch Live',
        icon: '📺',
        color: 'from-purple-600 to-pink-600',
        fallback: true
      };
    }
    
    // Twitch - Vídeo
    const twVideo = url.match(/twitch\.tv\/videos\/(\d+)/);
    if (twVideo) {
      const videoId = twVideo[1];
      return {
        src: `https://static-cdn.jtvnw.net/videos_capture/${videoId}.jpg`,
        platform: 'Twitch Video',
        icon: '📺',
        color: 'from-purple-500 to-purple-600',
        fallback: true
      };
    }
    
    // Instagram
    if (url.includes('instagram.com')) {
      const insta = url.match(/instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
      if (insta) {
        const postId = insta[1];
        return {
          src: `https://www.instagram.com/p/${postId}/media/?size=l`,
          platform: 'Instagram',
          icon: '📷',
          color: 'from-pink-500 via-purple-500 to-orange-500',
          fallback: false
        };
      }
      return {
        src: null,
        platform: 'Instagram',
        icon: '📷',
        color: 'from-pink-500 via-purple-500 to-orange-500'
      };
    }
    
    // TikTok
    if (url.includes('tiktok.com')) {
      const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/) || 
                         url.match(/tiktok\.com\/v\/(\d+)/) ||
                         url.match(/vm\.tiktok\.com\/(\w+)/);
      if (tiktokMatch) {
        return {
          src: `/api/tiktok-image?url=${encodeURIComponent(url)}`,
          platform: 'TikTok',
          icon: '🎵',
          color: 'from-black via-gray-800 to-gray-600',
          fallback: false
        };
      }
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

  const handleDenunciarConteudo = (conteudo: ConteudoParceiro, e: React.MouseEvent) => {
    e.stopPropagation()
    setConteudoParaDenunciar(conteudo)
    setShowDenunciaModal(true)
  }

  const getTipoIcon = (tipo: string, url?: string) => {
    // Detectar automaticamente o tipo baseado na URL para melhorar a experiência
    let tipoDetectado = tipo;
    
    if (url) {
      if (url.includes('tiktok.com')) {
        tipoDetectado = 'tiktok';
      } else if (url.includes('instagram.com')) {
        tipoDetectado = 'instagram';
      } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        tipoDetectado = 'youtube';
      } else if (url.includes('twitch.tv')) {
        tipoDetectado = 'twitch';
      }
    }

    switch (tipoDetectado?.toLowerCase()) {
      case 'video':
      case 'youtube':
        return <VideoCameraIcon className="w-16 h-16 text-red-400" />;
      case 'tiktok':
        return <FaTiktok className="w-16 h-16 text-black" />;
      case 'instagram':
        return <FaInstagram className="w-16 h-16 text-pink-500" />;
      case 'twitch':
        return <FaTwitch className="w-16 h-16 text-purple-500" />;
      case 'imagem':
      case 'foto':
        return <VideoCameraIcon className="w-16 h-16 text-green-400" />;
      case 'link':
      case 'url':
        return <DocumentTextIcon className="w-16 h-16 text-blue-400" />;
      default:
        return <DocumentTextIcon className="w-16 h-16 text-gray-400" />;
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Carregando... - SementesPLAY</title>
        </Head>
        <div className="min-h-screen bg-sss-dark flex flex-col">
          
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
                  
                  {/* URL do Connect */}
                  {parceiro.urlConnect && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between bg-sss-dark/50 rounded-lg p-3">
                        <span className="text-sm text-gray-400">Connect:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-blue-400 truncate max-w-48">
                            {parceiro.urlConnect}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigator.clipboard.writeText(parceiro.urlConnect!);
                              // Mostrar feedback visual
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
               className="px-4 py-2 rounded-t-lg transition-colors bg-sss-accent text-white"
             >
               <DocumentTextIcon className="w-5 h-5 inline mr-2" /> Conteúdos
             </button>
           </div>

                     {/* Conteúdo das Tabs */}
           <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
             <div>
               <h3 className="text-xl font-semibold text-sss-white mb-4">Conteúdos do Parceiro</h3>
               {conteudos.length === 0 ? (
                 <div className="text-center py-8">
                   <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                   <p className="text-gray-400">Nenhum conteúdo encontrado.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
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
                       // YouTube, Instagram, TikTok, Twitch com thumbnail real
                       return (
                         <div className="relative h-48">
                           <Image 
                             src={thumbnail.src} 
                             alt={conteudo.titulo} 
                             fill
                             className="object-cover group-hover:scale-105 transition-transform duration-300"
                             sizes="(max-width: 768px) 100vw, 33vw"
                             unoptimized={thumbnail.platform === 'YouTube' || thumbnail.platform === 'TikTok'}
                             onError={(e) => {
                               console.log('🔍 Erro ao carregar thumbnail:', thumbnail.src, 'Platform:', thumbnail.platform);
                               const target = e.currentTarget as HTMLImageElement;
                               target.style.display = 'none';
                               const parent = target.parentElement;
                               if (parent) {
                                 const placeholder = document.createElement('div');
                                 placeholder.className = `w-full h-48 bg-gradient-to-br ${thumbnail.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`;
                                 
                                 if (thumbnail.platform === 'Instagram') {
                                   placeholder.innerHTML = `
                                     <div class="text-center text-white">
                                       <svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                         <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                       </svg>
                                       <p class="font-semibold">Instagram</p>
                                     </div>
                                   `;
                                 } else {
                                   placeholder.innerHTML = `
                                     <div class="text-center text-white">
                                       <span class="text-4xl mb-2 block">${thumbnail.icon}</span>
                                       <p class="font-semibold">${thumbnail.platform}</p>
                                     </div>
                                   `;
                                 }
                                 
                                 parent.appendChild(placeholder);
                               }
                             }}
                           />
                           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                             <div className={`${thumbnail.platform === 'YouTube' ? 'bg-red-600 hover:bg-red-700' : 
                                              thumbnail.platform === 'Instagram' ? 'bg-pink-600 hover:bg-pink-700' :
                                              thumbnail.platform === 'TikTok' ? 'bg-black hover:bg-gray-800' :
                                              thumbnail.platform === 'Twitch Live' || thumbnail.platform === 'Twitch Video' ? 'bg-purple-600 hover:bg-purple-700' :
                                              'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg font-semibold transition-colors`}>
                               {thumbnail.platform === 'YouTube' ? 'Assistir no YouTube' :
                                thumbnail.platform === 'Instagram' ? 'Ver no Instagram' :
                                thumbnail.platform === 'TikTok' ? 'Ver no TikTok' :
                                thumbnail.platform === 'Twitch Live' ? 'Assistir na Twitch' :
                                thumbnail.platform === 'Twitch Video' ? 'Ver Vídeo na Twitch' :
                                'Abrir Link'}
                             </div>
                           </div>
                         </div>
                       );
                     } else {
                       // Outras plataformas com ícones específicos
                       return (
                         <div className={`w-full h-48 bg-gradient-to-br ${thumbnail?.color || 'from-gray-600 to-gray-700'} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                           <div className="text-center text-white">
                             {thumbnail?.platform ? (
                               <>
                                 <span className="text-4xl mb-2 block">{thumbnail.icon}</span>
                                 <p className="font-semibold">{thumbnail.platform}</p>
                               </>
                             ) : (
                               <>
                                 {getTipoIcon(conteudo.tipo, conteudo.url)}
                                 <p className="font-semibold mt-2">Link</p>
                               </>
                             )}
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

                          {/* Botão de Denúncia */}
                          <button
                            onClick={(e) => handleDenunciarConteudo(conteudo, e)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-orange-400 transition-colors"
                            title="Denunciar conteúdo"
                          >
                            <FlagIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                 </div>
                   ))}
                 </div>
               )}
             </div>
           </div>

          {/* Modal de Denúncia */}
          {showDenunciaModal && conteudoParaDenunciar && (
            <DenunciaModal
              isOpen={showDenunciaModal}
              onClose={() => {
                setShowDenunciaModal(false)
                setConteudoParaDenunciar(null)
              }}
              conteudoParceiroId={conteudoParaDenunciar.id}
              tituloConteudo={conteudoParaDenunciar.titulo}
              tipoConteudo="parceiro"
            />
          )}
        </main>
      </div>
    </>
  )
} 