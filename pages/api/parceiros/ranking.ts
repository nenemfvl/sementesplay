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

    // Calcular total de vendas para cada parceiro baseado nos repasses realizados
    const parceirosComVendas = await Promise.all(
      parceiros.map(async (parceiro) => {
        // Buscar repasses realizados pelo parceiro
        const repassesRealizados = await prisma.repasseParceiro.findMany({
          where: {
            parceiroId: parceiro.id,
            status: 'pago'
          }
        })

        // Calcular total de vendas baseado nos repasses
        const totalVendasReal = repassesRealizados.reduce((sum, r) => sum + r.valor, 0)

        return {
          ...parceiro,
          totalVendasCalculado: totalVendasReal
        }
      })
    )

    // Formatar dados dos parceiros
    const parceirosFormatados = parceirosComVendas.map((parceiro, index) => ({
      id: parceiro.id,
      nome: parceiro.usuario.nome,
      email: parceiro.usuario.email,
      avatar: parceiro.usuario.avatarUrl || '🏢',
      nivel: parceiro.usuario.nivel,
      sementes: parceiro.usuario.sementes,
      nomeCidade: parceiro.nomeCidade,
      comissaoMensal: parceiro.comissaoMensal,
      totalVendas: parceiro.totalVendasCalculado, // Usar o valor calculado
      codigosGerados: parceiro.codigosGerados,
      posicao: index + 1,
      dataCriacao: parceiro.usuario.dataCriacao,
      // Redes Sociais
      instagram: parceiro.instagram,
      twitch: parceiro.twitch,
      youtube: parceiro.youtube,
      tiktok: parceiro.tiktok,
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