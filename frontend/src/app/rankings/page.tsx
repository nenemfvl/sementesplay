'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllRankings, getRankingsByCategory, Ranking } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Rankings() {
  const [allRankings, setAllRankings] = useState<{ [category: string]: Ranking[] }>({});
  const [selectedCategory, setSelectedCategory] = useState('totalViews');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  const categories = [
    { key: 'totalViews', label: 'Visualizações', icon: '👁️', color: 'text-blue-400' },
    { key: 'totalFollowers', label: 'Seguidores', icon: '👥', color: 'text-green-400' },
    { key: 'totalLikes', label: 'Curtidas', icon: '❤️', color: 'text-red-400' },
    { key: 'totalStreams', label: 'Streams', icon: '📺', color: 'text-purple-400' },
    { key: 'engagementRate', label: 'Engajamento', icon: '📈', color: 'text-yellow-400' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getAllRankings(token);
        setAllRankings(data);
      } catch (error) {
        showToast('Erro ao carregar rankings', 'error');
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, showToast]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return num.toFixed(1) + '%';
  };

  const getRankingIcon = (change: number) => {
    if (change > 0) return '↗️';
    if (change < 0) return '↘️';
    return '➡️';
  };

  const getRankingColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `#${position}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando rankings..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Rankings Globais
        </h1>

        {/* Filtros de Categoria */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                selectedCategory === category.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Ranking Selecionado */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-3">{categories.find(c => c.key === selectedCategory)?.icon}</span>
              Top {categories.find(c => c.key === selectedCategory)?.label}
            </h2>
            <div className="text-sm text-gray-400">
              {allRankings[selectedCategory]?.length || 0} participantes
            </div>
          </div>

          {/* Lista de Rankings */}
          <div className="space-y-4">
            {allRankings[selectedCategory]?.map((ranking, index) => (
              <div key={ranking.id} className="flex items-center justify-between p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <div className="flex items-center space-x-6">
                  <div className="text-3xl font-bold text-white min-w-[4rem] text-center">
                    {getPositionIcon(ranking.position)}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {ranking.user?.avatar && (
                      <img
                        src={ranking.user.avatar}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full border-2 border-white/20"
                      />
                    )}
                    <div>
                      <p className="text-white font-semibold text-lg">
                        {ranking.user?.email || 'Usuário'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Posição anterior: #{ranking.previousPosition || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${categories.find(c => c.key === selectedCategory)?.color}`}>
                      {selectedCategory === 'engagementRate' 
                        ? formatPercentage(ranking.score)
                        : formatNumber(ranking.score)
                      }
                    </p>
                    <p className="text-gray-400 text-sm">
                      {categories.find(c => c.key === selectedCategory)?.label}
                    </p>
                  </div>
                  
                  <div className={`flex items-center space-x-1 ${getRankingColor(ranking.change)}`}>
                    <span className="text-xl">{getRankingIcon(ranking.change)}</span>
                    {ranking.change !== 0 && (
                      <span className="text-sm font-semibold">
                        {Math.abs(ranking.change)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!allRankings[selectedCategory] && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Nenhum ranking disponível para esta categoria</p>
            </div>
          )}
        </div>

        {/* Resumo de Todas as Categorias */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.key} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </h3>
                <span className={`text-2xl ${category.color}`}>
                  {allRankings[category.key]?.length || 0}
                </span>
              </div>
              
              {allRankings[category.key]?.slice(0, 3).map((ranking, index) => (
                <div key={ranking.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                    <span className="text-white text-sm truncate max-w-24">
                      {ranking.user?.email || 'Usuário'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-300">
                    {category.key === 'engagementRate' 
                      ? formatPercentage(ranking.score)
                      : formatNumber(ranking.score)
                    }
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}