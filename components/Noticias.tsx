import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, PlayIcon, PhotoIcon, LinkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

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
        const response = await fetch('/api/conteudos/recentes?limit=5');
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

  // Auto-advance slides
  useEffect(() => {
    if (conteudos.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.min(conteudos.length, 3));
      }, 8000); // Change slide every 8 seconds

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
        <div className="w-full md:w-80 flex-shrink-0">
          <h2 className="text-2xl font-bold text-sss-white mb-4 md:mb-6 md:text-left text-center">
            Conteúdos dos Criadores
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
                   <div className="text-lg font-bold text-sss-white mb-2">Conteúdos Recentes</div>
                   <div className="text-sm text-gray-300">
                     Descubra os melhores conteúdos dos criadores da comunidade
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
                   {conteudos.slice(0, 3).map((conteudo, index) => (
                     <div
                       key={conteudo.id}
                       className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                         index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                       }`}
                     >
                       <div className="relative h-full bg-gradient-to-br from-purple-600/30 to-pink-600/30">
                         {/* Background Image */}
                         {conteudo.preview && (
                           <div className="absolute inset-0">
                             <Image
                               src={conteudo.preview}
                               alt={conteudo.titulo}
                               fill
                               className="object-cover opacity-20"
                             />
                           </div>
                         )}
                         
                                                   {/* Content Overlay */}
                          <Link href={conteudo.link} className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/30 transition-colors cursor-pointer">
                            <div className="text-center text-white p-6 max-w-md">
                              <div className="text-2xl font-bold mb-3">{conteudo.titulo}</div>
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
                              </div>
                            </div>
                          </Link>
                       </div>
                     </div>
                   ))}
                 </div>

                                   {/* Navigation Arrows */}
                  {conteudos.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        title="Slide anterior"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full transition-colors flex items-center justify-center text-lg font-bold z-10"
                      >
                        ‹
                      </button>
                      <button
                        onClick={nextSlide}
                        title="Próximo slide"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full transition-colors flex items-center justify-center text-lg font-bold z-10"
                      >
                        ›
                      </button>
                    </>
                  )}

                 {/* Dots Indicator */}
                 {conteudos.length > 1 && (
                   <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
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
               </>
             )}
           </div>
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
                         <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-sss-light/30 scrollbar-track-transparent">
              {conteudos.map((conteudo) => (
                <div key={conteudo.id} className="bg-sss-dark/50 backdrop-blur-sm border border-sss-light/30 rounded-xl p-4 hover:border-sss-accent/50 hover:bg-sss-dark/70 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    {/* Preview do conteúdo */}
                    <div className="flex-shrink-0">
                      {conteudo.preview ? (
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-sss-light/30 bg-sss-dark/30">
                          <Image
                            src={conteudo.preview}
                            alt={conteudo.titulo}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center group-hover:border-blue-400/50 transition-colors">
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
                        {conteudo.titulo}
                      </Link>
                      <div className="flex items-center space-x-3 mt-2">
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
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <span className="text-sm text-gray-400 bg-sss-light/10 px-3 py-1 rounded-full border border-sss-light/20">
                        {conteudo.data}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 