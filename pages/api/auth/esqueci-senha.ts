import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { Resend } from 'resend'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { email } = req.body

      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' })
      }

      // Verificar se o usuário existe
      const usuario = await prisma.usuario.findUnique({
        where: { email: String(email) }
      })

      if (!usuario) {
        // Por segurança, não revelamos se o email existe ou não
        return res.status(200).json({ 
          message: 'Se o email existir em nossa base, você receberá um link de recuperação.' 
        })
      }

      // Gerar token único
      const token = crypto.randomBytes(32).toString('hex')
      const expiracao = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

      // Salvar token no banco
      await prisma.tokenRecuperacao.create({
        data: {
          usuarioId: usuario.id,
          token,
          expiraEm: expiracao
        }
      })

      // Criar link de recuperação
      const link = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sementesplay.com.br'}/redefinir-senha?token=${token}`

      // Template do email
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: white; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background-color: #ff6b6b; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="font-size: 24px;">🌱</span>
            </div>
            <h1 style="color: #ff6b6b; margin: 0;">SementesPLAY</h1>
            <p style="color: #cccccc; margin: 10px 0;">Recuperação de Senha</p>
          </div>
          
          <div style="background-color: #2a2a2a; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: white; margin-top: 0;">Olá, ${usuario.nome}!</h2>
            <p style="color: #cccccc; line-height: 1.6;">
              Recebemos uma solicitação para redefinir sua senha no SementesPLAY.
            </p>
            <p style="color: #cccccc; line-height: 1.6;">
              Clique no botão abaixo para criar uma nova senha:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" style="background-color: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                Redefinir Senha
              </a>
            </div>
            
            <p style="color: #cccccc; font-size: 14px; margin-top: 20px;">
              <strong>⚠️ Importante:</strong> Este link expira em 1 hora por segurança.
            </p>
            
            <p style="color: #cccccc; font-size: 14px;">
              Se você não solicitou esta recuperação, ignore este email.
            </p>
          </div>
          
          <div style="text-align: center; color: #888888; font-size: 12px;">
            <p>© 2024 SementesPLAY. Todos os direitos reservados.</p>
          </div>
        </div>
      `

      // Enviar email com Resend
      try {
        await resend.emails.send({
          from: 'SementesPLAY <noreply@sementesplay.com.br>',
          to: email,
          subject: 'Recuperação de Senha - SementesPLAY',
          html: emailHtml
        })
        console.log('✅ Email enviado com sucesso para:', email)
      } catch (emailError) {
        console.log('❌ Erro ao enviar email pelo Resend:', emailError)
        return res.status(500).json({ error: 'Erro ao enviar email de recuperação.' })
      }

      // Log da ação
      await prisma.logAuditoria.create({
        data: {
          usuarioId: usuario.id,
          acao: 'SOLICITACAO_RECUPERACAO_SENHA',
          detalhes: `Solicitação de recuperação de senha para ${email}`,
          ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          nivel: 'info'
        }
      })

      res.status(200).json({ 
        message: 'Se o email existir em nossa base, você receberá um link de recuperação.' 
      })

    } catch (error) {
      console.error('Erro ao processar recuperação de senha:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ error: 'Método não permitido' })
  }
} 