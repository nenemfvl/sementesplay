import React from 'react';
import noticias from '../noticias';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

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
            className="block w-full rounded-lg overflow-hidden bg-sss-medium min-h-[192px]"
          >
            <Image
              src="/images/fivem-banner.jpg"
              alt="FiveM Servers"
              width={400}
              height={192}
              className="w-full h-full min-h-[192px] object-cover object-center rounded-t-lg block"
            />
            <div className="text-center py-2 bg-sss-medium rounded-b-lg">
              <div className="text-base font-bold text-sss-white mb-1">FiveM Servers</div>
              <div className="text-xs text-blue-200 underline flex items-center justify-center gap-1">
                Lista de cidades
                <svg width="16" height="16" fill="currentColor" className="inline-block" viewBox="0 0 24 24"><path d="M14 3h7v7h-2V6.414l-9.293 9.293-1.414-1.414L17.586 5H14V3z"/><path d="M5 5h5V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5h-2v5H5V5z"/></svg>
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