import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar códigos não usados
    const codigos = await prisma.codigoCashback.findMany({
      where: {
        usado: false
      },
      include: {
        parceiro: {
          select: {
            id: true,
            nomeCidade: true
          }
        }
      },
      orderBy: {
        dataGeracao: 'desc'
      }
    })

    const codigosFormatados = codigos.map(codigo => ({
      id: codigo.id,
      codigo: codigo.codigo,
      descricao: `Código de ${codigo.parceiro.nomeCidade} - ${codigo.valor} Sementes`,
      valor: codigo.valor,
      tipo: 'fixo',
      valorMinimo: 0,
      valorMaximo: codigo.valor,
      dataInicio: codigo.dataGeracao,
      dataFim: null,
      status: 'ativo',
      categoria: 'parceiro',
      usos: 0,
      maxUsos: 1,
      icone: '🎁',
      cor: 'green'
    }))

    return res.status(200).json({ codigos: codigosFormatados })
  } catch (error) {
    console.error('Erro ao buscar códigos:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 