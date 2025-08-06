import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.query

    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId é obrigatório' })
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: String(usuarioId) }
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Verificar se existe registro na tabela criadores
    const criador = await prisma.criador.findUnique({
      where: { usuarioId: String(usuarioId) }
    })

    // Se não existe criador mas o usuário tem nível criador, criar automaticamente
    if (!criador && (usuario.nivel.startsWith('criador-'))) {
      const novoCriador = await prisma.criador.create({
        data: {
          usuarioId: usuario.id,
          nome: usuario.nome,
          bio: 'Criador de conteúdo da comunidade SementesPLAY',
          categoria: 'Gaming',
          redesSociais: '{}',
          portfolio: '{}',
          nivel: usuario.nivel,
          sementes: usuario.sementes,
          apoiadores: 0,
          doacoes: 0
        }
      })

      return res.status(200).json({
        success: true,
        usuario,
        criador: novoCriador,
        existeCriador: true,
        criadoAutomaticamente: true
      })
    }

    return res.status(200).json({
      success: true,
      usuario,
      criador,
      existeCriador: !!criador,
      criadoAutomaticamente: false
    })

  } catch (error) {
    console.error('Erro ao verificar criador:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 