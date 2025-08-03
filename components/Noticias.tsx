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
    <section className="w-full max-w-5xl mx-auto mt-8 mb-10 flex flex-col md:flex-row gap-8 items-start">
      <div className="w-full md:w-auto flex flex-col md:flex-row md:items-start gap-8">
        <div className="w-full md:w-80 flex-shrink-0">
          <h2 className="text-2xl font-bold text-sss-white mb-4 md:mb-6 md:text-left text-center">
            Conteúdos dos Criadores
          </h2>
          
          {/* Banner informativo */}
          <div className="block w-full rounded-lg overflow-hidden bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 min-h-[192px] p-6">
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
        <div className="flex-1 w-full mt-16 md:mt-12">
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
            <ul className="divide-y divide-sss-light/15">
              {conteudos.map((conteudo) => (
                <li key={conteudo.id} className="flex items-center py-4 group hover:bg-blue-900/5 transition rounded-lg px-2">
                  <div className="flex items-center space-x-3 flex-1">
                    {getTipoIcon(conteudo.tipo)}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={conteudo.link}
                        className="block text-base text-sss-white font-medium hover:text-sss-accent truncate"
                        title={conteudo.titulo}
                      >
                        {conteudo.titulo}
                      </Link>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-400">
                          por {conteudo.criador.nome}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-400">
                          {getTipoLabel(conteudo.tipo)}
                        </span>
                        {conteudo.categoria && (
                          <>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-400">
                              {conteudo.categoria}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {conteudo.criador.avatarUrl && (
                      <div className="w-6 h-6 rounded-full overflow-hidden">
                        <Image
                          src={conteudo.criador.avatarUrl.replace('http://', 'https://')}
                          alt={conteudo.criador.nome}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <span className="text-xs text-gray-400 min-w-[80px] text-right">
                      {conteudo.data}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
} 