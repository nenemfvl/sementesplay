'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserStatistics, getTopStatistics, Statistics } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Estatisticas() {
  const [userStats, setUserStats] = useState<Statistics | null>(null);
  const [topStats, setTopStats] = useState<{ [category: string]: Statistics[] }>({});
  const [selectedCategory, setSelectedCategory] = useState('totalViews');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  const categories = [
    { key: 'totalViews', label: 'Visualizações', icon: '👁️' },
    { key: 'totalFollowers', label: 'Seguidores', icon: '👥' },
    { key: 'totalLikes', label: 'Curtidas', icon: '❤️' },
    { key: 'totalStreams', label: 'Streams', icon: '📺' },
    { key: 'engagementRate', label: 'Engajamento', icon: '📈' },
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
        const [userData, topData] = await Promise.all([
          getUserStatistics(token),
          getTopStatistics(token, selectedCategory)
        ]);
        setUserStats(userData);
        setTopStats({ [selectedCategory]: topData });
      } catch (error) {
        showToast('Erro ao carregar estatísticas', 'error');
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, selectedCategory, showToast]);

  const loadTopStats = async (category: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const data = await getTopStatistics(token, category);
      setTopStats(prev => ({ ...prev, [category]: data }));
    } catch (error) {
      showToast('Erro ao carregar top estatísticas', 'error');
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (!topStats[category]) {
      loadTopStats(category);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return num.toFixed(1) + '%';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando estatísticas..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Estatísticas Detalhadas
        </h1>

        {/* Estatísticas do Usuário */}
        {userStats && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Suas Estatísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">👁️</span>
                  <div>
                    <p className="text-gray-300 text-sm">Visualizações</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(userStats.totalViews)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">👥</span>
                  <div>
                    <p className="text-gray-300 text-sm">Seguidores</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(userStats.totalFollowers)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">❤️</span>
                  <div>
                    <p className="text-gray-300 text-sm">Curtidas</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(userStats.totalLikes)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">💬</span>
                  <div>
                    <p className="text-gray-300 text-sm">Comentários</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(userStats.totalComments)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">📺</span>
                  <div>
                    <p className="text-gray-300 text-sm">Streams</p>
                    <p className="text-2xl font-bold text-white">{userStats.totalStreams}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">📈</span>
                  <div>
                    <p className="text-gray-300 text-sm">Engajamento</p>
                    <p className="text-2xl font-bold text-white">{formatPercentage(userStats.engagementRate)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Tempo de Transmissão</h3>
                <p className="text-3xl font-bold text-blue-400">{userStats.totalHoursStreamed}h</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Média de Espectadores</h3>
                <p className="text-3xl font-bold text-green-400">{formatNumber(userStats.averageViewers)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Top Rankings */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Top Rankings</h2>
          
          {/* Filtros de Categoria */}
          <div className="flex flex-wrap gap-3 mb-6">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => handleCategoryChange(category.key)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === category.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>

          {/* Lista de Rankings */}
          <div className="space-y-4">
            {topStats[selectedCategory]?.map((stat, index) => (
              <div key={stat.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-white min-w-[3rem]">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div className="flex items-center space-x-3">
                    {stat.user?.avatar && (
                      <img
                        src={stat.user.avatar}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border-2 border-white/20"
                      />
                    )}
                    <div>
                      <p className="text-white font-semibold">
                        {stat.user?.email || 'Usuário'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {selectedCategory === 'engagementRate' 
                          ? formatPercentage(stat[selectedCategory as keyof Statistics] as number)
                          : formatNumber(stat[selectedCategory as keyof Statistics] as number)
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!topStats[selectedCategory] && (
            <div className="text-center py-8">
              <LoadingSpinner size="md" text="Carregando rankings..." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}