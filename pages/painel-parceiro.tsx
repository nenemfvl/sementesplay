import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { auth } from '../lib/auth';
import Navbar from '../components/Navbar';
import { 
  ChartBarIcon, 
  BuildingOfficeIcon, 
  TrophyIcon, 
  CurrencyDollarIcon, 
  CreditCardIcon,
  EyeIcon,
  PlusIcon,
  CogIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  LinkIcon,
  QrCodeIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

type CodigoCashback = {
  id: string;
  codigo: string;
  valor: number;
  usado: boolean;
  dataGeracao: string;
  dataUso?: string;
  usuario?: { nome: string; email: string };
};

type Transacao = {
  id: string;
  valor: number;
  codigoParceiro: string;
  status: string;
  data: string;
  usuario?: { nome: string; email: string };
};

type Estatisticas = {
  totalVendas: number;
  totalComissoes: number;
  codigosAtivos: number;
  codigosUsados: number;
  transacoesMes: number;
  usuariosAtivos: number;
};

type Notificacao = {
  id: string;
  titulo: string;
  mensagem: string;
  data: string;
};

type Repasse = {
  id: string;
  valorCompra: number;
  valorRepasse: number;
  status: string;
  dataCompra: string;
  dataRepasse?: string;
  comprovante?: string;
  usuario?: { nome: string; email: string };
};

export default function PainelParceiro() {
  const [codigos, setCodigos] = useState<CodigoCashback[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ valor: '', quantidade: '1' });
  const [saving, setSaving] = useState(false);
  const valorRef = useRef<HTMLInputElement>(null);
  const [editando, setEditando] = useState<CodigoCashback | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loadingTransacoes, setLoadingTransacoes] = useState(true);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loadingEstatisticas, setLoadingEstatisticas] = useState(true);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(true);
  const [repasses, setRepasses] = useState<Repasse[]>([]);
  const [loadingRepasses, setLoadingRepasses] = useState(true);
  const [parceiro, setParceiro] = useState<any>(null);
  const [loadingParceiro, setLoadingParceiro] = useState(true);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = auth.getUser();
        if (!currentUser) {
          window.location.href = '/login';
          return;
        }
        
        if (currentUser.nivel !== 'parceiro') {
          alert('Acesso negado. Apenas parceiros podem acessar esta área.');
          window.location.href = '/perfil';
          return;
        }
        
        setUser(currentUser);
        setAuthorized(true);
      } catch (error) {
        console.error('Erro na verificação de autorização:', error);
        window.location.href = '/login';
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (authorized && user) {
      fetchParceiro();
      fetchCodigos();
      fetchTransacoes();
      fetchEstatisticas();
      fetchNotificacoes();
      fetchRepasses();
    }
  }, [authorized, user]);

  async function fetchParceiro() {
    try {
      const response = await fetch(`/api/parceiros/perfil?usuarioId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setParceiro(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do parceiro:', error);
    } finally {
      setLoadingParceiro(false);
    }
  }

  async function fetchCodigos() {
    try {
      const response = await fetch(`/api/parceiros/codigos?usuarioId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setCodigos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar códigos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTransacoes() {
    try {
      const response = await fetch(`/api/parceiros/transacoes?usuarioId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setTransacoes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoadingTransacoes(false);
    }
  }

  async function fetchEstatisticas() {
    try {
      const response = await fetch(`/api/parceiros/estatisticas?usuarioId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setEstatisticas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoadingEstatisticas(false);
    }
  }

  async function fetchNotificacoes() {
    try {
      const response = await fetch(`/api/notificacoes?usuarioId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotificacoes(data.slice(0, 5)); // Apenas as 5 mais recentes
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoadingNotificacoes(false);
    }
  }

  async function fetchRepasses() {
    try {
      const response = await fetch(`/api/repasses-parceiro?usuarioId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setRepasses(data);
      }
    } catch (error) {
      console.error('Erro ao carregar repasses:', error);
    } finally {
      setLoadingRepasses(false);
    }
  }

  async function handleGerarCodigo(e: React.FormEvent) {
    e.preventDefault();
    if (!form.valor || !form.quantidade) {
      alert('Preencha todos os campos');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/parceiros/gerar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: parseFloat(form.valor),
          quantidade: parseInt(form.quantidade),
          usuarioId: user?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCodigos(prev => [...data.codigos, ...prev]);
        setForm({ valor: '', quantidade: '1' });
        setShowModal(false);
        alert('Códigos gerados com sucesso!');
        fetchCodigos();
        fetchEstatisticas();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao gerar códigos');
      }
    } catch (error) {
      alert('Erro ao gerar códigos');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoverCodigo(id: string) {
    if (!confirm('Tem certeza que deseja remover este código?')) return;

    try {
      const response = await fetch(`/api/parceiros/codigos/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCodigos(prev => prev.filter(c => c.id !== id));
        alert('Código removido com sucesso!');
        fetchEstatisticas();
      } else {
        alert('Erro ao remover código');
      }
    } catch (error) {
      alert('Erro ao remover código');
    }
  }

  async function copiarCodigo(codigo: string) {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(codigo);
      setTimeout(() => setCopiado(null), 2000);
    } catch (error) {
      alert('Erro ao copiar código');
    }
  }

  const getProgressWidthClass = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 100) return 'w-full';
    if (percentage >= 75) return 'w-3/4';
    if (percentage >= 50) return 'w-1/2';
    if (percentage >= 25) return 'w-1/4';
    return 'w-full';
  };

  // Mostrar loading enquanto verifica autorização
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-sss-white text-lg font-medium">Verificando autorização...</div>
        </div>
      </div>
    );
  }

  // Se não estiver autorizado, não renderizar nada (já foi redirecionado)
  if (!authorized) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Painel do Parceiro | SementesPLAY</title>
      </Head>
      
      {/* Modal de gerar código */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-sss-medium rounded-2xl p-6 w-full max-w-md border border-sss-light shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-sss-white">
                Gerar Códigos de Cashback
              </h2>
              <button 
                onClick={() => { setShowModal(false); setEditando(null); }}
                className="text-gray-400 hover:text-sss-white transition-colors"
                aria-label="Fechar modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleGerarCodigo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Valor do Código (R$)</label>
                <input 
                  ref={valorRef}
                  required 
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  placeholder="10.00" 
                  value={form.valor} 
                  onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quantidade de Códigos</label>
                <input 
                  required 
                  type="number"
                  min="1"
                  max="100"
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  placeholder="1" 
                  value={form.quantidade} 
                  onChange={e => setForm(f => ({ ...f, quantidade: e.target.value }))} 
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-sss-accent text-sss-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sss-white"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Gerar Códigos
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="px-6 py-3 bg-sss-light text-sss-white rounded-lg hover:bg-sss-light transition-colors" 
                  onClick={() => { setShowModal(false); setEditando(null); }} 
                  disabled={saving}
                >
                  Cancelar
                </button>
            </div>
          </form>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-sss-dark">
        <Navbar />
        
        {/* Header */}
        <div className="bg-sss-medium/50 backdrop-blur-sm border-b border-sss-light sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="w-5 h-5 text-sss-white" />
                  </div>
                  <h1 className="text-xl font-bold text-sss-white">Painel do Parceiro</h1>
                </div>
              </div>
              
              <button 
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-sss-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <PlusIcon className="w-4 h-4" />
                Gerar Códigos
              </button>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Estatísticas principais */}
          <section className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-all">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-sss-white">
                      {!loadingEstatisticas ? `R$ ${estatisticas?.totalVendas.toFixed(2) || '0.00'}` : '--'}
                    </div>
                    <div className="text-sm text-green-300">Total de Vendas</div>
                  </div>
                </div>
                <div className="h-1 bg-green-500/20 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full ${getProgressWidthClass(estatisticas?.totalVendas || 0, 10000)}`}></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-all">
                    <CreditCardIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-sss-white">
                      {!loadingEstatisticas ? estatisticas?.codigosAtivos || 0 : '--'}
                    </div>
                    <div className="text-sm text-blue-300">Códigos Ativos</div>
                  </div>
                </div>
                <div className="h-1 bg-blue-500/20 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full ${getProgressWidthClass(estatisticas?.codigosAtivos || 0, 100)}`}></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition-all">
                    <CheckCircleIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-sss-white">
                      {!loadingEstatisticas ? estatisticas?.codigosUsados || 0 : '--'}
                    </div>
                    <div className="text-sm text-purple-300">Códigos Usados</div>
                  </div>
                </div>
                <div className="h-1 bg-purple-500/20 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full ${getProgressWidthClass(estatisticas?.codigosUsados || 0, 50)}`}></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center group-hover:bg-yellow-500/30 transition-all">
                    <UsersIcon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-sss-white">
                      {!loadingEstatisticas ? estatisticas?.usuariosAtivos || 0 : '--'}
                    </div>
                    <div className="text-sm text-yellow-300">Usuários Ativos</div>
                  </div>
                </div>
                <div className="h-1 bg-yellow-500/20 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full ${getProgressWidthClass(estatisticas?.usuariosAtivos || 0, 100)}`}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Gestão de Códigos */}
          <section className="mb-8">
            <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
              <div className="p-6 border-b border-sss-light">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <CreditCardIcon className="w-5 h-5 text-sss-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-sss-white">Seus Códigos de Cashback</h2>
                      <p className="text-sm text-gray-400">Gerencie seus códigos de desconto</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-400">Carregando códigos...</span>
                  </div>
                ) : codigos && codigos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {codigos.map((codigo) => (
                      <div key={codigo.id} className="bg-sss-light/50 rounded-xl overflow-hidden hover:bg-sss-light/70 transition-all duration-300 group border border-sss-light hover:border-gray-500">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <CreditCardIcon className="w-5 h-5 text-blue-400" />
                              <span className="text-sss-white font-medium">Código</span>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              codigo.usado 
                                ? 'bg-red-500/20 text-red-400' 
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                              {codigo.usado ? 'Usado' : 'Ativo'}
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-400">Código</p>
                              <div className="flex items-center space-x-2">
                                <p className="text-lg font-mono text-sss-white">{codigo.codigo}</p>
                                <button
                                  onClick={() => copiarCodigo(codigo.codigo)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  aria-label={copiado === codigo.codigo ? "Código copiado" : "Copiar código"}
                                  title={copiado === codigo.codigo ? "Código copiado" : "Copiar código"}
                                >
                                  {copiado === codigo.codigo ? (
                                    <CheckIcon className="w-4 h-4" />
                                  ) : (
                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-400">Valor</p>
                              <p className="text-lg font-bold text-sss-accent">
                                R$ {codigo.valor.toFixed(2)}
                              </p>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <div>
                                <p className="text-gray-400">Gerado em</p>
                                <p className="text-sss-white">
                                  {new Date(codigo.dataGeracao).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              {codigo.dataUso && (
                                <div>
                                  <p className="text-gray-400">Usado em</p>
                                  <p className="text-sss-white">
                                    {new Date(codigo.dataUso).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {codigo.usuario && (
                              <div>
                                <p className="text-sm text-gray-400">Usado por</p>
                                <p className="text-sss-white">{codigo.usuario.nome}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-sss-light">
                            <div className="flex space-x-2">
                              {!codigo.usado && (
                                <button 
                                  className="text-red-400 hover:text-red-300 transition-colors p-1" 
                                  onClick={() => handleRemoverCodigo(codigo.id)}
                                  title="Remover"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => copiarCodigo(codigo.codigo)}
                                className="bg-blue-600 hover:bg-blue-700 text-sss-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                              >
                                {copiado === codigo.codigo ? 'Copiado!' : 'Copiar'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum código gerado ainda</p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="mt-4 bg-sss-accent text-sss-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Gerar Primeiro Código
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Transações Recentes */}
          <section className="mb-8">
            <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
              <div className="p-6 border-b border-sss-light">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-sss-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-sss-white">Transações Recentes</h2>
                    <p className="text-sm text-gray-400">Histórico de vendas e códigos utilizados</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {loadingTransacoes ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                    <span className="ml-3 text-gray-400">Carregando transações...</span>
                  </div>
                ) : transacoes && transacoes.length > 0 ? (
                  <div className="space-y-4">
                    {transacoes.slice(0, 5).map((transacao) => (
                      <div key={transacao.id} className="flex items-center justify-between p-4 bg-sss-light/30 rounded-lg hover:bg-sss-light/50 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-sss-white font-medium">
                              Código: {transacao.codigoParceiro}
                            </p>
                            <p className="text-sm text-gray-400">
                              {transacao.usuario?.nome || 'Usuário'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sss-white font-semibold">
                            R$ {transacao.valor.toFixed(2)}
                          </p>
                          <p className={`text-sm ${
                            transacao.status === 'aprovada' ? 'text-green-400' : 
                            transacao.status === 'pendente' ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {transacao.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhuma transação encontrada</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Repasses Pendentes */}
          <section className="mb-8">
            <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
              <div className="p-6 border-b border-sss-light">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-sss-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-sss-white">Repasses Pendentes</h2>
                    <p className="text-sm text-gray-400">Compras aguardando repasse</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {loadingRepasses ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                    <span className="ml-3 text-gray-400">Carregando repasses...</span>
                  </div>
                ) : repasses && repasses.length > 0 ? (
                  <div className="space-y-4">
                    {repasses.filter(r => r.status === 'pendente').slice(0, 5).map((repasse) => (
                      <div key={repasse.id} className="flex items-center justify-between p-4 bg-sss-light/30 rounded-lg hover:bg-sss-light/50 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                            <ClockIcon className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-sss-white font-medium">
                              Compra: R$ {repasse.valorCompra.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-400">
                              Repasse: R$ {repasse.valorRepasse.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sss-white font-semibold">
                            {new Date(repasse.dataCompra).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm text-orange-400">
                            Pendente
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ArrowTrendingUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum repasse pendente</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Notificações */}
          <section className="mb-8">
            <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
              <div className="p-6 border-b border-sss-light">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <BellIcon className="w-5 h-5 text-sss-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-sss-white">Notificações Recentes</h2>
                    <p className="text-sm text-gray-400">Suas últimas notificações</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {loadingNotificacoes ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                    <span className="ml-3 text-gray-400">Carregando notificações...</span>
                  </div>
                ) : notificacoes && notificacoes.length > 0 ? (
                  <div className="space-y-4">
                    {notificacoes.map((notificacao) => (
                      <div key={notificacao.id} className="p-4 bg-sss-light/30 rounded-lg hover:bg-sss-light/50 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sss-white font-medium">{notificacao.titulo}</h3>
                            <p className="text-gray-400 text-sm mt-1">{notificacao.mensagem}</p>
                          </div>
                          <span className="text-xs text-gray-500 ml-4">
                            {new Date(notificacao.data).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhuma notificação</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
} 