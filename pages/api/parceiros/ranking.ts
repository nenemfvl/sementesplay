import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
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

    // Calcular total de vendas e solicitações de compra para cada parceiro
    const parceirosComDados = await Promise.all(
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

        // Buscar solicitações de compra registradas com este parceiro
        const solicitacoesCompra = await prisma.solicitacaoCompra.findMany({
          where: {
            parceiroId: parceiro.id
          }
        })

        // Contar total de solicitações de compra
        const totalSolicitacoes = solicitacoesCompra.length

        return {
          ...parceiro,
          totalVendasCalculado: totalVendasReal,
          codigosGeradosCalculado: totalSolicitacoes
        }
      })
    )

    // Formatar dados dos parceiros
    const parceirosFormatados = parceirosComDados.map((parceiro, index) => ({
      id: parceiro.id,
      nome: parceiro.usuario.nome,
      email: parceiro.usuario.email,
      avatar: parceiro.usuario.avatarUrl || '🏢',
      nivel: parceiro.usuario.nivel,
      sementes: parceiro.usuario.sementes,
      nomeCidade: parceiro.nomeCidade,
      comissaoMensal: parceiro.comissaoMensal,
      totalVendas: parceiro.totalVendasCalculado, // Usar o valor calculado
      codigosGerados: parceiro.codigosGeradosCalculado, // Usar o valor calculado
      posicao: index + 1,
      dataCriacao: parceiro.usuario.dataCriacao,
      // Redes Sociais
      instagram: parceiro.instagram,
      twitch: parceiro.twitch,
      youtube: parceiro.youtube,
      tiktok: parceiro.tiktok,
      discord: parceiro.discord,
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