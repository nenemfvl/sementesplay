import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon, 
  ArrowLeftIcon, 
  FunnelIcon,
  StarIcon,
  UserIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { auth } from '../lib/auth';

export default function Buscar() {
  useEffect(() => {
    const user = auth.getUser();
    if (!user) {
      window.location.href = '/login';
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('todos')
  const [ordenacao, setOrdenacao] = useState('ranking')
  const [criadores, setCriadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCriadores() {
      setLoading(true);
      try {
        const res = await fetch('/api/criadores');
        const data = await res.json();
        if (res.ok && data.criadores) {
          setCriadores(data.criadores);
        } else {
          setCriadores([]);
        }
      } catch {
        setCriadores([]);
      }
      setLoading(false);
    }
    fetchCriadores();
  }, []);

  // Filtrar e ordenar criadores
  const criadoresFiltrados = criadores
    .filter((criador: any) => {
      const matchSearch = criador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (criador.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchNivel = filtroNivel === 'todos' || criador.categoria === filtroNivel
      return matchSearch && matchNivel
    })
    .sort((a: any, b: any) => {
      switch (ordenacao) {
        case 'ranking':
          return (a.posicao || 0) - (b.posicao || 0)
        case 'sementes':
          return (b.sementes || 0) - (a.sementes || 0)
        case 'apoiadores':
          return (b.apoiadores || 0) - (a.apoiadores || 0)
        case 'nome':
          return a.nome.localeCompare(b.nome)
        default:
          return (a.posicao || 0) - (b.posicao || 0)
      }
    })

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Supremo': return 'text-yellow-500'
      case 'Parceiro': return 'text-gray-400'
      case 'Comum': return 'text-orange-600'
      default: return 'text-gray-300'
    }
  }

  const getNivelBg = (nivel: string) => {
    switch (nivel) {
      case 'Supremo': return 'bg-yellow-500/20'
      case 'Parceiro': return 'bg-gray-500/20'
      case 'Comum': return 'bg-orange-500/20'
      default: return 'bg-gray-500/20'
    }
  }

  return (
    <>
      <Head>
        <title>Buscar Criadores - SementesPLAY</title>
        <meta name="description" content="Encontre criadores no SementesPLAY" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="inline-flex items-center text-sss-accent hover:text-red-400">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🌱</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-gray-300">Buscar Criadores</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-20 h-20 bg-sss-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlassIcon className="w-10 h-10 text-sss-accent" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Buscar Criadores
              </h2>
              <p className="text-gray-300">
                Encontre os melhores criadores para apoiar
              </p>
            </div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-sss-medium rounded-lg p-6 border border-sss-light"
            >
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou tags..."
                    className="w-full pl-10 pr-3 py-3 bg-sss-dark border border-sss-light rounded-lg text-sss-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sss-accent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sss-white mb-2">
                    <FunnelIcon className="w-4 h-4 inline mr-1" />
                    Nível
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                    value={filtroNivel}
                    onChange={(e) => setFiltroNivel(e.target.value)}
                  >
                    <option value="todos">Todos os níveis</option>
                    <option value="supremo">Supremo</option>
                    <option value="parceiro">Parceiro</option>
                    <option value="comum">Comum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sss-white mb-2">
                    Ordenar por
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-sss-dark border border-sss-light rounded-lg text-sss-white focus:outline-none focus:ring-2 focus:ring-sss-accent"
                    value={ordenacao}
                    onChange={(e) => setOrdenacao(e.target.value)}
                  >
                    <option value="ranking">Ranking</option>
                    <option value="sementes">Mais Sementes</option>
                    <option value="apoiadores">Mais Apoiadores</option>
                    <option value="nome">Nome A-Z</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-sss-white">
                  Resultados ({criadoresFiltrados.length})
                </h3>
                {criadoresFiltrados.length > 0 && (
                  <p className="text-gray-400 text-sm">
                    Mostrando {criadoresFiltrados.length} criadores
                  </p>
                )}
              </div>

              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-gray-400">Carregando criadores...</p>
                </motion.div>
              ) : criadoresFiltrados.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sss-white mb-2">
                    Nenhum criador encontrado
                  </h3>
                  <p className="text-gray-400">
                    Tente ajustar os filtros ou termos de busca
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {criadoresFiltrados.map((criador, index) => (
                    <motion.div
                      key={criador.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-sss-medium rounded-lg p-6 border border-sss-light hover:border-sss-accent/50 transition-colors"
                    >
                      <div className="text-center">
                        {/* Avatar */}
                        <div className="w-20 h-20 bg-sss-dark rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                          {criador.avatar}
                        </div>

                        {/* Info */}
                        <div className="mb-4">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-sss-white">{criador.nome}</h3>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getNivelBg(criador.nivel)} ${getNivelColor(criador.nivel)}`}>
                              {criador.nivel}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-center space-x-1 text-yellow-500 mb-2">
                            <StarIcon className="w-4 h-4" />
                            <span className="text-sm">#{criador.posicao}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-sss-accent font-semibold">{criador.sementes.toLocaleString()}</p>
                              <p className="text-gray-400">Sementes Disponíveis</p>
                            </div>
                            <div>
                              <p className="text-sss-accent font-semibold">{criador.apoiadores}</p>
                              <p className="text-gray-400">Apoiadores</p>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap justify-center gap-1 mb-4">
                          {criador.tags.map((tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-sss-dark text-gray-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <Link
                            href={`/criador/${criador.id}`}
                            className="flex-1 bg-sss-light hover:bg-sss-accent text-white py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center"
                          >
                            <UserIcon className="w-4 h-4 mr-1" />
                            Perfil
                          </Link>
                          <Link
                            href={`/doar?criador=${criador.id}`}
                            className="flex-1 bg-sss-accent hover:bg-red-600 text-white py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center"
                          >
                            <HeartIcon className="w-4 h-4 mr-1" />
                            Doar
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 