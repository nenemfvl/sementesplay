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
import Navbar from '../components/Navbar'

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
    
    // Buscar perfil autenticado com token
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
      .catch(err => console.error('Erro ao buscar perfil autenticado:', err))

    // Buscar sessão autenticada com token
    fetch('/api/auth/session', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          // Sessão válida, pode atualizar estado se quiser
        }
      })
      .catch(err => console.error('Erro ao buscar sessão autenticada:', err))
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
    const interval = setInterval(() => {
      if (user) {
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
          .catch(err => console.error('Erro ao atualizar perfil:', err))
      }
    }, 30000) // Atualizar a cada 30 segundos

    return () => clearInterval(interval)
  }, [user])

  // Atualizar perfil quando a página ganhar foco
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
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
          .catch(err => console.error('Erro ao atualizar perfil:', err))
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user])

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/perfil/stats?usuarioId=${user?.id}`)
      const data = await response.json()
      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadXPData = async () => {
    try {
      const token = localStorage.getItem('sementesplay_token');
      const res = await fetch('/api/usuario/xp', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setXpData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de XP:', error);
    }
  }

  const loadMissoesUsuario = async () => {
    try {
      const token = localStorage.getItem('sementesplay_token');
      const res = await fetch('/api/missoes', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setMissoesUsuario(data);
      }
    } catch (error) {
      console.error('Erro ao carregar missões do usuário:', error);
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
    { id: 'conquistas', label: 'Conquistas', icon: TrophyIcon },
    { id: 'xp', label: 'Histórico XP', icon: StarIcon }
  ]

  return (
    <>
      <Head>
        <title>Perfil - SementesPLAY</title>
        <meta name="description" content="Seu perfil SementesPLAY" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Navbar */}
        <Navbar />

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
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(xpData.progressoNivel, 100)}%` }}
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
                         {user.pontuacao}
                       </p>
                     </div>
                     <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                       <TrophyIcon className="w-5 h-5 text-yellow-500" />
                     </div>
                   </div>
                 </div>

                {xpData && (
                  <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">Experiência</p>
                        <p className="text-2xl font-bold text-sss-white">
                          {xpData.usuario.xp} XP
                        </p>
                        <p className="text-sm text-blue-400">
                          Nível {xpData.usuario.nivelUsuario}
                        </p>
                      </div>
                                             <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                         <StarIcon className="w-5 h-5 text-blue-500" />
                       </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progresso</span>
                        <span>{Math.round(xpData.progressoNivel)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(xpData.progressoNivel, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                                 <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
                   <div className="flex items-center justify-between mb-3">
                     <div>
                       <p className="text-gray-300 text-sm">Missões Ativas</p>
                       <p className="text-2xl font-bold text-green-400">
                         {missoesUsuario.filter(m => !m.concluida).length}
                       </p>
                       <p className="text-sm text-gray-400">
                         {missoesUsuario.filter(m => m.concluida).length} concluídas
                       </p>
                     </div>
                     <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                       <TrophyIcon className="w-5 h-5 text-green-400" />
                     </div>
                   </div>
                   <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progresso Geral</span>
                      <span>
                        {missoesUsuario.length > 0 
                          ? Math.round((missoesUsuario.filter(m => m.concluida).length / missoesUsuario.length) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${missoesUsuario.length > 0 
                            ? (missoesUsuario.filter(m => m.concluida).length / missoesUsuario.length) * 100
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {missoesUsuario.filter(m => !m.concluida).length} disponíveis
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

                      <div>
                        <h3 className="text-lg font-semibold text-sss-white mb-4">Próximas Conquistas</h3>
                        <div className="space-y-3">
                          {stats?.proximasConquistas?.map((conquista: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-sss-dark rounded-lg">
                              <div>
                                <p className="text-sss-white text-sm">{conquista.nome}</p>
                                <p className="text-gray-400 text-xs">{conquista.descricao}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-400">{conquista.progresso}%</div>
                                <div className="w-16 h-2 bg-gray-600 rounded-full">
                                  <div 
                                    className="progress-bar"
                                    style={{ width: `${conquista.progresso}%` }}
                                  ></div>
                                </div>
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

                

                {activeTab === 'conquistas' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold text-sss-white mb-4">Conquistas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {stats?.conquistas?.map((conquista: any, index: number) => (
                        <div key={index} className={`p-4 rounded-lg border ${
                          conquista.desbloqueada 
                            ? 'bg-sss-accent/10 border-sss-accent' 
                            : 'bg-sss-dark border-sss-light'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <TrophyIcon className={`w-6 h-6 ${
                              conquista.desbloqueada ? 'text-yellow-500' : 'text-gray-400'
                            }`} />
                            <div>
                              <p className={`font-semibold ${
                                conquista.desbloqueada ? 'text-sss-white' : 'text-gray-400'
                              }`}>
                                {conquista.nome}
                              </p>
                              <p className="text-gray-400 text-sm">{conquista.descricao}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-lg font-semibold text-sss-white mb-4">Emblemas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {stats?.emblemas?.map((emblema: any, index: number) => (
                        <div key={index} className="p-4 rounded-lg border bg-sss-accent/10 border-sss-accent text-center">
                          <div className="text-4xl mb-2">{emblema.emblema}</div>
                          <p className="text-sss-white font-semibold text-sm">{emblema.titulo}</p>
                          <p className="text-gray-400 text-xs">{emblema.dataConquista?.toLocaleDateString('pt-BR')}</p>
                        </div>
                      ))}
                      {(!stats?.emblemas || stats.emblemas.length === 0) && (
                        <div className="col-span-2 md:col-span-4 text-center py-8">
                          <p className="text-gray-400">Nenhum emblema conquistado ainda</p>
                          <p className="text-gray-500 text-sm">Complete missões para ganhar emblemas!</p>
                        </div>
                      )}
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
                              <span className="text-gray-300">Doações: 25 XP cada</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400">🎯</span>
                              <span className="text-gray-300">Missões: 50 XP cada</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-purple-400">🔥</span>
                              <span className="text-gray-300">Login diário: 10 XP</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-yellow-400">⭐</span>
                              <span className="text-gray-300">Conquistas: 50-1000 XP</span>
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