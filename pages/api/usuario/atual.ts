import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Obter o token do header Authorization
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação necessário' })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Por enquanto, vamos usar uma abordagem simples
    // Em produção, você deveria verificar o token JWT
    // Por enquanto, vamos buscar o usuário pelo ID que está no token
    // (assumindo que o token é o ID do usuário)
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: token },
      include: {
        criador: true,
        parceiro: true
      }
    })

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    // Retornar dados do usuário sem a senha
    const { senha, ...usuarioSemSenha } = usuario

    res.status(200).json({ 
      usuario: usuarioSemSenha,
      autenticado: true 
    })
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 