import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { email, senha } = req.body

    // Validações básicas
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        criador: true,
        parceiro: true
      }
    })

    if (!usuario) {
      return res.status(401).json({ error: 'Email ou senha inválidos' })
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha)

    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha inválidos' })
    }

    // Retornar usuário sem senha
    const { senha: _, ...usuarioSemSenha } = usuario

    res.status(200).json({
      message: 'Login realizado com sucesso',
      usuario: usuarioSemSenha
    })

  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 