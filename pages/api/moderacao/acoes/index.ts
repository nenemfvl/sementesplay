import { NextApiRequest, NextApiResponse } from 'next'

interface AcaoModerativa {
  id: string
  tipo: 'advertencia' | 'suspensao' | 'banimento' | 'remocao_conteudo'
  usuario: string
  motivo: string
  duracao?: number // em dias
  moderador: string
  dataAcao: Date
  status: 'ativa' | 'expirada' | 'revogada'
  observacoes?: string
}

// COMENTADO: Dados mockados - substituir por consulta real ao banco quando implementar sistema de ações moderativas
/*
const acoesMock: AcaoModerativa[] = [
  {
    id: '1',
    tipo: 'suspensao',
    usuario: 'João Costa',
    motivo: 'Linguagem inadequada e ofensiva',
    duracao: 7,
    moderador: 'Admin1',
    dataAcao: new Date('2024-07-14'),
    status: 'ativa',
    observacoes: 'Usuário suspenso por 7 dias por violação das regras da comunidade'
  },
  {
    id: '2',
    tipo: 'advertencia',
    usuario: 'Carlos123',
    motivo: 'Spam no chat',
    moderador: 'Admin2',
    dataAcao: new Date('2024-07-13'),
    status: 'ativa',
    observacoes: 'Primeira advertência por envio de mensagens em massa'
  },
  {
    id: '3',
    tipo: 'banimento',
    usuario: 'Spammer99',
    motivo: 'Múltiplas violações e criação de contas falsas',
    moderador: 'Admin1',
    dataAcao: new Date('2024-07-12'),
    status: 'ativa',
    observacoes: 'Banimento permanente por violações graves e reincidência'
  },
  {
    id: '4',
    tipo: 'remocao_conteudo',
    usuario: 'Lucas Mendes',
    motivo: 'Conteúdo impróprio',
    moderador: 'Admin2',
    dataAcao: new Date('2024-07-11'),
    status: 'ativa',
    observacoes: 'Conteúdo removido por violar diretrizes da comunidade'
  },
  {
    id: '5',
    tipo: 'suspensao',
    usuario: 'User456',
    motivo: 'Comportamento tóxico',
    duracao: 30,
    moderador: 'Admin1',
    dataAcao: new Date('2024-07-05'),
    status: 'expirada',
    observacoes: 'Suspensão de 30 dias expirada'
  }
]
*/
const acoesMock: AcaoModerativa[] = [] // COMENTADO: Array vazio até implementar sistema real

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { tipo, status } = req.query
      
      let acoesFiltradas = acoesMock
      
      if (tipo && tipo !== 'todas') {
        acoesFiltradas = acoesFiltradas.filter(a => a.tipo === tipo)
      }
      
      if (status && status !== 'todas') {
        acoesFiltradas = acoesFiltradas.filter(a => a.status === status)
      }

      // COMENTADO: Simular delay de rede - remover quando implementar sistema real
      // setTimeout(() => {
        res.status(200).json({
          success: true,
          acoes: acoesFiltradas,
          total: acoesFiltradas.length,
          estatisticas: {
            ativas: acoesMock.filter(a => a.status === 'ativa').length,
            expiradas: acoesMock.filter(a => a.status === 'expirada').length,
            revogadas: acoesMock.filter(a => a.status === 'revogada').length
          }
        })
      // }, 300)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  } else if (req.method === 'POST') {
    try {
      const { usuarioId, tipo, motivo, duracao } = req.body

      // Simular criação de ação moderativa
      setTimeout(() => {
        res.status(200).json({
          success: true,
          message: 'Ação moderativa aplicada com sucesso!',
          acao: {
            id: Date.now().toString(),
            tipo,
            usuario: usuarioId,
            motivo,
            duracao,
            moderador: 'Admin1',
            dataAcao: new Date(),
            status: 'ativa'
          }
        })
      }, 1000)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).json({
      success: false,
      message: `Método ${req.method} não permitido`
    })
  }
} 