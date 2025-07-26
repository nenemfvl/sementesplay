import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getUserFromToken } from '../utils/auth-backend'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const user = getUserFromToken(req)
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // Buscar dados completos do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: user.id },
      include: {
        criador: {
          select: {
            id: true,
            nome: true,
            bio: true,
            categoria: true,
            nivel: true,
            sementes: true,
            apoiadores: true,
            doacoes: true,
            redesSociais: true,
            portfolio: true,
            dataCriacao: true
          }
        },
        parceiro: {
          select: {
            id: true,
            nomeCidade: true,
            comissaoMensal: true,
            totalVendas: true,
            codigosGerados: true,
            saldoDevedor: true
          }
        }
      }
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Remover senha dos dados retornados
    const { senha, ...usuarioSemSenha } = usuario

    // Formatar dados do criador se existir
    if (usuarioSemSenha.criador) {
      try {
        if (usuarioSemSenha.criador.redesSociais) {
          usuarioSemSenha.criador.redesSociais = JSON.parse(usuarioSemSenha.criador.redesSociais)
        }
        if (usuarioSemSenha.criador.portfolio) {
          usuarioSemSenha.criador.portfolio = JSON.parse(usuarioSemSenha.criador.portfolio)
        }
      } catch (error) {
        console.log('Erro ao processar dados do criador:', error)
      }
    }

    return res.status(200).json({
      success: true,
      usuario: usuarioSemSenha
    })

  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 