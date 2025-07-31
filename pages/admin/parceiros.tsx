import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  EyeIcon,
  TrashIcon,
  NoSymbolIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { auth, User } from '../../lib/auth';

interface Parceiro {
  id: string;
  usuarioId: string;
  nomeCidade: string;
  comissaoMensal: number;
  totalVendas: number;
  codigosGerados: number;
  usuario: {
    id: string;
    nome: string;
    email: string;
    tipo: string;
    nivel: string;
  };
}

interface CodigoCashback {
  id: string;
  codigo: string;
  valor: number;
  usado: boolean;
  dataGeracao: string;
  dataUso?: string;
}

interface Transacao {
  id: string;
  valor: number;
  codigoParceiro: string;
  status: string;
  data: string;
  usuario?: {
    nome: string;
    email: string;
  };
}

interface Estatisticas {
  totalVendas: number;
  totalComissoes: number;
  codigosAtivos: number;
  codigosUsados: number;
  transacoesMes: number;
  usuariosAtivos: number;
}

export default function AdminParceiros() {
  const [user, setUser] = useState<User | null>(null);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParceiro, setSelectedParceiro] = useState<Parceiro | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [codigos, setCodigos] = useState<CodigoCashback[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [aba, setAba] = useState<'dados' | 'codigos' | 'transacoes' | 'estatisticas'>('dados');
  const [banindo, setBanindo] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [showRemoveById, setShowRemoveById] = useState(false);
  const [parceiroIdToRemove, setParceiroIdToRemove] = useState('');

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
    loadParceiros();
  }, []);

  const loadParceiros = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/parceiros');
      if (response.ok) {
        const data = await response.json();
        setParceiros(data.parceiros);
      }
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirDetalhes = async (parceiro: Parceiro) => {
    setSelectedParceiro(parceiro);
    setShowModal(true);
    setAba('dados');
    await Promise.all([
      loadCodigos(parceiro.usuarioId),
      loadTransacoes(parceiro.usuarioId),
      loadEstatisticas(parceiro.usuarioId)
    ]);
  };

  const loadCodigos = async (usuarioId: string) => {
    try {
      const response = await fetch(`/api/parceiros/codigos?usuarioId=${usuarioId}`);
      if (response.ok) {
        const codigosData = await response.json();
        setCodigos(codigosData);
      }
    } catch (error) {
      console.error('Erro ao carregar códigos:', error);
    }
  };

  const loadTransacoes = async (usuarioId: string) => {
    try {
      const response = await fetch(`/api/parceiros/transacoes?usuarioId=${usuarioId}`);
      if (response.ok) {
        const transacoesData = await response.json();
        setTransacoes(transacoesData);
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  const loadEstatisticas = async (usuarioId: string) => {
    try {
      const response = await fetch(`/api/parceiros/estatisticas?usuarioId=${usuarioId}`);
      if (response.ok) {
        const statsData = await response.json();
        setEstatisticas(statsData);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const banirParceiro = async (parceiro: Parceiro) => {
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo do banimento.');
      return;
    }
    setBanindo(true);
    try {
      const response = await fetch(`/api/admin/parceiros/${parceiro.usuarioId}/banir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motivo })
      });
      if (response.ok) {
        alert('Parceiro banido com sucesso!');
        setShowBanModal(false);
        setMotivo('');
        loadParceiros();
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao banir parceiro:', error);
      alert('Erro ao banir parceiro');
    } finally {
      setBanindo(false);
    }
  };

  const removerParceiro = async (parceiro: Parceiro) => {
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo da remoção.');
      return;
    }
    setRemovendo(true);
    try {
      const response = await fetch(`/api/admin/parceiros/${parceiro.usuarioId}/remover`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motivo })
      });
      if (response.ok) {
        alert('Parceiro removido com sucesso!');
        setShowRemoveModal(false);
        setMotivo('');
        loadParceiros();
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao remover parceiro:', error);
      alert('Erro ao remover parceiro');
    } finally {
      setRemovendo(false);
    }
  };

  const removerParceiroPorId = async (parceiroId?: string) => {
    const idToRemove = parceiroId || parceiroIdToRemove
    
    if (!idToRemove.trim()) {
      alert('Selecione um parceiro para remover')
      return
    }

    // Encontrar o parceiro na lista para mostrar o nome
    const parceiro = parceiros.find(p => p.id === idToRemove)
    const nomeParceiro = parceiro ? parceiro.usuario.nome : `ID: ${idToRemove}`

    if (confirm(`Tem certeza que deseja remover o parceiro "${nomeParceiro}"?\n\n⚠️ ATENÇÃO: Esta ação irá remover:\n• Status de parceiro\n• Todos os códigos de cashback gerados\n• Todas as transações relacionadas\n• Todas as estatísticas de parceiro\n• Todas as notificações de parceiro\n• Todas as permissões de parceiro\n\n💬 O usuário voltará ao nível comum.`)) {
      try {
        const token = localStorage.getItem('sementesplay_token')
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        }
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`/api/admin/parceiros/${parceiro?.usuarioId || idToRemove}/remover`, {
          method: 'DELETE',
          credentials: 'include',
          headers,
          body: JSON.stringify({ motivo: 'Remoção por ID - Admin' })
        })

        if (response.ok) {
          const data = await response.json()
          
          // Se o usuário removido for o usuário atual, atualizar a sessão
          if (data.usuarioAtualizado && data.usuarioAtualizado.id === user?.id) {
            // Atualizar dados do usuário na sessão
            const { auth } = await import('../../lib/auth')
            auth.updateUser({
              nivel: data.usuarioAtualizado.nivel,
              tipo: data.usuarioAtualizado.tipo
            })
          }
          
          alert('Parceiro removido com sucesso!')
          setParceiroIdToRemove('')
          setShowRemoveById(false)
          loadParceiros() // Recarregar lista
        } else {
          const error = await response.text()
          alert(`Erro ao remover parceiro: ${error}`)
        }
      } catch (error) {
        console.error('Erro ao remover parceiro:', error)
        alert('Erro ao remover parceiro')
      }
    }
  }

  const parceirosFiltrados = parceiros.filter(parceiro => {
    const termo = searchTerm.toLowerCase();
    return (
      parceiro.usuario.nome.toLowerCase().includes(termo) ||
      parceiro.usuario.email.toLowerCase().includes(termo) ||
      parceiro.nomeCidade.toLowerCase().includes(termo)
    );
  });

  return (
    <>
      <Head>
        <title>Painel Admin - Parceiros</title>
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
                <h1 className="text-3xl font-bold text-sss-white">Parceiros</h1>
                <p className="text-gray-400 mt-1">Gerencie os parceiros do SementesPLAY</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-sss-accent">{parceiros.length}</div>
              <div className="text-gray-400 text-sm">Total de Parceiros</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou cidade..."
                  className="w-full pl-12 pr-4 py-3 bg-sss-medium border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:border-sss-accent"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <button
                  onClick={() => setShowRemoveById(!showRemoveById)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Remover por ID
                </button>
              </div>
            </div>
            
            {/* Remove by ID section */}
            {showRemoveById && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-red-400 mb-2">
                    Selecione o Parceiro para Remover
                  </h3>
                  <p className="text-sm text-red-300">
                    Clique no parceiro que deseja remover da plataforma
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {parceiros.map((parceiro) => (
                    <button
                      key={parceiro.id}
                      onClick={() => removerParceiroPorId(parceiro.id)}
                      className="p-3 bg-sss-dark border border-red-500/30 rounded-lg hover:bg-red-900/20 transition-colors text-left"
                    >
                      <div className="font-medium text-sss-white">{parceiro.usuario.nome}</div>
                      <div className="text-sm text-gray-400">{parceiro.usuario.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Parceiro
                        </span>
                        <span className="text-xs text-red-400">Clique para remover</span>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setShowRemoveById(false)
                      setParceiroIdToRemove('')
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
                
                <p className="text-xs text-red-400 mt-2">
                  ⚠️ Esta ação irá remover completamente o parceiro e todos os seus dados
                </p>
              </motion.div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sss-accent"></div>
              <span className="ml-3 text-sss-white">Carregando parceiros...</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && parceirosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-sss-white mb-2">Nenhum parceiro encontrado</h3>
              <p className="text-gray-400">
                {searchTerm ? 'Tente ajustar os termos de busca.' : 'Ainda não há parceiros cadastrados.'}
              </p>
            </div>
          )}

          {/* Parceiros Grid */}
          {!loading && parceirosFiltrados.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parceirosFiltrados.map((parceiro, index) => (
                <motion.div
                  key={parceiro.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-sss-medium rounded-lg p-6 border border-sss-light hover:border-sss-accent transition-all duration-300 hover:shadow-lg"
                >
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BuildingOfficeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-sss-white">{parceiro.usuario.nome}</h3>
                        <p className="text-sm text-gray-400">{parceiro.usuario.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => abrirDetalhes(parceiro)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <EyeIcon className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedParceiro(parceiro)
                          setShowBanModal(true)
                        }}
                        className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                        title="Banir parceiro"
                      >
                        <NoSymbolIcon className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedParceiro(parceiro)
                          setShowRemoveModal(true)
                        }}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        title="Remover parceiro"
                      >
                        <TrashIcon className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Informações do Parceiro */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Cidade</span>
                      <span className="text-sss-white font-medium">{parceiro.nomeCidade}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Comissão Mensal</span>
                      <span className="text-green-400 font-semibold">R$ {parceiro.comissaoMensal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Total de Vendas</span>
                      <span className="text-sss-accent font-semibold">R$ {parceiro.totalVendas.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Códigos Gerados</span>
                      <span className="text-blue-400 font-semibold">{parceiro.codigosGerados}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4 pt-4 border-t border-sss-light">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Status</span>
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                        Ativo
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de detalhes do parceiro */}
        {showModal && selectedParceiro && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="bg-sss-medium rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-sss-light"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-sss-white flex items-center">
                  <BuildingOfficeIcon className="w-8 h-8 mr-3 text-sss-accent" />
                  {selectedParceiro.usuario.nome}
                </h2>
                <button 
                  className="text-gray-400 hover:text-sss-white p-1 rounded-lg transition-colors" 
                  onClick={() => setShowModal(false)}
                  title="Fechar modal"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-2 mb-6 border-b border-sss-light">
                <button 
                  className={`px-4 py-2 rounded-t-lg transition-colors ${aba === 'dados' ? 'bg-sss-accent text-white' : 'bg-sss-dark text-gray-400 hover:text-sss-white'}`} 
                  onClick={() => setAba('dados')}
                >
                  <UsersIcon className="w-5 h-5 inline mr-2" /> Dados
                </button>
                <button 
                  className={`px-4 py-2 rounded-t-lg transition-colors ${aba === 'codigos' ? 'bg-sss-accent text-white' : 'bg-sss-dark text-gray-400 hover:text-sss-white'}`} 
                  onClick={() => setAba('codigos')}
                >
                  <DocumentTextIcon className="w-5 h-5 inline mr-2" /> Códigos
                </button>
                <button 
                  className={`px-4 py-2 rounded-t-lg transition-colors ${aba === 'transacoes' ? 'bg-sss-accent text-white' : 'bg-sss-dark text-gray-400 hover:text-sss-white'}`} 
                  onClick={() => setAba('transacoes')}
                >
                  <CreditCardIcon className="w-5 h-5 inline mr-2" /> Transações
                </button>
                <button 
                  className={`px-4 py-2 rounded-t-lg transition-colors ${aba === 'estatisticas' ? 'bg-sss-accent text-white' : 'bg-sss-dark text-gray-400 hover:text-sss-white'}`} 
                  onClick={() => setAba('estatisticas')}
                >
                  <ChartBarIcon className="w-5 h-5 inline mr-2" /> Estatísticas
                </button>
              </div>

              {/* Conteúdo das Tabs */}
              <div className="bg-sss-dark rounded-lg p-6">
                {aba === 'dados' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-sss-white mb-4">Informações Pessoais</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Nome:</span>
                          <span className="text-sss-white font-medium">{selectedParceiro.usuario.nome}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email:</span>
                          <span className="text-sss-white font-medium">{selectedParceiro.usuario.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Nível:</span>
                          <span className="text-sss-accent font-medium">{selectedParceiro.usuario.nivel}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-sss-white mb-4">Informações da Cidade</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cidade:</span>
                          <span className="text-sss-white font-medium">{selectedParceiro.nomeCidade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Comissão Mensal:</span>
                          <span className="text-green-400 font-semibold">R$ {selectedParceiro.comissaoMensal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total de Vendas:</span>
                          <span className="text-sss-accent font-semibold">R$ {selectedParceiro.totalVendas.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {aba === 'codigos' && (
                  <div>
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Códigos de Cashback</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-sss-medium rounded-lg overflow-hidden">
                        <thead className="bg-sss-light">
                          <tr>
                            <th className="px-4 py-3 text-left text-sss-white font-medium">Código</th>
                            <th className="px-4 py-3 text-left text-sss-white font-medium">Valor</th>
                            <th className="px-4 py-3 text-left text-sss-white font-medium">Status</th>
                            <th className="px-4 py-3 text-left text-sss-white font-medium">Data Geração</th>
                          </tr>
                        </thead>
                        <tbody>
                          {codigos.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center py-8 text-gray-400">
                                Nenhum código encontrado.
                              </td>
                            </tr>
                          ) : codigos.map(codigo => (
                            <tr key={codigo.id} className="border-b border-sss-light">
                              <td className="px-4 py-3 font-mono text-sss-white">{codigo.codigo}</td>
                              <td className="px-4 py-3 text-green-400 font-medium">R$ {codigo.valor.toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${codigo.usado ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                                  {codigo.usado ? 'Usado' : 'Ativo'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-400">
                                {new Date(codigo.dataGeracao).toLocaleDateString('pt-BR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {aba === 'transacoes' && (
                  <div>
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Transações</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-sss-medium rounded-lg overflow-hidden">
                        <thead className="bg-sss-light">
                          <tr>
                            <th className="px-4 py-3 text-left text-sss-white font-medium">Código</th>
                            <th className="px-4 py-3 text-left text-sss-white font-medium">Usuário</th>
                            <th className="px-4 py-3 text-left text-sss-white font-medium">Valor</th>
                            <th className="px-4 py-3 text-left text-sss-white font-medium">Status</th>
                            <th className="px-4 py-3 text-left text-sss-white font-medium">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transacoes.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-8 text-gray-400">
                                Nenhuma transação encontrada.
                              </td>
                            </tr>
                          ) : transacoes.map(transacao => (
                            <tr key={transacao.id} className="border-b border-sss-light">
                              <td className="px-4 py-3 font-mono text-sss-white">{transacao.codigoParceiro}</td>
                              <td className="px-4 py-3 text-sss-white">{transacao.usuario?.nome || 'N/A'}</td>
                              <td className="px-4 py-3 text-green-400 font-medium">R$ {transacao.valor.toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  transacao.status === 'aprovada' ? 'bg-green-600 text-white' :
                                  transacao.status === 'pendente' ? 'bg-yellow-600 text-white' :
                                  'bg-red-600 text-white'
                                }`}>
                                  {transacao.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-400">
                                {new Date(transacao.data).toLocaleDateString('pt-BR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {aba === 'estatisticas' && estatisticas && (
                  <div>
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Estatísticas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-sss-medium p-4 rounded-lg border border-sss-light">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="w-8 h-8 text-green-400 mr-3" />
                          <div>
                            <p className="text-gray-400 text-sm">Total de Vendas</p>
                            <p className="text-sss-white font-semibold text-lg">R$ {estatisticas.totalVendas.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-sss-medium p-4 rounded-lg border border-sss-light">
                        <div className="flex items-center">
                          <CreditCardIcon className="w-8 h-8 text-blue-400 mr-3" />
                          <div>
                            <p className="text-gray-400 text-sm">Total de Comissões</p>
                            <p className="text-sss-white font-semibold text-lg">R$ {estatisticas.totalComissoes.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-sss-medium p-4 rounded-lg border border-sss-light">
                        <div className="flex items-center">
                          <DocumentTextIcon className="w-8 h-8 text-purple-400 mr-3" />
                          <div>
                            <p className="text-gray-400 text-sm">Códigos Ativos</p>
                            <p className="text-sss-white font-semibold text-lg">{estatisticas.codigosAtivos}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-sss-medium p-4 rounded-lg border border-sss-light">
                        <div className="flex items-center">
                          <ChartBarIcon className="w-8 h-8 text-yellow-400 mr-3" />
                          <div>
                            <p className="text-gray-400 text-sm">Códigos Usados</p>
                            <p className="text-sss-white font-semibold text-lg">{estatisticas.codigosUsados}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-sss-medium p-4 rounded-lg border border-sss-light">
                        <div className="flex items-center">
                          <CreditCardIcon className="w-8 h-8 text-sss-accent mr-3" />
                          <div>
                            <p className="text-gray-400 text-sm">Transações no Mês</p>
                            <p className="text-sss-white font-semibold text-lg">{estatisticas.transacoesMes}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-sss-medium p-4 rounded-lg border border-sss-light">
                        <div className="flex items-center">
                          <UserGroupIcon className="w-8 h-8 text-green-400 mr-3" />
                          <div>
                            <p className="text-gray-400 text-sm">Usuários Ativos</p>
                            <p className="text-sss-white font-semibold text-lg">{estatisticas.usuariosAtivos}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Banimento */}
        {showBanModal && selectedParceiro && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-sss-medium rounded-lg p-6 w-full max-w-md border border-sss-light"
            >
              <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
                <NoSymbolIcon className="w-6 h-6 mr-2" />
                Banir Parceiro: {selectedParceiro.usuario.nome}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Motivo do Banimento *
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Informe o motivo do banimento..."
                    className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowBanModal(false)
                      setMotivo('')
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => banirParceiro(selectedParceiro)}
                    disabled={banindo}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {banindo ? 'Banindo...' : 'Banir Parceiro'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Remoção */}
        {showRemoveModal && selectedParceiro && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-sss-medium rounded-lg p-6 w-full max-w-md border border-sss-light"
            >
              <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
                <TrashIcon className="w-6 h-6 mr-2" />
                Remover Parceiro: {selectedParceiro.usuario.nome}
              </h3>
              
              <div className="space-y-4">
                <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-3">
                  <p className="text-yellow-200 text-sm">
                    <strong>Atenção:</strong> Esta ação é irreversível. O parceiro será removido e suas permissões serão revogadas.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Motivo da Remoção *
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Informe o motivo da remoção..."
                    className="w-full px-4 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowRemoveModal(false)
                      setMotivo('')
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => removerParceiro(selectedParceiro)}
                    disabled={removendo}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {removendo ? 'Removendo...' : 'Remover Parceiro'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
} 