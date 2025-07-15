'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFavoritos, toggleFavorito, Favorito } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
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

    const loadFavoritos = async () => {
      try {
        setLoading(true);
        const data = await getFavoritos(token);
        setFavoritos(data);
      } catch (error) {
        showToast('Erro ao carregar favoritos', 'error');
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavoritos();
  }, [router, showToast]);

  const handleToggleFavorito = async (favoritoId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setToggling(favoritoId);
      const updatedFavorito = await toggleFavorito(token, favoritoId);
      
      setFavoritos(prev => 
        prev.map(f => 
          f.id === favoritoId 
            ? { ...f, favoritado: updatedFavorito.favoritado }
            : f
        )
      );

      showToast(
        updatedFavorito.favoritado 
          ? 'Adicionado aos favoritos! ❤️' 
          : 'Removido dos favoritos',
        'success'
      );
    } catch (error) {
      showToast('Erro ao atualizar favorito', 'error');
    } finally {
      setToggling(null);
    }
  };

  const favoritosAtivos = favoritos.filter(f => f.favoritado).length;
  const totalFavoritos = favoritos.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando favoritos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Favoritos</h1>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 inline-block">
            <p className="text-2xl font-bold text-white">
              {favoritosAtivos} / {totalFavoritos}
            </p>
            <p className="text-gray-300">Itens Favoritados</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-red-400 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(favoritosAtivos / totalFavoritos) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritos.map((favorito) => (
            <div
              key={favorito.id}
              className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border transition-all duration-300 transform hover:scale-105 ${
                favorito.favoritado
                  ? 'border-red-400/50 shadow-lg shadow-red-400/20'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {favorito.favoritado ? '❤️' : favorito.icone}
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${
                  favorito.favoritado ? 'text-red-400' : 'text-white'
                }`}>
                  {favorito.nome}
                </h3>
                
                <p className="text-gray-300 mb-4 text-sm">
                  {favorito.descricao}
                </p>

                <button
                  onClick={() => handleToggleFavorito(favorito.id)}
                  disabled={toggling === favorito.id}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                    favorito.favoritado
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {toggling === favorito.id ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Processando...</span>
                    </div>
                  ) : favorito.favoritado ? (
                    'Remover dos Favoritos'
                  ) : (
                    'Adicionar aos Favoritos'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {favoritos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Nenhum favorito disponível</p>
          </div>
        )}
      </div>
    </div>
  );
}