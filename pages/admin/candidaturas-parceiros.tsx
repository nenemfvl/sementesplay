import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { auth, User } from '../../lib/auth';

interface CandidaturaParceiro {
  id: string;
  usuarioId: string;
  nome: string;
  email: string;
  telefone: string;
  nomeCidade: string;
  siteCidade?: string;
  descricao: string;
  experiencia: string;
  expectativa: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  dataCandidatura: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
  };
}

export default function AdminCandidaturasParceiros() {
  const [, setUser] = useState<User | null>(null);
  const [candidaturas, setCandidaturas] = useState<CandidaturaParceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidatura, setSelectedCandidatura] = useState<CandidaturaParceiro | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [aprovarLoading, setAprovarLoading] = useState(false);
  const [rejeitarLoading, setRejeitarLoading] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');

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
    loadCandidaturas();
  }, []);

  const loadCandidaturas = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/candidaturas-parceiros');
      if (response.ok) {
        const data = await response.json();
        setCandidaturas(data.candidaturas);
      }
    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirDetalhes = (candidatura: CandidaturaParceiro) => {
    setSelectedCandidatura(candidatura);
    setShowModal(true);
  };

  const aprovarCandidatura = async (candidatura: CandidaturaParceiro) => {
    setAprovarLoading(true);
    try {
      const response = await fetch(`/api/admin/candidaturas-parceiros/${candidatura.id}/aprovar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        alert('Candidatura aprovada com sucesso!');
        setShowModal(false);
        loadCandidaturas();
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao aprovar candidatura:', error);
      alert('Erro ao aprovar candidatura');
    } finally {
      setAprovarLoading(false);
    }
  };

  const rejeitarCandidatura = async (candidatura: CandidaturaParceiro) => {
    if (!motivoRejeicao.trim()) {
      alert('Por favor, informe o motivo da rejeição.');
      return;
    }
    setRejeitarLoading(true);
    try {
      const response = await fetch(`/api/admin/candidaturas-parceiros/${candidatura.id}/rejeitar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motivo: motivoRejeicao })
      });
      if (response.ok) {
        alert('Candidatura rejeitada com sucesso!');
        setShowModal(false);
        setMotivoRejeicao('');
        loadCandidaturas();
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao rejeitar candidatura:', error);
      alert('Erro ao rejeitar candidatura');
    } finally {
      setRejeitarLoading(false);
    }
  };

  const candidaturasFiltradas = candidaturas.filter(candidatura => {
    const termo = searchTerm.toLowerCase();
    return (
      candidatura.nome.toLowerCase().includes(termo) ||
      candidatura.email.toLowerCase().includes(termo) ||
      candidatura.nomeCidade.toLowerCase().includes(termo) ||
      candidatura.status.toLowerCase().includes(termo)
    );
  });

  const candidaturasPendentes = candidaturasFiltradas.filter(c => c.status === 'pendente');
  const candidaturasAprovadas = candidaturasFiltradas.filter(c => c.status === 'aprovada');
  const candidaturasRejeitadas = candidaturasFiltradas.filter(c => c.status === 'rejeitada');

  return (
    <>
      <Head>
        <title>Painel Admin - Candidaturas Parceiros</title>
      </Head>
      <div className="min-h-screen bg-sss-dark p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button 
                onClick={() => window.location.href = '/admin'}
                className="mr-4 p-2 bg-sss-medium hover:bg-sss-light rounded-lg transition-colors"
                title="Voltar ao painel admin"
              >
                <ArrowLeftIcon className="w-6 h-6 text-sss-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-sss-white">Candidaturas Parceiros</h1>
                <p className="text-gray-400 mt-1">Gerencie as candidaturas para se tornar parceiro</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-sss-accent">{candidaturas.length}</div>
              <div className="text-gray-400 text-sm">Total de Candidaturas</div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <div className="flex items-center">
                <ClockIcon className="w-8 h-8 text-yellow-400 mr-3" />
                <div>
                  <p className="text-gray-400 text-sm">Pendentes</p>
                  <p className="text-sss-white font-semibold text-2xl">{candidaturasPendentes.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <div className="flex items-center">
                <CheckIcon className="w-8 h-8 text-green-400 mr-3" />
                <div>
                  <p className="text-gray-400 text-sm">Aprovadas</p>
                  <p className="text-sss-white font-semibold text-2xl">{candidaturasAprovadas.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <div className="flex items-center">
                <XMarkIcon className="w-8 h-8 text-red-400 mr-3" />
                <div>
                  <p className="text-gray-400 text-sm">Rejeitadas</p>
                  <p className="text-sss-white font-semibold text-2xl">{candidaturasRejeitadas.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email, cidade ou status..."
                className="w-full pl-12 pr-4 py-3 bg-sss-medium border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:border-sss-accent"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sss-accent"></div>
              <span className="ml-3 text-sss-white">Carregando candidaturas...</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && candidaturasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-sss-white mb-2">Nenhuma candidatura encontrada</h3>
              <p className="text-gray-400">
                {searchTerm ? 'Tente ajustar os termos de busca.' : 'Ainda não há candidaturas de parceiros.'}
              </p>
            </div>
          )}

          {/* Candidaturas Grid */}
          {!loading && candidaturasFiltradas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidaturasFiltradas.map((candidatura, index) => (
                <motion.div
                  key={candidatura.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-sss-medium rounded-lg p-6 border border-sss-light hover:border-sss-accent transition-all duration-300 hover:shadow-lg"
                >
                  {/* Header do Card */}
                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BuildingOfficeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="font-semibold text-sss-white">{candidatura.nome}</h3>
                        <p className="text-sm text-gray-400">{candidatura.email}</p>
                      </div>
                    </div>
                    
                    {/* Botões de Ação */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => abrirDetalhes(candidatura)}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center justify-center"
                        title="Ver detalhes"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Ver
                      </button>
                      {candidatura.status === 'pendente' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedCandidatura(candidatura);
                              setShowModal(true);
                            }}
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm flex items-center justify-center"
                            title="Aprovar candidatura"
                          >
                            <CheckIcon className="w-4 h-4 mr-1" />
                            Aprovar
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCandidatura(candidatura);
                              setShowModal(true);
                            }}
                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm flex items-center justify-center"
                            title="Rejeitar candidatura"
                          >
                            <XMarkIcon className="w-4 h-4 mr-1" />
                            Rejeitar
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Informações da Candidatura */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Cidade</span>
                      <span className="text-sss-white font-medium">{candidatura.nomeCidade}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Telefone</span>
                      <span className="text-sss-white font-medium">{candidatura.telefone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Data</span>
                      <span className="text-sss-white font-medium">
                        {new Date(candidatura.dataCandidatura).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4 pt-4 border-t border-sss-light">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Status</span>
                      <span className={`px-2 py-1 text-white text-xs rounded-full ${
                        candidatura.status === 'pendente' ? 'bg-yellow-600' :
                        candidatura.status === 'aprovada' ? 'bg-green-600' :
                        'bg-red-600'
                      }`}>
                        {candidatura.status === 'pendente' ? 'Pendente' :
                         candidatura.status === 'aprovada' ? 'Aprovada' : 'Rejeitada'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de detalhes da candidatura */}
        {showModal && selectedCandidatura && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="bg-sss-medium rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-sss-light"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-sss-white flex items-center">
                  <BuildingOfficeIcon className="w-8 h-8 mr-3 text-sss-accent" />
                  Candidatura: {selectedCandidatura.nome}
                </h2>
                <button 
                  className="text-gray-400 hover:text-sss-white p-1 rounded-lg transition-colors" 
                  onClick={() => setShowModal(false)}
                  title="Fechar modal"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-sss-dark rounded-lg p-6 space-y-6">
                {/* Informações Pessoais */}
                <div>
                  <h3 className="text-lg font-semibold text-sss-white mb-4 flex items-center">
                    <UsersIcon className="w-5 h-5 mr-2" />
                    Informações Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 text-sm">Nome:</span>
                      <p className="text-sss-white font-medium">{selectedCandidatura.nome}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Email:</span>
                      <p className="text-sss-white font-medium">{selectedCandidatura.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Telefone:</span>
                      <p className="text-sss-white font-medium">{selectedCandidatura.telefone}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Data da Candidatura:</span>
                      <p className="text-sss-white font-medium">
                        {new Date(selectedCandidatura.dataCandidatura).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informações da Cidade */}
                <div>
                  <h3 className="text-lg font-semibold text-sss-white mb-4 flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                    Informações da Cidade
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Nome da Cidade:</span>
                      <p className="text-sss-white font-medium">{selectedCandidatura.nomeCidade}</p>
                    </div>
                    {selectedCandidatura.siteCidade && (
                      <div>
                        <span className="text-gray-400 text-sm">Site da Cidade:</span>
                        <p className="text-sss-white font-medium">{selectedCandidatura.siteCidade}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Descrição e Experiência */}
                <div>
                  <h3 className="text-lg font-semibold text-sss-white mb-4 flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    Detalhes da Candidatura
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-400 text-sm">Descrição:</span>
                      <p className="text-sss-white mt-1 bg-sss-medium p-3 rounded-lg">
                        {selectedCandidatura.descricao}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Experiência:</span>
                      <p className="text-sss-white mt-1 bg-sss-medium p-3 rounded-lg">
                        {selectedCandidatura.experiencia}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Expectativa:</span>
                      <p className="text-sss-white mt-1 bg-sss-medium p-3 rounded-lg">
                        {selectedCandidatura.expectativa}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span className="text-gray-400 text-sm">Status Atual:</span>
                  <div className="mt-2">
                    <span className={`px-3 py-1 text-white text-sm rounded-full ${
                      selectedCandidatura.status === 'pendente' ? 'bg-yellow-600' :
                      selectedCandidatura.status === 'aprovada' ? 'bg-green-600' :
                      'bg-red-600'
                    }`}>
                      {selectedCandidatura.status === 'pendente' ? 'Pendente' :
                       selectedCandidatura.status === 'aprovada' ? 'Aprovada' : 'Rejeitada'}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                {selectedCandidatura.status === 'pendente' && (
                  <div className="border-t border-sss-light pt-6">
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Ações</h3>
                    
                    {/* Motivo de Rejeição */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Motivo da Rejeição (se aplicável)
                      </label>
                      <textarea
                        value={motivoRejeicao}
                        onChange={(e) => setMotivoRejeicao(e.target.value)}
                        placeholder="Informe o motivo da rejeição..."
                        className="w-full px-4 py-2 bg-sss-medium border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => aprovarCandidatura(selectedCandidatura)}
                        disabled={aprovarLoading}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {aprovarLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Aprovando...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="w-4 h-4 mr-2" />
                            Aprovar Candidatura
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => rejeitarCandidatura(selectedCandidatura)}
                        disabled={rejeitarLoading}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {rejeitarLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Rejeitando...
                          </>
                        ) : (
                          <>
                            <XMarkIcon className="w-4 h-4 mr-2" />
                            Rejeitar Candidatura
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
} 