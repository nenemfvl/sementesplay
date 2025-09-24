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

    console.log('Senha válida, atualizando streak de login...')
    
    // Calcular streak de login
    const agora = new Date()
    const ontem = new Date(agora)
    ontem.setDate(ontem.getDate() - 1)
    
    let novoStreak = 1 // Pelo menos 1 dia pelo login atual
    
    if (usuario.ultimoLogin) {
      const ultimoLogin = new Date(usuario.ultimoLogin)
      const diffTempo = agora.getTime() - ultimoLogin.getTime()
      const diffDias = Math.floor(diffTempo / (1000 * 60 * 60 * 24))
      
      if (diffDias === 0) {
        // Mesmo dia - manter streak atual
        novoStreak = usuario.streakLogin || 1
      } else if (diffDias === 1) {
        // Dia consecutivo - incrementar streak
        novoStreak = (usuario.streakLogin || 0) + 1
      } else {
        // Quebrou a sequência - resetar para 1
        novoStreak = 1
      }
    }
    
    // Atualizar último login e streak
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        ultimoLogin: agora,
        streakLogin: novoStreak
      },
      include: {
        criador: true,
        parceiro: true
      }
    })
    
    console.log(`Streak atualizado para ${novoStreak} dias`)
    
    // Dar XP por login diário (apenas se for um novo dia)
    if (!usuario.ultimoLogin || Math.floor((agora.getTime() - new Date(usuario.ultimoLogin).getTime()) / (1000 * 60 * 60 * 24)) >= 1) {
      try {
        // Dar 10 XP por login diário
        await prisma.historicoXP.create({
          data: {
            usuarioId: usuario.id,
            xpGanho: 10,
            xpAnterior: usuario.xp,
            xpPosterior: usuario.xp + 10,
            nivelAnterior: usuario.nivelUsuario,
            nivelPosterior: usuario.nivelUsuario, // Será recalculado se necessário
            fonte: 'login_diario',
            descricao: `Login diário - Streak de ${novoStreak} dias`
          }
        })
        
        // Atualizar XP do usuário
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { xp: { increment: 10 } }
        })
        
        console.log('XP de login diário concedido: +10 XP')
      } catch (xpError) {
        console.error('Erro ao conceder XP de login:', xpError)
      }
    }
    
    // Retornar usuário sem senha
    const { senha: _, ...usuarioSemSenha } = usuarioAtualizado

    // Gerar JWT
    const token = jwt.sign(
      { id: usuarioSemSenha.id, email: usuarioSemSenha.email, tipo: usuarioSemSenha.tipo },
      process.env.JWT_SECRET || 'sementesplay_secret',
      { expiresIn: '7d' }
    )

    // Definir cookies com o token e usuário
    const userCookie = `sementesplay_user=${encodeURIComponent(JSON.stringify(usuarioSemSenha))}; Path=/; SameSite=Strict; Max-Age=604800`
    const tokenCookie = `token=${token}; Path=/; SameSite=Strict; Max-Age=604800`
    
    res.setHeader('Set-Cookie', [userCookie, tokenCookie])

    console.log('Login realizado com sucesso para:', email)
    console.log('🍪 Cookie de usuário definido:', userCookie.substring(0, 100) + '...')
    
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