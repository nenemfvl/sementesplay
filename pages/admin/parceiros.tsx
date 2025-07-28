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
  ArrowLeftIcon
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
    if (!confirm('Tem certeza que deseja banir este parceiro?')) return;
    setBanindo(true);
    try {
      const response = await fetch(`/api/admin/parceiros/${parceiro.usuarioId}/banir`, {
        method: 'POST'
      });
      if (response.ok) {
        alert('Parceiro banido com sucesso!');
        setShowModal(false);
        loadParceiros();
      } else {
        alert('Erro ao banir parceiro');
      }
    } catch (error) {
      console.error('Erro ao banir parceiro:', error);
      alert('Erro ao banir parceiro');
    } finally {
      setBanindo(false);
    }
  };

  const removerParceiro = async (parceiro: Parceiro) => {
    if (!confirm('Tem certeza que deseja remover este parceiro? Esta ação é irreversível.')) return;
    setRemovendo(true);
    try {
      const response = await fetch(`/api/admin/parceiros/${parceiro.usuarioId}/remover`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Parceiro removido com sucesso!');
        setShowModal(false);
        loadParceiros();
      } else {
        alert('Erro ao remover parceiro');
      }
    } catch (error) {
      console.error('Erro ao remover parceiro:', error);
      alert('Erro ao remover parceiro');
    } finally {
      setRemovendo(false);
    }
  };

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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <ArrowLeftIcon className="w-6 h-6 mr-2 cursor-pointer" onClick={() => window.location.href = '/admin'} />
          <h1 className="text-2xl font-bold">Parceiros</h1>
        </div>
        <div className="mb-4 flex items-center">
          <input
            type="text"
            placeholder="Buscar por nome, email ou cidade..."
            className="px-4 py-2 border rounded-lg w-full max-w-md"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto rounded-lg shadow border">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left">Nome</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Cidade</th>
                <th className="px-6 py-3 text-left">Comissão</th>
                <th className="px-6 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Carregando...</td></tr>
              ) : parceirosFiltrados.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">Nenhum parceiro encontrado.</td></tr>
              ) : (
                parceirosFiltrados.map(parceiro => (
                  <tr key={parceiro.id} className="border-b">
                    <td className="px-6 py-4">{parceiro.usuario.nome}</td>
                    <td className="px-6 py-4">{parceiro.usuario.email}</td>
                    <td className="px-6 py-4">{parceiro.nomeCidade}</td>
                    <td className="px-6 py-4">R$ {parceiro.comissaoMensal.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-500 hover:text-blue-700"
                          title="Ver detalhes"
                          onClick={() => abrirDetalhes(parceiro)}
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          className="text-yellow-500 hover:text-yellow-700"
                          title="Banir parceiro"
                          onClick={() => banirParceiro(parceiro)}
                          disabled={banindo}
                        >
                          <NoSymbolIcon className="w-5 h-5" />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          title="Remover parceiro"
                          onClick={() => removerParceiro(parceiro)}
                          disabled={removendo}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de detalhes do parceiro */}
        {showModal && selectedParceiro && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowModal(false)}>
                ×
              </button>
              <div className="flex space-x-4 mb-6">
                <button className={`px-4 py-2 rounded-lg ${aba === 'dados' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`} onClick={() => setAba('dados')}>
                  <UsersIcon className="w-5 h-5 inline mr-1" /> Dados
                </button>
                <button className={`px-4 py-2 rounded-lg ${aba === 'codigos' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`} onClick={() => setAba('codigos')}>
                  <DocumentTextIcon className="w-5 h-5 inline mr-1" /> Códigos
                </button>
                <button className={`px-4 py-2 rounded-lg ${aba === 'transacoes' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`} onClick={() => setAba('transacoes')}>
                  <CreditCardIcon className="w-5 h-5 inline mr-1" /> Transações
                </button>
                <button className={`px-4 py-2 rounded-lg ${aba === 'estatisticas' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`} onClick={() => setAba('estatisticas')}>
                  <ChartBarIcon className="w-5 h-5 inline mr-1" /> Estatísticas
                </button>
              </div>
              {aba === 'dados' && (
                <div>
                  <h2 className="text-xl font-bold mb-2">{selectedParceiro.usuario.nome}</h2>
                  <p><b>Email:</b> {selectedParceiro.usuario.email}</p>
                  <p><b>Cidade:</b> {selectedParceiro.nomeCidade}</p>
                  <p><b>Comissão mensal:</b> R$ {selectedParceiro.comissaoMensal.toFixed(2)}</p>
                  <p><b>Nível:</b> {selectedParceiro.usuario.nivel}</p>
                </div>
              )}
              {aba === 'codigos' && (
                <div>
                  <h3 className="font-bold mb-2">Códigos de Cashback</h3>
                  <div className="overflow-x-auto max-h-64">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="px-2 py-1">Código</th>
                          <th className="px-2 py-1">Valor</th>
                          <th className="px-2 py-1">Status</th>
                          <th className="px-2 py-1">Data Geração</th>
                        </tr>
                      </thead>
                      <tbody>
                        {codigos.length === 0 ? (
                          <tr><td colSpan={4} className="text-center py-4">Nenhum código encontrado.</td></tr>
                        ) : codigos.map(codigo => (
                          <tr key={codigo.id}>
                            <td className="px-2 py-1 font-mono">{codigo.codigo}</td>
                            <td className="px-2 py-1">R$ {codigo.valor.toFixed(2)}</td>
                            <td className="px-2 py-1">{codigo.usado ? 'Usado' : 'Ativo'}</td>
                            <td className="px-2 py-1">{new Date(codigo.dataGeracao).toLocaleDateString('pt-BR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {aba === 'transacoes' && (
                <div>
                  <h3 className="font-bold mb-2">Transações</h3>
                  <div className="overflow-x-auto max-h-64">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="px-2 py-1">Código</th>
                          <th className="px-2 py-1">Usuário</th>
                          <th className="px-2 py-1">Valor</th>
                          <th className="px-2 py-1">Status</th>
                          <th className="px-2 py-1">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transacoes.length === 0 ? (
                          <tr><td colSpan={5} className="text-center py-4">Nenhuma transação encontrada.</td></tr>
                        ) : transacoes.map(transacao => (
                          <tr key={transacao.id}>
                            <td className="px-2 py-1 font-mono">{transacao.codigoParceiro}</td>
                            <td className="px-2 py-1">{transacao.usuario?.nome || 'N/A'}</td>
                            <td className="px-2 py-1">R$ {transacao.valor.toFixed(2)}</td>
                            <td className="px-2 py-1">{transacao.status}</td>
                            <td className="px-2 py-1">{new Date(transacao.data).toLocaleDateString('pt-BR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {aba === 'estatisticas' && estatisticas && (
                <div>
                  <h3 className="font-bold mb-2">Estatísticas</h3>
                  <ul className="space-y-1">
                    <li><b>Total de vendas:</b> R$ {estatisticas.totalVendas.toFixed(2)}</li>
                    <li><b>Total de comissões:</b> R$ {estatisticas.totalComissoes.toFixed(2)}</li>
                    <li><b>Códigos ativos:</b> {estatisticas.codigosAtivos}</li>
                    <li><b>Códigos usados:</b> {estatisticas.codigosUsados}</li>
                    <li><b>Transações no mês:</b> {estatisticas.transacoesMes}</li>
                    <li><b>Usuários ativos:</b> {estatisticas.usuariosAtivos}</li>
                  </ul>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
} 