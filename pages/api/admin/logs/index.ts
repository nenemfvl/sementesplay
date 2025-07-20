import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Por enquanto, retornar logs mockados
    // Em uma implementação real, você criaria uma tabela logs_auditoria
    const logs = [
      {
        id: '1',
        usuarioId: 'user1',
        usuarioNome: 'João Silva',
        acao: 'login',
        detalhes: 'Login realizado com sucesso',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min atrás
        nivel: 'success'
      },
      {
        id: '2',
        usuarioId: 'user2',
        usuarioNome: 'Maria Santos',
        acao: 'doacao',
        detalhes: 'Doação de 500 Sementes para Criador XYZ',
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min atrás
        nivel: 'info'
      },
      {
        id: '3',
        usuarioId: 'user3',
        usuarioNome: 'Pedro Costa',
        acao: 'cashback',
        detalhes: 'Resgate de código BONUS100 - 100 Sementes',
        ip: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
        nivel: 'success'
      },
      {
        id: '4',
        usuarioId: 'admin1',
        usuarioNome: 'Admin Sistema',
        acao: 'admin',
        detalhes: 'Alteração de nível do usuário user1 para parceiro',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
        nivel: 'warning'
      },
      {
        id: '5',
        usuarioId: 'user4',
        usuarioNome: 'Ana Oliveira',
        acao: 'logout',
        detalhes: 'Logout realizado',
        ip: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 horas atrás
        nivel: 'info'
      },
      {
        id: '6',
        usuarioId: 'user5',
        usuarioNome: 'Carlos Lima',
        acao: 'doacao',
        detalhes: 'Tentativa de doação com saldo insuficiente',
        ip: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 horas atrás
        nivel: 'error'
      },
      {
        id: '7',
        usuarioId: 'user6',
        usuarioNome: 'Lucia Ferreira',
        acao: 'missao',
        detalhes: 'Missão "Primeira Doação" completada - Recompensa: 1000 Sementes',
        ip: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 horas atrás
        nivel: 'success'
      },
      {
        id: '8',
        usuarioId: 'admin1',
        usuarioNome: 'Admin Sistema',
        acao: 'admin',
        detalhes: 'Configurações do sistema alteradas: Taxa de cashback para 15%',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 horas atrás
        nivel: 'warning'
      }
    ]

    // Ordenar por timestamp (mais recente primeiro)
    const logsOrdenados = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return res.status(200).json({ logs: logsOrdenados })
  } catch (error) {
    console.error('Erro ao buscar logs:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 