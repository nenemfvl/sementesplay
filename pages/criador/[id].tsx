// Página de perfil do criador - exibe informações, conteúdos, enquetes e recados públicos
import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon, 
  TrophyIcon,
  StarIcon,
  FireIcon,
  CalendarIcon,
  ChartBarIcon,
  UserIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  EyeIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  ShareIcon,
  FlagIcon
} from '@heroicons/react/24/outline'
import { auth, User } from '../../lib/auth'
import { FaInstagram, FaTiktok, FaTwitch } from 'react-icons/fa'

import DenunciaModal from '../../components/DenunciaModal'

interface CriadorDetalhes {
  id: string
  nome: string
  avatar: string
  nivel: string
  nivelRanking: string
  sementes: number
  sementesRecebidas: number
  pontosMissoes: number
  pontosConquistas: number
  pontosUsuario: number
  pontuacaoTotal: number
  doacoes: number
  missoesCompletadas: number
  conquistasDesbloqueadas: number
  posicao: number
  usuarioId: string
  redesSociais?: {
    youtube?: string
    twitch?: string
    instagram?: string
    tiktok?: string
    discord?: string
  }
}

interface Conteudo {
  id: string
  titulo: string
  url: string
  tipo: string
  categoria: string
  data: string
  visualizacoes: number
  curtidas: number
  dislikes: number
  comentarios: number
  compartilhamentos: number
  thumbnail: string
}

interface Enquete {
  id: string
  pergunta: string
  opcoes: { opcao: string; votos: number; porcentagem: number }[]
  criador: string
  totalVotos: number
  dataCriacao: string
  dataFim?: string
  ativa: boolean
}

interface Recado {
  id: string
  titulo: string
  mensagem: string
  data: string
  resposta?: string
  publico: boolean
  remetenteNome?: string
}

