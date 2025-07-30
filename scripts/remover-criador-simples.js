const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ID do criador que você quer remover - MODIFIQUE AQUI
const CRIADOR_ID = 'COLOQUE_O_ID_AQUI'

async function removerCriadorSimples() {
  try {
    console.log('🗑️ Removendo criador por ID...')
    
    // Buscar o criador
    const criador = await prisma.criador.findUnique({
      where: { id: CRIADOR_ID },
      include: { usuario: true }
    })
    
    if (!criador) {
      console.log('❌ Criador não encontrado com este ID')
      return
    }
    
    console.log(`\n🗑️ Removendo criador: ${criador.usuario.nome}`)
    console.log('=============================')
    
    // Remover todos os dados relacionados
    const votosRemovidos = await prisma.votoEnquete.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })
    console.log(`✅ Votos removidos: ${votosRemovidos.count}`)
    
    const recadosRemovidos = await prisma.recado.deleteMany({
      where: { 
        OR: [
          { remetenteId: criador.usuarioId },
          { destinatarioId: criador.usuarioId }
        ]
      }
    })
    console.log(`✅ Recados removidos: ${recadosRemovidos.count}`)
    
    const interacoesRemovidas = await prisma.interacaoConteudo.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })
    console.log(`✅ Interações removidas: ${interacoesRemovidas.count}`)
    
    const enquetesRemovidas = await prisma.enquete.deleteMany({
      where: { criadorId: criador.id }
    })
    console.log(`✅ Enquetes removidas: ${enquetesRemovidas.count}`)
    
    const conteudosRemovidos = await prisma.conteudo.deleteMany({
      where: { criadorId: criador.id }
    })
    console.log(`✅ Conteúdos removidos: ${conteudosRemovidos.count}`)
    
    const doacoesRemovidas = await prisma.doacao.deleteMany({
      where: { criadorId: criador.id }
    })
    console.log(`✅ Doações removidas: ${doacoesRemovidas.count}`)
    
    const notificacoesRemovidas = await prisma.notificacao.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })
    console.log(`✅ Notificações removidas: ${notificacoesRemovidas.count}`)
    
    const conquistasRemovidas = await prisma.conquistaUsuario.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })
    console.log(`✅ Conquistas removidas: ${conquistasRemovidas.count}`)
    
    const emblemasRemovidos = await prisma.emblemaUsuario.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })
    console.log(`✅ Emblemas removidos: ${emblemasRemovidos.count}`)
    
    const missoesRemovidas = await prisma.missaoUsuario.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })
    console.log(`✅ Missões removidas: ${missoesRemovidas.count}`)
    
    const comentariosRemovidos = await prisma.comentario.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })
    console.log(`✅ Comentários removidos: ${comentariosRemovidos.count}`)
    
    const conversasRemovidas = await prisma.conversa.deleteMany({
      where: { 
        OR: [
          { usuario1Id: criador.usuarioId },
          { usuario2Id: criador.usuarioId }
        ]
      }
    })
    console.log(`✅ Conversas removidas: ${conversasRemovidas.count}`)
    
    const mensagensRemovidas = await prisma.mensagem.deleteMany({
      where: { remetenteId: criador.usuarioId }
    })
    console.log(`✅ Mensagens removidas: ${mensagensRemovidas.count}`)
    
    const candidaturaRemovida = await prisma.candidaturaCriador.deleteMany({
      where: { usuarioId: criador.usuarioId }
    })
    console.log(`✅ Candidatura removida: ${candidaturaRemovida.count}`)
    
    // Remover o criador
    await prisma.criador.delete({
      where: { id: criador.id }
    })
    console.log(`✅ Criador removido`)
    
    // Atualizar usuário para comum
    await prisma.usuario.update({
      where: { id: criador.usuarioId },
      data: { nivel: 'comum' }
    })
    console.log(`✅ Usuário atualizado para nível comum`)
    
    console.log('\n🎉 Criador removido com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removerCriadorSimples() 