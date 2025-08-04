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
        const response = await fetch('/api/conteudos/populares?limit=5');
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

  // Auto-advance slides
  useEffect(() => {
    if (conteudos.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.min(conteudos.length, 3));
      }, 60000); // Change slide every 60 seconds (1 minute)

      return () => clearInterval(timer);
    }
  }, [conteudos.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.min(conteudos.length, 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.min(conteudos.length, 3)) % Math.min(conteudos.length, 3));
  };

  return (
    <section className="w-full max-w-6xl mx-auto mt-8 mb-10 flex flex-col md:flex-row gap-36 items-stretch">
      <div className="w-full md:w-auto flex flex-col md:flex-row md:items-stretch gap-36">
        <div className="w-full md:w-80 flex-shrink-0 relative">
          <h2 className="text-2xl font-bold text-sss-white mb-4 md:mb-6 md:text-left text-center">
            🔥 Conteúdos dos Parceiros
          </h2>
          
          {/* Banner Slider */}
          <div className="block w-full rounded-lg overflow-hidden bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 h-[400px] relative">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sss-accent mx-auto mb-4"></div>
                  <div className="text-gray-400">Carregando...</div>
                </div>
              </div>
            ) : conteudos.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-4xl mb-3">🏢</div>
                  <div className="text-lg font-bold text-sss-white mb-2">Conteúdos dos Parceiros</div>
                  <div className="text-sm text-gray-300">
                    Descubra os conteúdos mais populares dos nossos parceiros
                  </div>
                  <div className="mt-4 text-xs text-gray-400">
                    Atualizado em tempo real
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Slides */}
                <div className="relative h-full overflow-hidden">
                  {conteudos.slice(0, 3).map((conteudo, index) => {
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
                              <div className="text-sm text-gray-200 mb-4">{conteudo.parceiro.nome}</div>
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
                                <span className="text-yellow-400">
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
          
          {/* Navigation Arrows - Outside the slider card */}
          {conteudos.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                title="Slide anterior"
                className="absolute -left-12 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full transition-colors flex items-center justify-center text-lg font-bold z-20"
              >
                ‹
              </button>
              <button
                onClick={nextSlide}
                title="Próximo slide"
                className="absolute -right-12 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full transition-colors flex items-center justify-center text-lg font-bold z-20"
              >
                ›
              </button>
            </>
          )}

          {/* Dots Indicator - Outside the slider card */}
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
        </div>

        {/* Lista de conteúdos à direita */}
        <div className="flex-1 w-full mt-12 mr-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sss-accent mx-auto mb-4"></div>
              <div className="text-gray-400">Carregando conteúdos...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 mb-2">❌</div>
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
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-sss-light/30 scrollbar-track-transparent" style={{ minHeight: '200px' }}>
              {conteudos.map((conteudo) => {
                const thumbnail = getThumbnail(conteudo.url);
                return (
                  <div key={conteudo.id} className="bg-sss-dark/50 backdrop-blur-sm border border-sss-light/30 rounded-xl p-4 hover:border-sss-accent/50 hover:bg-sss-dark/70 transition-all duration-300 group cursor-pointer" onClick={() => window.open(conteudo.url, '_blank')}>
                    <div className="flex items-start space-x-4">
                      {/* Preview do conteúdo */}
                      <div className="flex-shrink-0">
                        {thumbnail?.src ? (
                          <div className="w-20 h-20 rounded-lg overflow-hidden border border-sss-light/30 bg-sss-dark/30 relative">
                            <Image
                              src={thumbnail.src}
                              alt={conteudo.titulo}
                              width={80}
                              height={80}
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
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center text-2xl" style={{ display: 'none' }}>
                                {thumbnail.icon}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`w-20 h-20 bg-gradient-to-br ${thumbnail?.color || 'from-blue-500/20 to-purple-500/20'} border border-blue-500/30 rounded-lg flex items-center justify-center group-hover:border-blue-400/50 transition-colors text-2xl`}>
                            {thumbnail?.icon || '🔗'}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="block text-lg text-sss-white font-semibold hover:text-sss-accent truncate transition-colors">
                          {conteudo.titulo}
                        </div>
                        <div className="flex items-center space-x-3 mt-2 flex-wrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-300 font-medium">
                              {conteudo.parceiro.nome}
                            </span>
                          </div>
                          <span className="text-gray-500">•</span>
                          <span className="text-sm text-blue-400 font-medium">
                            {getTipoLabel(conteudo.tipo)}
                          </span>
                          {conteudo.categoria && (
                            <>
                              <span className="text-gray-500">•</span>
                              <span className="text-sm text-purple-400 font-medium">
                                {conteudo.categoria}
                              </span>
                            </>
                          )}
                                                     {/* Indicador de popularidade */}
                           <span className="text-gray-500">•</span>
                           <span className="text-xs text-yellow-400 font-medium">
                             🔥 {formatarNumero(conteudo.visualizacoes)} view
                           </span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <span className="text-sm text-gray-400 bg-sss-light/10 px-3 py-1 rounded-full border border-sss-light/20">
                          {new Date(conteudo.dataPublicacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 