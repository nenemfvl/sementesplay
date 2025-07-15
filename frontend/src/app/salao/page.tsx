import React from "react";

// Simulated featured streamers/videos data
const destaques = [
  {
    id: 1,
    nome: "StreamerAlpha",
    avatar: "/window.svg",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    descricao: "Live de FPS com dicas avançadas.",
  },
  {
    id: 2,
    nome: "StreamerBeta",
    avatar: "/vercel.svg",
    video: "https://www.youtube.com/embed/3GwjfUFyY6M",
    descricao: "Gameplay MOBA e interação com seguidores.",
  },
  {
    id: 3,
    nome: "StreamerGamma",
    avatar: "/globe.svg",
    video: "https://www.youtube.com/embed/oHg5SJYRHA0",
    descricao: "Explorando mundos RPG ao vivo!",
  },
];

export default function Salao() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        Salão de Destaques
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {destaques.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center"
          >
            <img
              src={d.avatar}
              alt={d.nome}
              className="w-16 h-16 rounded-full mb-4 border-4 border-indigo-200"
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {d.nome}
            </h2>
            <p className="text-sm text-gray-500 mb-2">{d.descricao}</p>
            <div className="w-full aspect-video mb-2">
              <iframe
                src={d.video}
                title={d.nome}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-48 rounded"
              ></iframe>
            </div>
            <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
              Seguir
            </button>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center text-gray-500">
        <p>Confira os streamers e vídeos em destaque na plataforma!</p>
      </div>
    </main>
  );
}