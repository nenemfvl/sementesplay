'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Simulated notifications data
const notificacoes = [
  {
    id: 1,
    tipo: 'live',
    mensagem: 'StreamerAlpha iniciou uma nova live!',
    hora: '14:05',
    lida: false,
  },
  {
    id: 2,
    tipo: 'conquista',
    mensagem: 'Você desbloqueou a conquista "Primeira Live"!',
    hora: '13:50',
    lida: true,
  },
  {
    id: 3,
    tipo: 'favorito',
    mensagem: 'StreamerBeta foi adicionado aos seus favoritos.',
    hora: '13:30',
    lida: true,
  },
];

export default function NotificacoesPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) router.replace('/login');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Notificações</h1>
      <div className="max-w-xl mx-auto">
        {notificacoes.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Nenhuma notificação encontrada.
          </div>
        ) : (
          <ul className="space-y-4">
            {notificacoes.map((n) => (
              <li
                key={n.id}
                className={`p-4 rounded-lg shadow flex items-center justify-between ${n.lida ? 'bg-gray-100' : 'bg-indigo-50 border-l-4 border-indigo-400'}`}
              >
                <div>
                  <span className="font-semibold text-gray-700 mr-2">[{n.tipo.toUpperCase()}]</span>
                  <span className="text-gray-800">{n.mensagem}</span>
                  <div className="text-xs text-gray-400 mt-1">{n.hora}</div>
                </div>
                {!n.lida && (
                  <span className="ml-4 px-2 py-1 bg-indigo-600 text-white rounded text-xs">Nova</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-10 text-center text-gray-500">
        <p>Receba notificações sobre lives, conquistas e favoritos em tempo real!</p>
      </div>
    </main>
  );
}