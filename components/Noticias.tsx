import React from 'react';
import noticias from '../noticias';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export default function Noticias() {
  return (
    <section className="w-full max-w-5xl mx-auto mt-8 mb-10 flex flex-col md:flex-row gap-8 items-start">
      {/* Título Notícias acima do banner */}
      <div className="w-full md:w-auto flex flex-col md:flex-row md:items-start gap-8">
        <div className="w-full md:w-80 flex-shrink-0">
          <h2 className="text-2xl font-bold text-sss-white mb-4 md:mb-6 md:text-left text-center">Notícias</h2>
          {/* Banner à esquerda */}
          <a
            href="https://servers.fivem.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-lg overflow-hidden bg-sss-medium"
          >
            <img
              src="https://cdn.fivem.net/img/fivem-og.jpg"
              alt="FiveM Servers"
              className="w-full h-48 object-cover object-center rounded-t-lg"
            />
            <div className="text-center py-2 bg-sss-medium rounded-b-lg">
              <div className="text-base font-bold text-sss-white mb-1">FiveM Servers</div>
              <div className="text-xs text-blue-200 underline flex items-center justify-center gap-1">
                Aviso de CM
                <svg width="14" height="14" fill="currentColor" className="inline-block"><path d="M12.293 4.293a1 1 0 0 1 1.414 1.414l-7 7a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L6 10.586l6.293-6.293z"/></svg>
              </div>
            </div>
          </a>
        </div>
        {/* Lista de notícias à direita */}
        <div className="flex-1 w-full mt-16 md:mt-12">
          {noticias.length === 0 ? (
            <div className="text-gray-400 text-center py-8">Nenhuma notícia no momento.</div>
          ) : (
            <ul className="divide-y divide-sss-light/15">
              {noticias.map((noticia) => (
                <li key={noticia.id} className="flex items-center py-3 group hover:bg-blue-900/5 transition">
                  <DocumentTextIcon className="w-5 h-5 text-blue-300 flex-shrink-0 mr-2" />
                  <a
                    href={noticia.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-base text-sss-white font-medium hover:text-sss-accent truncate"
                    title={noticia.titulo}
                  >
                    {noticia.titulo}
                  </a>
                  <span className="text-xs text-gray-400 ml-4 min-w-[80px] text-right">
                    {noticia.data}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
} 