import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { auth, User } from '../../lib/auth';

interface Repasse {
  id: string;
  valor: number;
  status: string;
  dataRepasse: Date;
  comprovanteUrl?: string;
  parceiro: {
    id: string;
    nomeCidade: string;
    usuario: {
      nome: string;
      email: string;
    };
  };
  compra: {
    id: string;
    valorCompra: number;
    dataCompra: Date;
    usuario: {
      nome: string;
      email: string;
    };
  };
}

export default function AdminRepasses() {
  const [user, setUser] = useState<User | null>(null);
  const [repasses, setRepasses] = useState<Repasse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [aprovarLoading, setAprovarLoading] = useState<string | null>(null);
  const [rejeitarLoading, setRejeitarLoading] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = auth.getUser();
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    if (Number(currentUser.nivel) < 5) {
      alert('Acesso negado. Apenas administradores podem acessar esta área.');
      window.location.href = '/admin';
      return;
    }
    setUser(currentUser);
    loadRepasses();
  }, []);

  const loadRepasses = async () => {
    try {
      const response = await fetch('/api/admin/repasses');
      if (response.ok) {
        const data = await response.json();
        setRepasses(data.repasses.map((r: any) => ({
          ...r,
          dataRepasse: new Date(r.dataRepasse),
          compra: {
            ...r.compra,
            dataCompra: new Date(r.compra.dataCompra)
          }
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar repasses:', error);
    } finally {
      setLoading(false);
    }
  };

  const aprovarRepasse = async (repasseId: string) => {
    setAprovarLoading(repasseId);
    try {
      const response = await fetch('/api/admin/aprovar-repasse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repasseId })
      });
      
      if (response.ok) {
        await loadRepasses();
        alert('Repasse aprovado com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao aprovar repasse:', error);
      alert('Erro ao aprovar repasse');
    } finally {
      setAprovarLoading(null);
    }
  };

  const rejeitarRepasse = async (repasseId: string) => {
    setRejeitarLoading(repasseId);
    try {
      const response = await fetch('/api/admin/rejeitar-repasse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repasseId })
      });
      
      if (response.ok) {
        await loadRepasses();
        alert('Repasse rejeitado com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao rejeitar repasse:', error);
      alert('Erro ao rejeitar repasse');
    } finally {
      setRejeitarLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'text-yellow-400';
      case 'confirmado': return 'text-green-400';
      case 'rejeitado': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <ClockIcon className="w-4 h-4" />;
      case 'confirmado': return <CheckCircleIcon className="w-4 h-4" />;
      case 'rejeitado': return <XCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const filteredRepasses = repasses.filter(repasse => {
    const matchesSearch = 
      repasse.parceiro.nomeCidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repasse.parceiro.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repasse.compra.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || repasse.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Head>
        <title>Repasses | Admin SementesPLAY</title>
      </Head>
      <div className="min-h-screen bg-sss-dark text-sss-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => window.history.back()}
              className="bg-sss-medium hover:bg-sss-light text-sss-white px-4 py-2 rounded-lg transition-colors"
            >
              ← Voltar
            </button>
            <h1 className="text-3xl font-bold text-sss-white">Gestão de Repasses</h1>
          </div>

          {/* Filtros */}
          <div className="bg-sss-medium rounded-lg p-6 border border-sss-light mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por parceiro ou usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-sss-light border border-sss-light rounded-lg pl-10 pr-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all"
                >
                  <option value="todos">Todos os status</option>
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="rejeitado">Rejeitado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Repasses */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sss-accent mx-auto"></div>
              <p className="text-gray-400 mt-4">Carregando repasses...</p>
            </div>
          ) : (
            <div className="bg-sss-medium rounded-lg border border-sss-light overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-sss-light bg-sss-light/50">
                      <th className="text-left p-4 text-gray-400 font-medium">Parceiro</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Compra</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Valor Repasse</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Data</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Comprovante</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRepasses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-400">
                          Nenhum repasse encontrado
                        </td>
                      </tr>
                    ) : (
                      filteredRepasses.map((repasse) => (
                        <tr key={repasse.id} className="border-b border-sss-light/30 hover:bg-sss-light/20 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-sss-white">{repasse.parceiro.nomeCidade}</p>
                              <p className="text-sm text-gray-400">{repasse.parceiro.usuario.nome}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-sss-white">R$ {repasse.compra.valorCompra.toFixed(2)}</p>
                              <p className="text-sm text-gray-400">{repasse.compra.usuario.nome}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <CurrencyDollarIcon className="w-4 h-4 text-green-400" />
                              <span className="font-semibold text-sss-white">R$ {repasse.valor.toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className={`flex items-center gap-2 ${getStatusColor(repasse.status)}`}>
                              {getStatusIcon(repasse.status)}
                              <span className="capitalize">{repasse.status}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-400">
                            {repasse.dataRepasse.toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-4">
                            {repasse.comprovanteUrl ? (
                              <a
                                href={repasse.comprovanteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sss-accent hover:text-sss-accent/80 transition-colors"
                              >
                                <EyeIcon className="w-4 h-4" />
                                Ver
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            {repasse.status === 'pendente' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => aprovarRepasse(repasse.id)}
                                  disabled={aprovarLoading === repasse.id}
                                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                  {aprovarLoading === repasse.id ? 'Aprovando...' : 'Aprovar'}
                                </button>
                                <button
                                  onClick={() => rejeitarRepasse(repasse.id)}
                                  disabled={rejeitarLoading === repasse.id}
                                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                  {rejeitarLoading === repasse.id ? 'Rejeitando...' : 'Rejeitar'}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Estatísticas */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400">Pendentes</span>
              </div>
              <p className="text-2xl font-bold text-sss-white">
                {repasses.filter(r => r.status === 'pendente').length}
              </p>
            </div>
            <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                <span className="text-gray-400">Aprovados</span>
              </div>
              <p className="text-2xl font-bold text-sss-white">
                {repasses.filter(r => r.status === 'confirmado').length}
              </p>
            </div>
            <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
              <div className="flex items-center gap-2">
                <XCircleIcon className="w-5 h-5 text-red-400" />
                <span className="text-gray-400">Rejeitados</span>
              </div>
              <p className="text-2xl font-bold text-sss-white">
                {repasses.filter(r => r.status === 'rejeitado').length}
              </p>
            </div>
            <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">Total</span>
              </div>
              <p className="text-2xl font-bold text-sss-white">
                R$ {repasses.reduce((sum, r) => sum + r.valor, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 