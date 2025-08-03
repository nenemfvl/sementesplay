const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verificarMissaoDoacao() {
  try {
    console.log('🔍 Verificando missão de doação...')
    
    // Buscar missão "Doador Diário"
    const missao = await prisma.missao.findFirst({
      where: {
        titulo: 'Doador Diário'
      }
    })
    
    if (!missao) {
      console.log('❌ Missão "Doador Diário" não encontrada')
      return
    }
    
    console.log('✅ Missão encontrada:')
    console.log(`   ID: ${missao.id}`)
    console.log(`   Título: ${missao.titulo}`)
    console.log(`   Tipo: ${missao.tipo}`)
    console.log(`   Objetivo: ${missao.objetivo}`)
    console.log(`   Recompensa: ${missao.recompensa} XP`)
    console.log(`   Ativa: ${missao.ativa}`)
    
    // Buscar usuários
    const usuarios = await prisma.usuario.findMany({
      take: 3
    })
    
    console.log(`\n👥 Verificando progresso de ${usuarios.length} usuários:`)
    
    for (const usuario of usuarios) {
      console.log(`\n👤 Usuário: ${usuario.nome} (${usuario.id})`)
      
      // Verificar progresso na missão
      const missaoUsuario = await prisma.missaoUsuario.findFirst({
        where: {
          missaoId: missao.id,
          usuarioId: usuario.id
        }
      })
      
      if (missaoUsuario) {
        console.log(`   Progresso: ${missaoUsuario.progresso}/${missao.objetivo}`)
        console.log(`   Concluída: ${missaoUsuario.concluida}`)
        console.log(`   Reivindicada: ${missaoUsuario.reivindicada}`)
      } else {
        console.log(`   ❌ Nenhum progresso encontrado`)
      }
      
      // Verificar doações do usuário
      const doacoes = await prisma.doacao.findMany({
        where: {
          doadorId: usuario.id
        }
      })
      
      console.log(`   📊 Total de doações: ${doacoes.length}`)
      
      if (doacoes.length > 0) {
        console.log(`   📅 Última doação: ${doacoes[0].data}`)
        console.log(`   💰 Quantidade: ${doacoes[0].quantidade}`)
      }
    }
    
    // Simular uma doação para testar
    console.log('\n🧪 Simulando doação para testar...')
    const usuarioTeste = usuarios[0]
    
    if (usuarioTeste) {
      console.log(`Testando com usuário: ${usuarioTeste.nome}`)
      
      // Buscar um criador para doar
      const criador = await prisma.criador.findFirst()
      
      if (criador) {
        console.log(`Doando para criador: ${criador.id}`)
        
        // Simular a função de atualizar missões
        const missoes = await prisma.missao.findMany({
          where: {
            ativa: true,
            tipo: 'doacao'
          }
        })
        
        console.log(`Encontradas ${missoes.length} missões do tipo 'doacao'`)
        
        for (const missao of missoes) {
          console.log(`\n🎯 Processando missão: ${missao.titulo}`)
          
          // Verificar se o usuário já tem progresso nesta missão
          let missaoUsuario = await prisma.missaoUsuario.findFirst({
            where: {
              missaoId: missao.id,
              usuarioId: usuarioTeste.id
            }
          })
          
          if (!missaoUsuario) {
            console.log('   Criando novo progresso...')
            missaoUsuario = await prisma.missaoUsuario.create({
              data: {
                missaoId: missao.id,
                usuarioId: usuarioTeste.id,
                progresso: 0,
                concluida: false
              }
            })
          }
          
          console.log(`   Progresso atual: ${missaoUsuario.progresso}/${missao.objetivo}`)
          
          // Atualizar progresso
          const novoProgresso = missaoUsuario.progresso + 1
          const concluida = novoProgresso >= missao.objetivo
          
          console.log(`   Novo progresso: ${novoProgresso}/${missao.objetivo}`)
          console.log(`   Concluída: ${concluida}`)
          
          // Atualizar missão
          await prisma.missaoUsuario.update({
            where: { id: missaoUsuario.id },
            data: {
              progresso: novoProgresso,
              concluida: concluida,
              dataConclusao: concluida && !missaoUsuario.concluida ? new Date() : missaoUsuario.dataConclusao
            }
          })
          
          console.log(`   ✅ Missão atualizada!`)
          
          if (concluida) {
            console.log(`   🎉 Missão completada!`)
          }
        }
      } else {
        console.log('❌ Nenhum criador encontrado para teste')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarMissaoDoacao() 