// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function sincronizarSementesCriadores() {
  console.log('🔄 Iniciando sincronização de sementes dos criadores...')

  try {
    // Buscar todos os criadores
    const criadores = await prisma.criador.findMany({
      include: {
        usuario: true,
        doacoesRecebidas: true
      }
    })

    console.log(`📊 Encontrados ${criadores.length} criadores`)

    let totalSincronizados = 0
    let totalSementesTransferidas = 0

    for (const criador of criadores) {
      console.log(`\n🔍 Processando criador: ${criador.nome} (ID: ${criador.id})`)
      
      // Calcular total de sementes recebidas em doações
      const totalDoacoesRecebidas = criador.doacoesRecebidas.reduce((sum, doacao) => sum + doacao.quantidade, 0)
      
      console.log(`   - Sementes no criador: ${criador.sementes}`)
      console.log(`   - Sementes no usuário: ${criador.usuario.sementes}`)
      console.log(`   - Total de doações recebidas: ${totalDoacoesRecebidas}`)
      
      // Se o criador tem sementes mas o usuário não tem as doações, transferir
      if (criador.sementes > 0 && criador.usuario.sementes < totalDoacoesRecebidas) {
        const sementesParaTransferir = totalDoacoesRecebidas - criador.usuario.sementes
        
        console.log(`   - Transferindo ${sementesParaTransferir} sementes para o usuário...`)
        
        await prisma.usuario.update({
          where: { id: criador.usuarioId },
          data: { sementes: { increment: sementesParaTransferir } }
        })
        
        // Zerar sementes do criador (já que agora estão no usuário)
        await prisma.criador.update({
          where: { id: criador.id },
          data: { sementes: 0 }
        })
        
        totalSincronizados++
        totalSementesTransferidas += sementesParaTransferir
        
        console.log(`   ✅ Sincronização concluída para ${criador.nome}`)
      } else {
        console.log(`   ⏭️  Criador ${criador.nome} já está sincronizado ou não precisa de ajuste`)
      }
    }

    console.log(`\n🎉 Sincronização concluída!`)
    console.log(`   - Criadores sincronizados: ${totalSincronizados}`)
    console.log(`   - Total de sementes transferidas: ${totalSementesTransferidas}`)

//   } catch (error) {
//     console.error('❌ Erro durante a sincronização:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// // Executar se chamado diretamente
// if (require.main === module) {
//   sincronizarSementesCriadores()
//     .then(() => {
//       console.log('✅ Script executado com sucesso!')
//       process.exit(0)
//     })
//     .catch((error) => {
//       console.error('❌ Erro ao executar script:', error)
//       process.exit(1)
//     })
// }

// module.exports = { sincronizarSementesCriadores } 