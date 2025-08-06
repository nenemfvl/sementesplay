import { NextApiRequest, NextApiResponse } from 'next'

interface Denuncia {
  id: string
  tipo: 'conteudo' | 'usuario' | 'spam' | 'inadequado' | 'outro'
  categoria: string
  descricao: string
  denunciante: string
  denunciado: string
  conteudo?: string
  status: 'pendente' | 'em_analise' | 'resolvida' | 'rejeitada'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  dataDenuncia: Date
  dataResolucao?: Date
  moderador?: string
  acao?: string
  observacoes?: string
}

// COMENTADO: Dados mockados - substituir por consulta real ao banco quando implementar sistema de denúncias
/*
const denunciasMock: Denuncia[] = [
  {
    id: '1',
    tipo: 'conteudo',
    categoria: 'inadequado',
    descricao: 'Conteúdo com linguagem inadequada e ofensiva',
    denunciante: 'Maria Silva',
    denunciado: 'João Costa',
    conteudo: 'Mensagem ofensiva no chat',
    status: 'pendente',
    prioridade: 'alta',
    dataDenuncia: new Date('2024-07-15')
  },
  {
    id: '2',
    tipo: 'usuario',
    categoria: 'spam',
    descricao: 'Usuário enviando mensagens em massa sem sentido',
    denunciante: 'Pedro Santos',
    denunciado: 'Carlos123',
    status: 'em_analise',
    prioridade: 'media',
    dataDenuncia: new Date('2024-07-14'),
    moderador: 'Admin1'
  },
  {
    id: '3',
    tipo: 'conteudo',
    categoria: 'inadequado',
    descricao: 'Imagem com conteúdo impróprio',
    denunciante: 'Ana Oliveira',
    denunciado: 'Lucas Mendes',
    conteudo: 'Imagem compartilhada',
    status: 'resolvida',
    prioridade: 'critica',
    dataDenuncia: new Date('2024-07-13'),
    dataResolucao: new Date('2024-07-14'),
    moderador: 'Admin1',
    acao: 'remocao_conteudo',
    observacoes: 'Conteúdo removido e usuário advertido'
  },
  {
    id: '4',
    tipo: 'usuario',
    categoria: 'outro',
    descricao: 'Usuário criando múltiplas contas para burlar banimento',
    denunciante: 'Sistema',
    denunciado: 'User123',
    status: 'pendente',
    prioridade: 'critica',
    dataDenuncia: new Date('2024-07-15')
  },
  {
    id: '5',
    tipo: 'spam',
    categoria: 'spam',
    descricao: 'Links suspeitos sendo compartilhados',
    denunciante: 'Fernanda Costa',
    denunciado: 'Spammer99',
    conteudo: 'Link suspeito: http://spam.com',
    status: 'resolvida',
    prioridade: 'alta',
    dataDenuncia: new Date('2024-07-12'),
    dataResolucao: new Date('2024-07-13'),
    moderador: 'Admin2',
    acao: 'suspensao',
    observacoes: 'Usuário suspenso por 7 dias'
  }
]
*/
const denunciasMock: Denuncia[] = [] // COMENTADO: Array vazio até implementar sistema real

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { status, tipo, prioridade } = req.query
      
      let denunciasFiltradas = denunciasMock
      
      if (status && status !== 'todas') {
        denunciasFiltradas = denunciasFiltradas.filter(d => d.status === status)
      }
      
      if (tipo && tipo !== 'todos') {
        denunciasFiltradas = denunciasFiltradas.filter(d => d.tipo === tipo)
      }
      
      if (prioridade && prioridade !== 'todas') {
        denunciasFiltradas = denunciasFiltradas.filter(d => d.prioridade === prioridade)
      }

      // COMENTADO: Simular delay de rede - remover quando implementar sistema real
      // setTimeout(() => {
        res.status(200).json({
          success: true,
          denuncias: denunciasFiltradas,
          total: denunciasFiltradas.length,
          estatisticas: {
            pendentes: denunciasMock.filter(d => d.status === 'pendente').length,
            em_analise: denunciasMock.filter(d => d.status === 'em_analise').length,
            resolvidas: denunciasMock.filter(d => d.status === 'resolvida').length,
            rejeitadas: denunciasMock.filter(d => d.status === 'rejeitada').length
          }
        })
      // }, 300)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({
      success: false,
      message: `Método ${req.method} não permitido`
    })
  }
} 