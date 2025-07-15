import React from "react";
import Link from 'next/link'

// Simulated highlights, news, and promotions data
const destaques = [
  {
    id: 1,
    titulo: "Live especial de FPS",
    descricao: "Assista agora a live com dicas avançadas!",
    imagem: "/window.svg",
  },
  {
    id: 2,
    titulo: "Promoção de apoiador",
    descricao: "Ganhe benefícios exclusivos ao apoiar seu streamer favorito.",
    imagem: "/vercel.svg",
  },
];

const noticias = [
  {
    id: 1,
    titulo: "Nova funcionalidade: Rankings em tempo real",
    descricao: "Acompanhe o desempenho dos streamers ao vivo!",
  },
  {
    id: 2,
    titulo: "Atualização de conquistas",
    descricao: "Novas conquistas disponíveis para desbloquear.",
  },
];

const promocoes = [
  {
    id: 1,
    titulo: "Sorteio mensal de apoiadores",
    descricao: "Participe e concorra a prêmios exclusivos!",
  },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-50">
      {/* Banner principal */}
      <section className="w-full mb-8">
        <div className="bg-blue-700 text-white p-8 rounded-lg shadow-lg flex flex-col items-center">
          <h1 className="text-5xl font-extrabold mb-2">SementesPLAY</h1>
          <h2 className="text-xl mb-4">Conectando streamers e influenciadores a jogadores e cidades de FiveM</h2>
          <div className="flex gap-4">
            <button className="bg-white text-blue-700 px-6 py-2 rounded font-semibold hover:bg-blue-100">Registrar</button>
            <button className="bg-white text-blue-700 px-6 py-2 rounded font-semibold hover:bg-blue-100">Login</button>
          </div>
        </div>
      </section>
      {/* Destaques de streamers/influenciadores */}
      <section className="w-full mb-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Destaques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {destaques.map((d) => (
            <div key={d.id} className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
              <img src={d.imagem} alt={d.titulo} className="w-16 h-16 rounded-full border-4 border-indigo-200" />
              <div>
                <h3 className="text-lg font-bold text-gray-800">{d.titulo}</h3>
                <p className="text-gray-600">{d.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Notícias e eventos */}
      <section className="w-full mb-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Notícias</h2>
        <ul className="space-y-4">
          {noticias.map((n) => (
            <li key={n.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-gray-800 mb-1">{n.titulo}</h3>
              <p className="text-gray-600">{n.descricao}</p>
            </li>
          ))}
        </ul>
      </section>
      {/* Promoções */}
      <section className="w-full mb-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Promoções Ativas</h2>
        <ul className="space-y-4">
          {promocoes.map((p) => (
            <li key={p.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-gray-800 mb-1">{p.titulo}</h3>
              <p className="text-gray-600">{p.descricao}</p>
            </li>
          ))}
        </ul>
      </section>
      <div className="mt-10 text-center text-gray-500">
        <p>Explore todas as funcionalidades e torne-se parte da comunidade!</p>
      </div>
    </main>
  );
}
