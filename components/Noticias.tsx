import React from 'react';
import noticias from '../noticias';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export default function Noticias() {
  return (
    <section className="w-full max-w-5xl mx-auto mt-16 mb-20 flex flex-col md:flex-row gap-12 items-start">
      {/* Banner à esquerda */}
      <div className="w-full md:w-96 flex-shrink-0 rounded-2xl overflow-hidden shadow-xl bg-sss-medium flex flex-col items-center justify-center p-0 md:p-2">
        <a
          href="https://servers.fivem.net/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <img
            src="https://forum.cfx.re/uploads/default/original/4X/2/7/2/272b1e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e.png"
            alt="FiveM Servers"
            className="w-full h-72 object-cover object-center rounded-t-2xl"
          />
          <div className="text-center py-4 bg-sss-medium rounded-b-2xl">
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
        <h2 className="text-3xl font-bold text-sss-white mb-8">Notícias</h2>
        {noticias.length === 0 ? (
          <div className="text-gray-400 text-center py-12">Nenhuma notícia no momento.</div>
        ) : (
          <ul className="flex flex-col gap-6">
            {noticias.map((noticia) => (
              <li key={noticia.id} className="flex items-center bg-sss-medium rounded-xl shadow-md border border-sss-light/20 px-6 py-5 group hover:border-sss-accent hover:shadow-lg transition-all">
                <DocumentTextIcon className="w-7 h-7 text-blue-300 flex-shrink-0 mr-4" />
                <a
                  href={noticia.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-lg text-sss-white font-semibold hover:text-sss-accent truncate"
                  title={noticia.titulo}
                >
                  {noticia.titulo}
                </a>
                <span className="text-sm text-gray-400 ml-6 min-w-[90px] text-right">
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