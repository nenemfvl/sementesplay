import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { auth } from '../lib/auth';

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
  const [enquetes, setEnquetes] = useState<Enquete[]>([]);
  const [loadingEnquetes, setLoadingEnquetes] = useState(true);
  const [novaEnquete, setNovaEnquete] = useState<{pergunta:string, opcoes:string[]}>({pergunta:'', opcoes:['','']});
  const [salvandoEnquete, setSalvandoEnquete] = useState(false);
  const [enqueteStatus, setEnqueteStatus] = useState<'idle'|'salva'>('idle');
  const [copiado, setCopiado] = useState(false);

  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

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

      console.log('User data:', user); // Debug

      // Verificar se o usuário é um criador pelo tipo
      if (user.tipo === 'criador' || user.nivel === 'criador') {
        setAuthorized(true);
        setCheckingAuth(false);
      } else {
        alert('Acesso negado. Apenas criadores podem acessar o painel de criador.');
        window.location.href = '/dashboard';
      }
    };

    checkAuth();
  }, []);

  // Link de divulgação temporário
  const linkDivulgacao = '';

  // Estatísticas calculadas
  const totalVisualizacoes = Array.isArray(conteudos) ? conteudos.reduce((acc, c) => acc + (c as any).visualizacoes || 0, 0) : 0;
  const totalCurtidas = Array.isArray(conteudos) ? conteudos.reduce((acc, c) => acc + (c as any).curtidas || 0, 0) : 0;
  const totalComentarios = Array.isArray(conteudos) ? conteudos.reduce((acc, c) => acc + (c as any).comentarios || 0, 0) : 0;
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
        const res = await fetch('/api/conteudos');
        const data = await res.json();
        setConteudos(data);
      } catch (e) {
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
        setMissoes(data);
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
        setConquistas(data);
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
        const res = await fetch('/api/doacoes');
        const data = await res.json();
        setDoacoes(data);
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
        setRanking(data);
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
        setNotificacoes(data);
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
        const res = await fetch('/api/recados');
        const data = await res.json();
        setRecados(data);
      } catch {
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
        const res = await fetch('/api/enquetes');
        const data = await res.json();
        setEnquetes(data);
      } catch {
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
          if (data.criador && data.criador.redesSociais) {
            setRedesSociais(data.criador.redesSociais);
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

      const token = localStorage.getItem('sementesplay_token');
      const res = await fetch(`/api/criador/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      const res = await fetch('/api/conteudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
      const res = await fetch('/api/conteudos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: editando.id }),
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
      await fetch('/api/recados/responder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, resposta: resposta[id] }),
      });
      setRespostaStatus(s => ({...s, [id]: 'enviado'}));
      setRecados(rs => rs.map(r => r.id === id ? { ...r, resposta: resposta[id] } : r));
      setResposta(r => ({...r, [id]: ''}));
      setRespondendo(null);
    } finally {
      setTimeout(() => setRespostaStatus(s => ({...s, [id]: ''})), 2000);
    }
  }

  async function handleCriarEnquete(e: React.FormEvent) {
    e.preventDefault();
    setSalvandoEnquete(true);
    try {
      await fetch('/api/enquetes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pergunta: novaEnquete.pergunta,
          opcoes: novaEnquete.opcoes.filter(Boolean)
        }),
      });
      setEnqueteStatus('salva');
      setNovaEnquete({pergunta:'', opcoes:['','']});
      setTimeout(() => setEnqueteStatus('idle'), 2000);
      // Atualizar lista
      const res = await fetch('/api/enquetes');
      setEnquetes(await res.json());
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
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-sss-white text-xl">Verificando autorização...</div>
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={editando ? handleEditConteudo : handleAddConteudo} className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white flex flex-col gap-3">
            <h2 className="text-xl font-bold mb-2">Editar Conteúdo</h2>
            <input ref={tituloRef} required className="border rounded px-2 py-1 bg-sss-dark text-sss-white border-sss-light placeholder-gray-400" placeholder="Título" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
            <input required className="border rounded px-2 py-1 bg-sss-dark text-sss-white border-sss-light placeholder-gray-400" placeholder="URL" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            <input required className="border rounded px-2 py-1 bg-sss-dark text-sss-white border-sss-light placeholder-gray-400" placeholder="Tipo (ex: vídeo, live)" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} />
            <input required className="border rounded px-2 py-1 bg-sss-dark text-sss-white border-sss-light placeholder-gray-400" placeholder="Categoria" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} />
            <div className="flex gap-2 mt-2">
              <button type="submit" className="bg-sss-accent text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition" disabled={saving}>{saving ? 'Salvando...' : (editando ? 'Salvar' : 'Adicionar')}</button>
              <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => { setShowModal(false); setEditando(null); }} disabled={saving}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      <main className="max-w-6xl mx-auto px-4 py-8 bg-sss-dark min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Painel do Criador</h1>
        {/* Estatísticas principais */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white flex flex-col items-center">
            <span className="text-lg font-semibold">Visualizações</span>
            <span className="text-2xl font-bold text-green-600">{!loading ? totalVisualizacoes : '--'}</span>
          </div>
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white flex flex-col items-center">
            <span className="text-lg font-semibold">Curtidas</span>
            <span className="text-2xl font-bold text-pink-500">{!loading ? totalCurtidas : '--'}</span>
          </div>
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white flex flex-col items-center">
            <span className="text-lg font-semibold">Comentários</span>
            <span className="text-2xl font-bold text-blue-500">{!loading ? totalComentarios : '--'}</span>
          </div>
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white flex flex-col items-center">
            <span className="text-lg font-semibold">Compartilhamentos</span>
            <span className="text-2xl font-bold text-yellow-500">{!loading ? totalCompartilhamentos : '--'}</span>
          </div>
        </section>
        {/* Gestão de Conteúdos */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">Seus Conteúdos</h2>
            <button className="bg-sss-accent text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition" onClick={() => setShowModal(true)}>Adicionar Conteúdo</button>
          </div>
          {categorias.length > 0 && (
            <div className="mb-2 flex gap-2 items-center">
              <span className="font-semibold">Filtrar por categoria:</span>
              <select className="border rounded px-2 py-1" value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
                <option value="">Todas</option>
                {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          )}
          {conteudoFixado && (
            <div className="border-2 border-yellow-400 bg-yellow-50 rounded p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">📌 {conteudoFixado.titulo}</span>
                <button className="text-xs text-yellow-700 underline" onClick={() => handleFixarConteudo(conteudoFixado.id, false)}>Desfixar</button>
              </div>
              <span className="text-sm text-gray-500">{conteudoFixado.dataPublicacao ? new Date(conteudoFixado.dataPublicacao).toLocaleDateString() : ''}</span>
              {getPreview((conteudoFixado as any).url)}
            </div>
          )}
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white min-h-[120px]">
            {loading ? (
              <div className="text-gray-400 text-center">Carregando...</div>
            ) : conteudos && conteudos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conteudosFiltrados.map((c) => {
                  const yt = getYoutubeInfo((c as any).url);
                  return (
                    <div key={c.id} className="border rounded p-3 flex flex-col gap-2 bg-sss-medium border-sss-light text-sss-white">
                      {yt ? (
                        <>
                          <img src={yt.thumbnail} alt={c.titulo} className="rounded w-full max-h-48 object-cover mb-2" />
                          <a href={yt.link} target="_blank" rel="noopener" className="text-lg font-bold hover:underline">{c.titulo}</a>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded w-fit">{c.tipo}</span>
                          <a href={yt.link} target="_blank" rel="noopener" className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded font-semibold w-fit">Assistir no YouTube</a>
                        </>
                      ) : (
                        <>
                          <div className="w-full h-32 bg-gray-700 rounded flex items-center justify-center text-gray-400">Preview</div>
                          <a href={(c as any).url} target="_blank" rel="noopener" className="text-lg font-bold hover:underline">{c.titulo}</a>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded w-fit">{c.tipo}</span>
                          <a href={(c as any).url} target="_blank" rel="noopener" className="mt-2 bg-sss-accent hover:bg-green-700 text-white px-4 py-1 rounded font-semibold w-fit">Ver conteúdo</a>
                        </>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button className="text-blue-400 hover:underline text-sm" onClick={() => { setEditando(c); setForm({ titulo: c.titulo, url: (c as any).url || '', tipo: c.tipo, categoria: (c as any).categoria || '' }); setShowModal(true); }}>Editar</button>
                        <button className="text-red-400 hover:underline text-sm" onClick={() => handleRemoverConteudo(c.id)}>Remover</button>
                        <button className="text-yellow-400 hover:underline text-sm" onClick={() => handleFixarConteudo(c.id, true)} disabled={!!conteudoFixado}>Fixar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-gray-400">Nenhum conteúdo cadastrado ainda.</span>
            )}
          </div>
        </section>
        {/* Missões e Conquistas */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white">
            <h2 className="text-lg font-bold mb-2">Missões</h2>
            {loadingMissoes ? (
              <span className="text-gray-400">Carregando...</span>
            ) : Array.isArray(missoes) && missoes.length > 0 ? (
              <ul className="space-y-2">
                {missoes.map(m => (
                  <li key={m.id} className="border rounded p-2">
                    <span className="font-semibold">{m.titulo}</span>
                    <div className="text-sm text-gray-500">{m.descricao}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-400">Nenhuma missão disponível.</span>
            )}
          </div>
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white">
            <h2 className="text-lg font-bold mb-2">Conquistas</h2>
            {loadingConquistas ? (
              <span className="text-gray-400">Carregando...</span>
            ) : Array.isArray(conquistas) && conquistas.length > 0 ? (
              <ul className="space-y-2">
                {conquistas.map(c => (
                  <li key={c.id} className="border rounded p-2">
                    <span className="font-semibold">{c.titulo}</span>
                    <div className="text-sm text-gray-500">{c.descricao}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-400">Nenhuma conquista disponível.</span>
            )}
          </div>
        </section>
        {/* Histórico de Doações e Ranking de Doadores */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white">
            <h2 className="text-lg font-bold mb-2">Histórico de Doações</h2>
            {loadingDoacoes ? (
              <span className="text-gray-400">Carregando...</span>
            ) : Array.isArray(doacoes) && doacoes.length > 0 ? (
              <ul className="space-y-2">
                {doacoes.map(d => (
                  <li key={d.id} className="border rounded p-2 flex flex-col">
                    <span className="font-semibold">{d.quantidade} sementes</span>
                    <span className="text-xs text-gray-500">{d.data ? new Date(d.data).toLocaleDateString() : ''}</span>
                    {d.mensagem && <span className="text-sm text-gray-700">"{d.mensagem}"</span>}
                    {d.doador && <span className="text-xs text-gray-400">Doador: {d.doador.nome}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-400">Nenhuma doação recebida ainda.</span>
            )}
          </div>
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white">
            <h2 className="text-lg font-bold mb-2">Ranking de Doadores</h2>
            {loadingRanking ? (
              <span className="text-gray-400">Carregando...</span>
            ) : Array.isArray(ranking) && ranking.length > 0 ? (
              <ol className="space-y-2 list-decimal list-inside">
                {ranking.map((d, i) => (
                  <li key={d.id} className="border rounded p-2 flex justify-between items-center">
                    <span className="font-semibold">{d.nome}</span>
                    <span className="text-green-700 font-bold">{d.total} sementes</span>
                  </li>
                ))}
              </ol>
            ) : (
              <span className="text-gray-400">Nenhum doador no ranking ainda.</span>
            )}
          </div>
        </section>

        {/* Atalhos e widgets */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white">
            <h3 className="font-bold mb-2">Missões & Conquistas</h3>
            <ul className="space-y-1">
              <li><a href="#" className="text-sss-accent hover:underline">Ver missões</a></li>
              <li><a href="#" className="text-sss-accent hover:underline">Ver conquistas</a></li>
            </ul>
          </div>
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white">
            <h3 className="font-bold mb-2">Monetização</h3>
            <ul className="space-y-1">
              <li><a href="#" className="text-sss-accent hover:underline">Histórico de doações</a></li>
              <li><a href="#" className="text-sss-accent hover:underline">Ranking de doadores</a></li>
              <li><a href="#" className="text-sss-accent hover:underline">Metas de arrecadação</a></li>
            </ul>
          </div>
        </section>
        {/* Notificações e suporte */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white">
            <h3 className="font-bold mb-2">Notificações</h3>
            {loadingNotificacoes ? (
              <span className="text-gray-400">Carregando...</span>
            ) : Array.isArray(notificacoes) && notificacoes.length > 0 ? (
              <ul className="space-y-2">
                {notificacoes.map(n => (
                  <li key={n.id} className="border rounded p-2">
                    <span className="font-semibold">{n.titulo}</span>
                    <div className="text-sm text-gray-500">{n.mensagem}</div>
                    <span className="text-xs text-gray-400">{n.data ? new Date(n.data).toLocaleDateString() : ''}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-400">Nenhuma notificação recente.</span>
            )}
          </div>
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white">
            <h3 className="font-bold mb-2">Suporte & Feedback</h3>
            <form onSubmit={handleEnviarSuporte} className="flex flex-col gap-2 mb-2">
              <textarea className="border rounded px-2 py-1 bg-sss-dark text-sss-white border-sss-light placeholder-gray-400" placeholder="Descreva seu problema ou sugestão..." value={suporteMsg} onChange={e => setSuporteMsg(e.target.value)} disabled={suporteStatus==='enviando'} />
              <button type="submit" className="bg-red-700 text-white px-4 py-2 rounded font-semibold" disabled={suporteStatus==='enviando' || !suporteMsg.trim()}>{suporteStatus==='enviando' ? 'Enviando...' : 'Abrir chamado de suporte'}</button>
              {suporteStatus==='enviado' && <span className="text-green-600 text-sm">Chamado enviado com sucesso!</span>}
            </form>
            <ul className="space-y-1">
              <li><a href="#" className="text-red-700 hover:underline">Enviar sugestão</a></li>
            </ul>
          </div>
        </section>
        {/* Configuração de Redes Sociais */}
        <section className="mb-8">
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white">
            <h2 className="text-lg font-bold mb-4">Configurar Redes Sociais</h2>
            <p className="text-sm text-gray-400 mb-4">
              Configure suas redes sociais para aparecer no ranking da página de status e permitir que seus fãs te encontrem.
            </p>
            <form onSubmit={handleSalvarRedesSociais} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">YouTube</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@seucanal"
                    value={redesSociais.youtube}
                    onChange={(e) => setRedesSociais(prev => ({ ...prev, youtube: e.target.value }))}
                    className="w-full border rounded px-3 py-2 bg-sss-dark text-sss-white border-sss-light placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Twitch</label>
                  <input
                    type="url"
                    placeholder="https://twitch.tv/seucanal"
                    value={redesSociais.twitch}
                    onChange={(e) => setRedesSociais(prev => ({ ...prev, twitch: e.target.value }))}
                    className="w-full border rounded px-3 py-2 bg-sss-dark text-sss-white border-sss-light placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Instagram</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/seuperfil"
                    value={redesSociais.instagram}
                    onChange={(e) => setRedesSociais(prev => ({ ...prev, instagram: e.target.value }))}
                    className="w-full border rounded px-3 py-2 bg-sss-dark text-sss-white border-sss-light placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">TikTok</label>
                  <input
                    type="url"
                    placeholder="https://tiktok.com/@seuperfil"
                    value={redesSociais.tiktok}
                    onChange={(e) => setRedesSociais(prev => ({ ...prev, tiktok: e.target.value }))}
                    className="w-full border rounded px-3 py-2 bg-sss-dark text-sss-white border-sss-light placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={salvandoRedes}
                  className="bg-sss-accent text-white px-6 py-2 rounded font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {salvandoRedes ? 'Salvando...' : 'Salvar Redes Sociais'}
                </button>
                {redesStatus === 'salvo' && (
                  <span className="text-green-500 text-sm">Redes sociais salvas com sucesso!</span>
                )}
              </div>
            </form>
          </div>
        </section>
        {/* Enquetes para Seguidores */}
        <section className="mb-8">
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white">
            <h2 className="text-lg font-bold mb-2">Enquetes para Seguidores</h2>
            <form onSubmit={handleCriarEnquete} className="flex flex-col gap-2 mb-4">
              <input className="border rounded px-2 py-1 bg-sss-dark text-sss-white border-sss-light placeholder-gray-400" placeholder="Pergunta da enquete" value={novaEnquete.pergunta} onChange={e => setNovaEnquete(f => ({...f, pergunta: e.target.value}))} />
              {novaEnquete.opcoes.map((op, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input className="border rounded px-2 py-1 bg-sss-dark text-sss-white border-sss-light flex-1 placeholder-gray-400" placeholder={`Opção ${i+1}`} value={op} onChange={e => setNovaEnquete(f => ({...f, opcoes: f.opcoes.map((o, j) => j===i ? e.target.value : o)}))} />
                  {novaEnquete.opcoes.length > 2 && <button type="button" className="text-red-600" onClick={() => setNovaEnquete(f => ({...f, opcoes: f.opcoes.filter((_,j) => j!==i)}))}>Remover</button>}
                </div>
              ))}
              <button type="button" className="text-sss-accent underline w-fit" onClick={() => setNovaEnquete(f => ({...f, opcoes: [...f.opcoes, '']}))}>Adicionar opção</button>
              <button type="submit" className="bg-sss-accent text-white px-4 py-2 rounded font-semibold mt-2" disabled={salvandoEnquete || !novaEnquete.pergunta.trim() || novaEnquete.opcoes.filter(Boolean).length<2}>{salvandoEnquete ? 'Salvando...' : 'Criar Enquete'}</button>
              {enqueteStatus==='salva' && <span className="text-green-600 text-sm">Enquete criada!</span>}
            </form>
            {loadingEnquetes ? (
              <span className="text-gray-400">Carregando...</span>
            ) : Array.isArray(enquetes) && enquetes.length > 0 ? (
              <ul className="space-y-2">
                {enquetes.map(e => (
                  <li key={e.id} className="border rounded p-2">
                    <div className="font-semibold mb-1">{e.pergunta}</div>
                    <ul className="ml-4">
                      {e.opcoes.map(o => (
                        <li key={o.id} className="flex justify-between items-center">
                          <span>{o.texto}</span>
                          <span className="text-xs text-gray-500">{o.votos} votos</span>
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
        </section>
        {/* Caixa de Perguntas/Recados dos Fãs */}
        <section className="mb-8">
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light text-sss-white">
            <h2 className="text-lg font-bold mb-2">Caixa de Perguntas/Recados dos Fãs</h2>
            {loadingRecados ? (
              <span className="text-gray-400">Carregando...</span>
            ) : Array.isArray(recados) && recados.length > 0 ? (
              <ul className="space-y-2">
                {recados.map(r => (
                  <li key={r.id} className="border rounded p-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{r.usuarioNome}</span>
                      <span className="text-xs text-gray-400">{r.data ? new Date(r.data).toLocaleDateString() : ''}</span>
                    </div>
                    <div className="text-gray-700 mb-1">{r.mensagem}</div>
                    {r.resposta ? (
                      <div className="text-green-700 text-sm">Resposta: {r.resposta}</div>
                    ) : respondendo === r.id ? (
                      <form onSubmit={e => handleResponderRecado(e, r.id)} className="flex gap-2 mt-1">
                        <input className="border rounded px-2 py-1 bg-sss-dark text-sss-white border-sss-light flex-1 placeholder-gray-400" placeholder="Digite sua resposta..." value={resposta[r.id]||''} onChange={e => setResposta(s => ({...s, [r.id]: e.target.value}))} />
                        <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded font-semibold" disabled={!resposta[r.id]||respostaStatus[r.id]==='enviando'}>{respostaStatus[r.id]==='enviando' ? 'Enviando...' : 'Responder'}</button>
                        <button type="button" className="bg-gray-300 px-3 py-1 rounded" onClick={() => setRespondendo(null)}>Cancelar</button>
                        {respostaStatus[r.id]==='enviado' && <span className="text-green-600 text-xs ml-2">Enviado!</span>}
                      </form>
                    ) : (
                      <button className="text-sss-accent hover:underline text-sm mt-1" onClick={() => setRespondendo(r.id)}>Responder</button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-400">Nenhum recado recebido ainda.</span>
            )}
          </div>
        </section>
        {/* Geração de Links Personalizados para Divulgação */}
        <section className="mb-8">
          <div className="bg-sss-medium rounded-lg p-4 border border-sss-light flex flex-col md:flex-row items-center gap-6 text-sss-white">
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-2">Link Personalizado para Divulgação</h2>
              {linkDivulgacao ? (
                <div className="flex items-center gap-2 mb-2">
                  <input className="border rounded px-2 py-1 bg-sss-dark text-sss-white border-sss-light flex-1" value={linkDivulgacao} readOnly />
                  <button className="bg-sss-accent text-white px-3 py-1 rounded font-semibold" onClick={handleCopiarLink}>{copiado ? 'Copiado!' : 'Copiar'}</button>
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
    </>
  );
} 