export default function CriadorPerfil() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState<User | null>(null)
  const [criador, setCriador] = useState<CriadorDetalhes | null>(null)
  const [conteudos, setConteudos] = useState<Conteudo[]>([])
  const [enquetes, setEnquetes] = useState<Enquete[]>([])
  const [recados, setRecados] = useState<Recado[]>([])
  const [loading, setLoading] = useState(true)
  const [showPerguntaForm, setShowPerguntaForm] = useState(false)
  const [perguntaForm, setPerguntaForm] = useState({ titulo: '', mensagem: '' })
  const [enviandoPergunta, setEnviandoPergunta] = useState(false)
  const [perguntaStatus, setPerguntaStatus] = useState<'idle' | 'enviando' | 'enviado' | 'erro'>('idle')
  const [conteudosInteracao, setConteudosInteracao] = useState<Record<string, { curtido: boolean, visualizado: boolean, disliked: boolean }>>({})
  
  // Estados para denúncia
  const [showDenunciaModal, setShowDenunciaModal] = useState(false)
  const [conteudoParaDenunciar, setConteudoParaDenunciar] = useState<{ id: string, titulo: string } | null>(null)

  useEffect(() => {
    const currentUser = auth.getUser()
    setUser(currentUser)
  }, [])

  useEffect(() => {
    if (id) {
      carregarDetalhesCriador(id as string)
    }
  }, [id, user])

  const carregarDetalhesCriador = async (criadorId: string) => {
    setLoading(true)
    try {
      // Buscar dados do criador
      const response = await fetch(`/api/criadores/${criadorId}`)
      const data = await response.json()
      
      if (response.ok) {
        setCriador(data.criador)
        
        // Carregar conteúdos do criador
        try {
          const responseConteudos = await fetch(`/api/conteudos?criadorId=${criadorId}`)
          const dataConteudos = await responseConteudos.json()
          
          if (responseConteudos.ok) {
            setConteudos(dataConteudos.conteudos || [])
          }
        } catch (error) {
          console.error('Erro ao carregar conteúdos:', error)
          setConteudos([])
        }

        // Carregar enquetes do criador
        try {
          const responseEnquetes = await fetch(`/api/enquetes?criadorId=${data.criador.usuarioId}`)
          const dataEnquetes = await responseEnquetes.json()
          
          if (responseEnquetes.ok) {
            setEnquetes(dataEnquetes.enquetes || [])
          }
        } catch (error) {
          console.error('Erro ao carregar enquetes:', error)
          setEnquetes([])
        }

        // Carregar recados públicos do criador
        try {
          const responseRecados = await fetch(`/api/recados/publicos/${data.criador.usuarioId}`)
          const dataRecados = await responseRecados.json()
          
          if (responseRecados.ok) {
                         // Mapear os dados da API para o formato esperado pela interface
             const recadosMapeados = (dataRecados.recados || []).map((recado: any) => ({
               id: recado.id,
               titulo: recado.pergunta || '',
               mensagem: recado.pergunta || '', // Mostrar a pergunta real como mensagem
               data: recado.dataResposta || new Date().toISOString(),
               resposta: recado.resposta,
               publico: true,
               remetenteNome: recado.remetenteNome
             }))
            setRecados(recadosMapeados)
          }
        } catch (error) {
          console.error('Erro ao carregar recados:', error)
          setRecados([])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnviarPergunta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!perguntaForm.titulo.trim() || !perguntaForm.mensagem.trim() || !criador || !user) return

    setEnviandoPergunta(true)
    setPerguntaStatus('enviando')

    try {
      const token = user.id
      
      const response = await fetch('/api/recados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          destinatarioId: criador.usuarioId,
          titulo: perguntaForm.titulo,
          mensagem: perguntaForm.mensagem
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPerguntaStatus('enviado')
        setPerguntaForm({ titulo: '', mensagem: '' })
        setShowPerguntaForm(false)
        setTimeout(() => setPerguntaStatus('idle'), 3000)
      } else {
        const data = await response.json()
        setPerguntaStatus('erro')
        setTimeout(() => setPerguntaStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Erro ao enviar pergunta:', error)
      setPerguntaStatus('erro')
      setTimeout(() => setPerguntaStatus('idle'), 3000)
    } finally {
      setEnviandoPergunta(false)
    }
  }

  const formatarNumero = (numero: number) => {
    if (numero >= 1000000) {
      return (numero / 1000000).toFixed(1) + 'M'
    } else if (numero >= 1000) {
      return (numero / 1000).toFixed(1) + 'K'
    }
    return numero.toString()
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getInstagramInfo = (url: string) => {
    // Tenta extrair o ID do post do Instagram
    const insta = url.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
    if (insta) {
      const postId = insta[1];
      return {
        thumbnail: `https://www.instagram.com/p/${postId}/media/?size=l`,
        fallbackThumbnail: `https://www.instagram.com/p/${postId}/embed/`,
        link: url,
        postId: postId
      };
    }
    return null;
  }

  const getTikTokInfo = (url: string) => {
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

  const getTwitchInfo = (url: string) => {
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

  const handleVisualizar = async (conteudoId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/conteudos/${conteudoId}/visualizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({ userId: user.id })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Atualizar estado local
        setConteudosInteracao(prev => ({
          ...prev,
          [conteudoId]: { ...prev[conteudoId], visualizado: true }
        }))

        // Atualizar contador de visualizações com o valor retornado pela API
        setConteudos(prev => prev.map(conteudo => 
          conteudo.id === conteudoId 
            ? { ...conteudo, visualizacoes: data.visualizacoes }
            : conteudo
        ))
      }
    } catch (error) {
      console.error('Erro ao registrar visualização:', error)
    }
  }

  const handleCurtir = async (conteudoId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que o clique propague para o card
    if (!user) return

    try {
      const response = await fetch(`/api/conteudos/${conteudoId}/curtir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({ userId: user.id })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Atualizar estado local
        setConteudosInteracao(prev => ({
          ...prev,
          [conteudoId]: { ...prev[conteudoId], curtido: data.curtido }
        }))

        // Atualizar contador de curtidas
        setConteudos(prev => prev.map(conteudo => 
          conteudo.id === conteudoId 
            ? { ...conteudo, curtidas: data.curtidas }
            : conteudo
        ))
      }
    } catch (error) {
      console.error('Erro ao curtir/descurtir:', error)
    }
  }

  const handleDislike = async (conteudoId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que o clique propague para o card
    if (!user) return

    try {
      const response = await fetch(`/api/conteudos/${conteudoId}/dislike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({ userId: user.id })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Atualizar estado local
        setConteudosInteracao(prev => ({
          ...prev,
          [conteudoId]: { ...prev[conteudoId], disliked: data.disliked }
        }))

        // Atualizar contador de dislikes
        setConteudos(prev => prev.map(conteudo => 
          conteudo.id === conteudoId 
            ? { ...conteudo, dislikes: data.dislikes }
            : conteudo
        ))
      }
    } catch (error) {
      console.error('Erro ao dar/remover dislike:', error)
    }
  }

  const handleCompartilhar = async (conteudoId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que o clique propague para o card
    if (!user) return

    try {
      // Registrar compartilhamento na API
      const response = await fetch(`/api/conteudos/${conteudoId}/compartilhar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({ userId: user.id })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Atualizar contador de compartilhamentos
        setConteudos(prev => prev.map(conteudo => 
          conteudo.id === conteudoId 
            ? { ...conteudo, compartilhamentos: data.compartilhamentos }
            : conteudo
        ))

        // Copiar URL do perfil para clipboard
        await navigator.clipboard.writeText(window.location.href)
        
        // Mostrar notificação elegante
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full'
        notification.textContent = 'Link copiado!'
        document.body.appendChild(notification)
        
        // Animar entrada
        setTimeout(() => {
          notification.classList.remove('translate-x-full')
        }, 100)
        
        // Remover após 3 segundos
        setTimeout(() => {
          notification.classList.add('translate-x-full')
          setTimeout(() => {
            document.body.removeChild(notification)
          }, 300)
        }, 3000)
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    }
  }

  const handleVotarEnquete = async (enqueteId: string, opcaoIndex: number) => {
    if (!user) {
      alert('Você precisa estar logado para votar nas enquetes')
      return
    }

    try {
      const response = await fetch('/api/enquetes/votar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({
          enqueteId,
          opcaoIndex,
          tipo: 'voto'
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Atualizar a enquete na lista
        setEnquetes(prev => prev.map(e => 
          e.id === enqueteId ? data.enquete : e
        ))
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erro ao votar na enquete')
      }
    } catch (error) {
      console.error('Erro ao votar na enquete:', error)
      alert('Erro ao votar na enquete')
    }
  }

  const handleDenunciarConteudo = (conteudo: { id: string, titulo: string }, e: React.MouseEvent) => {
    e.stopPropagation()
    setConteudoParaDenunciar(conteudo)
    setShowDenunciaModal(true)
  }

  const getTipoIcon = (tipo: string, url?: string) => {
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
        return <PlayIcon className="w-16 h-16 text-red-400" />;
      case 'tiktok':
        return <FaTiktok className="w-16 h-16 text-black" />;
      case 'instagram':
        return <FaInstagram className="w-16 h-16 text-pink-500" />;
      case 'twitch':
        return <FaTwitch className="w-16 h-16 text-purple-500" />;
      case 'imagem':
      case 'foto':
        return <PlayIcon className="w-16 h-16 text-green-400" />;
      case 'link':
      case 'url':
        return <PlayIcon className="w-16 h-16 text-blue-400" />;
      default:
        return <PlayIcon className="w-16 h-16 text-gray-400" />;
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Carregando... | SementesPLAY</title>
        </Head>
        <div className="min-h-screen bg-sss-dark">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sss-accent mx-auto mb-4"></div>
              <p className="text-sss-white">Carregando perfil do criador...</p>
            </div>
          </div>
      </div>
      </>
    )
  }

  if (!criador) {
    return (
      <>
        <Head>
          <title>Criador não encontrado | SementesPLAY</title>
        </Head>
        <div className="min-h-screen bg-sss-dark">
          <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
              <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-sss-white mb-2">Criador não encontrado</h1>
              <p className="text-gray-400 mb-4">O criador que você está procurando não existe ou foi removido.</p>
            <button 
                onClick={() => router.back()}
                className="bg-sss-accent text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
              >
                Voltar
            </button>
          </div>
        </div>
      </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{criador.nome} | SementesPLAY</title>
      </Head>

      <div className="min-h-screen bg-sss-dark">
        
        {/* Header */}
        <div className="bg-sss-medium/50 backdrop-blur-sm border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="text-sss-white hover:text-sss-accent transition-colors"
                  title="Voltar"
                  aria-label="Voltar"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full relative overflow-hidden">
                    {criador.avatar && criador.avatar.startsWith('http') ? (
                      <Image
                        src={criador.avatar}
                        alt={`Avatar de ${criador.nome}`}
                        fill
                        className="object-cover"
                        sizes="40px"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.className = "w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center";
                            parent.innerHTML = '<span class="text-xl">👨‍🎨</span>';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center">
                        <span className="text-xl">{criador.avatar || '👨‍🎨'}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-sss-white">{criador.nome}</h1>
                    <p className="text-sm text-gray-400">Posição #{criador.posicao} no ranking</p>
                  </div>
              </div>
              </div>
              
              <button 
                onClick={() => setShowPerguntaForm(true)}
                className="bg-sss-accent text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                <span>Enviar Pergunta</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna da Esquerda - Informações do Criador */}
            <div className="lg:col-span-1">
              <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 relative overflow-hidden">
                    {criador.avatar && criador.avatar.startsWith('http') ? (
                      <Image
                        src={criador.avatar}
                        alt={`Avatar de ${criador.nome}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.className = "w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center mx-auto mb-4";
                            parent.innerHTML = '<span class="text-4xl">👨‍🎨</span>';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center">
                        <span className="text-4xl">{criador.avatar || '👨‍🎨'}</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-sss-white mb-2">{criador.nome}</h2>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-sss-accent text-white text-sm rounded-full">
                      {criador.nivelRanking}
                    </span>
                    <span className="text-gray-400">#{criador.posicao}</span>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sss-accent font-bold text-2xl">
                        {formatarNumero(criador.sementes)}
                      </p>
                      <p className="text-gray-400 text-sm">Sementes Disponíveis</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sss-white font-semibold text-lg">
                        {formatarNumero(criador.pontuacaoTotal)}
                      </p>
                      <p className="text-gray-400 text-sm">Pontos Totais</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sss-white font-semibold text-lg">
                        {formatarNumero(criador.doacoes)}
                      </p>
                      <p className="text-gray-400 text-sm">Doações</p>
                    </div>
                  </div>
                </div>

                {/* Redes Sociais */}
                {(criador.redesSociais?.youtube || criador.redesSociais?.twitch || criador.redesSociais?.instagram || criador.redesSociais?.tiktok || criador.redesSociais?.discord) && (
                  <div className="border-t border-sss-light pt-4">
                    <h3 className="text-sss-white font-semibold mb-3">Redes Sociais</h3>
                    <div className="flex justify-center space-x-3">
                      {criador.redesSociais.youtube && (
                        <a
                          href={criador.redesSociais.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-500 hover:text-red-400 transition-colors"
                          title="YouTube"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </a>
                      )}
                      {criador.redesSociais.twitch && (
                        <a
                          href={criador.redesSociais.twitch}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-500 hover:text-purple-400 transition-colors"
                          title="Twitch"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                          </svg>
                        </a>
                      )}
                      {criador.redesSociais.instagram && (
                        <a
                          href={criador.redesSociais.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-500 hover:text-pink-400 transition-colors"
                          title="Instagram"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      )}
                      {criador.redesSociais.tiktok && (
                        <a
                          href={criador.redesSociais.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black hover:text-gray-700 transition-colors"
                          title="TikTok"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                          </svg>
                        </a>
                      )}
                      {criador.redesSociais.discord && (
                        <a
                          href={criador.redesSociais.discord}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-400 transition-colors"
                          title="Discord"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                    </div>
                  )}
                </div>
              </div>

            {/* Coluna da Direita - Conteúdos e Atividades */}
            <div className="lg:col-span-2 space-y-6">
              {/* Conteúdos */}
              <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                <h3 className="text-xl font-bold text-sss-white mb-4 flex items-center">
                  <PlayIcon className="w-6 h-6 mr-2" />
                  Conteúdos
                </h3>
                
                {conteudos.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Nenhum conteúdo publicado ainda.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conteudos.map((conteudo) => (
                      <div 
                        key={conteudo.id} 
                        className="bg-sss-dark rounded-lg overflow-hidden border border-sss-light cursor-pointer hover:border-sss-accent transition-all duration-200 hover:scale-[1.02] group"
                        onClick={() => {
                          handleVisualizar(conteudo.id)
                          window.open(conteudo.url, '_blank')
                        }}
                      >
                        {/* Thumbnail */}
                        <div className="relative h-48 bg-sss-medium">
                          {(() => {
                            // Primeiro, verificar se há thumbnail da API
                            if (conteudo.thumbnail && conteudo.thumbnail !== '/thumbnails/default.jpg') {
                              return (
                                <img 
                                  src={conteudo.thumbnail} 
                                  alt={conteudo.titulo}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    e.currentTarget.src = '/thumbnails/default.jpg'
                                  }}
                                />
                              );
                            }
                            
                            // Se não há thumbnail, verificar se é Instagram
                            const insta = getInstagramInfo(conteudo.url || '');
                            if (insta) {
                              return (
                                <Image
                                  src={insta.thumbnail}
                                  alt={conteudo.titulo}
                                  width={400}
                                  height={200}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    // Se a imagem falhar, mostra o placeholder do Instagram
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      const placeholder = document.createElement('div');
                                      placeholder.className = 'w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white group-hover:from-pink-600 group-hover:to-purple-700 transition-all';
                                      placeholder.innerHTML = `
                                        <div class="text-center">
                                          <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                          </svg>
                                          <div class="text-sm font-medium">Instagram</div>
                                          <div class="text-xs opacity-75">${conteudo.tipo}</div>
                                        </div>
                                      `;
                                      parent.appendChild(placeholder);
                                    }
                                  }}
                                />
                              );
                            }
                            
                            // Se não há thumbnail, verificar se é TikTok
                            const tiktok = getTikTokInfo(conteudo.url || '');
                            if (tiktok) {
                              return (
                                <Image
                                  src={tiktok.thumbnail}
                                  alt={conteudo.titulo}
                                  width={400}
                                  height={200}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    // Se a imagem falhar, mostra o placeholder do TikTok
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      const placeholder = document.createElement('div');
                                      placeholder.className = 'w-full h-full bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center text-white transition-all';
                                      placeholder.innerHTML = `
                                        <div class="text-center">
                                          <div class="text-6xl mb-3">🎵</div>
                                          <div class="text-sm font-bold">TikTok</div>
                                          <div class="text-xs opacity-80">${conteudo.tipo}</div>
                                        </div>
                                      `;
                                      parent.appendChild(placeholder);
                                    }
                                  }}
                                />
                              );
                            }
                            
                            // Se não há thumbnail, verificar se é Twitch
                            const twitch = getTwitchInfo(conteudo.url || '');
                            if (twitch) {
                              return (
                                <Image
                                  src={twitch.thumbnail}
                                  alt={conteudo.titulo}
                                  width={400}
                                  height={200}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    // Se a imagem falhar, mostra o placeholder do Twitch
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      const placeholder = document.createElement('div');
                                      placeholder.className = 'w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white transition-all';
                                      placeholder.innerHTML = `
                                        <div class="text-center">
                                          <div class="text-6xl mb-3">📺</div>
                                          <div class="text-sm font-bold">Twitch</div>
                                          <div class="text-xs opacity-80">${twitch.type === 'live' ? 'LIVE' : conteudo.tipo}</div>
                                        </div>
                                      `;
                                      parent.appendChild(placeholder);
                                    }
                                  }}
                                />
                              );
                            }
                            
                            // Se não é Instagram, TikTok, Twitch ou não tem thumbnail, mostrar ícone
                            return (
                              <div className="w-full h-full flex items-center justify-center">
                                {getTipoIcon(conteudo.tipo, conteudo.url)}
                              </div>
                            );
                          })()}
                          
                          {/* Overlay com tipo */}
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-1 bg-sss-accent text-white rounded text-xs font-medium">
                              {conteudo.tipo}
                            </span>
                    </div>
                    
                          {/* Overlay com ícone de play */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                            <div className="bg-sss-accent rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-75 group-hover:scale-100">
                              <PlayIcon className="w-8 h-8 text-white" />
                            </div>
                          </div>
                    </div>
                    
                        {/* Conteúdo do card */}
                        <div className="p-4">
                          <h4 className="text-sss-white font-semibold mb-2 line-clamp-2 group-hover:text-sss-accent transition-colors">{conteudo.titulo}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-400 mb-3">
                            <span className="px-2 py-1 bg-sss-light text-sss-white rounded text-xs">
                              {conteudo.categoria}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <EyeIcon className="w-4 h-4 mr-1" />
                                {formatarNumero(conteudo.visualizacoes)}
                              </span>
                              <button
                                onClick={(e) => handleCurtir(conteudo.id, e)}
                                className={`flex items-center transition-colors ${
                                  conteudosInteracao[conteudo.id]?.curtido 
                                    ? 'text-sss-accent' 
                                    : 'text-gray-400 hover:text-sss-accent'
                                }`}
                                title={conteudosInteracao[conteudo.id]?.curtido ? 'Descurtir' : 'Curtir'}
                              >
                                <HandThumbUpIcon className={`w-4 h-4 mr-1 ${
                                  conteudosInteracao[conteudo.id]?.curtido ? 'fill-current' : ''
                                }`} />
                                {formatarNumero(conteudo.curtidas)}
                              </button>
                                                             <button
                                 onClick={(e) => handleDislike(conteudo.id, e)}
                                 className={`flex items-center transition-colors ${
                                   conteudosInteracao[conteudo.id]?.disliked 
                                     ? 'text-red-500' 
                                     : 'text-gray-400 hover:text-red-500'
                                 }`}
                                 title={conteudosInteracao[conteudo.id]?.disliked ? 'Remover dislike' : 'Dislike'}
                               >
                                 <HandThumbDownIcon className={`w-4 h-4 mr-1 ${
                                   conteudosInteracao[conteudo.id]?.disliked ? 'fill-current' : ''
                                 }`} />
                                 {formatarNumero(conteudo.dislikes)}
                               </button>
                    <button
                                 onClick={(e) => handleCompartilhar(conteudo.id, e)}
                                 className="flex items-center text-gray-400 hover:text-green-500 transition-colors"
                                 title="Compartilhar"
                    >
                                 <ShareIcon className="w-4 h-4 mr-1" />
                                 {formatarNumero(conteudo.compartilhamentos || 0)}
                    </button>
                    <button
                      onClick={(e) => handleDenunciarConteudo(conteudo, e)}
                      className="flex items-center text-gray-400 hover:text-red-500 transition-colors"
                      title="Denunciar conteúdo"
                    >
                      <FlagIcon className="w-4 h-4 mr-1" />
                    </button>
                            </div>
                            <span>{formatarData(conteudo.data)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enquetes */}
              {enquetes.length > 0 && (
                <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                  <h3 className="text-xl font-bold text-sss-white mb-4 flex items-center">
                    <ChartBarIcon className="w-6 h-6 mr-2" />
                    Enquetes
                  </h3>
                  
                  <div className="space-y-4">
                    {enquetes.map((enquete) => (
                      <div key={enquete.id} className="bg-sss-dark rounded-lg p-4 border border-sss-light">
                        <h4 className="text-sss-white font-semibold mb-3">{enquete.pergunta}</h4>
                        <div className="space-y-2">
                          {enquete.opcoes.map((opcao, index) => {
                            const totalVotos = enquete.opcoes.reduce((sum, o) => sum + o.votos, 0)
                            const porcentagem = totalVotos > 0 ? (opcao.votos / totalVotos) * 100 : 0
                            
                            return (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sss-white text-sm">{opcao.opcao}</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleVotarEnquete(enquete.id, index)}
                                    className="px-3 py-1 bg-sss-accent hover:bg-sss-accent/80 text-sss-dark text-xs rounded transition-colors"
                                  >
                                    Votar
                                  </button>
                                  <div className="w-24 bg-sss-light rounded-full h-2">
                                    <div 
                                      className={`bg-sss-accent h-2 rounded-full transition-all duration-300 ${porcentagem <= 10 ? 'w-[10%]' : porcentagem <= 20 ? 'w-[20%]' : porcentagem <= 30 ? 'w-[30%]' : porcentagem <= 40 ? 'w-[40%]' : porcentagem <= 50 ? 'w-[50%]' : porcentagem <= 60 ? 'w-[60%]' : porcentagem <= 70 ? 'w-[70%]' : porcentagem <= 80 ? 'w-[80%]' : porcentagem <= 90 ? 'w-[90%]' : 'w-full'}`}
                                    ></div>
                                  </div>
                                  <span className="text-gray-400 text-sm w-8 text-right">
                                    {opcao.votos}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <p className="text-gray-400 text-xs mt-3">{formatarData(enquete.dataCriacao)}</p>
                      </div>
                    ))}
                            </div>
                          </div>
              )}

              {/* Recados Públicos */}
              {recados.length > 0 && (
                <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
                  <h3 className="text-xl font-bold text-sss-white mb-4 flex items-center">
                    <ChatBubbleLeftIcon className="w-6 h-6 mr-2" />
                    Recados Públicos
                  </h3>
                  
                  <div className="space-y-4">
                    {recados.map((recado) => (
                      <div key={recado.id} className="bg-sss-dark rounded-lg p-4 border border-sss-light">
                        <h4 className="text-sss-white font-semibold mb-2">{recado.mensagem}</h4>
                        <p className="text-gray-300 mb-3">De: {recado.remetenteNome || 'Usuário'}</p>
                        {recado.resposta && (
                          <div className="bg-sss-light rounded-lg p-3 mt-3">
                            <p className="text-sss-accent font-semibold text-sm mb-1">Resposta:</p>
                            <p className="text-sss-white text-sm">{recado.resposta}</p>
                          </div>
                        )}
                        <p className="text-gray-400 text-xs">{formatarData(recado.data)}</p>
                        </div>
                    ))}
                  </div>
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Pergunta */}
        {showPerguntaForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-sss-medium rounded-lg p-6 w-full max-w-md mx-4 border border-sss-light"
            >
              <h3 className="text-xl font-bold text-sss-white mb-4">Enviar Pergunta</h3>
              
              <form onSubmit={handleEnviarPergunta} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all"
                    placeholder="Título da pergunta"
                    value={perguntaForm.titulo}
                    onChange={e => setPerguntaForm(f => ({ ...f, titulo: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mensagem</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full bg-sss-light border border-sss-light rounded-lg px-4 py-3 text-sss-white placeholder-gray-400 focus:ring-2 focus:ring-sss-accent focus:border-transparent transition-all resize-none"
                    placeholder="Sua pergunta..."
                    value={perguntaForm.mensagem}
                    onChange={e => setPerguntaForm(f => ({ ...f, mensagem: e.target.value }))}
                  />
                </div>

                {perguntaStatus === 'enviado' && (
                  <div className="bg-green-600 text-white p-3 rounded-lg text-center">
                    Pergunta enviada com sucesso!
                  </div>
                )}

                {perguntaStatus === 'erro' && (
                  <div className="bg-red-600 text-white p-3 rounded-lg text-center">
                    Erro ao enviar pergunta. Tente novamente.
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={enviandoPergunta}
                    className="flex-1 bg-sss-accent text-white py-3 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviandoPergunta ? 'Enviando...' : 'Enviar Pergunta'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPerguntaForm(false)}
                    className="px-6 py-3 bg-sss-light text-sss-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal de Denúncia */}
        {showDenunciaModal && conteudoParaDenunciar && (
          <DenunciaModal
            isOpen={showDenunciaModal}
            onClose={() => {
              setShowDenunciaModal(false)
              setConteudoParaDenunciar(null)
            }}
            conteudoId={conteudoParaDenunciar.id}
            tituloConteudo={conteudoParaDenunciar.titulo}
            tipoConteudo="criador"
          />
        )}
      </div>
    </>
  )
} 