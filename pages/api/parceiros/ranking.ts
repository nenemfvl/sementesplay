import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar todos os parceiros ativos
    const parceiros = await prisma.parceiro.findMany({
      where: {
        usuario: {
          nivel: 'parceiro'
        }
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true,
            nivel: true,
            sementes: true,
            dataCriacao: true
          }
        },
        // Aqui você pode incluir outros dados específicos dos parceiros
        // como códigos gerados, transações, etc.
      }
    })

    // Formatar dados dos parceiros
    const parceirosFormatados = parceiros.map((parceiro, index) => ({
      id: parceiro.id,
      nome: parceiro.usuario.nome,
      email: parceiro.usuario.email,
      avatar: parceiro.usuario.avatarUrl || '🏢',
      nivel: parceiro.usuario.nivel,
      sementes: parceiro.usuario.sementes,
      nomeCidade: parceiro.nomeCidade,
      comissaoMensal: parceiro.comissaoMensal,
      totalVendas: parceiro.totalVendas,
      codigosGerados: parceiro.codigosGerados,
      posicao: index + 1,
      dataCriacao: parceiro.usuario.dataCriacao,
      // Aqui você pode adicionar mais campos específicos dos parceiros
      // como conteúdo, promoções, etc.
    }))

    // Ordenar por total de vendas (maior para menor)
    parceirosFormatados.sort((a, b) => b.totalVendas - a.totalVendas)

    res.status(200).json({ 
      success: true,
      parceiros: parceirosFormatados 
    })

  } catch (error) {
    console.error('Erro ao buscar parceiros:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 