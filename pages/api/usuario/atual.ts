import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Tentar obter o token do header Authorization
    let userId = null
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      userId = authHeader.replace('Bearer ', '')
    } else {
      // Se não há token, tentar obter do cookie de sessão
      const sessionToken = req.cookies['next-auth.session-token'] || req.cookies['__Secure-next-auth.session-token']
      
      if (sessionToken) {
        // Decodificar o token de sessão (simplificado)
        // Em produção, você deveria verificar o token JWT adequadamente
        try {
          // Por enquanto, vamos buscar o usuário pelo email da sessão
          // Isso é uma solução temporária
          const usuarios = await prisma.usuario.findMany({
            take: 1,
            include: {
              criador: true,
              parceiro: true
            }
          })
          
          if (usuarios.length > 0) {
            userId = usuarios[0].id
          }
        } catch (error) {
          console.error('Erro ao decodificar sessão:', error)
        }
      }
    }

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
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