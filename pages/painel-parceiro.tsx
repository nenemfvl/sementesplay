import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { auth } from '../lib/auth';
import Navbar from '../components/Navbar';
import { 
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  PlusIcon,
  BellIcon,

  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';



type Transacao = {
  id: string;
  valor: number;
  codigoParceiro: string;
  status: string;
  data: string;
  usuario?: { nome: string; email: string };
};

type Estatisticas = {
  totalVendas: number; // Agora representa o total de repasses realizados
  totalComissoes: number;
  codigosAtivos: number;
  repassesRealizados: number; // Agora representa a quantidade de repasses realizados
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
  tipo?: string; // 'solicitacao', 'compra', 'repasse'
};

type ConteudoParceiro = {
  id: string;
  titulo: string;
  tipo: string;
  categoria: string;
  url: string;
  dataPublicacao?: string;
  fixado?: boolean;
  visualizacoes?: number;
  curtidas?: number;
  dislikes?: number;
};

export default function PainelParceiro() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loadingTransacoes, setLoadingTransacoes] = useState(true);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loadingEstatisticas, setLoadingEstatisticas] = useState(true);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(true);
  const [repasses, setRepasses] = useState<Repasse[]>([]);
  const [loadingRepasses, setLoadingRepasses] = useState(true);
  const [parceiro, setParceiro] = useState<any>(null);

  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [conteudos, setConteudos] = useState<ConteudoParceiro[]>([]);
  const [loadingConteudos, setLoadingConteudos] = useState(true);
  const [showModalConteudo, setShowModalConteudo] = useState(false);
  const [formConteudo, setFormConteudo] = useState({ 
    titulo: '',
    tipo: '',
    categoria: '', 
    url: '',
    cidade: ''
  });
  const [editandoConteudo, setEditandoConteudo] = useState<ConteudoParceiro | null>(null);
  const [savingConteudo, setSavingConteudo] = useState(false);
  const [showModalPIX, setShowModalPIX] = useState(false);

  // Função para obter informações do YouTube
  function getYoutubeInfo(url: string) {
    const yt = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (yt) {
      const id = yt[1];
      return {
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        link: `https://www.youtube.com/watch?v=${id}`
      };
    }
    return null;
  }

  // Função para obter preview do conteúdo
  function getPreview(url: string) {
    if (!url) return null;
    
    // YouTube
    const yt = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (yt) {
      return <iframe width="100%" height="180" src={`https://www.youtube.com/embed/${yt[1]}`} frameBorder="0" allowFullScreen className="rounded my-2" title="YouTube video" />;
    }
    
    // Twitch
    const tw = url.match(/twitch.tv\/(videos\/)?([\w-]+)/);
    if (tw) {
      return <iframe width="100%" height="180" src={`https://player.twitch.tv/?${tw[1] ? 'video=' + tw[2] : 'channel=' + tw[2]}&parent=localhost`} frameBorder="0" allowFullScreen className="rounded my-2" title="Twitch stream" />;
    }
    
    // Instagram
    if (url.includes('instagram.com')) {
      return <a href={url} target="_blank" rel="noopener noreferrer" className="text-pink-600 underline my-2 block">Ver no Instagram</a>;
    }
    
    // TikTok
    if (url.includes('tiktok.com')) {
      return <a href={url} target="_blank" rel="noopener noreferrer" className="text-black underline my-2 block">Ver no TikTok</a>;
    }
    
    // Outro
    return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline my-2 block">Abrir link</a>;
  }

  // Função para obter thumbnail das plataformas
  function getThumbnail(url: string) {
    if (!url) return null;
    
    // YouTube
    const yt = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (yt) {
      return {
        src: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`,
        platform: 'YouTube',
        icon: '🎥',
        color: 'from-red-500 to-red-600'
      };
    }
    
    // Twitch - Stream ao vivo
    const twLive = url.match(/twitch\.tv\/([^/?]+)/);
    if (twLive && !url.includes('/videos/')) {
      return {
        src: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${twLive[1]}.jpg`,
        platform: 'Twitch Live',
        icon: '📺',
        color: 'from-purple-600 to-pink-600',
        fallback: true
      };
    }
    
    // Twitch - Vídeo
    const twVideo = url.match(/twitch\.tv\/videos\/(\d+)/);
    if (twVideo) {
      return {
        src: `https://static-cdn.jtvnw.net/videos_capture/${twVideo[1]}.jpg`,
        platform: 'Twitch Video',
        icon: '📺',
        color: 'from-purple-600 to-pink-600',
        fallback: true
      };
    }
    
    // Instagram
    if (url.includes('instagram.com')) {
      return {
        src: null, // Instagram não permite thumbnails diretos
        platform: 'Instagram',
        icon: '📷',
        color: 'from-pink-500 via-purple-500 to-orange-500'
      };
    }
    
    // TikTok
    if (url.includes('tiktok.com')) {
      return {
        src: null, // TikTok não permite thumbnails diretos
        platform: 'TikTok',
        icon: '🎵',
        color: 'from-gray-900 via-gray-800 to-gray-700'
      };
    }
    
    return {
      src: null,
      platform: 'Link',
      icon: '🔗',
      color: 'from-blue-500 to-blue-600'
    };
  }

  const [repasseSelecionado, setRepasseSelecionado] = useState<Repasse | null>(null);
  const [showModalRedesSociais, setShowModalRedesSociais] = useState(false);
  const [redesSociais, setRedesSociais] = useState({
    instagram: '',
    twitch: '',
    youtube: '',
    tiktok: ''
  });
  const [savingRedesSociais, setSavingRedesSociais] = useState(false);
  const [aprovarLoading, setAprovarLoading] = useState<string | null>(null);
  const [rejeitarLoading, setRejeitarLoading] = useState<string | null>(null);


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = auth.getUser();
        if (!currentUser) {
          window.location.href = '/login';
          return;
        }
        
        // Verificar se o usuário é parceiro no banco de dados
        const response = await fetch(`/api/parceiros/perfil?usuarioId=${currentUser.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            // Parceiro não encontrado - redirecionar para perfil
            alert('Acesso negado. Apenas parceiros podem acessar esta área.');
            window.location.href = '/perfil';
            return;
          } else {
            // Outro erro - redirecionar para login
            console.error('Erro ao verificar parceiro:', response.status);
            window.location.href = '/login';
            return;
          }
        }
        
        const parceiroData = await response.json();
        if (!parceiroData || !parceiroData.id) {
          // Se não retornou dados de parceiro, o usuário não é parceiro
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

  const fetchParceiro = useCallback(async () => {
    try {
      const response = await fetch(`/api/parceiros/perfil?usuarioId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setParceiro(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do parceiro:', error);
    }
  }, [user?.id]);

  const fetchTransacoes = useCallback(async () => {
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
  }, [user?.id]);

  const fetchEstatisticas = useCallback(async () => {
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
  }, [user?.id]);

  const fetchNotificacoes = useCallback(async () => {
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
  }, [user?.id]);

  const fetchRepasses = useCallback(async () => {
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
  }, [user?.id]);

  const fetchConteudos = useCallback(async () => {
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
  }, [parceiro?.id]);

  useEffect(() => {
    if (authorized && user) {
      fetchParceiro();
      fetchTransacoes();
      fetchEstatisticas();
      fetchNotificacoes();
      fetchRepasses();
      fetchConteudos();
    }
  }, [authorized, user, parceiro?.id, fetchParceiro, fetchTransacoes, fetchEstatisticas, fetchNotificacoes, fetchRepasses, fetchConteudos]);

  const getProgressWidthClass = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 100) return 'w-full';
    if (percentage >= 75) return 'w-3/4';
    if (percentage >= 50) return 'w-1/2';
    if (percentage >= 25) return 'w-1/4';
    return 'w-full';
  };

  const formatarNumero = (numero: number) => {
    if (numero >= 1000000) {
      return (numero / 1000000).toFixed(1) + 'M'
    } else if (numero >= 1000) {
      return (numero / 1000).toFixed(1) + 'K'
    }
    return numero.toString()
  };



  async function handleAddConteudo(e: React.FormEvent) {
    e.preventDefault();
    if (!formConteudo.titulo || !formConteudo.tipo || !formConteudo.categoria || !formConteudo.url || !formConteudo.cidade) {
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
          tipo: '',
          categoria: '', 
          url: '',
          cidade: ''
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
      const response = await fetch(`/api/parceiros/conteudos/${editandoConteudo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formConteudo
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConteudos(prev => prev.map(c => c.id === editandoConteudo.id ? data.conteudo : c));
        setFormConteudo({ 
          titulo: '',
          tipo: '',
          categoria: '', 
          url: '',
          cidade: ''
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
      const response = await fetch(`/api/parceiros/conteudos/${id}`, {
        method: 'DELETE'
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
      const response = await fetch(`/api/parceiros/conteudos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          fixado: fixar
        })
      });

      if (response.ok) {
        setConteudos(prev => prev.map(c => c.id === id ? { ...c, fixado: fixar } : c));
      }
    } catch (error) {
      console.error('Erro ao fixar conteúdo:', error);
    }
  }

  const [pagamentoPIX, setPagamentoPIX] = useState<any>(null);
  const [verificandoPagamento, setVerificandoPagamento] = useState(false);



  async function handleFazerPagamentoPIX(repasse: Repasse) {
    setRepasseSelecionado(repasse);
    setShowModalPIX(true);
    
    try {
      const response = await fetch('/api/mercadopago/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repasseId: repasse.id,
          parceiroId: parceiro?.id,
          usuarioId: user?.id,
          valor: repasse.valorRepasse
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPagamentoPIX(data);
        // Iniciar verificação automática
        verificarPagamento(data.paymentId);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao gerar pagamento PIX');
      }
    } catch (error) {
      alert('Erro ao gerar pagamento PIX');
    }
  }

  async function verificarPagamento(paymentId: string) {
    setVerificandoPagamento(true);
    
    const interval = setInterval(async () => {
      try {
        console.log('Verificando pagamento:', paymentId);
        const response = await fetch(`/api/mercadopago/verificar-pagamento?paymentId=${paymentId}`);
        console.log('Resposta da API:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Dados da resposta:', data);
          
          if (data.status === 'approved') {
            clearInterval(interval);
            setVerificandoPagamento(false);
            
            // Processar repasse automaticamente
            await processarRepasseAutomaticamente(paymentId);
            
            alert('Pagamento confirmado e repasse processado automaticamente!');
            setShowModalPIX(false);
            setRepasseSelecionado(null);
            setPagamentoPIX(null);
            
            // Aguardar um pouco antes de atualizar a lista
            setTimeout(() => {
              fetchRepasses();
            }, 1000);
          } else if (data.status === 'rejected' || data.status === 'cancelled') {
            clearInterval(interval);
            setVerificandoPagamento(false);
            alert(`Pagamento ${data.status}. Tente novamente.`);
            setShowModalPIX(false);
            setRepasseSelecionado(null);
            setPagamentoPIX(null);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      }
    }, 5000); // Verificar a cada 5 segundos

    // Parar verificação após 5 minutos
    setTimeout(() => {
      clearInterval(interval);
      setVerificandoPagamento(false);
    }, 300000);
  }

  async function processarRepasseAutomaticamente(paymentId: string) {
    if (!repasseSelecionado) return;

    try {
      const response = await fetch('/api/parceiros/confirmar-pagamento-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repasseId: repasseSelecionado.id,
          comprovanteUrl: null,
          paymentId: paymentId
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Repasse processado automaticamente:', result);
      } else {
        const error = await response.json();
        console.error('Erro ao processar repasse automaticamente:', error);
      }
    } catch (error) {
      console.error('Erro ao processar repasse automaticamente:', error);
    }
  }

  async function aprovarSolicitacao(solicitacaoId: string) {
    if (!parceiro) return;
    
    setAprovarLoading(solicitacaoId);
    try {
      const response = await fetch(`/api/parceiros/solicitacoes/${solicitacaoId}/aprovar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parceiroId: parceiro.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Solicitação aprovada:', result);
        alert('Solicitação aprovada com sucesso!');
        fetchRepasses(); // Recarregar repasses
      } else {
        const error = await response.json();
        console.error('Erro ao aprovar solicitação:', error);
        alert(`Erro ao aprovar solicitação: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
      alert('Erro ao aprovar solicitação');
    } finally {
      setAprovarLoading(null);
    }
  }

  async function rejeitarSolicitacao(solicitacaoId: string) {
    if (!parceiro) return;
    
    const motivo = prompt('Motivo da rejeição:');
    if (!motivo) return;
    
    setRejeitarLoading(solicitacaoId);
    try {
      const response = await fetch(`/api/parceiros/solicitacoes/${solicitacaoId}/rejeitar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parceiroId: parceiro.id,
          motivoRejeicao: motivo
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Solicitação rejeitada:', result);
        alert('Solicitação rejeitada com sucesso!');
        fetchRepasses(); // Recarregar repasses
      } else {
        const error = await response.json();
        console.error('Erro ao rejeitar solicitação:', error);
        alert(`Erro ao rejeitar solicitação: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      alert('Erro ao rejeitar solicitação');
    } finally {
      setRejeitarLoading(null);
    }
  }

  async function handleSalvarRedesSociais(e: React.FormEvent) {
    e.preventDefault();
    if (!parceiro) return;

    setSavingRedesSociais(true);
    try {
      const response = await fetch(`/api/parceiros/redes-sociais`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parceiroId: parceiro.id,
          redesSociais
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Redes sociais salvas:', result);
        alert('Redes sociais salvas com sucesso!');
        setShowModalRedesSociais(false);
        // Atualizar dados do parceiro
        if (result.parceiro) {
          setParceiro(result.parceiro);
        }
      } else {
        const error = await response.json();
        console.error('Erro ao salvar redes sociais:', error);
        alert(`Erro ao salvar redes sociais: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao salvar redes sociais:', error);
      alert('Erro ao salvar redes sociais');
    } finally {
      setSavingRedesSociais(false);
    }
  }

  async function carregarRedesSociais() {
    if (!parceiro) return;
    
    setRedesSociais({
      instagram: parceiro.instagram || '',
      twitch: parceiro.twitch || '',
      youtube: parceiro.youtube || '',
      tiktok: parceiro.tiktok || ''
    });
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
                    tipo: '',
                    categoria: '', 
                    url: '',
                    cidade: ''
                  });
                }}
                className="text-gray-400 hover:text-sss-white transition-colors"
                aria-label="Fechar modal"
              >
                <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            
            <form onSubmit={editandoConteudo ? handleEditConteudo : handleAddConteudo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
                <input 
                  required 
                  type="text"
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  placeholder="Título do conteúdo" 
                  value={formConteudo.titulo} 
                  onChange={e => setFormConteudo(f => ({ ...f, titulo: e.target.value }))} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL *</label>
                <input 
                  required 
                  type="url"
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  placeholder="Link do conteúdo" 
                  value={formConteudo.url} 
                  onChange={e => setFormConteudo(f => ({ ...f, url: e.target.value }))} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo *</label>
                <select 
                  required
                  aria-label="Tipo do conteúdo"
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all"
                  value={formConteudo.tipo}
                  onChange={e => setFormConteudo(f => ({ ...f, tipo: e.target.value }))}
                >
                  <option value="">Selecione o tipo</option>
                  <option value="evento">Evento</option>
                  <option value="noticia">Notícia</option>
                  <option value="conteudo">Conteúdo</option>
                  <option value="cidade">Cidade</option>
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
                  <option value="noticias">Notícias</option>
                  <option value="conteudos">Conteúdos</option>
                  <option value="cidade">Cidade</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cidade *</label>
                <input 
                  required 
                  type="text"
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  placeholder="Nome da cidade" 
                  value={formConteudo.cidade} 
                  onChange={e => setFormConteudo(f => ({ ...f, cidade: e.target.value }))} 
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
                      tipo: '',
                      categoria: '', 
                      url: '',
                      cidade: ''
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

      {/* Modal de Redes Sociais */}
      {showModalRedesSociais && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-sss-medium rounded-2xl p-6 w-full max-w-2xl border border-sss-light shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-sss-white">
                Configurar Redes Sociais
              </h2>
              <button
                onClick={() => { 
                  setShowModalRedesSociais(false); 
                  carregarRedesSociais(); // Resetar para valores originais
                }}
                className="text-gray-400 hover:text-sss-white transition-colors"
                aria-label="Fechar modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSalvarRedesSociais} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Instagram</label>
                <input 
                  type="url"
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  placeholder="https://instagram.com/seu-usuario" 
                  value={redesSociais.instagram} 
                  onChange={e => setRedesSociais(f => ({ ...f, instagram: e.target.value }))} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Twitch</label>
                <input 
                  type="url"
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  placeholder="https://twitch.tv/seu-canal" 
                  value={redesSociais.twitch} 
                  onChange={e => setRedesSociais(f => ({ ...f, twitch: e.target.value }))} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">YouTube</label>
                <input 
                  type="url"
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  placeholder="https://youtube.com/@seu-canal" 
                  value={redesSociais.youtube} 
                  onChange={e => setRedesSociais(f => ({ ...f, youtube: e.target.value }))} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">TikTok</label>
                <input 
                  type="url"
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  placeholder="https://tiktok.com/@seu-usuario" 
                  value={redesSociais.tiktok} 
                  onChange={e => setRedesSociais(f => ({ ...f, tiktok: e.target.value }))} 
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-sss-accent text-sss-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                  disabled={savingRedesSociais}
                >
                  {savingRedesSociais ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sss-white"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Salvar Redes Sociais
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="px-6 py-3 bg-sss-light text-sss-white rounded-lg hover:bg-sss-light transition-colors" 
                  onClick={() => { 
                    setShowModalRedesSociais(false); 
                    carregarRedesSociais(); // Resetar para valores originais
                  }} 
                  disabled={savingRedesSociais}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-sss-medium rounded-2xl p-4 w-full max-w-md border border-sss-light shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-sss-white">
                Pagamento PIX
              </h2>
              <button 
                onClick={() => { 
                  setShowModalPIX(false); 
                  setRepasseSelecionado(null);
                }}
                className="text-gray-400 hover:text-sss-white transition-colors"
                aria-label="Fechar modal"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
                                <div className="bg-sss-light/30 rounded-lg p-3">
                    <h3 className="text-sss-white font-semibold mb-2">Detalhes do Repasse</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Valor da Compra:</span>
                        <span className="text-sss-white">R$ {repasseSelecionado.valorCompra.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Valor do Repasse (10%):</span>
                        <span className="text-sss-accent font-semibold">R$ {repasseSelecionado.valorRepasse.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Data da Compra:</span>
                        <span className="text-sss-white">{new Date(repasseSelecionado.dataCompra).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

              {pagamentoPIX ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 max-h-[70vh] overflow-y-auto">
                  <h3 className="text-green-400 font-semibold mb-3">Pagamento PIX Integrado</h3>
                  
                  {/* QR Code */}
                  <div className="text-center mb-3">
                    <Image 
                      src={pagamentoPIX.pixCode} 
                      alt="QR Code PIX" 
                      width={160}
                      height={160}
                      className="mx-auto bg-white rounded-lg p-2"
                    />
                  </div>

                  {/* Código PIX */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-400 mb-2">Código PIX (copie e cole no app):</p>
                    <div className="bg-gray-700 p-2 rounded-lg">
                      <code className="text-xs text-white break-all">{pagamentoPIX.qrCode}</code>
                    </div>
                  </div>

                  {/* Dados do PIX */}
                  <div className="space-y-2 mb-3">
                    <div>
                      <p className="text-sm text-gray-400">Chave PIX:</p>
                      <div className="bg-gray-700 p-2 rounded-lg">
                        <div className="flex items-start gap-2">
                          <code className="text-xs text-white break-all flex-1">{pagamentoPIX.pixData.chavePix}</code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(pagamentoPIX.pixData.chavePix);
                              alert('Chave PIX copiada!');
                            }}
                            className="text-sss-accent hover:text-sss-accent/80 flex-shrink-0"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Valor a pagar:</p>
                      <p className="text-green-400 font-bold text-lg">R$ {pagamentoPIX.pixData.valor.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Descrição:</p>
                      <p className="text-sss-white text-sm">{pagamentoPIX.pixData.descricao}</p>
                    </div>
                  </div>

                  {/* Instruções */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 mb-3">
                    <h4 className="text-blue-400 font-semibold mb-2">Instruções:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {pagamentoPIX.instrucoes.map((instrucao: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          {instrucao}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Status do pagamento */}
                  {verificandoPagamento && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 text-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400 mx-auto mb-2"></div>
                      <p className="text-yellow-400 text-sm">Verificando pagamento...</p>
                      <p className="text-gray-400 text-xs">O repasse será processado automaticamente quando confirmado</p>
                    </div>
                  )}



                  <div className="flex gap-3 pt-3">
                    <button 
                      type="button" 
                      className="flex-1 bg-sss-light text-sss-white px-4 py-2 rounded-lg hover:bg-sss-light transition-colors" 
                      onClick={() => { 
                        setShowModalPIX(false); 
                        setRepasseSelecionado(null);
                        setPagamentoPIX(null);
                      }}
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-3"></div>
                    <p className="text-yellow-400">Gerando pagamento PIX...</p>
                  </div>
                </div>
              )}
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
                    <div className="text-sm text-green-300">Total de Repasses</div>
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
                      {!loadingEstatisticas ? estatisticas?.repassesRealizados || 0 : '--'}
                    </div>
                                          <div className="text-sm text-purple-300">Repasses Realizados</div>
                  </div>
                </div>
                <div className="h-1 bg-purple-500/20 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full ${getProgressWidthClass(estatisticas?.repassesRealizados || 0, 50)}`}></div>
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
                                          <div className="text-sm text-yellow-300">Usuários com Repasse</div>
                  </div>
                </div>
                <div className="h-1 bg-yellow-500/20 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full ${getProgressWidthClass(estatisticas?.usuariosAtivos || 0, 100)}`}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Configurações */}
          <section className="mb-8">
            <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
              <div className="p-6 border-b border-sss-light">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Cog6ToothIcon className="w-5 h-5 text-sss-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-sss-white">Configurações</h2>
                    <p className="text-sm text-gray-400">Gerencie suas informações e redes sociais</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informações da Cidade */}
                  <div className="bg-sss-light/30 rounded-lg p-4">
                    <h3 className="text-sss-white font-semibold mb-3">Informações da Cidade</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-400">Nome da Cidade</p>
                        <p className="text-sss-white font-medium">{parceiro?.nomeCidade || 'Não definido'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Comissão Mensal</p>
                        <p className="text-sss-white font-medium">{parceiro?.comissaoMensal ? `R$ ${parceiro.comissaoMensal.toFixed(2)}` : 'Não definido'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Redes Sociais */}
                  <div className="bg-sss-light/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sss-white font-semibold">Redes Sociais</h3>
                      <button
                        onClick={() => {
                          carregarRedesSociais();
                          setShowModalRedesSociais(true);
                        }}
                        className="text-sss-accent hover:text-red-400 text-sm font-medium transition-colors"
                      >
                        Editar
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Instagram:</span>
                        <span className="text-sss-white text-sm">
                          {parceiro?.instagram ? (
                            <a href={parceiro.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                              Ver perfil
                            </a>
                          ) : (
                            'Não configurado'
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Twitch:</span>
                        <span className="text-sss-white text-sm">
                          {parceiro?.twitch ? (
                            <a href={parceiro.twitch} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                              Ver canal
                            </a>
                          ) : (
                            'Não configurado'
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">YouTube:</span>
                        <span className="text-sss-white text-sm">
                          {parceiro?.youtube ? (
                            <a href={parceiro.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                              Ver canal
                            </a>
                          ) : (
                            'Não configurado'
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">TikTok:</span>
                        <span className="text-sss-white text-sm">
                          {parceiro?.tiktok ? (
                            <a href={parceiro.tiktok} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                              Ver perfil
                            </a>
                          ) : (
                            'Não configurado'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
                    {repasses.map((repasse) => (
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
                          <div className="flex gap-2">
                            {repasse.comprovante && (
                              <button
                                onClick={() => window.open(repasse.comprovante, '_blank')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                                title="Ver comprovante"
                              >
                                <DocumentTextIcon className="w-4 h-4" />
                                Comprovante
                              </button>
                            )}
                            {repasse.tipo === 'solicitacao' && (
                              <>
                                <button
                                  onClick={() => aprovarSolicitacao(repasse.id)}
                                  disabled={aprovarLoading === repasse.id}
                                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                                  title="Aprovar solicitação"
                                >
                                  {aprovarLoading === repasse.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  ) : (
                                    <CheckIcon className="w-4 h-4" />
                                  )}
                                  {aprovarLoading === repasse.id ? 'Aprovando...' : 'Aprovar'}
                                </button>
                                <button
                                  onClick={() => rejeitarSolicitacao(repasse.id)}
                                  disabled={rejeitarLoading === repasse.id}
                                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                                  title="Rejeitar solicitação"
                                >
                                  {rejeitarLoading === repasse.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  ) : (
                                    <XMarkIcon className="w-4 h-4" />
                                  )}
                                  {rejeitarLoading === repasse.id ? 'Rejeitando...' : 'Rejeitar'}
                                </button>
                              </>
                            )}
                            {(repasse.tipo === 'repasse' || repasse.tipo === 'compra') && 
                             (repasse.status === 'pendente' || repasse.status === 'aguardando_repasse') && (
                              <button
                                onClick={() => handleFazerPagamentoPIX(repasse)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                              >
                                Pagar PIX
                              </button>
                            )}
                          </div>
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
                      <p className="text-sm text-gray-400">Gerencie seus eventos, notícias e conteúdos</p>
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
                      <div key={conteudo.id} className="bg-sss-light/50 rounded-xl overflow-hidden hover:bg-sss-light/70 transition-all duration-300 group border border-sss-light hover:border-gray-500 cursor-pointer">
                        {/* Área clicável para o conteúdo */}
                        <div 
                          className="cursor-pointer"
                          onClick={() => window.open(conteudo.url, '_blank', 'noopener,noreferrer')}
                        >
                          {/* Prévia visual do conteúdo */}
                          {(() => {
                            const thumbnail = getThumbnail(conteudo.url);
                            if (thumbnail && thumbnail.src) {
                              // YouTube e Twitch com thumbnail real
                              return (
                                <div className="relative">
                                  <img 
                                    src={thumbnail.src} 
                                    alt={conteudo.titulo} 
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      // Fallback para gradiente se a imagem falhar
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                  {/* Fallback para Twitch se a imagem falhar */}
                                  {thumbnail.fallback && (
                                    <div className={`w-full h-48 bg-gradient-to-br ${thumbnail.color} rounded-t-xl flex items-center justify-center hidden`}>
                                      <div className="text-center">
                                        <span className="text-4xl mb-2 block">{thumbnail.icon}</span>
                                        <p className="text-sss-white font-semibold">{thumbnail.platform}</p>
                                      </div>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="bg-red-600 hover:bg-red-700 text-sss-white px-4 py-2 rounded-lg font-semibold transition-colors">
                                      {(() => {
                                        if (conteudo.url.includes('youtube.com') || conteudo.url.includes('youtu.be')) {
                                          return 'Assistir no YouTube';
                                        } else if (conteudo.url.includes('twitch.tv')) {
                                          return 'Assistir na Twitch';
                                        } else if (conteudo.url.includes('instagram.com')) {
                                          return 'Ver no Instagram';
                                        } else if (conteudo.url.includes('tiktok.com')) {
                                          return 'Ver no TikTok';
                                        } else {
                                          return 'Abrir Link';
                                        }
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              );
                            } else {
                              // Outras plataformas com gradiente personalizado
                              return (
                                <div className={`w-full h-48 bg-gradient-to-br ${thumbnail?.color || 'from-gray-600 to-gray-700'} flex items-center justify-center text-white group-hover:scale-105 transition-all duration-300 relative overflow-hidden`}>
                                  <div className="text-center z-10">
                                    <div className="text-4xl mb-2">{thumbnail?.icon || '🔗'}</div>
                                    <div className="text-sm font-medium">{thumbnail?.platform || 'Link'}</div>
                                  </div>
                                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
                                </div>
                              );
                            }
                          })()}
                          
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <DocumentTextIcon className="w-5 h-5 text-indigo-400" />
                                <span className="text-sss-white font-medium truncate">{conteudo.titulo}</span>
                              </div>
                              {conteudo.fixado && (
                                <span className="bg-yellow-600 text-sss-white px-2 py-1 rounded text-xs font-semibold">
                                  Fixado
                                </span>
                              )}
                            </div>
                            
                            {/* Informações do conteúdo */}
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between">
                                <div>
                                  <p className="text-xs text-gray-400">Tipo</p>
                                  <p className="text-sss-white capitalize text-sm">{conteudo.tipo}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Categoria</p>
                                  <p className="text-sss-white capitalize text-sm">{conteudo.categoria}</p>
                                </div>
                              </div>
                              
                              {/* Estatísticas do conteúdo */}
                              <div className="pt-2 border-t border-gray-600">
                                <div className="flex justify-between items-center text-xs">
                                  <div className="flex items-center space-x-1">
                                    <span className="text-yellow-400">👁️</span>
                                    <span className="text-gray-300">{formatarNumero(conteudo.visualizacoes || 0)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-green-400">👍</span>
                                    <span className="text-gray-300">{formatarNumero(conteudo.curtidas || 0)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-red-400">👎</span>
                                    <span className="text-gray-300">{formatarNumero(conteudo.dislikes || 0)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Botões de ação (fora da área clicável) */}
                        <div className="px-4 pb-4 flex justify-between items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFixarConteudo(conteudo.id, !conteudo.fixado);
                            }}
                            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${conteudo.fixado ? 'bg-yellow-600 hover:bg-yellow-700 text-sss-white' : 'bg-gray-600 hover:bg-gray-700 text-sss-white'}`}
                          >
                            {conteudo.fixado ? 'Desfixar' : 'Fixar'}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoverConteudo(conteudo.id);
                            }}
                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                            title="Remover"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
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