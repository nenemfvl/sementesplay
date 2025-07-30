import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { auth } from '../lib/auth';
import Navbar from '../components/Navbar';
import { 
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  PlusIcon,
  BellIcon,
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

type ConteudoParceiro = {
  id: string;
  titulo: string;
  tipo: string;
  categoria: string;
  descricao?: string;
  url: string;
  cidade: string;
  endereco?: string;
  dataEvento?: string;
  preco?: string;
  vagas?: number;
  visualizacoes: number;
  curtidas: number;
  dislikes: number;
  compartilhamentos: number;
  comentarios: number;
  dataPublicacao: string;
  fixado: boolean;
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
  const [conteudos, setConteudos] = useState<ConteudoParceiro[]>([]);
  const [loadingConteudos, setLoadingConteudos] = useState(true);
  const [showModalConteudo, setShowModalConteudo] = useState(false);
  const [formConteudo, setFormConteudo] = useState({ 
    titulo: '', 
    url: '', 
    tipo: '', 
    categoria: '', 
    descricao: '', 
    plataforma: '', 
    cidade: '', 
    endereco: '', 
    dataEvento: '', 
    preco: '', 
    vagas: '',
    fixado: false
  });
  const [editandoConteudo, setEditandoConteudo] = useState<ConteudoParceiro | null>(null);
  const [savingConteudo, setSavingConteudo] = useState(false);
  const [showModalPIX, setShowModalPIX] = useState(false);
  const [repasseSelecionado, setRepasseSelecionado] = useState<Repasse | null>(null);
  const [comprovantePIX, setComprovantePIX] = useState<File | null>(null);
  const [enviandoPIX, setEnviandoPIX] = useState(false);

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
      fetchConteudos();
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
      const response = await fetch(`/api/parceiros/repasses-pendentes?usuarioId=${user?.id}`);
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

  async function fetchConteudos() {
    try {
      const response = await fetch(`/api/parceiros/conteudos?parceiroId=${parceiro?.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConteudos(data.conteudos || []);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error);
    } finally {
      setLoadingConteudos(false);
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

  async function handleAddConteudo(e: React.FormEvent) {
    e.preventDefault();
    if (!formConteudo.titulo || !formConteudo.url || !formConteudo.tipo || !formConteudo.categoria || !formConteudo.cidade) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setSavingConteudo(true);
    try {
      const response = await fetch('/api/parceiros/conteudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formConteudo,
          parceiroId: parceiro?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConteudos(prev => [data.conteudo, ...prev]);
        setFormConteudo({ 
          titulo: '', 
          url: '', 
          tipo: '', 
          categoria: '', 
          descricao: '', 
          plataforma: '', 
          cidade: '', 
          endereco: '', 
          dataEvento: '', 
          preco: '', 
          vagas: '',
          fixado: false
        });
        setShowModalConteudo(false);
        alert('Conteúdo criado com sucesso!');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao criar conteúdo');
      }
    } catch (error) {
      alert('Erro ao criar conteúdo');
    } finally {
      setSavingConteudo(false);
    }
  }

  async function handleEditConteudo(e: React.FormEvent) {
    e.preventDefault();
    if (!editandoConteudo) return;

    setSavingConteudo(true);
    try {
      const response = await fetch('/api/parceiros/conteudos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editandoConteudo.id,
          ...formConteudo,
          parceiroId: parceiro?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConteudos(prev => prev.map(c => c.id === editandoConteudo.id ? data.conteudo : c));
        setFormConteudo({ 
          titulo: '', 
          url: '', 
          tipo: '', 
          categoria: '', 
          descricao: '', 
          plataforma: '', 
          cidade: '', 
          endereco: '', 
          dataEvento: '', 
          preco: '', 
          vagas: '',
          fixado: false
        });
        setEditandoConteudo(null);
        setShowModalConteudo(false);
        alert('Conteúdo atualizado com sucesso!');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao atualizar conteúdo');
      }
    } catch (error) {
      alert('Erro ao atualizar conteúdo');
    } finally {
      setSavingConteudo(false);
    }
  }

  async function handleRemoverConteudo(id: string) {
    if (!confirm('Tem certeza que deseja remover este conteúdo?')) return;

    try {
      const response = await fetch('/api/parceiros/conteudos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        setConteudos(prev => prev.filter(c => c.id !== id));
        alert('Conteúdo removido com sucesso!');
      } else {
        alert('Erro ao remover conteúdo');
      }
    } catch (error) {
      alert('Erro ao remover conteúdo');
    }
  }

  async function handleFixarConteudo(id: string, fixar: boolean) {
    try {
      const response = await fetch('/api/parceiros/conteudos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          parceiroId: parceiro?.id,
          fixado: fixar,
          titulo: '',
          url: '',
          tipo: '',
          categoria: '',
          descricao: '',
          plataforma: '',
          cidade: '',
          endereco: '',
          dataEvento: '',
          preco: '',
          vagas: ''
        })
      });

      if (response.ok) {
        setConteudos(prev => prev.map(c => c.id === id ? { ...c, fixado: fixar } : c));
      }
    } catch (error) {
      console.error('Erro ao fixar conteúdo:', error);
    }
  }

  function handleFazerPagamentoPIX(repasse: Repasse) {
    setRepasseSelecionado(repasse);
    setShowModalPIX(true);
  }

  async function handleEnviarComprovantePIX(e: React.FormEvent) {
    e.preventDefault();
    if (!repasseSelecionado || !comprovantePIX) {
      alert('Selecione um comprovante de pagamento');
      return;
    }

    setEnviandoPIX(true);
    try {
      const formData = new FormData();
      formData.append('comprovante', comprovantePIX);
      formData.append('repasseId', repasseSelecionado.id);
      formData.append('parceiroId', parceiro?.id || '');

      const response = await fetch('/api/parceiros/enviar-comprovante-pix', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Comprovante enviado com sucesso! Aguardando confirmação.');
        setShowModalPIX(false);
        setRepasseSelecionado(null);
        setComprovantePIX(null);
        fetchRepasses(); // Recarregar repasses
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao enviar comprovante');
      }
    } catch (error) {
      alert('Erro ao enviar comprovante');
    } finally {
      setEnviandoPIX(false);
    }
  }

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

      {/* Modal de conteúdo */}
      {showModalConteudo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-sss-medium rounded-2xl p-6 w-full max-w-2xl border border-sss-light shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-sss-white">
                {editandoConteudo ? 'Editar Conteúdo' : 'Adicionar Conteúdo'}
              </h2>
                <button
                onClick={() => { 
                  setShowModalConteudo(false); 
                  setEditandoConteudo(null);
                  setFormConteudo({ 
                    titulo: '', 
                    url: '', 
                    tipo: '', 
                    categoria: '', 
                    descricao: '', 
                    plataforma: '', 
                    cidade: '', 
                    endereco: '', 
                    dataEvento: '', 
                    preco: '', 
                    vagas: '',
                    fixado: false
                  });
                }}
                className="text-gray-400 hover:text-sss-white transition-colors"
                aria-label="Fechar modal"
              >
                <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            
            <form onSubmit={editandoConteudo ? handleEditConteudo : handleAddConteudo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
                  <input 
                    required 
                    type="text"
                    className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                    placeholder="Ex: Evento de Gaming" 
                    value={formConteudo.titulo} 
                    onChange={e => setFormConteudo(f => ({ ...f, titulo: e.target.value }))} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo *</label>
                  <select 
                    required
                    aria-label="Tipo de conteúdo"
                    className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all"
                    value={formConteudo.tipo}
                    onChange={e => setFormConteudo(f => ({ ...f, tipo: e.target.value }))}
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="evento">Evento</option>
                    <option value="promoção">Promoção</option>
                    <option value="notícia">Notícia</option>
                    <option value="tour">Tour</option>
                    <option value="workshop">Workshop</option>
                    <option value="competição">Competição</option>
                  </select>
                </div>
                
                      <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Categoria *</label>
                  <select 
                    required
                    aria-label="Categoria do conteúdo"
                    className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all"
                    value={formConteudo.categoria}
                    onChange={e => setFormConteudo(f => ({ ...f, categoria: e.target.value }))}
                  >
                    <option value="">Selecione a categoria</option>
                    <option value="eventos">Eventos</option>
                    <option value="promoções">Promoções</option>
                    <option value="notícias">Notícias</option>
                    <option value="tours">Tours</option>
                    <option value="workshops">Workshops</option>
                    <option value="competições">Competições</option>
                  </select>
                      </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cidade *</label>
                  <input 
                    required 
                    type="text"
                    className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                    placeholder="Ex: São Paulo" 
                    value={formConteudo.cidade} 
                    onChange={e => setFormConteudo(f => ({ ...f, cidade: e.target.value }))} 
                  />
                      </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">URL *</label>
                  <input 
                    required 
                    type="url"
                    className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                    placeholder="https://exemplo.com" 
                    value={formConteudo.url} 
                    onChange={e => setFormConteudo(f => ({ ...f, url: e.target.value }))} 
                  />
                    </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Plataforma</label>
                  <input 
                    type="text"
                    className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                    placeholder="Ex: Site, Instagram, Facebook" 
                    value={formConteudo.plataforma} 
                    onChange={e => setFormConteudo(f => ({ ...f, plataforma: e.target.value }))} 
                  />
                  </div>

                      <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Endereço</label>
                  <input 
                    type="text"
                    className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                    placeholder="Endereço do evento/local" 
                    value={formConteudo.endereco} 
                    onChange={e => setFormConteudo(f => ({ ...f, endereco: e.target.value }))} 
                  />
                      </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Data do Evento</label>
                  <input 
                    type="datetime-local"
                    aria-label="Data e hora do evento"
                    className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                    value={formConteudo.dataEvento} 
                    onChange={e => setFormConteudo(f => ({ ...f, dataEvento: e.target.value }))} 
                  />
                      </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Preço</label>
                  <input 
                    type="text"
                    className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                    placeholder="Ex: R$ 50,00 ou Gratuito" 
                    value={formConteudo.preco} 
                    onChange={e => setFormConteudo(f => ({ ...f, preco: e.target.value }))} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Vagas</label>
                  <input 
                    type="number"
                    min="0"
                    className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                    placeholder="Número de vagas disponíveis" 
                    value={formConteudo.vagas} 
                    onChange={e => setFormConteudo(f => ({ ...f, vagas: e.target.value }))} 
                  />
                    </div>
                  </div>

                      <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                <textarea 
                  rows={4}
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  placeholder="Descrição detalhada do conteúdo..." 
                  value={formConteudo.descricao} 
                  onChange={e => setFormConteudo(f => ({ ...f, descricao: e.target.value }))} 
                />
                      </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-sss-accent text-sss-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                  disabled={savingConteudo}
                >
                  {savingConteudo ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sss-white"></div>
                      {editandoConteudo ? 'Salvando...' : 'Criando...'}
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      {editandoConteudo ? 'Salvar Alterações' : 'Criar Conteúdo'}
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="px-6 py-3 bg-sss-light text-sss-white rounded-lg hover:bg-sss-light transition-colors" 
                  onClick={() => { 
                    setShowModalConteudo(false); 
                    setEditandoConteudo(null);
                    setFormConteudo({ 
                      titulo: '', 
                      url: '', 
                      tipo: '', 
                      categoria: '', 
                      descricao: '', 
                      plataforma: '', 
                      cidade: '', 
                      endereco: '', 
                      dataEvento: '', 
                      preco: '', 
                      vagas: '',
                      fixado: false
                    });
                  }} 
                  disabled={savingConteudo}
                >
                  Cancelar
                </button>
                      </div>
            </form>
                    </div>
                  </div>
      )}

      {/* Modal de Pagamento PIX */}
      {showModalPIX && repasseSelecionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-sss-medium rounded-2xl p-6 w-full max-w-md border border-sss-light shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-sss-white">
                Pagamento PIX
              </h2>
              <button 
                onClick={() => { 
                  setShowModalPIX(false); 
                  setRepasseSelecionado(null);
                  setComprovantePIX(null);
                }}
                className="text-gray-400 hover:text-sss-white transition-colors"
                aria-label="Fechar modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-sss-light/30 rounded-lg p-4">
                <h3 className="text-sss-white font-semibold mb-2">Detalhes do Repasse</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Valor da Compra:</span>
                    <span className="text-sss-white">R$ {repasseSelecionado.valorCompra.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Valor do Repasse:</span>
                    <span className="text-sss-accent font-semibold">R$ {repasseSelecionado.valorRepasse.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data da Compra:</span>
                    <span className="text-sss-white">{new Date(repasseSelecionado.dataCompra).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h3 className="text-green-400 font-semibold mb-2">Dados para Pagamento PIX</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-400">Chave PIX:</p>
                    <p className="text-sss-white font-mono text-lg">82988181358</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Valor a pagar:</p>
                    <p className="text-green-400 font-bold text-xl">R$ {repasseSelecionado.valorRepasse.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                  <p className="text-yellow-400 text-xs">
                    ⚠️ Faça o pagamento PIX e envie o comprovante abaixo
                  </p>
                </div>
              </div>

              <form onSubmit={handleEnviarComprovantePIX} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Comprovante de Pagamento *
                  </label>
                  <input 
                    required 
                    type="file"
                    accept="image/*,.pdf"
                    aria-label="Comprovante de pagamento PIX"
                    className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sss-accent file:text-sss-white hover:file:bg-red-700 transition-all" 
                    onChange={e => setComprovantePIX(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Aceita imagens (JPG, PNG) ou PDF
                  </p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-sss-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                    disabled={enviandoPIX || !comprovantePIX}
                  >
                    {enviandoPIX ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sss-white"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        Enviar Comprovante
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="px-6 py-3 bg-sss-light text-sss-white rounded-lg hover:bg-sss-light transition-colors" 
                    onClick={() => { 
                      setShowModalPIX(false); 
                      setRepasseSelecionado(null);
                      setComprovantePIX(null);
                    }} 
                    disabled={enviandoPIX}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
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
                            {repasse.usuario && (
                              <p className="text-xs text-gray-500">
                                Usuário: {repasse.usuario.nome}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sss-white font-semibold">
                            {new Date(repasse.dataCompra).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm text-orange-400 mb-2">
                            Pendente
                          </p>
                          <button
                            onClick={() => handleFazerPagamentoPIX(repasse)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Pagar PIX
                          </button>
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

          {/* Gestão de Conteúdos */}
          <section className="mb-8">
            <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
              <div className="p-6 border-b border-sss-light">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <DocumentTextIcon className="w-5 h-5 text-sss-white" />
                </div>
                    <div>
                      <h2 className="text-xl font-bold text-sss-white">Seus Conteúdos</h2>
                      <p className="text-sm text-gray-400">Gerencie eventos, promoções e notícias da sua cidade</p>
                  </div>
                  </div>
                  <button 
                    onClick={() => setShowModalConteudo(true)}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-sss-white px-4 py-2 rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Adicionar Conteúdo
                  </button>
                  </div>
                </div>

              <div className="p-6">
                {loadingConteudos ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    <span className="ml-3 text-gray-400">Carregando conteúdos...</span>
                  </div>
                ) : conteudos && conteudos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {conteudos.map((conteudo) => (
                      <div key={conteudo.id} className="bg-sss-light/50 rounded-xl overflow-hidden hover:bg-sss-light/70 transition-all duration-300 group border border-sss-light hover:border-gray-500">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <DocumentTextIcon className="w-5 h-5 text-indigo-400" />
                              <span className="text-sss-white font-medium">{conteudo.tipo}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {conteudo.fixado && (
                                <div className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                                  Fixado
              </div>
            )}
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                conteudo.categoria === 'eventos' ? 'bg-blue-500/20 text-blue-400' :
                                conteudo.categoria === 'promoções' ? 'bg-green-500/20 text-green-400' :
                                'bg-purple-500/20 text-purple-400'
                              }`}>
                                {conteudo.categoria}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-400">Título</p>
                              <p className="text-lg font-bold text-sss-white">{conteudo.titulo}</p>
                            </div>
                            
                            {conteudo.descricao && (
                    <div>
                                <p className="text-sm text-gray-400">Descrição</p>
                                <p className="text-sm text-sss-white">{conteudo.descricao}</p>
                    </div>
                            )}
                    
                    <div>
                              <p className="text-sm text-gray-400">Cidade</p>
                              <p className="text-sss-white">{conteudo.cidade}</p>
                    </div>
                            
                            {conteudo.endereco && (
                              <div>
                                <p className="text-sm text-gray-400">Endereço</p>
                                <p className="text-sm text-sss-white">{conteudo.endereco}</p>
              </div>
            )}
                            
                            {conteudo.dataEvento && (
                              <div>
                                <p className="text-sm text-gray-400">Data do Evento</p>
                                <p className="text-sss-white">
                                  {new Date(conteudo.dataEvento).toLocaleDateString('pt-BR')}
                                </p>
        </div>
                            )}
                            
                            {conteudo.preco && (
                              <div>
                                <p className="text-sm text-gray-400">Preço</p>
                                <p className="text-sss-accent font-semibold">{conteudo.preco}</p>
            </div>
                            )}
            
                            {conteudo.vagas && (
              <div>
                                <p className="text-sm text-gray-400">Vagas</p>
                                <p className="text-sss-white">{conteudo.vagas} disponíveis</p>
              </div>
                            )}
              
                            <div className="flex justify-between text-sm">
              <div>
                                <p className="text-gray-400">Visualizações</p>
                                <p className="text-sss-white">{conteudo.visualizacoes}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Curtidas</p>
                                <p className="text-sss-white">{conteudo.curtidas}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Comentários</p>
                                <p className="text-sss-white">{conteudo.comentarios}</p>
                              </div>
              </div>
            </div>
            
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-sss-light">
                            <div className="flex space-x-2">
              <button
                                className="text-blue-400 hover:text-blue-300 transition-colors p-1" 
                                onClick={() => {
                                  setEditandoConteudo(conteudo);
                                  setFormConteudo({
                                    titulo: conteudo.titulo,
                                    url: conteudo.url,
                                    tipo: conteudo.tipo,
                                    categoria: conteudo.categoria,
                                    descricao: conteudo.descricao || '',
                                    plataforma: '',
                                    cidade: conteudo.cidade,
                                    endereco: conteudo.endereco || '',
                                    dataEvento: conteudo.dataEvento || '',
                                    preco: conteudo.preco || '',
                                    vagas: conteudo.vagas?.toString() || '',
                                    fixado: conteudo.fixado
                                  });
                                  setShowModalConteudo(true);
                                }}
                                title="Editar"
                              >
                                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                                className="text-red-400 hover:text-red-300 transition-colors p-1" 
                                onClick={() => handleRemoverConteudo(conteudo.id)}
                                title="Remover"
                              >
                                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleFixarConteudo(conteudo.id, !conteudo.fixado)}
                                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                                  conteudo.fixado 
                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-sss-white' 
                                    : 'bg-gray-600 hover:bg-gray-700 text-sss-white'
                                }`}
                              >
                                {conteudo.fixado ? 'Desfixar' : 'Fixar'}
                              </button>
                              <a
                                href={conteudo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-indigo-600 hover:bg-indigo-700 text-sss-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                              >
                                Ver
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum conteúdo criado ainda</p>
                    <button
                      onClick={() => setShowModalConteudo(true)}
                      className="mt-4 bg-sss-accent text-sss-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Criar Primeiro Conteúdo
                    </button>
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