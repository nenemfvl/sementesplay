import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { token, novaSenha } = req.body

      if (!token || !novaSenha) {
        return res.status(400).json({ error: 'Token e nova senha são obrigatórios' })
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' })
      }

      // Validar token
      const tokenRecuperacao = await prisma.tokenRecuperacao.findFirst({
        where: {
          token: String(token),
          usado: false,
          expiraEm: {
            gt: new Date()
          }
        },
        include: {
          usuario: true
        }
      })

      if (!tokenRecuperacao) {
        return res.status(400).json({ error: 'Token inválido ou expirado' })
      }

      const usuario = tokenRecuperacao.usuario

      // Criptografar nova senha
      const senhaCriptografada = await bcrypt.hash(novaSenha, 10)

      // Atualizar senha do usuário e marcar token como usado
      await prisma.$transaction([
        prisma.usuario.update({
          where: { id: usuario.id },
          data: { senha: senhaCriptografada }
        }),
        prisma.tokenRecuperacao.update({
          where: { id: tokenRecuperacao.id },
          data: { usado: true }
        })
      ])

      // Log da ação
      await prisma.logAuditoria.create({
        data: {
          usuarioId: usuario.id,
          acao: 'REDEFINICAO_SENHA',
          detalhes: 'Senha redefinida com sucesso via token de recuperação',
          ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          nivel: 'info'
        }
      })

      console.log('=== SENHA REDEFINIDA ===')
      console.log(`Usuário: ${usuario.email}`)
      console.log(`Nova senha: ${novaSenha}`)
      console.log('========================')

      res.status(200).json({ 
        message: 'Senha alterada com sucesso' 
      })

    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ error: 'Método não permitido' })
  }
} 