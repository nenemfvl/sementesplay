'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getConquistas, toggleConquista, Conquista } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Conquistas() {
  const [conquistas, setConquistas] = useState<Conquista[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const loadConquistas = async () => {
      try {
        setLoading(true);
        const data = await getConquistas(token);
        setConquistas(data);
      } catch (error) {
        showToast('Erro ao carregar conquistas', 'error');
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConquistas();
  }, [router, showToast]);

  const handleToggleConquista = async (conquistaId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setToggling(conquistaId);
      const updatedConquista = await toggleConquista(token, conquistaId);
      
      setConquistas(prev => 
        prev.map(c => 
          c.id === conquistaId 
            ? { ...c, conquistada: updatedConquista.conquistada }
            : c
        )
      );

      showToast(
        updatedConquista.conquistada 
          ? 'Conquista desbloqueada! 🎉' 
          : 'Conquista removida',
        'success'
      );
    } catch (error) {
      showToast('Erro ao atualizar conquista', 'error');
    } finally {
      setToggling(null);
    }
  };

  const conquistasConquistadas = conquistas.filter(c => c.conquistada).length;
  const totalConquistas = conquistas.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando conquistas..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Conquistas</h1>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 inline-block">
            <p className="text-2xl font-bold text-white">
              {conquistasConquistadas} / {totalConquistas}
            </p>
            <p className="text-gray-300">Conquistas Desbloqueadas</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(conquistasConquistadas / totalConquistas) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conquistas.map((conquista) => (
            <div
              key={conquista.id}
              className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border transition-all duration-300 transform hover:scale-105 ${
                conquista.conquistada
                  ? 'border-yellow-400/50 shadow-lg shadow-yellow-400/20'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {conquista.conquistada ? '🏆' : conquista.icone}
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${
                  conquista.conquistada ? 'text-yellow-400' : 'text-white'
                }`}>
                  {conquista.nome}
                </h3>
                
                <p className="text-gray-300 mb-4 text-sm">
                  {conquista.descricao}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-yellow-400 font-semibold">
                    {conquista.pontos} pontos
                  </span>
                  {conquista.conquistada && (
                    <span className="text-green-400 text-sm font-medium">
                      ✓ Desbloqueada
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleToggleConquista(conquista.id)}
                  disabled={toggling === conquista.id}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                    conquista.conquistada
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {toggling === conquista.id ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Processando...</span>
                    </div>
                  ) : conquista.conquistada ? (
                    'Remover Conquista'
                  ) : (
                    'Desbloquear Conquista'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {conquistas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Nenhuma conquista disponível</p>
          </div>
        )}
      </div>
    </div>
  );
}