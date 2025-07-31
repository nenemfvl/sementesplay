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
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  ShareIcon,
  CreditCardIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { auth, User } from '../../lib/auth'
import Navbar from '../../components/Navbar'

interface ParceiroDetalhes {
  id: string
  nome: string
  nomeCidade: string
  comissaoMensal: number
  totalVendas: number
  codigosGerados: number
  usuarioId: string
  usuario: {
    id: string
    nome: string
    email: string
    tipo: string
    nivel: string
  }
}

interface ConteudoParceiro {
  id: string
  titulo: string
  tipo: string
  categoria: string
  descricao?: string
  url: string
  cidade: string
  endereco?: string
  dataEvento?: string
  preco?: string
  vagas?: number
  visualizacoes: number
  curtidas: number
  dislikes: number
  compartilhamentos: number
  comentarios: number
  dataPublicacao: string
  fixado: boolean
}

interface Transacao {
  id: string
  valor: number
  codigoParceiro: string
  status: string
  data: string
  usuario?: {
    nome: string
    email: string
  }
}

interface CodigoCashback {
  id: string
  codigo: string
  valor: number
  usado: boolean
  dataGeracao: string
  dataUso?: string
}

export default function ParceiroPerfil() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState<User | null>(null)
  const [parceiro, setParceiro] = useState<ParceiroDetalhes | null>(null)
  const [conteudos, setConteudos] = useState<ConteudoParceiro[]>([])
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [codigos, setCodigos] = useState<CodigoCashback[]>([])
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState<'conteudos' | 'transacoes' | 'codigos'>('conteudos')
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())

  useEffect(() => {
    const currentUser = auth.getUser()
    if (currentUser) {
      setUser(currentUser)
    }

    // Carregar favoritos do localStorage
    const favoritosSalvos = localStorage.getItem('parceirosFavoritos')
    if (favoritosSalvos) {
      setFavoritos(new Set(JSON.parse(favoritosSalvos)))
    }
  }, [])

  useEffect(() => {
    if (id && typeof id === 'string') {
      carregarDetalhesParceiro(id)
    }
  }, [id])

  const carregarDetalhesParceiro = async (parceiroId: string) => {
    setLoading(true)
    try {
      // Carregar dados do parceiro
      const response = await fetch(`/api/parceiros/perfil?parceiroId=${parceiroId}`)
      if (response.ok) {
        const data = await response.json()
        setParceiro(data)
        
        // Só carregar outros dados se o parceiro existir
        // Carregar conteúdos do parceiro
        const conteudosResponse = await fetch(`/api/parceiros/conteudos?parceiroId=${parceiroId}`)
        if (conteudosResponse.ok) {
          const conteudosData = await conteudosResponse.json()
          setConteudos(conteudosData)
        }

        // Carregar transações do parceiro
        const transacoesResponse = await fetch(`/api/parceiros/transacoes?parceiroId=${parceiroId}`)
        if (transacoesResponse.ok) {
          const transacoesData = await transacoesResponse.json()
          setTransacoes(transacoesData)
        }

        // Carregar códigos do parceiro
        const codigosResponse = await fetch(`/api/parceiros/codigos?parceiroId=${parceiroId}`)
        if (codigosResponse.ok) {
          const codigosData = await codigosResponse.json()
          setCodigos(codigosData)
        }
      } else if (response.status === 404) {
        // Parceiro não encontrado - não carregar outros dados
        setParceiro(null)
      }

    } catch (error) {
      console.error('Erro ao carregar dados do parceiro:', error)
      setParceiro(null)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorito = (parceiroId: string) => {
    const novosFavoritos = new Set(favoritos)
    if (novosFavoritos.has(parceiroId)) {
      novosFavoritos.delete(parceiroId)
    } else {
      novosFavoritos.add(parceiroId)
    }
    setFavoritos(novosFavoritos)
    localStorage.setItem('parceirosFavoritos', JSON.stringify(Array.from(novosFavoritos)))
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
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Carregando... - SementesPLAY</title>
        </Head>
        <div className="min-h-screen bg-sss-dark flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-gray-400">Carregando perfil do parceiro...</div>
          </main>
        </div>
      </>
    )
  }

  if (!parceiro) {
    return (
      <>
        <Head>
          <title>Parceiro não encontrado - SementesPLAY</title>
        </Head>
        <div className="min-h-screen bg-sss-dark flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🏢</div>
              <h1 className="text-2xl font-bold text-sss-white mb-2">Parceiro não encontrado</h1>
              <p className="text-gray-400 mb-4">O parceiro que você está procurando não existe ou foi removido.</p>
              <button
                onClick={() => router.push('/parceiros')}
                className="bg-sss-accent hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Voltar aos Parceiros
              </button>
            </div>
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{parceiro.nome} - Parceiro SementesPLAY</title>
      </Head>
      <div className="min-h-screen bg-sss-dark">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header do Parceiro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-sss-medium rounded-lg p-6 mb-8 border border-sss-light"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-6">
                  <BuildingOfficeIcon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-sss-white mb-2">{parceiro.nome}</h1>
                  <p className="text-gray-400 mb-1">🏢 Parceiro</p>
                  <p className="text-gray-400 mb-4">{parceiro.nomeCidade}</p>
                  
                  {/* Estatísticas */}
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{formatarMoeda(parceiro.totalVendas)}</div>
                      <div className="text-sm text-gray-400">Total de Vendas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{parceiro.codigosGerados}</div>
                      <div className="text-sm text-gray-400">Códigos Gerados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{formatarMoeda(parceiro.comissaoMensal)}</div>
                      <div className="text-sm text-gray-400">Comissão Mensal</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botões de ação */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => toggleFavorito(parceiro.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  {favoritos.has(parceiro.id) ? (
                    <>
                      <HeartIcon className="w-5 h-5" />
                      Favoritado
                    </>
                  ) : (
                    <>
                      <HeartIcon className="w-5 h-5" />
                      Favoritar
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => router.push('/parceiros')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Voltar
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6 border-b border-sss-light">
            <button 
              className={`px-4 py-2 rounded-t-lg transition-colors ${aba === 'conteudos' ? 'bg-sss-accent text-white' : 'bg-sss-dark text-gray-400 hover:text-sss-white'}`} 
              onClick={() => setAba('conteudos')}
            >
              <DocumentTextIcon className="w-5 h-5 inline mr-2" /> Conteúdos
            </button>
            <button 
              className={`px-4 py-2 rounded-t-lg transition-colors ${aba === 'transacoes' ? 'bg-sss-accent text-white' : 'bg-sss-dark text-gray-400 hover:text-sss-white'}`} 
              onClick={() => setAba('transacoes')}
            >
              <CreditCardIcon className="w-5 h-5 inline mr-2" /> Transações
            </button>
            <button 
              className={`px-4 py-2 rounded-t-lg transition-colors ${aba === 'codigos' ? 'bg-sss-accent text-white' : 'bg-sss-dark text-gray-400 hover:text-sss-white'}`} 
              onClick={() => setAba('codigos')}
            >
              <DocumentTextIcon className="w-5 h-5 inline mr-2" /> Códigos
            </button>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="bg-sss-medium rounded-lg p-6 border border-sss-light">
            {aba === 'conteudos' && (
              <div>
                <h3 className="text-xl font-semibold text-sss-white mb-4">Conteúdos do Parceiro</h3>
                {conteudos.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum conteúdo encontrado.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {conteudos.map((conteudo) => (
                      <div key={conteudo.id} className="bg-sss-dark rounded-lg p-4 border border-sss-light">
                        <h4 className="font-semibold text-sss-white mb-2">{conteudo.titulo}</h4>
                        <p className="text-sm text-gray-400 mb-2">{conteudo.tipo} • {conteudo.categoria}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>👁️ {formatarNumero(conteudo.visualizacoes)}</span>
                          <span>👍 {formatarNumero(conteudo.curtidas)}</span>
                          <span>💬 {formatarNumero(conteudo.comentarios)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {aba === 'transacoes' && (
              <div>
                <h3 className="text-xl font-semibold text-sss-white mb-4">Transações</h3>
                {transacoes.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhuma transação encontrada.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-sss-light">
                          <th className="text-left py-3 px-4 text-sss-white">Código</th>
                          <th className="text-left py-3 px-4 text-sss-white">Usuário</th>
                          <th className="text-left py-3 px-4 text-sss-white">Valor</th>
                          <th className="text-left py-3 px-4 text-sss-white">Status</th>
                          <th className="text-left py-3 px-4 text-sss-white">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transacoes.map((transacao) => (
                          <tr key={transacao.id} className="border-b border-sss-light">
                            <td className="py-3 px-4 text-sss-white font-mono">{transacao.codigoParceiro}</td>
                            <td className="py-3 px-4 text-sss-white">{transacao.usuario?.nome || 'N/A'}</td>
                            <td className="py-3 px-4 text-green-400 font-medium">{formatarMoeda(transacao.valor)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                transacao.status === 'aprovada' ? 'bg-green-600 text-white' :
                                transacao.status === 'pendente' ? 'bg-yellow-600 text-white' :
                                'bg-red-600 text-white'
                              }`}>
                                {transacao.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-400">{formatarData(transacao.data)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {aba === 'codigos' && (
              <div>
                <h3 className="text-xl font-semibold text-sss-white mb-4">Códigos de Cashback</h3>
                {codigos.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum código encontrado.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-sss-light">
                          <th className="text-left py-3 px-4 text-sss-white">Código</th>
                          <th className="text-left py-3 px-4 text-sss-white">Valor</th>
                          <th className="text-left py-3 px-4 text-sss-white">Status</th>
                          <th className="text-left py-3 px-4 text-sss-white">Data Geração</th>
                        </tr>
                      </thead>
                      <tbody>
                        {codigos.map((codigo) => (
                          <tr key={codigo.id} className="border-b border-sss-light">
                            <td className="py-3 px-4 text-sss-white font-mono">{codigo.codigo}</td>
                            <td className="py-3 px-4 text-green-400 font-medium">{formatarMoeda(codigo.valor)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${codigo.usado ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                                {codigo.usado ? 'Usado' : 'Ativo'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-400">{formatarData(codigo.dataGeracao)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
} 