import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { auth } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const user = auth.getUser()
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // Buscar dados atualizados do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        nivel: true,
        streakLogin: true,
        ultimoLogin: true,
        xp: true,
        nivelUsuario: true
      }
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Verificar se precisa atualizar streak (verificação de sessão)
    const agora = new Date()
    let streakAtualizado = false
    
    if (usuario.ultimoLogin) {
      const ultimoLogin = new Date(usuario.ultimoLogin)
      const diffTempo = agora.getTime() - ultimoLogin.getTime()
      const diffDias = Math.floor(diffTempo / (1000 * 60 * 60 * 24))
      
      // Se passou mais de 1 dia, quebrou o streak
      if (diffDias > 1) {
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { streakLogin: 0 }
        })
        streakAtualizado = true
        console.log(`Streak resetado para usuário ${usuario.nome} - ${diffDias} dias sem login`)
      }
    }

    const usuarioAtualizado = streakAtualizado ? 
      await prisma.usuario.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          nivel: true,
          streakLogin: true,
          ultimoLogin: true,
          xp: true,
          nivelUsuario: true
        }
      }) : usuario

    return res.status(200).json({
      success: true,
      usuario: usuarioAtualizado,
      streakAtualizado
    })

  } catch (error) {
    console.error('Erro ao verificar sessão:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
