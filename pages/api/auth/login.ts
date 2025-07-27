import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    console.log('Iniciando login...')
    const { email, senha } = req.body

    // Validações básicas
    if (!email || !senha) {
      console.log('Email ou senha não fornecidos')
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    console.log('Buscando usuário:', email)
    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        criador: true,
        parceiro: true
      }
    })

    if (!usuario) {
      console.log('Usuário não encontrado:', email)
      return res.status(401).json({ error: 'Email ou senha inválidos' })
    }

    console.log('Usuário encontrado, verificando senha...')
    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha)

    if (!senhaValida) {
      console.log('Senha inválida para usuário:', email)
      return res.status(401).json({ error: 'Email ou senha inválidos' })
    }

    console.log('Senha válida, gerando resposta...')
    // Retornar usuário sem senha
    const { senha: _, ...usuarioSemSenha } = usuario

    // Gerar JWT
    const token = jwt.sign(
      { id: usuarioSemSenha.id, email: usuarioSemSenha.email, tipo: usuarioSemSenha.tipo },
      process.env.JWT_SECRET || 'sementesplay_secret',
      { expiresIn: '24h' }
    )

    console.log('Login realizado com sucesso para:', email)
    res.status(200).json({
      message: 'Login realizado com sucesso',
      usuario: usuarioSemSenha,
      token
    })

  } catch (error) {
    console.error('Erro detalhado no login:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 