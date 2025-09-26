import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, PlayIcon, PhotoIcon, LinkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram, FaTiktok, FaTwitch } from 'react-icons/fa';

interface Conteudo {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  link: string;
  tipo: string;
  url?: string;
  preview?: string;
  criador: {
    nome: string;
    avatarUrl?: string;
  };
  categoria?: string;
  // Informações de popularidade
  visualizacoes?: number;
  curtidas?: number;
  compartilhamentos?: number;
  pontuacaoPopularidade?: number;
}

export default function Noticias() {
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchConteudos = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/conteudos/recentes?limit=10');
        if (response.ok) {
          const data = await response.json();
          setConteudos(data.noticias || []);
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

  const getTipoIcon = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
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
    // Detectar automaticamente pela URL se possível
    if (url) {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return url.includes('/shorts/') ? 'YouTube Shorts' : 'YouTube';
      }
      if (url.includes('instagram.com')) {
        return 'Instagram';
      }
      if (url.includes('tiktok.com')) {
        return 'TikTok';
      }
      if (url.includes('twitch.tv')) {
        return url.includes('/videos/') ? 'Twitch Video' : 'Twitch Live';
      }
    }

    // Fallback para o tipo original
    switch (tipo?.toLowerCase()) {
      case 'video':
      case 'youtube':
        return 'Vídeo';
      case 'twitch':
        return 'Stream';
      case 'tiktok':
        return 'TikTok';
      case 'instagram':
        return 'Instagram';
      case 'imagem':
      case 'foto':
        return 'Imagem';
      case 'link':
      case 'url':
        return 'Link';
      case 'post':
        return 'Post';
      default:
        return 'Conteúdo';
    }
  };

  const getYoutubeInfo = (url: string) => {
    const yt = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
    if (yt) {
      const id = yt[1];
      return {
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        link: `https://www.youtube.com/watch?v=${id}`
      };
    }
    return null;
  };

  const getInstagramInfo = (url: string) => {
    // Tenta extrair o ID do post do Instagram
    const insta = url.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
    if (insta) {
      const postId = insta[1];
      // Tenta diferentes URLs para obter a imagem
      // Nota: O Instagram pode bloquear requisições diretas, então usamos fallbacks
      return {
        thumbnail: `https://www.instagram.com/p/${postId}/media/?size=l`,
        fallbackThumbnail: `https://www.instagram.com/p/${postId}/embed/`,
        link: url,
        postId: postId
      };
    }
    return null;
  };

  const getTikTokInfo = (url: string) => {
    // Tenta extrair o ID do vídeo do TikTok
    const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/) || 
                       url.match(/tiktok\.com\/v\/(\d+)/) ||
                       url.match(/vm\.tiktok\.com\/(\w+)/);
    if (tiktokMatch) {
      const videoId = tiktokMatch[1];
      
      // Usar nossa API que redireciona para a imagem real
      return {
        thumbnail: `/api/tiktok-image?url=${encodeURIComponent(url)}`,
        link: url,
        videoId: videoId
      };
    }
    return null;
  };

  const getTwitchInfo = (url: string) => {
    // Twitch - Stream ao vivo
    const twLive = url.match(/twitch\.tv\/([^/?]+)/);
    if (twLive && !url.includes('/videos/')) {
      const channelName = twLive[1];
      return {
        thumbnail: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channelName}.jpg`,
        link: url,
        channelName: channelName,
        type: 'live'
      };
    }
    
    // Twitch - Vídeo
    const twVideo = url.match(/twitch\.tv\/videos\/(\d+)/);
    if (twVideo) {
      const videoId = twVideo[1];
      return {
        thumbnail: `https://static-cdn.jtvnw.net/videos_capture/${videoId}.jpg`,
        link: url,
        videoId: videoId,
        type: 'video'
      };
    }
    
    return null;
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
    <section className="w-full max-w-5xl mx-auto mt-8 mb-10 flex flex-col md:flex-row gap-36 items-stretch">
      <div className="w-full md:w-auto flex flex-col md:flex-row md:items-stretch gap-36">
                 <div className="w-full md:w-80 flex-shrink-0 relative">
                     <h2 className="text-2xl font-bold text-sss-white mb-4 md:mb-6 md:text-left text-center">
             Conteúdos Populares
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
                    <div className="text-4xl mb-3">🎬</div>
                                         <div className="text-lg font-bold text-sss-white mb-2">Conteúdos Populares</div>
                     <div className="text-sm text-gray-300">
                       Descubra os conteúdos mais visualizados, curtidos e compartilhados
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
                    const yt = getYoutubeInfo(conteudo.url || '');
                    const insta = getInstagramInfo(conteudo.url || '');
                    const tiktok = getTikTokInfo(conteudo.url || '');
                    const twitch = getTwitchInfo(conteudo.url || '');
                    
                    return (
                      <div
                        key={conteudo.id}
                        className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                          index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                        }`}
                      >
                                                <div className="relative h-full bg-gradient-to-br from-purple-600/30 to-pink-600/30">
                                                     {/* Background Image */}
                            {conteudo.preview ? (
                              <div className="absolute inset-0">
                                <Image
                                  src={conteudo.preview}
                                  alt={conteudo.titulo}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : yt ? (
                              <div className="absolute inset-0">
                                <Image
                                  src={yt.thumbnail}
                                  alt={conteudo.titulo}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : insta ? (
                              <div className="absolute inset-0">
                                <Image
                                  src={insta.thumbnail}
                                  alt={conteudo.titulo}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    // Se a imagem falhar, mostra o placeholder do Instagram
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      const placeholder = document.createElement('div');
                                      placeholder.className = 'absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white';
                                      placeholder.innerHTML = `
                                        <div class="text-center">
                                          <svg class="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                          </svg>
                                          <div class="text-lg font-semibold">Post do Instagram</div>
                                        </div>
                                      `;
                                      parent.appendChild(placeholder);
                                    }
                                  }}
                                />
                              </div>
                            ) : tiktok ? (
                              <div className="absolute inset-0">
                                <Image
                                  src={tiktok.thumbnail}
                                  alt={conteudo.titulo}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    // Se a imagem falhar, mostra o placeholder do TikTok
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      const placeholder = document.createElement('div');
                                      placeholder.className = 'absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center text-white';
                                      placeholder.innerHTML = `
                                        <div class="text-center">
                                          <div class="text-8xl mb-4">🎵</div>
                                          <div class="text-2xl font-bold">TikTok</div>
                                        </div>
                                      `;
                                      parent.appendChild(placeholder);
                                    }
                                  }}
                                />
                              </div>
                            ) : twitch ? (
                              <div className="absolute inset-0">
                                <Image
                                  src={twitch.thumbnail}
                                  alt={conteudo.titulo}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    // Se a imagem falhar, mostra o placeholder do Twitch
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      const placeholder = document.createElement('div');
                                      placeholder.className = 'absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white';
                                      placeholder.innerHTML = `
                                        <div class="text-center">
                                          <div class="text-8xl mb-4">📺</div>
                                          <div class="text-2xl font-bold">Twitch ${twitch.type === 'live' ? 'Live' : 'Video'}</div>
                                        </div>
                                      `;
                                      parent.appendChild(placeholder);
                                    }
                                  }}
                                />
                              </div>
                            ) : null}
                            
                                                      {/* Content Overlay */}
                             <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-1">
                              <div className="text-center text-white p-6 max-w-md">
                                <div className="text-2xl font-bold mb-3">
                                  {conteudo.titulo.length > 33 ? conteudo.titulo.substring(0, 33) + '...' : conteudo.titulo}
                                </div>
                                <div className="text-sm text-gray-200 mb-4">{conteudo.descricao}</div>
                                <div className="flex items-center justify-center space-x-4 text-xs">
                                  <span className="flex items-center space-x-1">
                                    <div className="w-4 h-4 rounded-full overflow-hidden border border-white/30">
                                      {conteudo.criador.avatarUrl && (
            <Image
                                          src={conteudo.criador.avatarUrl}
                                          alt={conteudo.criador.nome}
                                          width={16}
                                          height={16}
                                          className="w-full h-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <span>{conteudo.criador.nome}</span>
                                  </span>
                                                                   <span>•</span>
                                 <span>{getTipoLabel(conteudo.tipo)}</span>
                                 <span>•</span>
                                 <span>{conteudo.data}</span>
                                                                   {/* Indicador de popularidade no slider */}
                                  {(conteudo.visualizacoes || conteudo.curtidas || conteudo.compartilhamentos) && (
                                    <>
                                      <span>•</span>
                                      <span className="text-yellow-400">
                                        🔥 {conteudo.visualizacoes || 0}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Clickable Link Overlay */}
                            <Link href={conteudo.link} className="absolute inset-0 z-10">
                              <span className="sr-only">Ver conteúdo: {conteudo.titulo}</span>
                            </Link>
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
         <div className="flex-1 w-full mt-12">
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
              <div className="text-gray-400 mb-2">📝</div>
              <div className="text-gray-400">Nenhum conteúdo disponível no momento.</div>
              <div className="text-sm text-gray-500 mt-2">
                Os criadores ainda não publicaram conteúdos.
              </div>
            </div>
          ) : (
                         <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-sss-light/30 scrollbar-track-transparent">
              {conteudos.map((conteudo) => {
                const yt = getYoutubeInfo(conteudo.url || '');
                const insta = getInstagramInfo(conteudo.url || '');
                const tiktok = getTikTokInfo(conteudo.url || '');
                const twitch = getTwitchInfo(conteudo.url || '');
                
                return (
                <div key={conteudo.id} className="bg-sss-dark/50 backdrop-blur-sm border border-sss-light/30 rounded-xl p-4 hover:border-sss-accent/50 hover:bg-sss-dark/70 transition-all duration-300 group">
                                      <div className="flex items-start space-x-3">
                      {/* Preview do conteúdo */}
                      <div className="flex-shrink-0">
                        {conteudo.preview ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-sss-light/30 bg-sss-dark/30">
                            <Image
                              src={conteudo.preview}
                              alt={conteudo.titulo}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : yt ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-sss-light/30 bg-sss-dark/30">
                            <Image
                              src={yt.thumbnail}
                              alt={conteudo.titulo}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : insta ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-sss-light/30 bg-sss-dark/30">
                            <Image
                              src={insta.thumbnail}
                              alt={conteudo.titulo}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                // Se a imagem falhar, mostra o placeholder do Instagram
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white group-hover:from-pink-600 group-hover:to-purple-700 transition-all rounded-lg';
                                  placeholder.innerHTML = `
                                    <div class="text-center">
                                      <svg class="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                      </svg>
                                    </div>
                                  `;
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          </div>
                        ) : tiktok ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-sss-light/30 bg-sss-dark/30">
                            <Image
                              src={tiktok.thumbnail}
                              alt={conteudo.titulo}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                // Se a imagem falhar, mostra o placeholder do TikTok
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'w-16 h-16 bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center text-white transition-all rounded-lg';
                                  placeholder.innerHTML = `
                                    <div class="text-center">
                                      <div class="text-2xl mb-1">🎵</div>
                                      <div class="text-xs font-bold">TikTok</div>
                                    </div>
                                  `;
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          </div>
                        ) : twitch ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-sss-light/30 bg-sss-dark/30">
                            <Image
                              src={twitch.thumbnail}
                              alt={conteudo.titulo}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                // Se a imagem falhar, mostra o placeholder do Twitch
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white transition-all rounded-lg';
                                  placeholder.innerHTML = `
                                    <div class="text-center">
                                      <div class="text-2xl mb-1">📺</div>
                                      <div class="text-xs font-bold">Twitch</div>
                                    </div>
                                  `;
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center group-hover:border-blue-400/50 transition-colors">
                            {getTipoIcon(conteudo.tipo)}
                          </div>
                        )}
                      </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link
                        href={conteudo.link}
                        className="block text-lg text-sss-white font-semibold hover:text-sss-accent truncate transition-colors"
                        title={conteudo.titulo}
                      >
                        {conteudo.titulo.length > 33 ? conteudo.titulo.substring(0, 33) + '...' : conteudo.titulo}
                      </Link>
                                             <div className="flex items-center space-x-2 mt-1 flex-wrap">
                        <div className="flex items-center space-x-2">
                          {conteudo.criador.avatarUrl && (
                            <div className="w-5 h-5 rounded-full overflow-hidden border border-sss-light/30">
                              <Image
                                src={conteudo.criador.avatarUrl}
                                alt={conteudo.criador.nome}
                                width={20}
                                height={20}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="text-sm text-gray-300 font-medium">
                            {conteudo.criador.nome}
                          </span>
                        </div>
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-blue-400 font-medium">
                          {getTipoLabel(conteudo.tipo, conteudo.url)}
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
                           {(conteudo.visualizacoes || conteudo.curtidas || conteudo.compartilhamentos) && (
                             <>
                               <span className="text-gray-500">•</span>
                               <span className="text-xs text-yellow-400 font-medium">
                                 🔥 {conteudo.visualizacoes || 0}
                               </span>
                             </>
                           )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <span className="text-sm text-gray-400 bg-sss-light/10 px-3 py-1 rounded-full border border-sss-light/20">
                        {conteudo.data}
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