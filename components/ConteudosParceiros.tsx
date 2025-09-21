import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, PlayIcon, PhotoIcon, LinkIcon } from '@heroicons/react/24/outline';
import { FaInstagram, FaTiktok, FaTwitch } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

interface ConteudoParceiro {
  id: string;
  titulo: string;
  tipo: string;
  categoria: string;
  url: string;
  preview?: string; // Campo para imagem personalizada do parceiro
  visualizacoes: number;
  curtidas: number;
  dislikes: number;
  dataPublicacao: string;
  data?: string;
  parceiro: {
    id: string;
    nome: string;
    nomeCidade: string;
  };
}

export default function ConteudosParceiros() {
  const [conteudos, setConteudos] = useState<ConteudoParceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchConteudos = async () => {
      try {
        setLoading(true);
        // Usar a API específica de conteúdos dos parceiros
        const response = await fetch('/api/parceiros/conteudos');
        if (response.ok) {
          const data = await response.json();
          setConteudos(data.conteudos || []);
        } else {
          setError('Erro ao carregar conteúdos');
        }
      } catch (err) {
        setError('Erro ao carregar conteúdos');
        console.error('Erro ao buscar conteúdos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConteudos();
  }, []);

  // Função para obter thumbnail do conteúdo
  const getThumbnail = (url: string, preview?: string) => {
    // Priorizar o campo preview do banco de dados se disponível
    if (preview) {
      return {
        src: preview,
        platform: 'Custom',
        icon: '🖼️',
        color: 'from-blue-500 to-purple-500',
        fallback: false // Usar imagem real, não fallback
      };
    }
    
    if (!url) return null;
    
    // YouTube (incluindo Shorts)
    const yt = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
    if (yt) {
      return {
        src: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`,
        platform: 'YouTube',
        icon: '🎥',
        color: 'from-red-500 to-red-600',
        fallback: false // Usar thumbnail real do YouTube
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
        fallback: true // Sempre usar fallback para Twitch
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
        fallback: true // Sempre usar fallback para Twitch
      };
    }
    
    // Instagram
    if (url.includes('instagram.com')) {
      const insta = url.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
      if (insta) {
        const postId = insta[1];
        return {
          src: `https://www.instagram.com/p/${postId}/media/?size=l`,
          platform: 'Instagram',
          icon: '📷',
          color: 'from-pink-500 via-purple-500 to-orange-500',
          fallback: false // Usar thumbnail real do Instagram
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
          fallback: false // Usar thumbnail real do TikTok
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
  };

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
        return <PlayIcon className="w-5 h-5 text-red-400" />;
      case 'tiktok':
        return <FaTiktok className="w-5 h-5 text-black" />;
      case 'instagram':
        return <FaInstagram className="w-5 h-5 text-pink-500" />;
      case 'twitch':
        return <FaTwitch className="w-5 h-5 text-purple-500" />;
      case 'imagem':
      case 'foto':
        return <PhotoIcon className="w-5 h-5 text-green-400" />;
      case 'link':
      case 'url':
        return <LinkIcon className="w-5 h-5 text-blue-400" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-blue-300" />;
    }
  };

  const getTipoLabel = (tipo: string, url?: string) => {
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
        return 'Vídeo';
      case 'tiktok':
        return 'TikTok';
      case 'instagram':
        return 'Instagram';
      case 'twitch':
        return 'Stream';
      case 'imagem':
      case 'foto':
        return 'Imagem';
      case 'link':
      case 'url':
        return 'Link';
      default:
        return 'Conteúdo';
    }
  };

  const formatarNumero = (numero: number) => {
    if (numero >= 1000000) {
      return (numero / 1000000).toFixed(1) + 'M'
    } else if (numero >= 1000) {
      return (numero / 1000).toFixed(1) + 'K'
    }
    return numero.toString()
  };

  // Função para calcular pontuação baseada em visualizações, likes e dislikes
  const calcularPontuacao = (conteudo: ConteudoParceiro) => {
    const pontosVisualizacao = conteudo.visualizacoes * 1; // 1 ponto por visualização
    const pontosLikes = conteudo.curtidas * 10; // 10 pontos por like
    const pontosDislikes = conteudo.dislikes * -5; // -5 pontos por dislike
    return pontosVisualizacao + pontosLikes + pontosDislikes;
  };

  // Ordenar conteúdos por pontuação (mais populares primeiro)
  const getConteudosOrdenados = () => {
    const ordenados = [...conteudos]
      .map(conteudo => ({
        ...conteudo,
        pontuacao: calcularPontuacao(conteudo)
      }))
      .sort((a, b) => b.pontuacao - a.pontuacao);
    return ordenados;
  };

  // Auto-advance slides
  useEffect(() => {
    const conteudosOrdenados = getConteudosOrdenados();
    if (conteudosOrdenados.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.min(conteudosOrdenados.length, 3));
      }, 60000); // Change slide every 60 seconds (1 minute)

      return () => clearInterval(timer);
    }
  }, [conteudos.length]);

  const nextSlide = () => {
    const conteudosOrdenados = getConteudosOrdenados();
    setCurrentSlide((prev) => (prev + 1) % Math.min(conteudosOrdenados.length, 3));
  };

  const prevSlide = () => {
    const conteudosOrdenados = getConteudosOrdenados();
    setCurrentSlide((prev) => (prev - 1 + Math.min(conteudosOrdenados.length, 3)) % Math.min(conteudosOrdenados.length, 3));
  };

  return (
    <div className="w-full bg-sss-dark rounded-2xl shadow-lg p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Banner Slider - Lado Esquerdo */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-2xl font-bold text-sss-white mb-6">
            🔥 Conteúdos dos Parceiros
          </h2>
          
          {/* Banner Slider */}
          <div className="relative w-full rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 aspect-[16/9] shadow-lg">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <div className="text-white">Carregando...</div>
                </div>
              </div>
            ) : (
              <>
                {/* Slides */}
                <div className="relative h-full overflow-hidden">
                  {(() => {
                    const conteudosOrdenados = getConteudosOrdenados();
                    const conteudosParaSlide = conteudosOrdenados.slice(0, 3);
                    
                    if (conteudosParaSlide.length === 0) {
                      return (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center text-white">
                            <div className="text-4xl mb-3">🏢</div>
                            <div className="text-lg font-bold mb-2">Conteúdos dos Parceiros</div>
                            <div className="text-sm opacity-80">
                              Descubra os conteúdos mais populares dos nossos parceiros
                            </div>
                            <div className="mt-4 text-xs opacity-60">
                              Atualizado em tempo real
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    return conteudosParaSlide.map((conteudo, index) => {
                      const thumbnail = getThumbnail(conteudo.url, conteudo.preview);
                      return (
                        <div
                          key={conteudo.id}
                          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                            index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                          }`}
                        >
                          <div className="relative h-full bg-gradient-to-br from-purple-600/30 to-pink-600/30">
                            {/* Mostrar imagem real quando disponível, senão usar fallback visual */}
                            {thumbnail?.src && (thumbnail.platform === 'Custom' || thumbnail.platform === 'YouTube' || thumbnail.platform === 'Instagram' || thumbnail.platform === 'TikTok') ? (
                              <div className="absolute inset-0">
                                                            <Image
                              src={thumbnail.src}
                              alt={conteudo.titulo}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              unoptimized={thumbnail.platform === 'YouTube' || thumbnail.platform === 'Instagram' || thumbnail.platform === 'TikTok'}
                              onError={(e) => {
                                console.log('Erro ao carregar imagem:', thumbnail.src);
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20"></div>
                              </div>
                            ) : (
                              <div className={`absolute inset-0 bg-gradient-to-br ${thumbnail?.color || 'from-purple-600 to-pink-600'} flex items-center justify-center`}>
                                <div className="text-center text-white">
                                  {/* Ícone específico para cada plataforma - mesmo padrão da página de status */}
                                  {thumbnail?.platform === 'Instagram' && (
                                    <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                  )}
                                  {thumbnail?.platform === 'TikTok' && (
                                    <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12.75 2v14.25a2.25 2.25 0 1 1-2.25-2.25h.75V12h-.75a4.5 4.5 0 1 0 4.5 4.5V7.5a5.25 5.25 0 0 0 5.25 5.25V9.75A3.75 3.75 0 0 1 16.5 6V2h-3.75z"/>
                                    </svg>
                                  )}
                                  {thumbnail?.platform === 'YouTube' && (
                                    <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.692 3.5 12 3.5 12 3.5s-7.692 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.88 0 12 0 12s0 4.12.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.308 20.5 12 20.5 12 20.5s7.692 0 9.386-.574A2.994 2.994 0 0 0 2.112-2.112C24 16.12 24 12 24 12s0-4.12-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
                                    </svg>
                                  )}
                                  {thumbnail?.platform === 'Twitch Live' && (
                                    <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                                    </svg>
                                  )}
                                  {thumbnail?.platform === 'Twitch Video' && (
                                    <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                                    </svg>
                                  )}
                                  {thumbnail?.platform === 'Link' && (
                                    <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5V21C21 21.55 20.55 22 20 22H4C3.45 22 3 21.55 3 21V5C3 4.45 3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V20H17V6H7Z"/>
                                    </svg>
                                  )}
                                  
                                  {/* Título da plataforma - mesmo estilo da página de status */}
                                  <div className="text-lg font-semibold mb-2">
                                    {thumbnail?.platform === 'Instagram' ? 'Post do Instagram' : 
                                     thumbnail?.platform === 'TikTok' ? 'Vídeo do TikTok' :
                                     thumbnail?.platform === 'YouTube' ? 'Vídeo do YouTube' :
                                     thumbnail?.platform === 'Twitch Live' ? 'Stream ao Vivo' :
                                     thumbnail?.platform === 'Twitch Video' ? 'Vídeo do Twitch' :
                                     thumbnail?.platform === 'Link' ? 'Link Externo' :
                                     'Conteúdo do Parceiro'}
                                  </div>
                                  
                                  {/* Título do conteúdo */}
                                  <div className="text-xl opacity-90 drop-shadow-md max-w-md px-4">
                                    {conteudo.titulo}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Gradiente sutil sobre o thumbnail visual */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                            
                            {/* Content Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center text-white p-6 max-w-md relative z-10">
                                <div className="text-2xl font-bold mb-3 drop-shadow-lg">{conteudo.titulo}</div>
                                <div className="text-sm opacity-90 mb-4 drop-shadow-md">{conteudo.parceiro.nome}</div>
                                <div className="flex items-center justify-center space-x-4 text-xs drop-shadow-md">
                                  <span className="flex items-center space-x-1 bg-black/30 px-2 py-1 rounded-full">
                                    <span>🏢</span>
                                    <span>{conteudo.parceiro.nome}</span>
                                  </span>
                                  <span className="bg-black/30 px-2 py-1 rounded-full">•</span>
                                  <span className="bg-black/30 px-2 py-1 rounded-full">{getTipoLabel(conteudo.tipo)}</span>
                                  <span className="bg-black/30 px-2 py-1 rounded-full">•</span>
                                  <span className="bg-black/30 px-2 py-1 rounded-full">
                                    {(conteudo.data || conteudo.dataPublicacao) ? 
                                      (() => {
                                        try {
                                          const dataValue = conteudo.data || conteudo.dataPublicacao;
                                          return new Date(dataValue).toLocaleDateString('pt-BR');
                                        } catch (error) {
                                          return 'Data inválida';
                                        }
                                      })() 
                                      : 'Data não disponível'
                                    }
                                  </span>
                                  {/* Indicador de popularidade no slider */}
                                  <span className="bg-black/30 px-2 py-1 rounded-full">•</span>
                                  <span className="text-yellow-300 bg-black/30 px-2 py-1 rounded-full">
                                    🔥 {formatarNumero(conteudo.visualizacoes)} view
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Clickable Link Overlay */}
                            <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => window.open(conteudo.url, '_blank')}>
                              <span className="sr-only">Ver conteúdo: {conteudo.titulo}</span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </>
            )}
          </div>
          
          {/* Navigation Arrows - Abaixo do Banner */}
          {getConteudosOrdenados().length > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={prevSlide}
                title="Slide anterior"
                className="bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full transition-colors flex items-center justify-center text-lg font-bold"
              >
                ‹
              </button>
              <button
                onClick={nextSlide}
                title="Próximo slide"
                className="bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full transition-colors flex items-center justify-center text-lg font-bold"
              >
                ›
              </button>
            </div>
          )}

          {/* Dots Indicator - Abaixo dos botões */}
          {conteudos.length > 1 && (
            <div className="flex justify-center space-x-2 mt-3">
              {conteudos.slice(0, 3).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  title={`Ir para slide ${index + 1}`}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Lista de conteúdos - Lado Direito */}
        <div className="w-full lg:w-1/2">
          <h3 className="text-xl font-bold text-sss-white mb-4">
            📋 Lista de Conteúdos
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <div className="text-gray-400">Carregando conteúdos...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">❌</div>
              <div className="text-gray-400">{error}</div>
            </div>
          ) : conteudos.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">🏢</div>
              <div className="text-gray-400">Nenhum conteúdo dos parceiros disponível no momento.</div>
              <div className="text-sm text-gray-500 mt-2">
                Os parceiros ainda não publicaram conteúdos.
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {getConteudosOrdenados().map((conteudo) => {
                const thumbnail = getThumbnail(conteudo.url, conteudo.preview);
                return (
                  <div key={conteudo.id} className="bg-sss-medium border border-gray-600 rounded-lg p-4 hover:border-purple-400 hover:bg-sss-dark transition-all duration-300 group cursor-pointer" onClick={() => window.open(conteudo.url, '_blank')}>
                    <div className="flex items-start space-x-3">
                      {/* Preview do conteúdo */}
                      <div className="flex-shrink-0">
                        {thumbnail?.src ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-600 bg-sss-dark relative">
                            <Image
                              src={thumbnail.src}
                              alt={conteudo.titulo}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                              sizes="64px"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const nextSibling = target.nextElementSibling as HTMLElement;
                                if (nextSibling) {
                                  nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                            {/* Fallback para Twitch */}
                            {thumbnail.fallback && (
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center text-xl hidden-fallback">
                                {thumbnail.icon}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Thumbnail visual quando não há imagem - mesmo padrão da página de status */
                          <div className={`w-16 h-16 bg-gradient-to-br ${thumbnail?.color || 'from-blue-500 to-purple-500'} border border-gray-600 rounded-lg flex items-center justify-center group-hover:border-purple-400 transition-colors overflow-hidden`}>
                            {/* Ícone SVG específico para cada plataforma */}
                            {thumbnail?.platform === 'Instagram' && (
                              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            )}
                            {thumbnail?.platform === 'TikTok' && (
                              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.75 2v14.25a2.25 2.25 0 1 1-2.25-2.25h.75V12h-.75a4.5 4.5 0 1 0 4.5 4.5V7.5a5.25 5.25 0 0 0 5.25 5.25V9.75A3.75 3.75 0 0 1 16.5 6V2h-3.75z"/>
                              </svg>
                            )}
                            {thumbnail?.platform === 'YouTube' && (
                              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.692 3.5 12 3.5 12 3.5s-7.692 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.88 0 12 0 12s0 4.12.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.308 20.5 12 20.5 12 20.5s7.692 0 9.386-.574A2.994 2.994 0 0 0 2.112-2.112C24 16.12 24 12 24 12s0-4.12-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
                              </svg>
                            )}
                            {thumbnail?.platform === 'Twitch Live' && (
                              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                              </svg>
                            )}
                            {thumbnail?.platform === 'Twitch Video' && (
                              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                              </svg>
                            )}
                            {thumbnail?.platform === 'Link' && (
                              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5V21C21 21.55 20.55 22 20 22H4C3.45 22 3 21.55 3 21V5C3 4.45 3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V20H17V6H7Z"/>
                              </svg>
                            )}
                            
                            {/* Fallback para outras plataformas */}
                            {!thumbnail?.platform && (
                              <div className="text-white text-2xl">
                                {thumbnail?.icon || '🏢'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="block text-sm font-semibold text-sss-white hover:text-purple-400 transition-colors">
                          {conteudo.titulo}
                        </div>
                        <div className="flex items-center space-x-2 mt-1 flex-wrap">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-300 font-medium">
                              {conteudo.parceiro.nome}
                            </span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs text-blue-400 font-medium">
                            {getTipoLabel(conteudo.tipo, conteudo.url)}
                          </span>
                          {conteudo.categoria && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-xs text-purple-400 font-medium">
                                {conteudo.categoria}
                              </span>
                            </>
                          )}
                          {/* Indicador de popularidade */}
                          <span className="text-gray-400">•</span>
                          <span className="text-xs text-yellow-400 font-medium">
                            🔥 {formatarNumero(conteudo.visualizacoes)} view
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <span className="text-xs text-gray-400 bg-sss-dark px-2 py-1 rounded-full border border-gray-600">
                          {(conteudo.data || conteudo.dataPublicacao) ? 
                            (() => {
                              try {
                                const dataValue = conteudo.data || conteudo.dataPublicacao;
                                return new Date(dataValue).toLocaleDateString('pt-BR');
                              } catch (error) {
                                return 'Data inválida';
                              }
                            })() 
                            : 'Data não disponível'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Indicador de mais conteúdos */}
              {getConteudosOrdenados().length > 4 && (
                <div className="text-center py-2 border-t border-gray-600 mt-2">
                  <div className="text-xs text-gray-400">
                    Role para ver mais conteúdos
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 