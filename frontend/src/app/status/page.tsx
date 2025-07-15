import React from "react";

// Simulated status/ranking data
const statusNoticias = [
  {
    id: 1,
    titulo: "Nova atualização de ranking!",
    descricao: "O ranking foi atualizado com novos critérios de pontuação.",
    data: "14/07/2025",
  },
  {
    id: 2,
    titulo: "StreamerAlpha alcançou o topo!",
    descricao: "Parabéns ao StreamerAlpha por conquistar a primeira posição no ranking.",
    data: "13/07/2025",
  },
];

const ranking = [
  {
    posicao: 1,
    nome: "StreamerAlpha",
    pontos: 9800,
    avatar: "/window.svg",
  },
  {
    posicao: 2,
    nome: "StreamerBeta",
    pontos: 8700,
    avatar: "/vercel.svg",
  },
  {
    posicao: 3,
    nome: "StreamerGamma",
    pontos: 7600,
    avatar: "/globe.svg",
  },
];

export default function Status() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        Status & Ranking
      </h1>
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">
          Notícias
        </h2>
        <ul className="space-y-4">
          {statusNoticias.map((n) => (
            <li key={n.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-800">{n.titulo}</span>
                <span className="text-xs text-gray-400">{n.data}</span>
              </div>
              <p className="text-gray-600">{n.descricao}</p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">
          Ranking Atual
        </h2>
        <div className="max-w-xl mx-auto">
          <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
            <thead className="bg-indigo-100">
              <tr>
                <th className="py-3 px-4 text-left">Posição</th>
                <th className="py-3 px-4 text-left">Streamer</th>
                <th className="py-3 px-4 text-left">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r) => (
                <tr
                  key={r.posicao}
                  className="border-b last:border-none hover:bg-indigo-50 transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-indigo-700">
                    {r.posicao}
                  </td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <img
                      src={r.avatar}
                      alt={r.nome}
                      className="w-8 h-8 rounded-full border-2 border-indigo-200"
                    />
                    <span className="font-semibold text-gray-800">{r.nome}</span>
                  </td>
                  <td className="py-3 px-4">{r.pontos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="mt-10 text-center text-gray-500">
        <p>
          Acompanhe as novidades e o ranking dos streamers em tempo real!
        </p>
      </div>
    </main>
  );
}