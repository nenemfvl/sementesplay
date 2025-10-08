import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
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
import { FaInstagram, FaTiktok, FaTwitch } from 'react-icons/fa';

type Conteudo = {
  id: string;
  titulo: string;
  tipo: string;
  dataPublicacao?: string;
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
  opcoes: { opcao: string; votos: number; porcentagem: number }[];
  criador: string;
  totalVotos: number;
  dataCriacao: string;
  dataFim?: string;
  ativa: boolean;
};


export default function PainelCriador() {
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ titulo: '', url: '', tipo: '', categoria: '' });
  const [saving, setSaving] = useState(false);
  const tituloRef = useRef<HTMLInputElement>(null);
  const [editando, setEditando] = useState<Conteudo | null>(null);
  const [estatisticas, setEstatisticas] = useState({ totalDoacoes: 0, totalSementes: 0, totalFavoritos: 0 });
  const [loadingEstatisticas, setLoadingEstatisticas] = useState(true);
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

  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [criadorId, setCriadorId] = useState<string | null>(null);

  // Estados para redes sociais
  const [redesSociais, setRedesSociais] = useState({
    youtube: '',
    twitch: '',
    instagram: '',
    tiktok: '',
    discord: ''
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
        window.location.href = '/perfil';
      }
    };

    checkAuth();
  }, []);



  // Estatísticas calculadas
  const totalVisualizacoes = Array.isArray(conteudos) ? conteudos.reduce((acc, c) => acc + (c as any).visualizacoes || 0, 0) : 0;
  const totalCurtidas = Array.isArray(conteudos) ? conteudos.reduce((acc, c) => acc + (c as any).curtidas || 0, 0) : 0;
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
  
          setConteudos([]);
          return;
        }
        
        const criadorId = criadorData.criadores[0].id;

        
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

    async function fetchEstatisticas() {
      setLoadingEstatisticas(true);
      try {
        const user = auth.getUser();
        if (!user) {
          setEstatisticas({ totalDoacoes: 0, totalSementes: 0, totalFavoritos: 0 });
          return;
        }
        
        const res = await fetch('/api/criador/estatisticas', {
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        });
        const data = await res.json();
        setEstatisticas(data || { totalDoacoes: 0, totalSementes: 0, totalFavoritos: 0 });
      } catch {
        setEstatisticas({ totalDoacoes: 0, totalSementes: 0, totalFavoritos: 0 });
      }
      setLoadingEstatisticas(false);
    }
    fetchEstatisticas();
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
        const user = auth.getUser();
        if (!user) {
          setRanking([]);
          return;
        }
        
        const res = await fetch('/api/ranking/doadores', {
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        });
        const data = await res.json();
        setRanking(Array.isArray(data) ? data : (data?.ranking || []));
      } catch (error) {
        console.error('Erro ao buscar ranking de doadores:', error);
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
        
        const res = await fetch(`/api/enquetes?criadorId=${user.id}`, {
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
      const res = await fetch(`/api/enquetes?criadorId=${user.id}`, {
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

  async function handleExcluirEnquete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir esta enquete? Esta ação não pode ser desfeita.')) return;
    
    try {
      const user = auth.getUser();
      if (!user) return;

      const res = await fetch('/api/enquetes', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        // Atualizar lista removendo a enquete excluída
        setEnquetes(prev => prev.filter(e => e.id !== id));
        alert('Enquete excluída com sucesso!');
      } else {
        const error = await res.json();
        alert(`Erro ao excluir enquete: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao excluir enquete:', error);
      alert('Erro ao excluir enquete. Tente novamente.');
    }
  }



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
      const insta = getInstagramInfo(url);
      if (insta) {
        return (
          <div className="my-2">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-4 text-white text-center">
              <FaInstagram className="w-8 h-8 mx-auto mb-2" />
              <div className="font-semibold mb-2">Post do Instagram</div>
              <a href={url} target="_blank" rel="noopener noreferrer" className="bg-white text-pink-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Ver no Instagram
              </a>
            </div>
          </div>
        );
      }
      return <a href={url} target="_blank" rel="noopener noreferrer" className="text-pink-600 underline my-2 block">Ver no Instagram</a>;
    }
    // TikTok
    if (url.includes('tiktok.com')) {
      return <a href={url} target="_blank" rel="noopener noreferrer" className="text-black underline my-2 block">Ver no TikTok</a>;
    }
    // Outro
    return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline my-2 block">Abrir link</a>;
  }





  function getYoutubeInfo(url: string) {
    const yt = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
    if (yt) {
      const id = yt[1];
      return {
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        link: `https://www.youtube.com/watch?v=${id}`
      };
    }
    return null;
  }

  function getInstagramInfo(url: string) {
    // Tenta extrair o ID do post do Instagram
    const insta = url.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
    if (insta) {
      const postId = insta[1];
      // Tenta diferentes URLs para obter a imagem
      // Nota: O Instagram pode bloquear requisições diretas, então usamos fallbacks
      return {
        thumbnail: `https://www.instagram.com/p/${postId}/media/?size=l`,
        fallbackThumbnail: `https://www.instagram.com/p/${postId}/embed/`,
        link: url,
        postId: postId
      };
    }
    return null;
  }

  function getTikTokInfo(url: string) {
    // Tenta extrair o ID do vídeo do TikTok
    const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/) || 
                       url.match(/tiktok\.com\/v\/(\d+)/) ||
                       url.match(/vm\.tiktok\.com\/(\w+)/);
    if (tiktokMatch) {
      const videoId = tiktokMatch[1];
      
      // Usar nossa API que redireciona para a imagem real
      return {
        thumbnail: `/api/tiktok-image?url=${encodeURIComponent(url)}`,
        link: url,
        videoId: videoId
      };
    }
    return null;
  }

  function getTwitchInfo(url: string) {
    // Twitch - Stream ao vivo
    const twLive = url.match(/twitch\.tv\/([^/?]+)/);
    if (twLive && !url.includes('/videos/')) {
      const channelName = twLive[1];
      return {
        thumbnail: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channelName}.jpg`,
        link: url,
        channelName: channelName,
        type: 'live'
      };
    }
    
    // Twitch - Vídeo
    const twVideo = url.match(/twitch\.tv\/videos\/(\d+)/);
    if (twVideo) {
      const videoId = twVideo[1];
      return {
        thumbnail: `https://static-cdn.jtvnw.net/videos_capture/${videoId}.jpg`,
        link: url,
        videoId: videoId,
        type: 'video'
      };
    }
    
    return null;
  }

  function getTipoIcon(tipo: string, url?: string) {
    // Detectar automaticamente o tipo baseado na URL para melhorar a experiência
    let tipoDetectado = tipo;
    
    if (url) {
      if (url.includes('tiktok.com')) {
        tipoDetectado = 'tiktok';
      } else if (url.includes('instagram.com')) {
        tipoDetectado = 'instagram';
      } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        tipoDetectado = 'youtube';
      } else if (url.includes('twitch.tv')) {
        tipoDetectado = 'twitch';
      }
    }

    switch (tipoDetectado?.toLowerCase()) {
      case 'video':
      case 'youtube':
        return <VideoCameraIcon className="w-12 h-12 text-red-400" />;
      case 'tiktok':
        return <FaTiktok className="w-12 h-12 text-black" />;
      case 'instagram':
        return <FaInstagram className="w-12 h-12 text-pink-500" />;
      case 'twitch':
        return <FaTwitch className="w-12 h-12 text-purple-500" />;
      case 'imagem':
      case 'foto':
        return <VideoCameraIcon className="w-12 h-12 text-green-400" />;
      case 'link':
      case 'url':
        return <LinkIcon className="w-12 h-12 text-blue-400" />;
      default:
        return <VideoCameraIcon className="w-12 h-12 text-gray-400" />;
    }
  }

  // Helper function para calcular largura das barras de progresso
  const getProgressWidthClass = (value: number, max: number) => {
    const percentage = Math.min((value / max) * 100, 100);
    if (percentage <= 10) return 'w-[10%]';
    if (percentage <= 20) return 'w-[20%]';
    if (percentage <= 30) return 'w-[30%]';
    if (percentage <= 40) return 'w-[40%]';
    if (percentage <= 50) return 'w-[50%]';
    if (percentage <= 60) return 'w-[60%]';
    if (percentage <= 70) return 'w-[70%]';
    if (percentage <= 80) return 'w-[80%]';
    if (percentage <= 90) return 'w-[90%]';
    return 'w-full';
  };

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
                aria-label="Fechar modal"
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
                  maxLength={36}
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  placeholder="Título do conteúdo (máx. 33 caracteres + ...)" 
                  value={form.titulo} 
                  onChange={e => {
                    const value = e.target.value;
                    // Se passar de 33 caracteres, adicionar ... automaticamente
                    const tituloTruncado = value.length > 33 ? value.substring(0, 33) + '...' : value;
                    setForm(f => ({ ...f, titulo: tituloTruncado }));
                  }} 
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
                <select 
                  required 
                  aria-label="Tipo de conteúdo"
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  value={form.tipo} 
                  onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} 
                >
                  <option value="">Selecione o tipo</option>
                  <option value="live">Live</option>
                  <option value="video">Video</option>
                  <option value="post">Post</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
                <select 
                  required 
                  aria-label="Categoria do conteúdo"
                  className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all" 
                  value={form.categoria} 
                  onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} 
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="gamer">Gamer</option>
                  <option value="life">Life</option>
                </select>
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
                  <div className={`h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full ${getProgressWidthClass(totalVisualizacoes, 1000)}`}></div>
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
                  <div className={`h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full ${getProgressWidthClass(totalCurtidas, 100)}`}></div>
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
                  <div className={`h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full ${getProgressWidthClass(totalDislikes, 50)}`}></div>
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
                  <div className={`h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full ${getProgressWidthClass(totalCompartilhamentos, 100)}`}></div>
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
                        aria-label="Filtrar por categoria"
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
                  const insta = getInstagramInfo((c as any).url);
                  const tiktok = getTikTokInfo((c as any).url);
                  const twitch = getTwitchInfo((c as any).url);
                  return (
                        <div key={c.id} className="bg-sss-light/50 rounded-xl overflow-hidden hover:bg-sss-light/70 transition-all duration-300 group border border-sss-light hover:border-gray-500">
                      {yt ? (
                            <div className="relative">
                              <Image src={yt.thumbnail} alt={c.titulo} width={400} height={200} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <a href={yt.link} target="_blank" rel="noopener" className="bg-red-600 hover:bg-red-700 text-sss-white px-4 py-2 rounded-lg font-semibold transition-colors">
                                  Assistir no YouTube
                                </a>
                              </div>
                            </div>
                          ) : insta ? (
                            <div className="relative">
                              <Image 
                                src={insta.thumbnail} 
                                alt={c.titulo} 
                                width={400}
                                height={200}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  // Se a imagem falhar, mostra o placeholder do Instagram
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const placeholder = document.createElement('div');
                                    placeholder.className = 'w-full h-48 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white group-hover:from-pink-600 group-hover:to-purple-700 transition-all';
                                    placeholder.innerHTML = `
                                      <div class="text-center">
                                        <svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                        </svg>
                                        <div class="text-sm font-semibold">Post do Instagram</div>
                                      </div>
                                    `;
                                    parent.appendChild(placeholder);
                                  }
                                }}
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <a href={insta.link} target="_blank" rel="noopener" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                                  Ver no Instagram
                                </a>
                              </div>
                            </div>
                          ) : tiktok ? (
                            <div className="relative">
                              <Image 
                                src={tiktok.thumbnail} 
                                alt={c.titulo} 
                                width={400}
                                height={200}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  // Se a imagem falhar, mostra o placeholder do TikTok
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const placeholder = document.createElement('div');
                                    placeholder.className = 'w-full h-48 bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center text-white';
                                    placeholder.innerHTML = `
                                      <div class="text-center">
                                        <div class="text-6xl mb-2">🎵</div>
                                        <div class="text-lg font-semibold">TikTok</div>
                                      </div>
                                    `;
                                    parent.appendChild(placeholder);
                                  }
                                }}
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <a href={tiktok.link} target="_blank" rel="noopener" className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                                  Ver no TikTok
                                </a>
                              </div>
                            </div>
                          ) : twitch ? (
                            <div className="relative">
                              <Image 
                                src={twitch.thumbnail} 
                                alt={c.titulo} 
                                width={400}
                                height={200}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  // Se a imagem falhar, mostra o placeholder do Twitch
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const placeholder = document.createElement('div');
                                    placeholder.className = 'w-full h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white';
                                    placeholder.innerHTML = `
                                      <div class="text-center">
                                        <div class="text-6xl mb-2">📺</div>
                                        <div class="text-lg font-semibold">Twitch ${twitch.type === 'live' ? 'Live' : 'Video'}</div>
                                      </div>
                                    `;
                                    parent.appendChild(placeholder);
                                  }
                                }}
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <a href={twitch.link} target="_blank" rel="noopener" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                                  Ver na Twitch
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-gray-400 group-hover:from-gray-500 group-hover:to-gray-600 transition-all">
                              {getTipoIcon(c.tipo, (c as any).url)}
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
                              
                              {!yt && !insta && (
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Estatísticas do Criador */}
            <div className="lg:col-span-1">
              <div className="bg-sss-medium/50 backdrop-blur-sm rounded-2xl border border-sss-light overflow-hidden">
                <div className="p-6 border-b border-sss-light">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <ChartBarIcon className="w-5 h-5 text-sss-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-sss-white">Estatísticas</h2>
                      <p className="text-sm text-gray-400">Suas métricas como criador</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {loadingEstatisticas ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                      <span className="ml-3 text-gray-400">Carregando...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-sss-light/50 rounded-xl p-4 border border-sss-light">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Total de Doações</p>
                            <p className="text-2xl font-bold text-sss-white">{estatisticas.totalDoacoes}</p>
                          </div>
                          <HeartIcon className="w-8 h-8 text-red-500" />
                        </div>
                      </div>
                      <div className="bg-sss-light/50 rounded-xl p-4 border border-sss-light">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Sementes Recebidas</p>
                            <p className="text-2xl font-bold text-sss-white">{estatisticas.totalSementes}</p>
                          </div>
                          <img src="/logo.png" alt="SementesPLAY Logo" className="w-8 h-8" />
                        </div>
                      </div>
                      <div className="bg-sss-light/50 rounded-xl p-4 border border-sss-light">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Favoritos</p>
                            <p className="text-2xl font-bold text-sss-white">{estatisticas.totalFavoritos}</p>
                          </div>
                          <HeartIcon className="w-8 h-8 text-pink-500" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Histórico de Doações */}
            <div className="lg:col-span-1">
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
                            <div className="text-sm text-gray-300 mb-2 italic">&quot;{d.mensagem}&quot;</div>
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
            </div>

            {/* Ranking de Doadores */}
            <div className="lg:col-span-1">
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
                <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Discord</label>
                  <input
                    type="url"
                    placeholder="https://discord.gg/seuserver"
                    value={redesSociais.discord}
                    onChange={(e) => setRedesSociais(prev => ({ ...prev, discord: e.target.value }))}
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
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-sss-white">{e.pergunta}</div>
                      <button
                        onClick={() => handleExcluirEnquete(e.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                        title="Excluir enquete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <ul className="ml-4">
                      {e.opcoes.map((o, index) => (
                        <li key={index} className="flex justify-between items-center">
                              <span className="text-gray-300">{o.opcao}</span>
                              <span className="text-xs text-gray-400">{o.votos} votos ({o.porcentagem}%)</span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-xs text-gray-400 mt-2">
                      Total: {e.totalVotos} votos • {e.dataCriacao ? new Date(e.dataCriacao).toLocaleDateString() : ''}
                    </div>
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



      </main>
      </div>
    </>
  );
} 
