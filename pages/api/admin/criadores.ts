import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Temporariamente sem autenticação para debug
    console.log('🔍 Buscando criadores...')

    // Buscar criadores
    const criadores = await prisma.criador.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            nivel: true,
            dataCriacao: true
          }
        }
      },
      orderBy: {
        dataCriacao: 'desc'
      }
    })

    console.log(`📊 Criadores encontrados: ${criadores.length}`)
    
    // Formatar dados
    const criadoresFormatados = criadores.map(criador => ({
      id: criador.id,
      nome: criador.usuario.nome,
      email: criador.usuario.email,
      nivel: criador.nivel,
      doacoesRecebidas: criador.doacoes || 0,
      apoiadores: criador.apoiadores || 0,
      favoritos: 0, // Campo não existe no schema
      status: 'ativo', // Campo não existe no schema
      dataCriacao: criador.dataCriacao
    }))

    console.log('✅ Dados formatados:', criadoresFormatados)
    return res.status(200).json({ criadores: criadoresFormatados })
  } catch (error) {
    console.error('Erro ao buscar criadores:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 