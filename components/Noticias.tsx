import React from 'react';
import noticias from '../noticias';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export default function Noticias() {
  return (
    <section className="w-full max-w-5xl mx-auto mt-12 mb-16 flex flex-col md:flex-row gap-8 items-start">
      {/* Banner à esquerda */}
      <div className="w-full md:w-96 flex-shrink-0 rounded-lg overflow-hidden shadow-lg bg-sss-medium flex flex-col items-center justify-center">
        <a
          href="https://servers.fivem.net/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <img
            src="https://forum.cfx.re/uploads/default/original/4X/2/7/2/272b1e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e.png"
            alt="FiveM Servers"
            className="w-full h-72 object-cover object-center"
          />
          <div className="text-center py-3">
            <div className="text-2xl font-bold text-sss-white mb-1">FiveM Servers</div>
            <div className="text-sm text-blue-200 underline flex items-center justify-center gap-1">
              Aviso de CM
              <svg width="16" height="16" fill="currentColor" className="inline-block"><path d="M12.293 4.293a1 1 0 0 1 1.414 1.414l-7 7a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L6 10.586l6.293-6.293z"/></svg>
            </div>
          </div>
        </a>
      </div>
      {/* Lista de notícias à direita */}
      <div className="flex-1 w-full">
        <h2 className="text-3xl font-bold text-sss-white mb-6">Notícias</h2>
        {noticias.length === 0 ? (
          <div className="text-gray-400 text-center py-12">Nenhuma notícia no momento.</div>
        ) : (
          <ul className="space-y-2">
            {noticias.map((noticia) => (
              <li key={noticia.id} className="flex items-center border-b border-sss-light/20 py-3 group hover:bg-blue-900/10 transition">
                <DocumentTextIcon className="w-6 h-6 text-blue-300 flex-shrink-0 mr-3" />
                <a
                  href={noticia.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-base text-sss-white font-medium hover:text-sss-accent truncate"
                  title={noticia.titulo}
                >
                  {noticia.titulo}
                </a>
                <span className="text-xs text-gray-400 ml-4 min-w-[90px] text-right">
                  {noticia.data}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
} 