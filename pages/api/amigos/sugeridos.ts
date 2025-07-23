import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.query

    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    // Buscar usuários que não são amigos nem têm solicitações pendentes
    const usuarios = await prisma.usuario.findMany({
      where: {
        AND: [
          { id: { not: String(usuarioId) } },
          {
            NOT: {
              OR: [
                {
                  amizades: {
                    some: {
                      OR: [
                        { usuarioId: String(usuarioId) },
                        { amigoId: String(usuarioId) }
                      ]
                    }
                  }
                },
                {
                  amizadesRecebidas: {
                    some: {
                      OR: [
                        { usuarioId: String(usuarioId) },
                        { amigoId: String(usuarioId) }
                      ]
                    }
                  }
                }
              ]
            }
          }
        ]
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        sementes: true,
        dataCriacao: true
      },
      take: 10,
      orderBy: {
        sementes: 'desc'
      }
    })

    const usuariosFormatados = usuarios.map(usuario => ({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      nivel: usuario.nivel,
      sementes: usuario.sementes,
      status: 'online' as const, // Mockado por enquanto
      ultimaAtividade: new Date(),
      mutual: false
    }))

    return res.status(200).json({ usuarios: usuariosFormatados })
  } catch (error) {
    console.error('Erro ao buscar usuários sugeridos:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 