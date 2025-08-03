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

  return (
    <section className="w-full max-w-5xl mx-auto mt-8 mb-10 flex flex-col md:flex-row gap-36 items-stretch">
      <div className="w-full md:w-auto flex flex-col md:flex-row md:items-stretch gap-36">
        <div className="w-full md:w-80 flex-shrink-0">
          <h2 className="text-2xl font-bold text-sss-white mb-4 md:mb-6 md:text-left text-center">
            Conteúdos dos Criadores
          </h2>
          
          {/* Banner informativo */}
                     <div className="block w-full rounded-lg overflow-hidden bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 p-6 flex items-center justify-center h-[500px]">
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
        </div>

        {/* Lista de conteúdos à direita */}
        <div className="flex-1 w-full">
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
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-sss-light/30 scrollbar-track-transparent">
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