import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { id } = req.query

  try {
    console.log('🔍 Suspender criador:', id)

    // Verificar autenticação
    const userCookie = req.cookies.sementesplay_user
    if (!userCookie) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    let user
    try {
      user = JSON.parse(decodeURIComponent(userCookie))
    } catch (error) {
      return res.status(401).json({ error: 'Cookie inválido' })
    }

    // Verificar se é admin
    if (Number(user.nivel) < 5) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar esta área.' })
    }

    // Buscar o criador
    const criador = await prisma.criador.findUnique({
      where: { id: String(id) },
      include: { usuario: true }
    })

    if (!criador) {
      return res.status(404).json({ error: 'Criador não encontrado' })
    }

    // Remover todos os dados relacionados ao criador
    console.log(`🗑️ Removendo dados do criador ${criador.usuario.nome}...`)

    // 1. Remover votos em enquetes
    await prisma.votoEnquete.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })

    // 2. Remover recados
    await prisma.recado.deleteMany({
      where: { 
        OR: [
          { remetenteId: criador.usuarioId },
          { destinatarioId: criador.usuarioId }
        ]
      }
    })

    // 3. Remover interações com conteúdo
    await prisma.interacaoConteudo.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })

    // 4. Remover enquetes
    await prisma.enquete.deleteMany({
      where: { criadorId: criador.id }
    })

    // 5. Remover conteúdo
    await prisma.conteudo.deleteMany({
      where: { criadorId: criador.id }
    })

    // 6. Remover candidatura de criador
    await prisma.candidaturaCriador.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })

    // 7. Remover doações recebidas
    await prisma.doacao.deleteMany({
      where: { criadorId: criador.id }
    })

    // 8. Remover notificações
    await prisma.notificacao.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })

    // 9. Remover conquistas do usuário
    await prisma.conquistaUsuario.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })

    // 10. Remover emblemas do usuário
    await prisma.emblemaUsuario.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })

    // 11. Remover missões do usuário
    await prisma.missaoUsuario.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })

    // 12. Remover comentários
    await prisma.comentario.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })

    // 13. Remover conversas (mantendo mensagens)
    await prisma.conversa.deleteMany({
      where: { 
        OR: [
          { usuario1Id: criador.usuarioId },
          { usuario2Id: criador.usuarioId }
        ]
      }
    })

    // 14. MANTER mensagens (não remover)
    // await prisma.mensagem.deleteMany({
    //   where: { remetenteId: criador.usuarioId }
    // })

    // 15. Remover registros de ranking (ciclo e season)
    await prisma.rankingCiclo.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })

    await prisma.rankingSeason.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })

    // 16. Remover o registro do criador
    await prisma.criador.delete({
      where: { id: criador.id }
    })

    // 17. Atualizar o nível do usuário para "comum"
    await prisma.usuario.update({
      where: { id: criador.usuarioId },
      data: { 
        nivel: 'comum',
        pontuacao: 0 // Zerar pontuação para não aparecer no ranking
      }
    })

    console.log(`✅ Criador ${criador.usuario.nome} e todos os dados relacionados removidos com sucesso`)

    return res.status(200).json({ 
      message: 'Criador removido com sucesso',
      criador: {
        id: criador.id,
        nome: criador.usuario.nome,
        nivel: 'comum'
      }
    })

  } catch (error) {
    console.error('❌ Erro ao suspender criador:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 