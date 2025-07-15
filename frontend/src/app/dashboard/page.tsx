'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserStatistics, getAllUserRankings, Statistics, Ranking } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, rankingsData] = await Promise.all([
          getUserStatistics(token),
          getAllUserRankings(token)
        ]);
        setStatistics(statsData);
        setRankings(rankingsData);
      } catch (error) {
        showToast('Erro ao carregar dados do dashboard', 'error');
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando dashboard..." />
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Dashboard
        </h1>

        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Visualizações Totais</p>
                  <p className="text-3xl font-bold text-white">{formatNumber(statistics.totalViews)}</p>
                </div>
                <div className="text-4xl">👁️</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Seguidores</p>
                  <p className="text-3xl font-bold text-white">{formatNumber(statistics.totalFollowers)}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Curtidas</p>
                  <p className="text-3xl font-bold text-white">{formatNumber(statistics.totalLikes)}</p>
                </div>
                <div className="text-4xl">❤️</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Taxa de Engajamento</p>
                  <p className="text-3xl font-bold text-white">{statistics.engagementRate.toFixed(1)}%</p>
                </div>
                <div className="text-4xl">📈</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Estatísticas Detalhadas */}
          {statistics && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Estatísticas Detalhadas</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Comentários</span>
                  <span className="text-white font-semibold">{formatNumber(statistics.totalComments)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Compartilhamentos</span>
                  <span className="text-white font-semibold">{formatNumber(statistics.totalShares)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Streams Realizados</span>
                  <span className="text-white font-semibold">{statistics.totalStreams}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Horas Transmitidas</span>
                  <span className="text-white font-semibold">{statistics.totalHoursStreamed}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Média de Espectadores</span>
                  <span className="text-white font-semibold">{formatNumber(statistics.averageViewers)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Rankings do Usuário */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Seus Rankings</h2>
            {rankings.length > 0 ? (
              <div className="space-y-4">
                {rankings.map((ranking) => (
                  <div key={ranking.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {ranking.position === 1 ? '🥇' : 
                         ranking.position === 2 ? '🥈' : 
                         ranking.position === 3 ? '🥉' : 
                         `#${ranking.position}`}
                      </span>
                      <div>
                        <p className="text-white font-semibold capitalize">
                          {ranking.category.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {formatNumber(ranking.score)} pontos
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 ${getRankingColor(ranking.change)}`}>
                      <span>{getRankingIcon(ranking.change)}</span>
                      {ranking.change !== 0 && (
                        <span className="text-sm">
                          {Math.abs(ranking.change)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Nenhum ranking disponível ainda
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}