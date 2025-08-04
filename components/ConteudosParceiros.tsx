import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, PlayIcon, PhotoIcon, LinkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

interface ConteudoParceiro {
  id: string;
  titulo: string;
  tipo: string;
  categoria: string;
  url: string;
  visualizacoes: number;
  curtidas: number;
  dislikes: number;
  dataPublicacao: string;
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
  const getThumbnail = (url: string) => {
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
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'video':
      case 'youtube':
      case 'twitch':
        return <PlayIcon className="w-5 h-5 text-red-400" />;
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

  const getTipoLabel = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'video':
      case 'youtube':
        return 'Vídeo';
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
    return [...conteudos]
      .map(conteudo => ({
        ...conteudo,
        pontuacao: calcularPontuacao(conteudo)
      }))
      .sort((a, b) => b.pontuacao - a.pontuacao);
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
          <div className="relative w-full rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 h-[300px] shadow-lg">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <div className="text-white">Carregando...</div>
                </div>
              </div>
            ) : conteudos.length === 0 ? (
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
            ) : (
              <>
                                 {/* Slides */}
                 <div className="relative h-full overflow-hidden">
                   {getConteudosOrdenados().slice(0, 3).map((conteudo, index) => {
                    const thumbnail = getThumbnail(conteudo.url);
                    return (
                      <div
                        key={conteudo.id}
                        className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                          index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                        }`}
                      >
                        <div className="relative h-full bg-gradient-to-br from-purple-600/30 to-pink-600/30">
                          {/* Background Image */}
                          {thumbnail?.src && (
                            <div className="absolute inset-0">
                              <Image
                                src={thumbnail.src}
                                alt={conteudo.titulo}
                                fill
                                className="object-cover"
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
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center text-6xl" style={{ display: 'none' }}>
                                  {thumbnail.icon}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Content Overlay */}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="text-center text-white p-6 max-w-md">
                              <div className="text-2xl font-bold mb-3">{conteudo.titulo}</div>
                              <div className="text-sm opacity-80 mb-4">{conteudo.parceiro.nome}</div>
                              <div className="flex items-center justify-center space-x-4 text-xs">
                                <span className="flex items-center space-x-1">
                                  <span>🏢</span>
                                  <span>{conteudo.parceiro.nome}</span>
                                </span>
                                <span>•</span>
                                <span>{getTipoLabel(conteudo.tipo)}</span>
                                <span>•</span>
                                <span>{new Date(conteudo.dataPublicacao).toLocaleDateString('pt-BR')}</span>
                                {/* Indicador de popularidade no slider */}
                                <span>•</span>
                                <span className="text-yellow-300">
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
                  })}
                </div>
              </>
            )}
          </div>
          
          {/* Dots Indicator */}
          {conteudos.length > 1 && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
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
                const thumbnail = getThumbnail(conteudo.url);
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
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center text-xl" style={{ display: 'none' }}>
                                {thumbnail.icon}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`w-16 h-16 bg-gradient-to-br ${thumbnail?.color || 'from-blue-500/20 to-purple-500/20'} border border-gray-600 rounded-lg flex items-center justify-center group-hover:border-purple-400 transition-colors text-xl`}>
                            {thumbnail?.icon || '🔗'}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="block text-sm font-semibold text-sss-white hover:text-purple-400 truncate transition-colors">
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
                            {getTipoLabel(conteudo.tipo)}
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
                          {new Date(conteudo.dataPublicacao).toLocaleDateString('pt-BR')}
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