import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar códigos ativos
    const codigos = await prisma.codigoCashback.findMany({
      where: {
        ativo: true,
        OR: [
          { dataExpiracao: null },
          { dataExpiracao: { gt: new Date() } }
        ]
      },
      orderBy: {
        dataCriacao: 'desc'
      }
    })

    const codigosFormatados = codigos.map(codigo => ({
      id: codigo.id,
      codigo: codigo.codigo,
      descricao: codigo.descricao,
      valor: codigo.valor,
      tipo: codigo.tipo,
      valorMinimo: codigo.valorMinimo,
      valorMaximo: codigo.valorMaximo,
      dataInicio: codigo.dataCriacao,
      dataFim: codigo.dataExpiracao,
      status: codigo.ativo ? 'ativo' : 'inativo',
      categoria: codigo.categoria,
      usos: codigo.usos || 0,
      maxUsos: codigo.maxUsos,
      icone: '🎁', // Mockado por enquanto
      cor: 'green' // Mockado por enquanto
    }))

    return res.status(200).json({ codigos: codigosFormatados })
  } catch (error) {
    console.error('Erro ao buscar códigos:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 