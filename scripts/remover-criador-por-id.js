const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function removerCriadorPorId() {
  try {
    console.log('🗑️ Remoção de Criador por ID')
    console.log('=============================')
    
    // Listar todos os criadores disponíveis
    const criadores = await prisma.criador.findMany({
      include: { usuario: true }
    })
    
    if (criadores.length === 0) {
      console.log('❌ Nenhum criador encontrado no banco de dados')
      return
    }
    
    console.log('\n📋 Criadores disponíveis:')
    criadores.forEach((criador, index) => {
      console.log(`${index + 1}. ${criador.usuario.nome} (${criador.usuario.email})`)
      console.log(`   ID: ${criador.id}`)
      console.log(`   Nível: ${criador.usuario.nivel}`)
      console.log('')
    })
    
    // Simular input do usuário (você pode modificar aqui)
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    rl.question('\nDigite o ID do criador que deseja remover: ', async (criadorId) => {
      try {
        // Buscar o criador
        const criador = await prisma.criador.findUnique({
          where: { id: criadorId },
          include: { usuario: true }
        })
        
        if (!criador) {
          console.log('❌ Criador não encontrado com este ID')
          rl.close()
          return
        }
        
        console.log(`\n🗑️ Removendo criador: ${criador.usuario.nome}`)
        console.log('=============================')
        
        // 1. Remover votos em enquetes
        const votosRemovidos = await prisma.votoEnquete.deleteMany({
          where: { usuarioId: criador.usuarioId }
        })
        console.log(`✅ Votos removidos: ${votosRemovidos.count}`)
        
        // 2. Remover recados
        const recadosRemovidos = await prisma.recado.deleteMany({
          where: { 
            OR: [
              { remetenteId: criador.usuarioId },
              { destinatarioId: criador.usuarioId }
            ]
          }
        })
        console.log(`✅ Recados removidos: ${recadosRemovidos.count}`)
        
        // 3. Remover interações com conteúdo
        const interacoesRemovidas = await prisma.interacaoConteudo.deleteMany({
          where: { usuarioId: criador.usuarioId }
        })
        console.log(`✅ Interações removidas: ${interacoesRemovidas.count}`)
        
        // 4. Remover enquetes
        const enquetesRemovidas = await prisma.enquete.deleteMany({
          where: { criadorId: criador.id }
        })
        console.log(`✅ Enquetes removidas: ${enquetesRemovidas.count}`)
        
        // 5. Remover conteúdo
        const conteudosRemovidos = await prisma.conteudo.deleteMany({
          where: { criadorId: criador.id }
        })
        console.log(`✅ Conteúdos removidos: ${conteudosRemovidos.count}`)
        
        // 6. Remover doações
        const doacoesRemovidas = await prisma.doacao.deleteMany({
          where: { criadorId: criador.id }
        })
        console.log(`✅ Doações removidas: ${doacoesRemovidas.count}`)
        
        // 7. Remover notificações
        const notificacoesRemovidas = await prisma.notificacao.deleteMany({
          where: { usuarioId: criador.usuarioId }
        })
        console.log(`✅ Notificações removidas: ${notificacoesRemovidas.count}`)
        
        // 8. Remover conquistas
        const conquistasRemovidas = await prisma.conquistaUsuario.deleteMany({
          where: { usuarioId: criador.usuarioId }
        })
        console.log(`✅ Conquistas removidas: ${conquistasRemovidas.count}`)
        
        // 9. Remover emblemas
        const emblemasRemovidos = await prisma.emblemaUsuario.deleteMany({
          where: { usuarioId: criador.usuarioId }
        })
        console.log(`✅ Emblemas removidos: ${emblemasRemovidos.count}`)
        
        // 10. Remover missões
        const missoesRemovidas = await prisma.missaoUsuario.deleteMany({
          where: { usuarioId: criador.usuarioId }
        })
        console.log(`✅ Missões removidas: ${missoesRemovidas.count}`)
        
        // 11. Remover comentários
        const comentariosRemovidos = await prisma.comentario.deleteMany({
          where: { usuarioId: criador.usuarioId }
        })
        console.log(`✅ Comentários removidos: ${comentariosRemovidos.count}`)
        
        // 12. Remover conversas
        const conversasRemovidas = await prisma.conversa.deleteMany({
          where: { 
            OR: [
              { usuario1Id: criador.usuarioId },
              { usuario2Id: criador.usuarioId }
            ]
          }
        })
        console.log(`✅ Conversas removidas: ${conversasRemovidas.count}`)
        
        // 13. Remover mensagens
        const mensagensRemovidas = await prisma.mensagem.deleteMany({
          where: { remetenteId: criador.usuarioId }
        })
        console.log(`✅ Mensagens removidas: ${mensagensRemovidas.count}`)
        
        // 14. Remover candidatura
        const candidaturaRemovida = await prisma.candidaturaCriador.deleteMany({
          where: { usuarioId: criador.usuarioId }
        })
        console.log(`✅ Candidatura removida: ${candidaturaRemovida.count}`)
        
        // 15. Remover o criador
        await prisma.criador.delete({
          where: { id: criador.id }
        })
        console.log(`✅ Criador removido`)
        
        // 16. Atualizar usuário para comum
        await prisma.usuario.update({
          where: { id: criador.usuarioId },
          data: { nivel: 'comum' }
        })
        console.log(`✅ Usuário atualizado para nível comum`)
        
        console.log('\n🎉 Criador removido com sucesso!')
        
      } catch (error) {
        console.error('❌ Erro ao remover criador:', error)
      } finally {
        rl.close()
      }
    })
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removerCriadorPorId() 