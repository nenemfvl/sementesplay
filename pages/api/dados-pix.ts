import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticação via cookie
  let user = null
  const userCookie = req.cookies['sementesplay_user']
  
  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie))
    } catch (error) {
      console.error('Erro ao decodificar cookie do usuário:', error)
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'Usuário não autenticado' })
  }

  if (req.method === 'GET') {
    const { usuarioId } = req.query

    if (!usuarioId || typeof usuarioId !== 'string') {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    // Verificar se o usuário está acessando seus próprios dados
    if (usuarioId !== user.id) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    try {
      const dadosPix = await prisma.dadosPix.findFirst({
        where: { usuarioId }
      })

      return res.status(200).json(dadosPix)
    } catch (error) {
      console.error('Erro ao buscar dados PIX:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    const { usuarioId, chavePix, tipoChave, nomeTitular, cpfCnpj } = req.body

    if (!usuarioId || !chavePix || !tipoChave || !nomeTitular || !cpfCnpj) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    // Verificar se o usuário está criando dados para si mesmo
    if (usuarioId !== user.id) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    try {
      // Verificar se já existe dados PIX para este usuário
      const existingDadosPix = await prisma.dadosPix.findFirst({
        where: { usuarioId }
      })

      if (existingDadosPix) {
        return res.status(400).json({ error: 'Usuário já possui dados PIX cadastrados' })
      }

      const dadosPix = await prisma.dadosPix.create({
        data: {
          usuarioId,
          chavePix,
          tipoChave,
          nomeTitular,
          cpfCnpj,
          validado: false
        }
      })

      return res.status(201).json(dadosPix)
    } catch (error) {
      console.error('Erro ao criar dados PIX:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'PUT') {
    const { usuarioId, chavePix, tipoChave, nomeTitular, cpfCnpj } = req.body

    if (!usuarioId || !chavePix || !tipoChave || !nomeTitular || !cpfCnpj) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    // Verificar se o usuário está atualizando seus próprios dados
    if (usuarioId !== user.id) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    try {
      const dadosPix = await prisma.dadosPix.update({
        where: { usuarioId },
        data: {
          chavePix,
          tipoChave,
          nomeTitular,
          cpfCnpj
        }
      })

      return res.status(200).json(dadosPix)
    } catch (error) {
      console.error('Erro ao atualizar dados PIX:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
