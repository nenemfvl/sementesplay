import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { auth } from '../lib/auth';
import { 
  ChartBarIcon, 
  VideoCameraIcon, 
  TrophyIcon, 
  HeartIcon, 
  ShareIcon, 
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
  MapPinIcon
} from '@heroicons/react/24/outline';

type Conteudo = {
  id: string;
  titulo: string;
  tipo: string;
  dataPublicacao?: string;
};

type Missao = {
  id: string;
  titulo: string;
  descricao: string;
};
type Conquista = {
  id: string;
  titulo: string;
  descricao: string;
};
type Doacao = {
  id: string;
  quantidade: number;
  data: string;
  mensagem?: string;
  doador?: { nome: string };
};
type DoadorRanking = {
  id: string;
  nome: string;
  total: number;
};
type Notificacao = {
  id: string;
  titulo: string;
  mensagem: string;
  data: string;
};

type Recado = {
  id: string;
  usuarioNome: string;
  mensagem: string;
  data: string;
  resposta?: string;
  publico?: boolean;
};
type Enquete = {
  id: string;
  pergunta: string;
  opcoes: { id: string; texto: string; votos: number }[];
  data: string;
};


export default function PainelCriador() {
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ titulo: '', url: '', tipo: '', categoria: '' });
  const [saving, setSaving] = useState(false);
  const tituloRef = useRef<HTMLInputElement>(null);
  const [editando, setEditando] = useState<Conteudo | null>(null);
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [conquistas, setConquistas] = useState<Conquista[]>([]);
  const [loadingMissoes, setLoadingMissoes] = useState(true);
  const [loadingConquistas, setLoadingConquistas] = useState(true);
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [ranking, setRanking] = useState<DoadorRanking[]>([]);
  const [loadingDoacoes, setLoadingDoacoes] = useState(true);
  const [loadingRanking, setLoadingRanking] = useState(true);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(true);
  const [suporteMsg, setSuporteMsg] = useState('');
  const [suporteStatus, setSuporteStatus] = useState<'idle'|'enviando'|'enviado'>('idle');

  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [recados, setRecados] = useState<Recado[]>([]);
  const [loadingRecados, setLoadingRecados] = useState(true);
  const [resposta, setResposta] = useState<{[id:string]:string}>({});
  const [respondendo, setRespondendo] = useState<string|null>(null);
  const [respostaStatus, setRespostaStatus] = useState<{[id:string]:string}>({});
  const [toggleStatus, setToggleStatus] = useState<{[id:string]:string}>({});
  const [enquetes, setEnquetes] = useState<Enquete[]>([]);
  const [loadingEnquetes, setLoadingEnquetes] = useState(true);
  const [novaEnquete, setNovaEnquete] = useState<{pergunta:string, opcoes:string[]}>({pergunta:'', opcoes:['','']});
  const [salvandoEnquete, setSalvandoEnquete] = useState(false);
  const [enqueteStatus, setEnqueteStatus] = useState<'idle'|'salva'>('idle');
  const [copiado, setCopiado] = useState(false);

  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [criadorId, setCriadorId] = useState<string | null>(null);

  // Estados para redes sociais
  const [redesSociais, setRedesSociais] = useState({
    youtube: '',
    twitch: '',
    instagram: '',
    tiktok: ''
  })
  const [salvandoRedes, setSalvandoRedes] = useState(false)
  const [redesStatus, setRedesStatus] = useState<'idle'|'salvando'|'salvo'>('idle')

  // Verificação de autenticação e autorização
  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Verificação simplificada usando localStorage
      if (user.nivel === 'criador-iniciante' || user.nivel === 'criador-comum' || user.nivel === 'criador-parceiro' || user.nivel === 'criador-supremo') {
        setAuthorized(true);
        setCheckingAuth(false);
      } else {
        alert(`Acesso negado. Seu nível é: ${user.nivel || 'desconhecido'}. Apenas criadores podem acessar o painel de criador.`);
        window.location.href = '/dashboard';
      }
    };

    checkAuth();
  }, []);

  // Link de divulgação temporário
  const linkDivulgacao = '';

  // Estatísticas calculadas
  const totalVisualizacoes = Array.isArray(conteudos) ? conteudos.reduce((acc, c) => acc + (c as any).visualizacoes || 0, 0) : 0;
  const totalCurtidas = Array.isArray(conteudos) ? conteudos.reduce((acc, c) => acc + (c as any).likes || 0, 0) : 0;
  const totalDislikes = Array.isArray(conteudos) ? conteudos.reduce((acc, c) => acc + ((c as any).dislikes || 0), 0) : 0;
  const totalCompartilhamentos = Array.isArray(conteudos) ? conteudos.reduce((acc, c) => acc + (c as any).compartilhamentos || 0, 0) : 0;

  function handleFixarConteudo(id: string, fixar: boolean) {
    setConteudos(prev => prev.map(c => c.id === id ? { ...c, fixado: fixar } : (fixar ? { ...c, fixado: false } : c)));
    // Aqui você pode fazer um fetch PUT para atualizar no backend se desejar
  }

  const categorias = Array.isArray(conteudos) ? Array.from(new Set(conteudos.map((c: any) => c.categoria).filter(Boolean))) : [];
  const conteudoFixado = Array.isArray(conteudos) ? conteudos.find((c: any) => c.fixado) : undefined;
  const conteudosFiltrados = Array.isArray(conteudos) ? conteudos.filter((c: any) => (!categoriaFiltro || c.categoria === categoriaFiltro) && (!conteudoFixado || c.id !== conteudoFixado?.id)) : [];

  // Só carregar dados se estiver autorizado
  useEffect(() => {
    if (!authorized) return;

    async function fetchConteudos() {
      setLoading(true);
      try {
        const user = auth.getUser();
        if (!user) {
          setConteudos([]);
          return;
        }
        
        // Primeiro buscar o criadorId do usuário
        const criadorRes = await fetch(`/api/criadores?usuarioId=${user.id}`);
        const criadorData = await criadorRes.json();
        
        if (!criadorData.criadores || criadorData.criadores.length === 0) {
          console.log('Nenhum criador encontrado para o usuário');
          setConteudos([]);
          return;
        }
        
        const criadorId = criadorData.criadores[0].id;
        console.log('Criador ID encontrado:', criadorId);
        
        // Agora buscar os conteúdos usando o criadorId
        const res = await fetch(`/api/conteudos?criadorId=${criadorId}`);
        const data = await res.json();
        setConteudos(Array.isArray(data) ? data : (data?.conteudos || []));
      } catch (e) {
        console.error('Erro ao buscar conteúdos:', e);
        setConteudos([]);
      }
      setLoading(false);
    }
    fetchConteudos();
  }, [authorized]);

  useEffect(() => {
    if (!authorized) return;

    async function fetchMissoes() {
      setLoadingMissoes(true);
      try {
        const res = await fetch('/api/missoes');
        const data = await res.json();
        setMissoes(Array.isArray(data) ? data : (data?.missoes || []));
      } catch {
        setMissoes([]);
      }
      setLoadingMissoes(false);
    }
    async function fetchConquistas() {
      setLoadingConquistas(true);
      try {
        const res = await fetch('/api/conquistas');
        const data = await res.json();
        setConquistas(Array.isArray(data) ? data : (data?.conquistas || []));
      } catch {
        setConquistas([]);
      }
      setLoadingConquistas(false);
    }
    fetchMissoes();
    fetchConquistas();
  }, [authorized]);

  useEffect(() => {
    if (!authorized) return;

    async function fetchDoacoes() {
      setLoadingDoacoes(true);
      try {
        const user = auth.getUser();
        if (!user) {
          setDoacoes([]);
          return;
        }
        
        const res = await fetch('/api/criador/doacoes-recebidas', {
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        });
        const data = await res.json();
        setDoacoes(Array.isArray(data) ? data : []);
      } catch {
        setDoacoes([]);
      }
      setLoadingDoacoes(false);
    }
    async function fetchRanking() {
      setLoadingRanking(true);
      try {
        const res = await fetch('/api/ranking/doadores');
        const data = await res.json();
        setRanking(Array.isArray(data) ? data : (data?.ranking || []));
      } catch {
        setRanking([]);
      }
      setLoadingRanking(false);
    }
    fetchDoacoes();
    fetchRanking();
  }, [authorized]);

  useEffect(() => {
    if (!authorized) return;

    async function fetchNotificacoes() {
      setLoadingNotificacoes(true);
      try {
        const res = await fetch('/api/notificacoes');
        const data = await res.json();
        setNotificacoes(Array.isArray(data) ? data : (data?.notificacoes || []));
      } catch {
        setNotificacoes([]);
      }
      setLoadingNotificacoes(false);
    }
    fetchNotificacoes();
  }, [authorized]);



  useEffect(() => {
    if (!authorized) return;

    async function fetchRecados() {
      setLoadingRecados(true);
      try {
        const user = auth.getUser();
        if (!user) {
          setRecados([]);
          return;
        }
        
        const res = await fetch('/api/recados', {
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        });
        const data = await res.json();
        setRecados(Array.isArray(data?.recados) ? data.recados : []);
      } catch (error) {
        console.error('Erro ao buscar recados:', error);
        setRecados([]);
      }
      setLoadingRecados(false);
    }
    fetchRecados();
  }, [authorized]);

  useEffect(() => {
    if (!authorized) return;

    async function fetchEnquetes() {
      setLoadingEnquetes(true);
      try {
        const user = auth.getUser();
        if (!user) {
          setEnquetes([]);
          return;
        }
        
        const res = await fetch('/api/enquetes', {
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        });
        const data = await res.json();
        setEnquetes(Array.isArray(data?.enquetes) ? data.enquetes : []);
      } catch (error) {
        console.error('Erro ao buscar enquetes:', error);
        setEnquetes([]);
      }
      setLoadingEnquetes(false);
    }
    fetchEnquetes();
  }, [authorized]);

  // Carregar dados do criador (incluindo redes sociais)
  useEffect(() => {
    if (!authorized) return;

    async function fetchCriador() {
      try {
        const user = auth.getUser();
        if (user) {
          const res = await fetch(`/api/criador/${user.id}`);
          const data = await res.json();
          if (data.criador) {
            // O criadorId correto é data.criador.id
            setCriadorId(data.criador.id);
            if (data.criador.redesSociais) {
              setRedesSociais(data.criador.redesSociais);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do criador:', error);
      }
    }
    fetchCriador();
  }, [authorized]);

  async function handleSalvarRedesSociais(e: React.FormEvent) {
    e.preventDefault();
    setSalvandoRedes(true);
    setRedesStatus('salvando');
    
    try {
      const user = auth.getUser();
      if (!user) return;

      const res = await fetch(`/api/criador/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({ redesSociais })
      });

      if (res.ok) {
        setRedesStatus('salvo');
        setTimeout(() => setRedesStatus('idle'), 3000);
      } else {
        alert('Erro ao salvar redes sociais');
      }
    } catch (error) {
      console.error('Erro ao salvar redes sociais:', error);
      alert('Erro ao salvar redes sociais');
    } finally {
      setSalvandoRedes(false);
    }
  }

  async function handleAddConteudo(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (!criadorId) {
        alert('ID do criador não encontrado.');
        setSaving(false);
        return;
      }
      const res = await fetch('/api/conteudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, criadorId }),
      });
      if (res.ok) {
        const novo = await res.json();
        setConteudos((prev) => [novo, ...prev]);
        setShowModal(false);
        setForm({ titulo: '', url: '', tipo: '', categoria: '' });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleEditConteudo(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setSaving(true);
    try {
      if (!criadorId) {
        alert('ID do criador não encontrado.');
        setSaving(false);
        return;
      }
      const res = await fetch('/api/conteudos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: editando.id, criadorId }),
      });
      if (res.ok) {
        const atualizado = await res.json();
        setConteudos((prev) => prev.map(c => c.id === atualizado.id ? atualizado : c));
        setShowModal(false);
        setEditando(null);
        setForm({ titulo: '', url: '', tipo: '', categoria: '' });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoverConteudo(id: string) {
    if (!window.confirm('Tem certeza que deseja remover este conteúdo?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/conteudos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setConteudos((prev) => prev.filter(c => c.id !== id));
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleEnviarSuporte(e: React.FormEvent) {
    e.preventDefault();
    if (!suporteMsg.trim()) return;
    setSuporteStatus('enviando');
    try {
      await fetch('/api/moderacao/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: suporteMsg }),
      });
      setSuporteStatus('enviado');
      setSuporteMsg('');
    } finally {
      setTimeout(() => setSuporteStatus('idle'), 3000);
    }
  }



  async function handleResponderRecado(e: React.FormEvent, id: string) {
    e.preventDefault();
    setRespostaStatus(s => ({...s, [id]: 'enviando'}));
    try {
      const user = auth.getUser();
      if (!user) return;

      await fetch('/api/recados/responder', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({ id, resposta: resposta[id] }),
      });
      setRespostaStatus(s => ({...s, [id]: 'enviado'}));
      setRecados(rs => rs.map(r => r.id === id ? { ...r, resposta: resposta[id] } : r));
      setResposta(r => ({...r, [id]: ''}));
      setRespondendo(null);
    } catch (error) {
      console.error('Erro ao responder recado:', error);
    } finally {
      setTimeout(() => setRespostaStatus(s => ({...s, [id]: ''})), 2000);
    }
  }

  async function handleTogglePublico(id: string, publico: boolean) {
    setToggleStatus(s => ({...s, [id]: 'alterando'}));
    try {
      const user = auth.getUser();
      if (!user) return;

      await fetch('/api/recados/toggle-publico', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({ id, publico }),
      });
      
      setToggleStatus(s => ({...s, [id]: 'alterado'}));
      setRecados(rs => rs.map(r => r.id === id ? { ...r, publico } : r));
      
      setTimeout(() => setToggleStatus(s => ({...s, [id]: ''})), 2000);
    } catch (error) {
      console.error('Erro ao alterar visibilidade:', error);
      setToggleStatus(s => ({...s, [id]: 'erro'}));
      setTimeout(() => setToggleStatus(s => ({...s, [id]: ''})), 2000);
    }
  }

  async function handleCriarEnquete(e: React.FormEvent) {
    e.preventDefault();
    setSalvandoEnquete(true);
    try {
      const user = auth.getUser();
      if (!user) return;

      await fetch('/api/enquetes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({
          pergunta: novaEnquete.pergunta,
          opcoes: novaEnquete.opcoes.filter(Boolean)
        }),
      });
      setEnqueteStatus('salva');
      setNovaEnquete({pergunta:'', opcoes:['','']});
      setTimeout(() => setEnqueteStatus('idle'), 2000);
      // Atualizar lista
      const res = await fetch('/api/enquetes', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      const data = await res.json();
      setEnquetes(Array.isArray(data?.enquetes) ? data.enquetes : []);
    } catch (error) {
      console.error('Erro ao criar enquete:', error);
    } finally {
      setSalvandoEnquete(false);
    }
  }



  function getPreview(url: string) {
    if (!url) return null;
    // YouTube
    const yt = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (yt) {
      return <iframe width="100%" height="180" src={`https://www.youtube.com/embed/${yt[1]}`} frameBorder="0" allowFullScreen className="rounded my-2" />;
    }
    // Twitch
    const tw = url.match(/twitch.tv\/(videos\/)?([\w-]+)/);
    if (tw) {
      return <iframe width="100%" height="180" src={`https://player.twitch.tv/?${tw[1] ? 'video=' + tw[2] : 'channel=' + tw[2]}&parent=localhost`} frameBorder="0" allowFullScreen className="rounded my-2" />;
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

  function handleCopiarLink() {
    if (!linkDivulgacao) return;
    navigator.clipboard.writeText(linkDivulgacao);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }



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

  // Mostrar loading enquanto verifica autorização
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
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
        <title>Painel do Criador | SementesPLAY</title>
      </Head>
      
      {/* Modal de adicionar conteúdo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-sss-medium rounded-2xl p-6 w-full max-w-md border border-sss-light shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-sss-white">
                {editando ? 'Editar Conteúdo' : 'Adicionar Conteúdo'}
              </h2>
              <button 
                onClick={() => { setShowModal(false); setEditando(null); }}
                className="text-gray-400 hover:text-sss-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={editando ? handleEditConteudo : handleAddConteudo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                <input 
                  ref={tituloRef}
                  required 
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  placeholder="Título do conteúdo" 
                  value={form.titulo} 
                  onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
                <input 
                  required 
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  placeholder="Link do conteúdo" 
                  value={form.url} 
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                <input 
                  required 
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  placeholder="Ex: vídeo, live, post" 
                  value={form.tipo} 
                  onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
                <input 
                  required 
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  placeholder="Categoria do conteúdo" 
                  value={form.categoria} 
                  onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} 
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
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      {editando ? 'Salvar' : 'Adicionar'}
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
        {/* Header */}
        <div className="bg-sss-medium/50 backdrop-blur-sm border-b border-sss-light sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <VideoCameraIcon className="w-5 h-5 text-sss-white" />
                  </div>
                  <h1 className="text-xl font-bold text-sss-white">Painel do Criador</h1>
                </div>
              </div>
              
              <button 
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-sss-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <PlusIcon className="w-4 h-4" />
                Adicionar Conteúdo
              </button>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Estatísticas principais */}
          <section className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-all">
                    <EyeIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-sss-white">{!loading ? totalVisualizacoes.toLocaleString() : '--'}</div>
                    <div className="text-sm text-blue-300">Visualizações</div>
                  </div>
                </div>
                <div className="h-1 bg-blue-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{width: `${Math.min((totalVisualizacoes / 1000) * 100, 100)}%`}}></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center group-hover:bg-pink-500/30 transition-all">
                    <HeartIcon className="w-6 h-6 text-pink-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-sss-white">{!loading ? totalCurtidas.toLocaleString() : '--'}</div>
                    <div className="text-sm text-pink-300">Curtidas</div>
                  </div>
                </div>
                <div className="h-1 bg-pink-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full" style={{width: `${Math.min((totalCurtidas / 100) * 100, 100)}%`}}></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:bg-red-500/30 transition-all">
                    <XMarkIcon className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-sss-white">{!loading ? totalDislikes.toLocaleString() : '--'}</div>
                    <div className="text-sm text-red-300">Dislikes</div>
                  </div>
                </div>
                <div className="h-1 bg-red-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full" style={{width: `${Math.min((totalDislikes / 50) * 100, 100)}%`}}></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center group-hover:bg-yellow-500/30 transition-all">
                    <ShareIcon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-sss-white">{!loading ? totalCompartilhamentos.toLocaleString() : '--'}</div>
                    <div className="text-sm text-yellow-300">Compartilhamentos</div>
                  </div>
                </div>
                <div className="h-1 bg-yellow-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full" style={{width: `${Math.min((totalCompartilhamentos / 100) * 100, 100)}%`}}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Gestão de Conteúdos */}
          <section className="mb-8">
            <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
              <div className="p-6 border-b border-sss-light">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <VideoCameraIcon className="w-5 h-5 text-sss-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-sss-white">Seus Conteúdos</h2>
                      <p className="text-sm text-gray-400">Gerencie seus vídeos, lives e posts</p>
                    </div>
                  </div>
                  
                  {categorias.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-300">Filtrar:</span>
                      <select 
                        className="bg-sss-light border border-sss-light rounded-lg px-3 py-2 text-sss-white text-sm focus:ring-2 focus:ring-sss-accent focus:border-transparent" 
                        value={categoriaFiltro} 
                        onChange={e => setCategoriaFiltro(e.target.value)}
                      >
                        <option value="">Todas as categorias</option>
                        {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Conteúdo fixado */}
              {conteudoFixado && (
                <div className="mx-6 mt-6 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                                             <MapPinIcon className="w-5 h-5 text-yellow-400" />
                      <span className="font-semibold text-lg text-sss-white">Conteúdo Fixado</span>
                    </div>
                    <button 
                      className="text-yellow-400 hover:text-yellow-300 text-sm underline transition-colors" 
                      onClick={() => handleFixarConteudo(conteudoFixado.id, false)}
                    >
                      Desfixar
                    </button>
                  </div>
                  <div className="text-sm text-gray-300 mb-3">{conteudoFixado.titulo}</div>
                  <div className="text-xs text-gray-400">
                    {conteudoFixado.dataPublicacao ? new Date(conteudoFixado.dataPublicacao).toLocaleDateString() : ''}
                  </div>
                  {getPreview((conteudoFixado as any).url)}
                </div>
              )}

              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    <span className="ml-3 text-gray-400">Carregando conteúdos...</span>
                  </div>
                ) : conteudos && conteudos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {conteudosFiltrados.map((c) => {
                      const yt = getYoutubeInfo((c as any).url);
                      return (
                        <div key={c.id} className="bg-sss-light/50 rounded-xl overflow-hidden hover:bg-sss-light/70 transition-all duration-300 group border border-sss-light hover:border-gray-500">
                          {yt ? (
                            <div className="relative">
                              <img src={yt.thumbnail} alt={c.titulo} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <a href={yt.link} target="_blank" rel="noopener" className="bg-red-600 hover:bg-red-700 text-sss-white px-4 py-2 rounded-lg font-semibold transition-colors">
                                  Assistir no YouTube
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-gray-400 group-hover:from-gray-500 group-hover:to-gray-600 transition-all">
                              <VideoCameraIcon className="w-12 h-12" />
                            </div>
                          )}
                          
                          <div className="p-4">
                            <a href={(c as any).url} target="_blank" rel="noopener" className="text-lg font-bold text-sss-white hover:text-green-400 transition-colors line-clamp-2">
                              {c.titulo}
                            </a>
                            
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full">{c.tipo}</span>
                              <span className="text-xs text-gray-400">
                                {c.dataPublicacao ? new Date(c.dataPublicacao).toLocaleDateString() : ''}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-sss-light">
                              <div className="flex space-x-2">
                                <button 
                                  className="text-blue-400 hover:text-blue-300 transition-colors p-1" 
                                  onClick={() => { setEditando(c); setForm({ titulo: c.titulo, url: (c as any).url || '', tipo: c.tipo, categoria: (c as any).categoria || '' }); setShowModal(true); }}
                                  title="Editar"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button 
                                  className="text-red-400 hover:text-red-300 transition-colors p-1" 
                                  onClick={() => handleRemoverConteudo(c.id)}
                                  title="Remover"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                                <button 
                                  className="text-yellow-400 hover:text-yellow-300 transition-colors p-1" 
                                  onClick={() => handleFixarConteudo(c.id, true)} 
                                  disabled={!!conteudoFixado}
                                  title="Fixar"
                                >
                                                                     <MapPinIcon className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {!yt && (
                                <a href={(c as any).url} target="_blank" rel="noopener" className="bg-green-600 hover:bg-green-700 text-sss-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors">
                                  Ver conteúdo
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <VideoCameraIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">Nenhum conteúdo cadastrado</h3>
                    <p className="text-gray-500 mb-6">Comece adicionando seu primeiro conteúdo para aparecer aqui</p>
                    <button 
                      onClick={() => setShowModal(true)}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-sss-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2 mx-auto"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Adicionar Primeiro Conteúdo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Grid de seções */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Missões e Conquistas */}
            <div className="space-y-6">
              <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
                <div className="p-6 border-b border-sss-light">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <TrophyIcon className="w-5 h-5 text-sss-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-sss-white">Missões</h2>
                      <p className="text-sm text-gray-400">Complete missões para ganhar recompensas</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {loadingMissoes ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-3 text-gray-400">Carregando...</span>
                    </div>
                  ) : Array.isArray(missoes) && missoes.length > 0 ? (
                    <div className="space-y-3">
                      {missoes.map(m => (
                        <div key={m.id} className="bg-sss-light/50 rounded-xl p-4 border border-sss-light hover:border-gray-500 transition-colors">
                          <div className="font-semibold text-sss-white mb-2">{m.titulo}</div>
                          <div className="text-sm text-gray-400">{m.descricao}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrophyIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">Nenhuma missão disponível no momento</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
                <div className="p-6 border-b border-sss-light">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                      <TrophyIcon className="w-5 h-5 text-sss-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-sss-white">Conquistas</h2>
                      <p className="text-sm text-gray-400">Suas conquistas e badges</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {loadingConquistas ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                      <span className="ml-3 text-gray-400">Carregando...</span>
                    </div>
                  ) : Array.isArray(conquistas) && conquistas.length > 0 ? (
                    <div className="space-y-3">
                      {conquistas.map(c => (
                        <div key={c.id} className="bg-sss-light/50 rounded-xl p-4 border border-sss-light hover:border-gray-500 transition-colors">
                          <div className="font-semibold text-sss-white mb-2">{c.titulo}</div>
                          <div className="text-sm text-gray-400">{c.descricao}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrophyIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">Nenhuma conquista desbloqueada ainda</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Histórico de Doações e Ranking */}
            <div className="space-y-6">
              <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
                <div className="p-6 border-b border-sss-light">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <HeartIcon className="w-5 h-5 text-sss-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-sss-white">Histórico de Doações</h2>
                      <p className="text-sm text-gray-400">Doações recebidas dos seus fãs</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {loadingDoacoes ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                      <span className="ml-3 text-gray-400">Carregando...</span>
                    </div>
                  ) : Array.isArray(doacoes) && doacoes.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {doacoes.map(d => (
                        <div key={d.id} className="bg-sss-light/50 rounded-xl p-4 border border-sss-light hover:border-gray-500 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-green-400">{d.quantidade} sementes</span>
                            <span className="text-xs text-gray-400">
                              {d.data ? new Date(d.data).toLocaleDateString() : ''}
                            </span>
                          </div>
                          {d.mensagem && (
                            <div className="text-sm text-gray-300 mb-2 italic">"{d.mensagem}"</div>
                          )}
                          {d.doador && (
                            <div className="text-xs text-gray-400">De: {d.doador.nome}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <HeartIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">Nenhuma doação recebida ainda</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
                <div className="p-6 border-b border-sss-light">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <ChartBarIcon className="w-5 h-5 text-sss-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-sss-white">Ranking de Doadores</h2>
                      <p className="text-sm text-gray-400">Seus maiores apoiadores</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {loadingRanking ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                      <span className="ml-3 text-gray-400">Carregando...</span>
                    </div>
                  ) : Array.isArray(ranking) && ranking.length > 0 ? (
                    <div className="space-y-3">
                      {ranking.map((d, i) => (
                        <div key={d.id} className="bg-sss-light/50 rounded-xl p-4 border border-sss-light hover:border-gray-500 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-sss-white font-bold text-sm">
                                {i + 1}
                              </div>
                              <span className="font-semibold text-sss-white">{d.nome}</span>
                            </div>
                            <span className="text-green-400 font-bold">{d.total} sementes</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ChartBarIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">Nenhum doador no ranking ainda</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seções adicionais continuam com o mesmo padrão moderno */}
          {/* Atalhos e widgets */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
              <div className="p-6">
                <h3 className="font-bold text-sss-white mb-2">Missões & Conquistas</h3>
                <ul className="space-y-1">
                  <li><a href="#" className="text-sss-accent hover:underline text-sss-white">Ver missões</a></li>
                  <li><a href="#" className="text-sss-accent hover:underline text-sss-white">Ver conquistas</a></li>
                </ul>
              </div>
            </div>
            <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
              <div className="p-6">
                <h3 className="font-bold text-sss-white mb-2">Monetização</h3>
                <ul className="space-y-1">
                  <li><a href="#" className="text-sss-accent hover:underline text-sss-white">Histórico de doações</a></li>
                  <li><a href="#" className="text-sss-accent hover:underline text-sss-white">Ranking de doadores</a></li>
                  <li><a href="#" className="text-sss-accent hover:underline text-sss-white">Metas de arrecadação</a></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Notificações e suporte */}
          <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
              <div className="p-6">
                <h3 className="font-bold text-sss-white mb-2">Notificações</h3>
                {loadingNotificacoes ? (
                  <span className="text-gray-400">Carregando...</span>
                ) : Array.isArray(notificacoes) && notificacoes.length > 0 ? (
                  <ul className="space-y-2">
                    {notificacoes.map(n => (
                      <li key={n.id} className="border rounded p-2">
                        <span className="font-semibold text-sss-white">{n.titulo}</span>
                        <div className="text-sm text-gray-400">{n.mensagem}</div>
                        <span className="text-xs text-gray-400">{n.data ? new Date(n.data).toLocaleDateString() : ''}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400">Nenhuma notificação recente.</span>
                )}
              </div>
            </div>
            <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
              <div className="p-6">
                <h3 className="font-bold text-sss-white mb-2">Suporte & Feedback</h3>
                <form onSubmit={handleEnviarSuporte} className="flex flex-col gap-2 mb-2">
                  <textarea className="border rounded px-2 py-1 bg-sss-light border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" placeholder="Descreva seu problema ou sugestão..." value={suporteMsg} onChange={e => setSuporteMsg(e.target.value)} disabled={suporteStatus==='enviando'} />
                  <button type="submit" className="bg-red-700 text-sss-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={suporteStatus==='enviando' || !suporteMsg.trim()}>{suporteStatus==='enviando' ? 'Enviando...' : 'Abrir chamado de suporte'}</button>
                  {suporteStatus==='enviado' && <span className="text-green-600 text-sm">Chamado enviado com sucesso!</span>}
                </form>
                <ul className="space-y-1">
                  <li><a href="#" className="text-red-700 hover:underline text-sss-white">Enviar sugestão</a></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Configuração de Redes Sociais */}
          <section className="mb-8">
            <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-sss-white mb-4">Configurar Redes Sociais</h2>
                <p className="text-sm text-gray-400 mb-4">
                  Configure suas redes sociais para aparecer no ranking da página de status e permitir que seus fãs te encontrem.
                </p>
                <form onSubmit={handleSalvarRedesSociais} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">YouTube</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/@seucanal"
                        value={redesSociais.youtube}
                        onChange={(e) => setRedesSociais(prev => ({ ...prev, youtube: e.target.value }))}
                        className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Twitch</label>
                      <input
                        type="url"
                        placeholder="https://twitch.tv/seucanal"
                        value={redesSociais.twitch}
                        onChange={(e) => setRedesSociais(prev => ({ ...prev, twitch: e.target.value }))}
                        className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Instagram</label>
                      <input
                        type="url"
                        placeholder="https://instagram.com/seuperfil"
                        value={redesSociais.instagram}
                        onChange={(e) => setRedesSociais(prev => ({ ...prev, instagram: e.target.value }))}
                        className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">TikTok</label>
                      <input
                        type="url"
                        placeholder="https://tiktok.com/@seuperfil"
                        value={redesSociais.tiktok}
                        onChange={(e) => setRedesSociais(prev => ({ ...prev, tiktok: e.target.value }))}
                        className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={salvandoRedes}
                      className="bg-sss-accent text-sss-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {salvandoRedes ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="w-4 h-4" />
                          Salvar Redes Sociais
                        </>
                      )}
                    </button>
                    {redesStatus === 'salvo' && (
                      <span className="text-green-500 text-sm">Redes sociais salvas com sucesso!</span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </section>

          {/* Enquetes para Seguidores */}
          <section className="mb-8">
            <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-sss-white mb-2">Enquetes para Seguidores</h2>
                <form onSubmit={handleCriarEnquete} className="flex flex-col gap-2 mb-4">
                  <input className="border rounded px-2 py-1 bg-sss-light border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" placeholder="Pergunta da enquete" value={novaEnquete.pergunta} onChange={e => setNovaEnquete(f => ({...f, pergunta: e.target.value}))} />
                  {novaEnquete.opcoes.map((op, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input className="border rounded px-2 py-1 bg-sss-light border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all flex-1" placeholder={`Opção ${i+1}`} value={op} onChange={e => setNovaEnquete(f => ({...f, opcoes: f.opcoes.map((o, j) => j===i ? e.target.value : o)}))} />
                      {novaEnquete.opcoes.length > 2 && <button type="button" className="text-red-600" onClick={() => setNovaEnquete(f => ({...f, opcoes: f.opcoes.filter((_,j) => j!==i)}))}>Remover</button>}
                    </div>
                  ))}
                  <button type="button" className="text-sss-accent underline w-fit text-sss-white" onClick={() => setNovaEnquete(f => ({...f, opcoes: [...f.opcoes, '']}))}>Adicionar opção</button>
                  <button type="submit" className="bg-sss-accent text-sss-white px-4 py-2 rounded-lg font-semibold mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={salvandoEnquete || !novaEnquete.pergunta.trim() || novaEnquete.opcoes.filter(Boolean).length<2}>{salvandoEnquete ? 'Salvando...' : 'Criar Enquete'}</button>
                  {enqueteStatus==='salva' && <span className="text-green-600 text-sm">Enquete criada!</span>}
                </form>
                {loadingEnquetes ? (
                  <span className="text-gray-400">Carregando...</span>
                ) : Array.isArray(enquetes) && enquetes.length > 0 ? (
                  <ul className="space-y-2">
                    {enquetes.map(e => (
                      <li key={e.id} className="border rounded p-2">
                        <div className="font-semibold text-sss-white mb-1">{e.pergunta}</div>
                        <ul className="ml-4">
                          {e.opcoes.map(o => (
                            <li key={o.id} className="flex justify-between items-center">
                              <span className="text-gray-300">{o.texto}</span>
                              <span className="text-xs text-gray-400">{o.votos} votos</span>
                            </li>
                          ))}
                        </ul>
                        <span className="text-xs text-gray-400">{e.data ? new Date(e.data).toLocaleDateString() : ''}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400">Nenhuma enquete criada ainda.</span>
                )}
              </div>
            </div>
          </section>

          {/* Caixa de Perguntas/Recados dos Fãs */}
          <section className="mb-8">
            <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-sss-white mb-2">Caixa de Perguntas/Recados dos Fãs</h2>
                {loadingRecados ? (
                  <span className="text-gray-400">Carregando...</span>
                ) : Array.isArray(recados) && recados.length > 0 ? (
                  <ul className="space-y-2">
                    {recados.map(r => (
                      <li key={r.id} className="border rounded p-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-sss-white">{r.usuarioNome}</span>
                          <span className="text-xs text-gray-400">{r.data ? new Date(r.data).toLocaleDateString() : ''}</span>
                        </div>
                        <div className="text-gray-300 mb-1">{r.mensagem}</div>
                        {r.resposta ? (
                          <div className="text-green-700 text-sm">Resposta: {r.resposta}</div>
                        ) : respondendo === r.id ? (
                          <form onSubmit={e => handleResponderRecado(e, r.id)} className="flex gap-2 mt-1">
                            <input className="border rounded px-2 py-1 bg-sss-light border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all flex-1" placeholder="Digite sua resposta..." value={resposta[r.id]||''} onChange={e => setResposta(s => ({...s, [r.id]: e.target.value}))} />
                            <button type="submit" className="bg-green-600 text-sss-white px-3 py-1 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!resposta[r.id]||respostaStatus[r.id]==='enviando'}>{respostaStatus[r.id]==='enviando' ? 'Enviando...' : 'Responder'}</button>
                            <button type="button" className="bg-gray-600 text-sss-white px-3 py-1 rounded-lg transition-colors" onClick={() => setRespondendo(null)}>Cancelar</button>
                            {respostaStatus[r.id]==='enviado' && <span className="text-green-600 text-xs ml-2">Enviado!</span>}
                          </form>
                        ) : (
                          <button className="text-sss-accent hover:underline text-sm mt-1 text-sss-white" onClick={() => setRespondendo(r.id)}>Responder</button>
                        )}
                        {r.resposta && (
                          <div className="flex gap-2 mt-2">
                            <button 
                              onClick={() => handleTogglePublico(r.id, !r.publico)}
                              disabled={toggleStatus[r.id] === 'alterando'}
                              className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                                r.publico 
                                  ? 'bg-green-600 text-sss-white' 
                                  : 'bg-gray-600 text-sss-white'
                              } hover:opacity-80 disabled:opacity-50`}
                            >
                              {toggleStatus[r.id] === 'alterando' ? 'Alterando...' : 
                               toggleStatus[r.id] === 'alterado' ? 'Alterado!' :
                               r.publico ? 'Público' : 'Privado'}
                            </button>
                            {toggleStatus[r.id] === 'erro' && (
                              <span className="text-red-500 text-xs">Erro!</span>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400">Nenhum recado recebido ainda.</span>
                )}
              </div>
            </div>
          </section>

          {/* Geração de Links Personalizados para Divulgação */}
          <section className="mb-8">
            <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light flex flex-col md:flex-row items-center gap-6 p-6 text-sss-white">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-sss-white mb-2">Link Personalizado para Divulgação</h2>
                {linkDivulgacao ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input className="border rounded px-2 py-1 bg-sss-light border-sss-light rounded-lg text-sss-white flex-1" value={linkDivulgacao} readOnly />
                    <button className="bg-sss-accent text-sss-white px-3 py-1 rounded-lg font-semibold transition-colors" onClick={handleCopiarLink}>{copiado ? 'Copiado!' : 'Copiar'}</button>
                  </div>
                ) : (
                  <span className="text-gray-400">Seu link será gerado após salvar o perfil.</span>
                )}
              </div>
              {linkDivulgacao && (
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(linkDivulgacao)}`} alt="QR Code" className="rounded" />
              )}
            </div>
          </section>

        </main>
      </div>
    </>
  );
} 
