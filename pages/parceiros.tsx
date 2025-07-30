import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CheckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  PlusIcon,
  ClipboardDocumentIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CreditCardIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { auth, User } from '../lib/auth'
import Navbar from '../components/Navbar';

interface Parceiro {
  id: string
  usuarioId: string
  nomeCidade: string
  comissaoMensal: number
  totalVendas: number
  codigosGerados: number
  usuario?: User
}

interface CodigoCashback {
  id: string
  codigo: string
  valor: number
  usado: boolean
  dataGeracao: string
  dataUso?: string
}

interface Transacao {
  id: string
  valor: number
  codigoParceiro: string
  status: string
  data: string
  usuario?: {
    nome: string
    email: string
  }
}

interface Estatisticas {
  totalVendas: number
  totalComissoes: number
  codigosAtivos: number
  codigosUsados: number
  transacoesMes: number
  usuariosAtivos: number
}

export default function Parceiros() {
  const [user, setUser] = useState<User | null>(null);
  const [parceiro, setParceiro] = useState<Parceiro | null>(null);
  const [candidaturaStatus, setCandidaturaStatus] = useState<string | null>(null);
  const [candidaturaObj, setCandidaturaObj] = useState<any>(null);
  const [codigos, setCodigos] = useState<CodigoCashback[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showGerarCodigo, setShowGerarCodigo] = useState(false);
  const [novoCodigo, setNovoCodigo] = useState({ valor: '', quantidade: '1' });
  const [salvando, setSalvando] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    nomeCidade: '',
    siteCidade: '',
    descricao: '',
    experiencia: '',
    expectativa: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    const currentUser = auth.getUser();
    setUser(currentUser);
    if (currentUser) {
      checkParceiroStatus(currentUser.id);
      checkCandidaturaStatus(currentUser.id);
    } else {
      setLoading(false);
    }
  }, []);

  const checkParceiroStatus = async (usuarioId: string) => {
    try {
      const response = await fetch(`/api/parceiros/perfil?usuarioId=${usuarioId}`);
      if (response.ok) {
        const parceiroData = await response.json();
        setParceiro(parceiroData);
        await Promise.all([
          loadCodigos(usuarioId),
          loadTransacoes(usuarioId),
          loadEstatisticas(usuarioId)
        ]);
      } else {
        setParceiro(null);
      }
    } catch (error) {
      setParceiro(null);
    } finally {
      setLoading(false);
    }
  };

  const checkCandidaturaStatus = async (usuarioId: string) => {
    try {
      const response = await fetch(`/api/parceiros/candidaturas/status?usuarioId=${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        setCandidaturaStatus(data.status);
        setCandidaturaObj(data.candidatura);
      } else {
        setCandidaturaStatus(null);
        setCandidaturaObj(null);
      }
    } catch (error) {
      setCandidaturaStatus(null);
      setCandidaturaObj(null);
    }
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

  const gerarCodigo = async () => {
    if (!novoCodigo.valor || !novoCodigo.quantidade) {
      alert('Preencha todos os campos');
      return;
    }

    setSalvando(true);
    try {
      const res = await fetch('/api/parceiros/gerar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: parseFloat(novoCodigo.valor),
          quantidade: parseInt(novoCodigo.quantidade),
          usuarioId: user?.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCodigos(prev => [...data.codigos, ...prev]);
        setNovoCodigo({ valor: '', quantidade: '1' });
        setShowGerarCodigo(false);
        alert('Códigos gerados com sucesso!');
        if (user) {
          await Promise.all([
            loadCodigos(user.id),
            loadEstatisticas(user.id)
          ]);
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao gerar códigos');
      }
    } catch (error) {
      alert('Erro ao gerar códigos');
    } finally {
      setSalvando(false);
    }
  };

  const copiarCodigo = async (codigo: string) => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(codigo);
      setTimeout(() => setCopiado(null), 2000);
    } catch (error) {
      alert('Erro ao copiar código');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    
    try {
      const response = await fetch('/api/parceiros/candidaturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setEnviando(false);
        setEnviado(true);
        setTimeout(() => {
          setShowModal(false);
          setEnviado(false);
          setFormData({
            nome: '',
            email: '',
            telefone: '',
            nomeCidade: '',
            siteCidade: '',
            descricao: '',
            experiencia: '',
            expectativa: ''
          });
        }, 2000);
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.error}`);
        setEnviando(false);
      }
    } catch (error) {
      console.error('Erro ao enviar candidatura:', error);
      alert('Erro ao enviar candidatura. Tente novamente.');
      setEnviando(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'codigos', label: 'Códigos Cashback', icon: CreditCardIcon },
    { id: 'transacoes', label: 'Transações', icon: DocumentTextIcon },
    { id: 'relatorios', label: 'Relatórios', icon: ArrowTrendingUpIcon },
    { id: 'configuracoes', label: 'Configurações', icon: CogIcon }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-sss-white">Carregando...</div>
      </div>
    );
  }

  // Se for parceiro, mostra painel normalmente
  if (parceiro) {
    return (
      <>
        <Head>
          <title>Parceiros - SementesPLAY</title>
          <meta name="description" content="Página de parceiros do SementesPLAY" />
        </Head>
        <div className="min-h-screen bg-sss-dark">
          <Navbar />
          
          {/* Painel de Parceiro */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-sss-white">Painel Parceiro</h1>
                  <p className="text-gray-400 mt-2">Gerencie sua cidade: {parceiro.nomeCidade}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Comissão Mensal</p>
                    <p className="text-xl font-bold text-sss-accent">R$ {parceiro.comissaoMensal.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-sss-accent/20 rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="w-6 h-6 text-sss-accent" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex space-x-1 bg-sss-medium rounded-lg p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-sss-accent text-white'
                        : 'text-gray-400 hover:text-sss-white hover:bg-sss-light'
                    }`}
                    aria-label={tab.label}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total de Vendas</p>
                          <p className="text-2xl font-bold text-sss-white">
                            R$ {estatisticas?.totalVendas.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Comissões</p>
                          <p className="text-2xl font-bold text-sss-white">
                            R$ {estatisticas?.totalComissoes.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <ChartBarIcon className="w-6 h-6 text-blue-500" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Códigos Ativos</p>
                          <p className="text-2xl font-bold text-sss-white">
                            {estatisticas?.codigosAtivos || 0}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <CreditCardIcon className="w-6 h-6 text-yellow-500" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Usuários Ativos</p>
                          <p className="text-2xl font-bold text-sss-white">
                            {estatisticas?.usuariosAtivos || 0}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <UsersIcon className="w-6 h-6 text-purple-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-sss-medium rounded-lg border border-sss-light">
                    <div className="p-6 border-b border-sss-light">
                      <h3 className="text-lg font-semibold text-sss-white">Transações Recentes</h3>
                    </div>
                    <div className="p-6">
                      {transacoes.length > 0 ? (
                        <div className="space-y-4">
                          {transacoes.slice(0, 5).map((transacao) => (
                            <div key={transacao.id} className="flex items-center justify-between p-4 bg-sss-dark rounded-lg">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                                  <CurrencyDollarIcon className="w-5 h-5 text-sss-accent" />
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
                                  transacao.status === 'aprovada' ? 'text-green-500' : 
                                  transacao.status === 'pendente' ? 'text-yellow-500' : 'text-red-500'
                                }`}>
                                  {transacao.status}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-8">Nenhuma transação encontrada</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'codigos' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-sss-white">Códigos de Cashback</h2>
                    <button
                      onClick={() => setShowGerarCodigo(true)}
                      className="bg-sss-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center space-x-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Gerar Códigos</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {codigos.map((codigo) => (
                      <div key={codigo.id} className="bg-sss-medium rounded-lg border border-sss-light p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <CreditCardIcon className="w-5 h-5 text-sss-accent" />
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
                                className="text-sss-accent hover:text-sss-white transition"
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
                        </div>
                      </div>
                    ))}
                  </div>

                  {codigos.length === 0 && (
                    <div className="text-center py-12">
                      <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Nenhum código gerado ainda</p>
                      <button
                        onClick={() => setShowGerarCodigo(true)}
                        className="mt-4 bg-sss-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                      >
                        Gerar Primeiro Código
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'transacoes' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-sss-white">Histórico de Transações</h2>
                  
                  <div className="bg-sss-medium rounded-lg border border-sss-light">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-sss-light">
                            <th className="text-left p-4 text-gray-400 font-medium">Código</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Usuário</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Valor</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transacoes.map((transacao) => (
                            <tr key={transacao.id} className="border-b border-sss-light/50">
                              <td className="p-4">
                                <span className="font-mono text-sss-white">{transacao.codigoParceiro}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-sss-white">{transacao.usuario?.nome || 'N/A'}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-sss-accent font-semibold">
                                  R$ {transacao.valor.toFixed(2)}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  transacao.status === 'aprovada' ? 'bg-green-500/20 text-green-400' : 
                                  transacao.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400' : 
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {transacao.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="text-gray-400">
                                  {new Date(transacao.data).toLocaleDateString('pt-BR')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {transacoes.length === 0 && (
                      <div className="text-center py-12">
                        <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">Nenhuma transação encontrada</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'relatorios' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-sss-white">Relatórios</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-sss-medium rounded-lg border border-sss-light p-6">
                      <h3 className="text-lg font-semibold text-sss-white mb-4">Relatório de Vendas</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total de Vendas</span>
                          <span className="text-sss-white font-semibold">
                            R$ {estatisticas?.totalVendas.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Comissões</span>
                          <span className="text-sss-accent font-semibold">
                            R$ {estatisticas?.totalComissoes.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Transações este mês</span>
                          <span className="text-sss-white font-semibold">
                            {estatisticas?.transacoesMes || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-sss-medium rounded-lg border border-sss-light p-6">
                      <h3 className="text-lg font-semibold text-sss-white mb-4">Relatório de Códigos</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Códigos Gerados</span>
                          <span className="text-sss-white font-semibold">
                            {parceiro.codigosGerados}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Códigos Ativos</span>
                          <span className="text-green-400 font-semibold">
                            {estatisticas?.codigosAtivos || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Códigos Usados</span>
                          <span className="text-blue-400 font-semibold">
                            {estatisticas?.codigosUsados || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'configuracoes' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-sss-white">Configurações</h2>
                  
                  <div className="bg-sss-medium rounded-lg border border-sss-light p-6">
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Informações da Cidade</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Nome da Cidade
                        </label>
                        <input
                          type="text"
                          value={parceiro.nomeCidade}
                          disabled
                          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white disabled:opacity-50"
                          aria-label="Nome da cidade"
                          placeholder="Nome da cidade"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Comissão Mensal
                        </label>
                        <input
                          type="text"
                          value={`R$ ${parceiro.comissaoMensal.toFixed(2)}`}
                          disabled
                          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white disabled:opacity-50"
                          aria-label="Comissão mensal"
                          placeholder="Comissão mensal"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Modal de Cadastro de Parceiro */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-sss-medium rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-sss-light"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="w-8 h-8 text-sss-accent" />
                  <h2 className="text-2xl font-bold text-sss-white">Cadastro de Parceiro</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-sss-white transition"
                  aria-label="Fechar modal"
                  title="Fechar"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {enviado ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckIcon className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-sss-white mb-2">Solicitação Enviada!</h3>
                  <p className="text-gray-400">Nossa equipe entrará em contato em até 24 horas.</p>
                </div>
              ) : (
                <>
                  {/* Requisitos */}
                  <div className="bg-sss-dark rounded-lg p-4 mb-6 border border-sss-light">
                    <h3 className="text-lg font-semibold text-sss-white mb-3">📋 Requisitos para se tornar Parceiro</h3>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• Ser dono de uma cidade FiveM ativa</li>
                      <li>• Ter pelo menos 50 jogadores ativos</li>
                      <li>• Cidade funcionando há pelo menos 3 meses</li>
                      <li>• Discord ativo para comunicação</li>
                      <li>• Compromisso com a comunidade</li>
                    </ul>
                  </div>

                  {/* Formulário */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          <UserIcon className="w-4 h-4 inline mr-2" />
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nome}
                          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                          placeholder="Seu nome completo"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          <PhoneIcon className="w-4 h-4 inline mr-2" />
                          WhatsApp
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.telefone}
                          onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          <BuildingOfficeIcon className="w-4 h-4 inline mr-2" />
                          Nome da Cidade
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nomeCidade}
                          onChange={(e) => setFormData(prev => ({ ...prev, nomeCidade: e.target.value }))}
                          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                          placeholder="Nome da sua cidade FiveM"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        <GlobeAltIcon className="w-4 h-4 inline mr-2" />
                        Site da Cidade (opcional)
                      </label>
                      <input
                        type="url"
                        value={formData.siteCidade}
                        onChange={(e) => setFormData(prev => ({ ...prev, siteCidade: e.target.value }))}
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                        placeholder="https://sua-cidade.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                        Descrição da Cidade
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.descricao}
                        onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                        placeholder="Conte um pouco sobre sua cidade, recursos, comunidade..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Experiência com FiveM
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={formData.experiencia}
                        onChange={(e) => setFormData(prev => ({ ...prev, experiencia: e.target.value }))}
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                        placeholder="Há quanto tempo administra a cidade? Quantos jogadores ativos?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Expectativas como Parceiro
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={formData.expectativa}
                        onChange={(e) => setFormData(prev => ({ ...prev, expectativa: e.target.value }))}
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                        placeholder="O que espera ganhar sendo parceiro? Como pode contribuir?"
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-sss-light text-sss-white rounded-lg hover:bg-sss-light transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={enviando}
                        className="flex-1 px-4 py-2 bg-sss-accent text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {enviando ? 'Enviando...' : 'Enviar Solicitação'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* Modal Gerar Código */}
        {showGerarCodigo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-sss-medium rounded-lg p-6 w-full max-w-md border border-sss-light"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-sss-white">Gerar Códigos de Cashback</h3>
                <button
                  onClick={() => setShowGerarCodigo(false)}
                  className="text-gray-400 hover:text-sss-white"
                  aria-label="Fechar modal"
                  title="Fechar"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Valor do Código (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={novoCodigo.valor}
                    onChange={(e) => setNovoCodigo(prev => ({ ...prev, valor: e.target.value }))}
                    className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                    placeholder="10.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Quantidade de Códigos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={novoCodigo.quantidade}
                    onChange={(e) => setNovoCodigo(prev => ({ ...prev, quantidade: e.target.value }))}
                    className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                    placeholder="1"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowGerarCodigo(false)}
                  className="flex-1 px-4 py-2 border border-sss-light text-sss-white rounded-lg hover:bg-sss-light transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={gerarCodigo}
                  disabled={salvando}
                  className="flex-1 px-4 py-2 bg-sss-accent text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {salvando ? 'Gerando...' : 'Gerar Códigos'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Footer minimalista centralizado */}
        <footer className="bg-black border-t border-sss-light mt-16">
          <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col items-center">
            {/* Logo e nome */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold text-sss-white">SementesPLAY</span>
            </div>
            {/* Redes sociais */}
            <div className="flex gap-4 mb-4">
              <a href="#" title="Discord" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.07.07 0 0 0-.073.035c-.211.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.164-.393-.405-.874-.617-1.249a.07.07 0 0 0-.073-.035A19.736 19.736 0 0 0 3.677 4.369a.064.064 0 0 0-.03.027C.533 9.09-.32 13.579.099 18.021a.08.08 0 0 0 .031.056c2.052 1.507 4.042 2.422 5.992 3.029a.077.077 0 0 0 .084-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.104c-.652-.247-1.27-.549-1.872-.892a.077.077 0 0 1-.008-.127c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.198.372.292a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.891.076.076 0 0 0-.04.105c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028c1.961-.607 3.951-1.522 6.003-3.029a.077.077 0 0 0 .031-.055c.5-5.177-.838-9.637-3.548-13.625a.061.061 0 0 0-.03-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z"/></svg>
              </a>
              <a href="#" title="Instagram" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.98.98-1.274 2.092-1.334 3.374C2.013 5.741 2 6.151 2 12c0 5.849.013 6.259.072 7.54.06 1.282.354 2.394 1.334 3.374.98.98 2.092 1.274 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.06 2.394-.354 3.374-1.334.98-.98 1.274-2.092 1.334-3.374.059-1.281.072-1.691.072-7.54 0-5.849-.013-6.259-.072-7.54-.06-1.282-.354-2.394-1.334-3.374-.98-.98-2.092-1.274-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
              </a>
              <a href="#" title="TikTok" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12.75 2v14.25a2.25 2.25 0 1 1-2.25-2.25h.75V12h-.75a4.5 4.5 0 1 0 4.5 4.5V7.5a5.25 5.25 0 0 0 5.25 5.25V9.75A3.75 3.75 0 0 1 16.5 6V2h-3.75z"/></svg>
              </a>
              <a href="#" title="YouTube" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.692 3.5 12 3.5 12 3.5s-7.692 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.88 0 12 0 12s0 4.12.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.308 20.5 12 20.5 12 20.5s7.692 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 16.12 24 12 24 12s0-4.12-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
              </a>
              <a href="#" title="Twitter" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.116 2.813 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
              </a>
            </div>
            {/* Links horizontais */}
            <div className="flex flex-wrap justify-center gap-4 mb-4 text-gray-400 text-sm">
              <Link href="/termos" className="hover:text-sss-accent">Termos de Uso</Link>
              <span>|</span>
              <Link href="/termos" className="hover:text-sss-accent">Política de Privacidade</Link>
              <span>|</span>
              <Link href="/ajuda" className="hover:text-sss-accent">Ajuda</Link>
            </div>
            {/* Copyright */}
            <div className="text-gray-500 text-xs text-center">
              &copy; {new Date().getFullYear()} SementesPLAY. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      </>
    );
  }

  // Se candidatura pendente, mostra status pendente
  if (candidaturaStatus === 'pendente') {
    return (
      <div className="min-h-screen bg-sss-dark flex flex-col items-center justify-center">
        <div className="bg-sss-medium p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-sss-accent mb-4">Solicitação enviada!</h2>
          <p className="text-gray-200 mb-2">Sua solicitação para ser parceiro está em análise.</p>
          <p className="text-gray-400 text-sm">Assim que for aprovada ou rejeitada, você será notificado por email.</p>
        </div>
      </div>
    );
  }

  // Se candidatura rejeitada ou nunca enviada, mostra formulário
  return (
    <>
      <Head>
        <title>Parceiros - SementesPLAY</title>
        <meta name="description" content="Página de parceiros do SementesPLAY" />
      </Head>
      <div className="min-h-screen bg-sss-dark">
        <Navbar />
        
        {/* Página de Informações para não-parceiros */}
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-sss-medium rounded-lg shadow-lg p-8 border border-sss-light text-center max-w-4xl w-full">
            <h1 className="text-3xl font-bold text-sss-accent mb-6">Parceiros SementesPLAY</h1>
            <p className="text-sss-white text-lg mb-8">Donos de cidades FiveM que geram códigos de cashback para a comunidade</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-sss-dark rounded-lg p-6 border border-sss-light">
                <h3 className="text-xl font-semibold text-sss-white mb-4">Como Funciona</h3>
                <ul className="text-gray-300 space-y-2 text-left">
                  <li>• Cadastre sua cidade FiveM como parceira</li>
                  <li>• Gere códigos de cashback únicos</li>
                  <li>• Receba 10% de comissão das vendas</li>
                  <li>• Acompanhe estatísticas em tempo real</li>
                </ul>
              </div>
              
              <div className="bg-sss-dark rounded-lg p-6 border border-sss-light">
                <h3 className="text-xl font-semibold text-sss-white mb-4">Benefícios</h3>
                <ul className="text-gray-300 space-y-2 text-left">
                  <li>• Painel exclusivo de gestão</li>
                  <li>• Relatórios detalhados de vendas</li>
                  <li>• Suporte prioritário</li>
                  <li>• Taxa mensal de R$ 500,00</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-sss-accent/10 rounded-lg p-6 border border-sss-accent">
              <h3 className="text-xl font-semibold text-sss-accent mb-4">Interessado em ser Parceiro?</h3>
              <p className="text-gray-300 mb-4">Preencha o formulário abaixo e nossa equipe entrará em contato em até 24 horas.</p>
              <button 
                onClick={() => {
                  const user = auth.getUser();
                  if (!user) {
                    window.location.href = '/login';
                    return;
                  }
                  setShowModal(true);
                }}
                className="bg-sss-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition inline-block"
              >
                Solicitar Cadastro
              </button>
            </div>
          </div>
        </div>

        {/* Botão Fixo "Seja Parceiro" - Lateral Direita (apenas para usuários que não são parceiros) */}
        {user && !parceiro && candidaturaStatus !== 'pendente' && (
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
            <button
              onClick={() => {
                if (!user) {
                  window.location.href = '/login';
                  return;
                }
                window.location.href = '/candidatura-parceiro';
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 font-bold text-lg"
            >
              <span className="text-2xl">🏢</span>
              <span className="hidden sm:inline">Seja Parceiro</span>
              <span className="sm:hidden">Parceiro</span>
            </button>
          </div>
        )}

        {/* Modal de Cadastro de Parceiro */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-sss-medium rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-sss-light"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="w-8 h-8 text-sss-accent" />
                  <h2 className="text-2xl font-bold text-sss-white">Cadastro de Parceiro</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-sss-white transition"
                  aria-label="Fechar modal"
                  title="Fechar"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {enviado ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckIcon className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-sss-white mb-2">Solicitação Enviada!</h3>
                  <p className="text-gray-400">Nossa equipe entrará em contato em até 24 horas.</p>
                </div>
              ) : (
                <>
                  {/* Requisitos */}
                  <div className="bg-sss-dark rounded-lg p-4 mb-6 border border-sss-light">
                    <h3 className="text-lg font-semibold text-sss-white mb-3">📋 Requisitos para se tornar Parceiro</h3>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• Ser dono de uma cidade FiveM ativa</li>
                      <li>• Ter pelo menos 50 jogadores ativos</li>
                      <li>• Cidade funcionando há pelo menos 3 meses</li>
                      <li>• Discord ativo para comunicação</li>
                      <li>• Compromisso com a comunidade</li>
                    </ul>
                  </div>

                  {/* Formulário */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          <UserIcon className="w-4 h-4 inline mr-2" />
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nome}
                          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                          placeholder="Seu nome completo"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          <PhoneIcon className="w-4 h-4 inline mr-2" />
                          WhatsApp
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.telefone}
                          onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          <BuildingOfficeIcon className="w-4 h-4 inline mr-2" />
                          Nome da Cidade
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nomeCidade}
                          onChange={(e) => setFormData(prev => ({ ...prev, nomeCidade: e.target.value }))}
                          className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                          placeholder="Nome da sua cidade FiveM"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        <GlobeAltIcon className="w-4 h-4 inline mr-2" />
                        Site da Cidade (opcional)
                      </label>
                      <input
                        type="url"
                        value={formData.siteCidade}
                        onChange={(e) => setFormData(prev => ({ ...prev, siteCidade: e.target.value }))}
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                        placeholder="https://sua-cidade.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                        Descrição da Cidade
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.descricao}
                        onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                        placeholder="Conte um pouco sobre sua cidade, recursos, comunidade..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Experiência com FiveM
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={formData.experiencia}
                        onChange={(e) => setFormData(prev => ({ ...prev, experiencia: e.target.value }))}
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                        placeholder="Há quanto tempo administra a cidade? Quantos jogadores ativos?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Expectativas como Parceiro
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={formData.expectativa}
                        onChange={(e) => setFormData(prev => ({ ...prev, expectativa: e.target.value }))}
                        className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                        placeholder="O que espera ganhar sendo parceiro? Como pode contribuir?"
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-sss-light text-sss-white rounded-lg hover:bg-sss-light transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={enviando}
                        className="flex-1 px-4 py-2 bg-sss-accent text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {enviando ? 'Enviando...' : 'Enviar Solicitação'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* Modal Gerar Código */}
        {showGerarCodigo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-sss-medium rounded-lg p-6 w-full max-w-md border border-sss-light"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-sss-white">Gerar Códigos de Cashback</h3>
                <button
                  onClick={() => setShowGerarCodigo(false)}
                  className="text-gray-400 hover:text-sss-white"
                  aria-label="Fechar modal"
                  title="Fechar"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Valor do Código (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={novoCodigo.valor}
                    onChange={(e) => setNovoCodigo(prev => ({ ...prev, valor: e.target.value }))}
                    className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                    placeholder="10.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Quantidade de Códigos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={novoCodigo.quantidade}
                    onChange={(e) => setNovoCodigo(prev => ({ ...prev, quantidade: e.target.value }))}
                    className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:border-sss-accent focus:outline-none"
                    placeholder="1"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowGerarCodigo(false)}
                  className="flex-1 px-4 py-2 border border-sss-light text-sss-white rounded-lg hover:bg-sss-light transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={gerarCodigo}
                  disabled={salvando}
                  className="flex-1 px-4 py-2 bg-sss-accent text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {salvando ? 'Gerando...' : 'Gerar Códigos'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Footer minimalista centralizado */}
        <footer className="bg-black border-t border-sss-light mt-16">
          <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col items-center">
            {/* Logo e nome */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold text-sss-white">SementesPLAY</span>
            </div>
            {/* Redes sociais */}
            <div className="flex gap-4 mb-4">
              <a href="#" title="Discord" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.07.07 0 0 0-.073.035c-.211.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.164-.393-.405-.874-.617-1.249a.07.07 0 0 0-.073-.035A19.736 19.736 0 0 0 3.677 4.369a.064.064 0 0 0-.03.027C.533 9.09-.32 13.579.099 18.021a.08.08 0 0 0 .031.056c2.052 1.507 4.042 2.422 5.992 3.029a.077.077 0 0 0 .084-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.104c-.652-.247-1.27-.549-1.872-.892a.077.077 0 0 1-.008-.127c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.198.372.292a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.891.076.076 0 0 0-.04.105c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028c1.961-.607 3.951-1.522 6.003-3.029a.077.077 0 0 0 .031-.055c.5-5.177-.838-9.637-3.548-13.625a.061.061 0 0 0-.03-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z"/></svg>
              </a>
              <a href="#" title="Instagram" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.98.98-1.274 2.092-1.334 3.374C2.013 5.741 2 6.151 2 12c0 5.849.013 6.259.072 7.54.06 1.282.354 2.394 1.334 3.374.98.98 2.092 1.274 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.06 2.394-.354 3.374-1.334.98-.98 1.274-2.092 1.334-3.374.059-1.281.072-1.691.072-7.54 0-5.849-.013-6.259-.072-7.54-.06-1.282-.354-2.394-1.334-3.374-.98-.98-2.092-1.274-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
              </a>
              <a href="#" title="TikTok" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12.75 2v14.25a2.25 2.25 0 1 1-2.25-2.25h.75V12h-.75a4.5 4.5 0 1 0 4.5 4.5V7.5a5.25 5.25 0 0 0 5.25 5.25V9.75A3.75 3.75 0 0 1 16.5 6V2h-3.75z"/></svg>
              </a>
              <a href="#" title="YouTube" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.692 3.5 12 3.5 12 3.5s-7.692 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.88 0 12 0 12s0 4.12.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.308 20.5 12 20.5 12 20.5s7.692 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 16.12 24 12 24 12s0-4.12-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
              </a>
              <a href="#" title="Twitter" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.116 2.813 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
              </a>
            </div>
            {/* Links horizontais */}
            <div className="flex flex-wrap justify-center gap-4 mb-4 text-gray-400 text-sm">
              <Link href="/termos" className="hover:text-sss-accent">Termos de Uso</Link>
              <span>|</span>
              <Link href="/termos" className="hover:text-sss-accent">Política de Privacidade</Link>
              <span>|</span>
              <Link href="/ajuda" className="hover:text-sss-accent">Ajuda</Link>
            </div>
            {/* Copyright */}
            <div className="text-gray-500 text-xs text-center">
              &copy; {new Date().getFullYear()} SementesPLAY. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 