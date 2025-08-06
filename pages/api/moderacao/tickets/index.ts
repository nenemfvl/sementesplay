import { NextApiRequest, NextApiResponse } from 'next'

interface TicketSuporte {
  id: string
  usuario: string
  categoria: string
  titulo: string
  descricao: string
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  dataCriacao: Date
  dataResolucao?: Date
  agente?: string
  mensagens: any[]
}

// COMENTADO: Dados mockados - substituir por consulta real ao banco quando implementar sistema de tickets
/*
const ticketsMock: TicketSuporte[] = [
  {
    id: '1',
    usuario: 'João Silva',
    categoria: 'tecnico',
    titulo: 'Problema com login',
    descricao: 'Não consigo fazer login na minha conta. Aparece erro de senha incorreta.',
    status: 'aberto',
    prioridade: 'media',
    dataCriacao: new Date('2024-07-15'),
    mensagens: [
      {
        id: '1',
        autor: 'João Silva',
        conteudo: 'Olá, preciso de ajuda com meu login.',
        timestamp: new Date('2024-07-15T10:00:00'),
        tipo: 'usuario'
      }
    ]
  },
  {
    id: '2',
    usuario: 'Maria Santos',
    categoria: 'pagamento',
    titulo: 'Doação não processada',
    descricao: 'Fiz uma doação de 1000 sementes mas não foi processada. O dinheiro foi debitado da minha conta.',
    status: 'em_andamento',
    prioridade: 'alta',
    dataCriacao: new Date('2024-07-14'),
    agente: 'Suporte1',
    mensagens: [
      {
        id: '1',
        autor: 'Maria Santos',
        conteudo: 'Fiz uma doação mas não foi processada.',
        timestamp: new Date('2024-07-14T14:30:00'),
        tipo: 'usuario'
      },
      {
        id: '2',
        autor: 'Suporte1',
        conteudo: 'Olá Maria! Vou verificar o status da sua doação. Pode me informar o ID da transação?',
        timestamp: new Date('2024-07-14T15:00:00'),
        tipo: 'agente'
      }
    ]
  },
  {
    id: '3',
    usuario: 'Pedro Costa',
    categoria: 'conta',
    titulo: 'Mudança de email',
    descricao: 'Preciso alterar o email da minha conta. Como faço isso?',
    status: 'resolvido',
    prioridade: 'baixa',
    dataCriacao: new Date('2024-07-13'),
    dataResolucao: new Date('2024-07-13'),
    agente: 'Suporte2',
    mensagens: [
      {
        id: '1',
        autor: 'Pedro Costa',
        conteudo: 'Como altero meu email?',
        timestamp: new Date('2024-07-13T09:00:00'),
        tipo: 'usuario'
      },
      {
        id: '2',
        autor: 'Suporte2',
        conteudo: 'Olá Pedro! Para alterar seu email, acesse Configurações > Perfil > Editar Email.',
        timestamp: new Date('2024-07-13T09:15:00'),
        tipo: 'agente'
      }
    ]
  },
  {
    id: '4',
    usuario: 'Ana Oliveira',
    categoria: 'bug',
    titulo: 'Erro no sistema de missões',
    descricao: 'As missões não estão sendo marcadas como completadas. Já tentei várias vezes.',
    status: 'aberto',
    prioridade: 'alta',
    dataCriacao: new Date('2024-07-15'),
    mensagens: [
      {
        id: '1',
        autor: 'Ana Oliveira',
        conteudo: 'As missões não estão funcionando.',
        timestamp: new Date('2024-07-15T16:00:00'),
        tipo: 'usuario'
      }
    ]
  },
  {
    id: '5',
    usuario: 'Carlos Lima',
    categoria: 'outro',
    titulo: 'Sugestão de melhoria',
    descricao: 'Gostaria de sugerir a implementação de um sistema de notificações mais avançado.',
    status: 'fechado',
    prioridade: 'baixa',
    dataCriacao: new Date('2024-07-10'),
    dataResolucao: new Date('2024-07-11'),
    agente: 'Suporte3',
    mensagens: [
      {
        id: '1',
        autor: 'Carlos Lima',
        conteudo: 'Sugestão de melhoria para notificações.',
        timestamp: new Date('2024-07-10T11:00:00'),
        tipo: 'usuario'
      },
      {
        id: '2',
        autor: 'Suporte3',
        conteudo: 'Obrigado pela sugestão! Vamos analisar e implementar em breve.',
        timestamp: new Date('2024-07-11T10:00:00'),
        tipo: 'agente'
      }
    ]
  }
]
*/
const ticketsMock: TicketSuporte[] = [] // COMENTADO: Array vazio até implementar sistema real

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { status, categoria, prioridade } = req.query
      
      let ticketsFiltrados = ticketsMock
      
      if (status && status !== 'todos') {
        ticketsFiltrados = ticketsFiltrados.filter(t => t.status === status)
      }
      
      if (categoria && categoria !== 'todas') {
        ticketsFiltrados = ticketsFiltrados.filter(t => t.categoria === categoria)
      }
      
      if (prioridade && prioridade !== 'todas') {
        ticketsFiltrados = ticketsFiltrados.filter(t => t.prioridade === prioridade)
      }

      // COMENTADO: Simular delay de rede - remover quando implementar sistema real
      // setTimeout(() => {
        res.status(200).json({
          success: true,
          tickets: ticketsFiltrados,
          total: ticketsFiltrados.length,
          estatisticas: {
            abertos: ticketsMock.filter(t => t.status === 'aberto').length,
            em_andamento: ticketsMock.filter(t => t.status === 'em_andamento').length,
            resolvidos: ticketsMock.filter(t => t.status === 'resolvido').length,
            fechados: ticketsMock.filter(t => t.status === 'fechado').length
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