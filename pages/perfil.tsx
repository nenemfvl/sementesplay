import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  UserIcon, 
  ArrowLeftIcon, 
  HeartIcon,
  GiftIcon,
  TrophyIcon,
  ChartBarIcon,
  CalendarIcon,
  StarIcon,
  CogIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth, User } from '../lib/auth'
import Image from 'next/image'
import Cropper from 'react-easy-crop'
import Modal from 'react-modal'


export default function Perfil() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [xpData, setXpData] = useState<any>(null)
  const [missoesUsuario, setMissoesUsuario] = useState<any[]>([])

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    setUser(currentUser)
    setAvatarUrl((currentUser as any).avatarUrl || null)
    
    // Verificar token antes de fazer requisições
    const checkTokenAndLoadData = async () => {
      const tokenValid = await auth.checkAndRefreshToken()
      if (!tokenValid) {
        window.location.href = '/login'
        return
      }
      
      const token = localStorage.getItem('sementesplay_token');
      fetch('/api/perfil', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setUser(data)
            setAvatarUrl(data.avatarUrl || null)
            auth.setUser(data, token || undefined)
          }
        })
        .catch(err => {
          // COMENTADO: Log de debug - não afeta funcionalidade
          // console.error('Erro ao buscar perfil autenticado:', err)
        })
    }
    
    checkTokenAndLoadData()
  }, [])

  // Carregar estatísticas quando o usuário estiver definido
  useEffect(() => {
    if (user) {
      loadStats()
      loadXPData()
      loadMissoesUsuario()
    }
  }, [user])

  // Atualizar perfil periodicamente para manter sementes atualizadas
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user) {
        const tokenValid = await auth.checkAndRefreshToken()
        if (!tokenValid) {
          window.location.href = '/login'
          return
        }
        
        const token = localStorage.getItem('sementesplay_token');
        fetch('/api/perfil', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.id) {
              setUser(data)
              auth.setUser(data, token || undefined)
            }
          })
          .catch(err => {
            // COMENTADO: Log de debug - não afeta funcionalidade
            // console.error('Erro ao atualizar perfil:', err)
          })
      }
    }, 30000) // Atualizar a cada 30 segundos

    return () => clearInterval(interval)
  }, [user])

  // Atualizar perfil quando a página ganhar foco ou se tornar visível
  useEffect(() => {
    const handleFocus = async () => {
      if (user) {
        const tokenValid = await auth.checkAndRefreshToken()
        if (!tokenValid) {
          window.location.href = '/login'
          return
        }
        
        const token = localStorage.getItem('sementesplay_token');
        fetch('/api/perfil', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.id) {
              setUser(data)
              auth.setUser(data, token || undefined)
              // Recarregar estatísticas quando o perfil for atualizado
              loadStats()
              loadXPData()
            }
          })
          .catch(err => {
            // COMENTADO: Log de debug - não afeta funcionalidade
            // console.error('Erro ao atualizar perfil:', err)
          })
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Página se tornou visível novamente
        loadStats()
        loadXPData()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user])

  const loadStats = async () => {
    try {
      const currentUser = auth.getUser();
      if (!currentUser) {
        console.error('Usuário não encontrado');
        return;
      }
      
      const response = await fetch(`/api/perfil/stats?usuarioId=${currentUser.id}`)
      const data = await response.json()
      if (response.ok) {
        // COMENTADO: Log de debug - não afeta funcionalidade
        // console.log('Estatísticas carregadas:', data);
        setStats(data)
      } else {
        // COMENTADO: Log de debug - não afeta funcionalidade
        // console.error('Erro na resposta da API de estatísticas:', response.status, response.statusText);
      }
    } catch (error) {
      // COMENTADO: Log de debug - não afeta funcionalidade
      // console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadXPData = async () => {
    try {
      const currentUser = auth.getUser();
      if (!currentUser) {
        // COMENTADO: Log de debug - não afeta funcionalidade
        // console.error('Usuário não encontrado');
        return;
      }
      
      // COMENTADO: Log de debug - não afeta funcionalidade
      // console.log('Carregando XP para usuário:', currentUser.id);
      
      // Usar os dados da API de estatísticas que já inclui XP
      if (stats) {
        // Recalcular nível baseado no XP atual (mesma fórmula da API)
        const xpAtual = stats.xp || 0;
        const nivelCalculado = Math.floor(1 + Math.sqrt(xpAtual / 100));
        const xpProximoNivel = Math.pow(nivelCalculado + 1, 2) * 100;
        const xpNivelAtual = Math.pow(nivelCalculado, 2) * 100;
        const progressoCalculado = ((xpAtual - xpNivelAtual) / (xpProximoNivel - xpNivelAtual)) * 100;
        
        const xpData = {
          usuario: {
            xp: xpAtual,
            nivelUsuario: nivelCalculado
          },
          xpProximoNivel: xpProximoNivel,
          progressoNivel: Math.min(Math.max(progressoCalculado, 0), 100)
        };
        // COMENTADO: Log de debug - não afeta funcionalidade
        // console.log('Dados de XP calculados:', xpData);
        setXpData(xpData);
      }
    } catch (error) {
      // COMENTADO: Log de debug - não afeta funcionalidade
      // console.error('Erro ao carregar dados de XP:', error);
    }
  }

  const loadMissoesUsuario = async () => {
    try {
      const token = localStorage.getItem('sementesplay_token');
      const currentUser = auth.getUser();
      
      if (!currentUser || !currentUser.id) {
        console.error('Usuário não encontrado para carregar missões');
        return;
      }
      
      const res = await fetch(`/api/missoes?usuarioId=${currentUser.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setMissoesUsuario(data);
      } else {
        console.error('Erro ao carregar missões:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Erro ao carregar missões do usuário:', error);
    }
  }

  const atualizarEstatisticas = async () => {
    setLoading(true);
    try {
      await loadStats();
      await loadXPData(); // Chamar após loadStats para ter acesso aos dados
      await loadMissoesUsuario();
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }

  const getNivelIcon = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'supremo':
        return <StarIcon className="w-6 h-6 text-yellow-500" />
      case 'parceiro':
        return <StarIcon className="w-6 h-6 text-gray-400" />
      case 'comum':
        return <StarIcon className="w-6 h-6 text-orange-600" />
      default:
        return <UserIcon className="w-6 h-6 text-gray-400" />
    }
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'supremo':
        return 'text-yellow-500'
      case 'parceiro':
        return 'text-gray-400'
      case 'comum':
        return 'text-orange-600'
      default:
        return 'text-gray-400'
    }
  }

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const showCropModal = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setCropModalOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const getCroppedImg = async (imageSrc: string, crop: any) => {
    const image = new window.Image()
    image.src = imageSrc
    await new Promise((resolve) => { image.onload = resolve })
    const canvas = document.createElement('canvas')
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Falha ao obter contexto do canvas')
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    )
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Falha ao gerar imagem'))
      }, 'image/jpeg')
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return
    const file = e.target.files[0]
    showCropModal(file)
  }

  const handleCropSave = async () => {
    if (!selectedImage || !croppedAreaPixels || !user) return
    setUploading(true)
    const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels)
    const formData = new FormData()
    formData.append('avatar', croppedBlob, 'avatar.jpg')
    formData.append('usuarioId', user.id)
    try {
      const res = await fetch('/api/usuario/avatar', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.avatarUrl) {
        const resPerfil = await fetch('/api/perfil');
        if (resPerfil.ok) {
          const userAtualizado = await resPerfil.json();
          auth.setUser(userAtualizado);
          setUser(userAtualizado);
          setAvatarUrl(userAtualizado.avatarUrl || null);
        } else {
          setAvatarUrl(data.avatarUrl);
          setUser({ ...(user as any), avatarUrl: data.avatarUrl });
          auth.setUser({ ...(user as any), avatarUrl: data.avatarUrl });
        }
      }
    } catch (err) {
      alert('Erro ao fazer upload do avatar')
    } finally {
      setUploading(false)
      setCropModalOpen(false)
      setSelectedImage(null)
    }
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: ChartBarIcon },
    { id: 'doacoes', label: 'Histórico de Doações', icon: HeartIcon },
    { id: 'xp', label: 'Histórico XP', icon: StarIcon }
  ]

  return (
    <>
      <Head>
        <title>Perfil - SementesPLAY</title>
        <meta name="description" content="Seu perfil SementesPLAY" />
      </Head>

      <div className="min-h-screen bg-sss-dark">



        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Profile Header */}
            <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-sss-accent/20 rounded-full flex items-center justify-center relative group">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl.replace('http://', 'https://')}
                      alt="Avatar do usuário"
                      width={80}
                      height={80}
                      className="rounded-full object-cover w-20 h-20"
                    />
                  ) : (
                    <UserIcon className="w-10 h-10 text-sss-accent" />
                  )}
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-sss-accent text-white rounded-full p-1 cursor-pointer shadow-lg group-hover:scale-110 transition-transform" title="Alterar foto">
                    <PencilIcon className="w-5 h-5" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={uploading}
                      aria-label="Upload de avatar"
                    />
                  </label>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-sss-white">{user.nome}</h2>
                    {getNivelIcon(user.nivel)}
                    <span className={`text-sm font-medium ${getNivelColor(user.nivel)}`}>
                      Nível {user.nivel}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 mb-2">{user.email}</p>
                  
                  {/* XP e Nível do Usuário */}
                  {xpData && (
                    <div className="mb-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm text-blue-400 font-medium">
                          Nível {xpData.usuario.nivelUsuario}
                        </span>
                        <span className="text-sm text-gray-400">
                          ({xpData.usuario.xp} XP)
                        </span>
                        {(user as any).streakLogin > 0 && (
                          <span className="text-sm text-orange-400">
                            🔥 {(user as any).streakLogin} dias
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ${xpData.progressoNivel <= 25 ? 'w-1/4' : xpData.progressoNivel <= 50 ? 'w-1/2' : xpData.progressoNivel <= 75 ? 'w-3/4' : 'w-full'}`}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {xpData.usuario.xp} / {xpData.xpProximoNivel} XP para o próximo nível
                      </p>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    Membro desde {new Date(user.dataCriacao || Date.now()).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-sss-accent">{user.sementes}</div>
                  <div className="text-sm text-gray-400">Sementes Disponíveis</div>
                  {stats?.sementes && stats.sementes > 0 && (
                    <div className="mt-2">
                      <div className="text-lg font-semibold text-purple-400">{stats.sementes}</div>
                      <div className="text-xs text-gray-500">Sementes Disponíveis</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-sss-white">Estatísticas</h3>
              <button
                onClick={atualizarEstatisticas}
                disabled={loading}
                className="bg-sss-accent hover:bg-red-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CogIcon className="w-4 h-4" />
                )}
                {loading ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sss-accent mx-auto"></div>
                <p className="text-gray-400 mt-2">Carregando estatísticas...</p>
              </div>
            ) : (
                             <motion.div 
                 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: 0.2 }}
               >
                                 <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-gray-300 text-sm">Total Doações</p>
                       <p className="text-2xl font-bold text-sss-white">
                         {stats?.totalDoacoes || 0}
                       </p>
                     </div>
                     <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                       <HeartIcon className="w-5 h-5 text-red-500" />
                     </div>
                   </div>
                 </div>

                                 <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-gray-300 text-sm">Criadores Apoiados</p>
                       <p className="text-2xl font-bold text-sss-white">
                         {stats?.criadoresApoiados || 0}
                       </p>
                     </div>
                     <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                       <UserIcon className="w-5 h-5 text-blue-500" />
                     </div>
                   </div>
                 </div>



                                                   <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">Pontuação</p>
                        <p className="text-2xl font-bold text-sss-white">
                          {stats?.pontuacao || 0}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <TrophyIcon className="w-5 h-5 text-yellow-500" />
                      </div>
                    </div>
                  </div>

                

                                                                   <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">Total de XP Ganho</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {xpData?.usuario?.xp || 0} XP
                        </p>
                        <p className="text-sm text-gray-400">
                          Nível {xpData?.usuario?.nivelUsuario || 1}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <StarIcon className="w-5 h-5 text-purple-400" />
                      </div>
                    </div>
                    <div className="mt-3">
                     <div className="flex justify-between text-xs text-gray-400 mb-1">
                       <span>Progresso</span>
                       <span>{Math.round(xpData?.progressoNivel || 0)}%</span>
                     </div>
                     <div className="w-full bg-gray-700 rounded-full h-2">
                       <div 
                         className={`bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 ${(xpData?.progressoNivel || 0) <= 25 ? 'w-1/4' : (xpData?.progressoNivel || 0) <= 50 ? 'w-1/2' : (xpData?.progressoNivel || 0) <= 75 ? 'w-3/4' : 'w-full'}`}
                       ></div>
                     </div>
                     <p className="text-xs text-gray-400 mt-1">
                       {xpData?.usuario?.xp || 0} / {xpData?.xpProximoNivel || 100} XP
                     </p>
                   </div>
                </div>
              </motion.div>
            )}

            {/* Tabs */}
            <div className="bg-sss-medium rounded-lg border border-sss-light">
              <div className="border-b border-sss-light">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-sss-accent text-sss-accent'
                          : 'border-transparent text-gray-300 hover:text-sss-white'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-sss-white mb-4">Atividade Recente</h3>
                        <div className="space-y-3">
                          {stats?.atividadesRecentes?.map((atividade: any, index: number) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-sss-dark rounded-lg">
                              <div className="w-8 h-8 bg-sss-accent/20 rounded-full flex items-center justify-center">
                                <CalendarIcon className="w-4 h-4 text-sss-accent" />
                              </div>
                              <div>
                                <p className="text-sss-white text-sm">{atividade.descricao}</p>
                                <p className="text-gray-400 text-xs">{atividade.data}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>


                    </div>
                  </motion.div>
                )}

                {activeTab === 'doacoes' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Histórico de Doações</h3>
                    <div className="space-y-3">
                      {stats?.historicoDoacoes?.map((doacao: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                          <div className="flex items-center space-x-3">
                            <HeartIcon className="w-5 h-5 text-red-500" />
                            <div>
                              <p className="text-sss-white">{doacao.criador}</p>
                              <p className="text-gray-400 text-sm">{doacao.data}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sss-accent font-semibold">{doacao.valor} Sementes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                



                {activeTab === 'xp' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Histórico de Experiência</h3>
                    {xpData ? (
                      <div className="space-y-4">
                        <div className="bg-sss-dark rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sss-white font-medium">Resumo</span>
                            <span className="text-blue-400 font-bold">{xpData.usuario.xp} XP Total</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-2xl font-bold text-blue-400">{xpData.usuario.nivelUsuario}</p>
                              <p className="text-xs text-gray-400">Nível Atual</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-purple-400">{xpData.xpProximoNivel}</p>
                              <p className="text-xs text-gray-400">XP Próximo Nível</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-green-400">{Math.round(xpData.progressoNivel)}%</p>
                              <p className="text-xs text-gray-400">Progresso</p>
                            </div>
                                                         <div>
                               <p className="text-2xl font-bold text-orange-400">{(user as any).streakLogin || 0}</p>
                               <p className="text-xs text-gray-400">Dias Consecutivos</p>
                             </div>
                          </div>
                        </div>
                        
                        <div className="bg-sss-dark rounded-lg p-4">
                          <h4 className="text-sss-white font-medium mb-3">Como ganhar XP</h4>
                                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                             <div className="flex items-center space-x-2">
                               <span className="text-green-400">💝</span>
                               <span className="text-gray-300">Fazer doação: 10 XP cada</span>
                             </div>
                             
                             <div className="flex items-center space-x-2">
                               <span className="text-blue-400">🎁</span>
                               <span className="text-gray-300">Receber doação: 5 XP cada</span>
                             </div>
                             
                             <div className="flex items-center space-x-2">
                               <span className="text-purple-400">🔥</span>
                               <span className="text-gray-300">Login diário: 10 XP</span>
                             </div>

                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400">Carregando dados de XP...</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal de Crop de Avatar */}
      <Modal
        isOpen={cropModalOpen}
        onRequestClose={() => setCropModalOpen(false)}
        contentLabel="Ajustar avatar"
        ariaHideApp={false}
        className="flex items-center justify-center fixed inset-0 z-50 bg-black bg-opacity-60"
      >
        <div className="bg-white rounded-lg p-6 flex flex-col items-center">
          <h2 className="mb-4 text-lg font-bold">Ajuste sua foto de perfil</h2>
          {selectedImage && (
            <div className="relative w-64 h-64">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
          )}
          <div className="flex gap-4 mt-4">
            <button onClick={() => setCropModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
            <button onClick={handleCropSave} className="px-4 py-2 bg-sss-accent text-white rounded" disabled={uploading}>{uploading ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </div>
      </Modal>
    </>
  )
} 