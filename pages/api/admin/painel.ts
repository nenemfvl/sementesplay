import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Compras aguardando repasse
    const comprasAguardando = await prisma.compraParceiro.findMany({
      where: { status: 'aguardando_repasse' },
      include: { parceiro: true }
    })

    // Repasses pendentes
    const repassesPendentes = await prisma.repasseParceiro.findMany({
      where: { status: 'pendente' },
      include: { 
    parceiro: true, 
    compra: {
      include: {
        usuario: true
      }
    }
  }
    })

    // Fundo de sementes atual (não distribuído)
    const fundoAtual = await prisma.fundoSementes.findFirst({ where: { distribuido: false } })

    // Denúncias pendentes
    const denunciasPendentes = await prisma.denuncia.findMany({
      where: { status: 'pendente' },
      include: {
        denunciante: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        conteudo: {
          select: {
            id: true,
            titulo: true,
            url: true,
            criador: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        },
        conteudoParceiro: {
          select: {
            id: true,
            titulo: true,
            url: true,
            parceiro: {
              select: {
                id: true,
                usuario: {
                  select: {
                    id: true,
                    nome: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        dataDenuncia: 'desc'
      }
    })

    console.log('Denúncias pendentes encontradas:', denunciasPendentes.length)
    console.log('Detalhes das denúncias:', denunciasPendentes)

    // Verificar todas as denúncias (para debug)
    const todasDenuncias = await prisma.denuncia.findMany({
      include: {
        denunciante: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    })
    console.log('Total de denúncias no banco:', todasDenuncias.length)
    console.log('Todas as denúncias:', todasDenuncias)

    return res.status(200).json({
      comprasAguardando,
      repassesPendentes,
      fundoAtual,
      denunciasPendentes
    })
  } catch (error) {
    console.error('Erro ao buscar painel admin:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 