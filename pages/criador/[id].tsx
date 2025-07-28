import React, { useState, useEffect } from 'react'
import Head from 'next/head'
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
  ShareIcon
} from '@heroicons/react/24/outline'
import { auth, User } from '../../lib/auth'
import Navbar from '../../components/Navbar'

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
  opcoes: { id: string; texto: string; votos: number }[]
  data: string
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

        // Carregar enquetes do criador (apenas se usuário estiver autenticado)
        if (user) {
          try {
            const responseEnquetes = await fetch(`/api/enquetes?criadorId=${criadorId}`, {
              headers: {
                'Authorization': `Bearer ${user.id}`
              }
            })
            const dataEnquetes = await responseEnquetes.json()
            
            if (responseEnquetes.ok) {
              setEnquetes(dataEnquetes.enquetes || [])
            }
          } catch (error) {
            console.error('Erro ao carregar enquetes:', error)
            setEnquetes([])
          }
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

  if (loading) {
    return (
      <>
        <Head>
          <title>Carregando... | SementesPLAY</title>
        </Head>
        <div className="min-h-screen bg-sss-dark">
          <Navbar />
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
          <Navbar />
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
        <Navbar />
        
        {/* Header */}
        <div className="bg-sss-medium/50 backdrop-blur-sm border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="text-sss-white hover:text-sss-accent transition-colors"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-3">
                  {criador.avatar && criador.avatar.startsWith('http') ? (
                    <img src={criador.avatar} alt={criador.nome} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl">{criador.avatar}</span>
                  )}
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
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-sss-dark mx-auto mb-4">
                    {criador.avatar && criador.avatar.startsWith('http') ? (
                      <img src={criador.avatar} alt={criador.nome} className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <span className="text-4xl">{criador.avatar}</span>
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
                {(criador.redesSociais?.youtube || criador.redesSociais?.twitch || criador.redesSociais?.instagram || criador.redesSociais?.tiktok) && (
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
                          {conteudo.thumbnail && conteudo.thumbnail !== '/thumbnails/default.jpg' ? (
                            <img 
                              src={conteudo.thumbnail} 
                              alt={conteudo.titulo}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                e.currentTarget.src = '/thumbnails/default.jpg'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <PlayIcon className="w-16 h-16 text-gray-500" />
                      </div>
                          )}
                          
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
                          {enquete.opcoes.map((opcao) => {
                            const totalVotos = enquete.opcoes.reduce((sum, o) => sum + o.votos, 0)
                            const porcentagem = totalVotos > 0 ? (opcao.votos / totalVotos) * 100 : 0
                            
                            return (
                              <div key={opcao.id} className="flex items-center justify-between">
                                <span className="text-sss-white text-sm">{opcao.texto}</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-24 bg-sss-light rounded-full h-2">
                                    <div 
                                      className="bg-sss-accent h-2 rounded-full" 
                                      style={{ width: `${porcentagem}%` }}
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
                        <p className="text-gray-400 text-xs mt-3">{formatarData(enquete.data)}</p>
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
      </div>
    </>
  )
} 