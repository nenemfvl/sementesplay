import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
import { auth } from '../../../lib/auth'

// Função para calcular o nível baseado no XP
function calcularNivel(xp: number): number {
  // Fórmula: nível = 1 + raiz quadrada(xp / 100)
  return Math.floor(1 + Math.sqrt(xp / 100))
}

// Função para calcular XP necessário para o próximo nível
// Removida - lógica incorporada diretamente no código

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const user = auth.getUser()
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const { xpGanho, fonte, descricao } = req.body

      if (!xpGanho || !fonte || !descricao) {
        return res.status(400).json({ error: 'Dados incompletos' })
      }

      // Buscar usuário atual
      const usuario = await prisma.usuario.findUnique({
        where: { id: user.id }
      })

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      const xpAnterior = usuario.xp
      const nivelAnterior = usuario.nivelUsuario
      const xpPosterior = xpAnterior + xpGanho
      const nivelPosterior = calcularNivel(xpPosterior)

      // Atualizar usuário
      const usuarioAtualizado = await prisma.usuario.update({
        where: { id: user.id },
        data: {
          xp: xpPosterior,
          nivelUsuario: nivelPosterior
        }
      })

      // Registrar no histórico
      await prisma.historicoXP.create({
        data: {
          usuarioId: user.id,
          xpGanho,
          xpAnterior,
          xpPosterior,
          nivelAnterior,
          nivelPosterior,
          fonte,
          descricao
        }
      })

      // Verificar se subiu de nível
      const subiuNivel = nivelPosterior > nivelAnterior
      const xpProximoNivel = Math.pow(nivelPosterior, 2) * 100  // XP necessário para próximo nível
      const xpNivelAtual = Math.pow(nivelPosterior - 1, 2) * 100  // XP mínimo do nível atual

      return res.status(200).json({
        success: true,
        usuario: {
          id: usuarioAtualizado.id,
          nome: usuarioAtualizado.nome,
          xp: usuarioAtualizado.xp,
          nivelUsuario: usuarioAtualizado.nivelUsuario,
          titulo: usuarioAtualizado.titulo,
          corPerfil: usuarioAtualizado.corPerfil
        },
        subiuNivel,
        nivelAnterior,
        nivelPosterior,
        xpProximoNivel,
        progressoNivel: ((xpPosterior - xpNivelAtual) / (xpProximoNivel - xpNivelAtual)) * 100
      })

    } catch (error) {
      console.error('Erro ao adicionar XP:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else if (req.method === 'GET') {
    try {
      // Verificar autenticação via token Bearer
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido' })
      }

      const userId = authHeader.replace('Bearer ', '')
      console.log('API /api/usuario/xp chamada com userId:', userId)
      
      // Buscar dados do usuário
      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nome: true,
          xp: true,
          nivelUsuario: true,
          titulo: true,
          corPerfil: true,
          streakLogin: true,
          ultimoLogin: true
        }
      })

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      const xpProximoNivel = Math.pow(usuario.nivelUsuario, 2) * 100  // XP necessário para próximo nível
      const xpNivelAtual = Math.pow(usuario.nivelUsuario - 1, 2) * 100  // XP mínimo do nível atual
      const progressoNivel = ((usuario.xp - xpNivelAtual) / (xpProximoNivel - xpNivelAtual)) * 100

      return res.status(200).json({
        usuario,
        xpProximoNivel,
        progressoNivel: Math.min(progressoNivel, 100)
      })

    } catch (error) {
      console.error('Erro ao buscar XP:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido' })
  }
} 