const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function corrigirProgressoMissoes() {
  try {
    console.log('🔧 Corrigindo progresso das missões...')
    
    // Buscar todos os usuários
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true
      }
    })
    
    // Buscar missões relacionadas a doações
    const missoesDoacao = await prisma.missao.findMany({
      where: {
        ativa: true,
        OR: [
          { titulo: { contains: 'Doador' } },
          { titulo: { contains: 'Doação' } }
        ]
      },
      select: {
        id: true,
        titulo: true,
        objetivo: true,
        tipo: true
      }
    })
    
    console.log(`\n📋 Missões encontradas: ${missoesDoacao.length}`)
    for (const missao of missoesDoacao) {
      console.log(`   - ${missao.titulo} (${missao.tipo}) - Objetivo: ${missao.objetivo}`)
    }
    
    // Corrigir progresso de cada usuário
    for (const usuario of usuarios) {
      console.log(`\n👤 Corrigindo ${usuario.nome}:`)
      
      // Contar doações reais
      const doacoes = await prisma.doacao.findMany({
        where: {
          doadorId: usuario.id
        }
      })
      
      const totalDoacoes = doacoes.length
      console.log(`   💸 Total de doações: ${totalDoacoes}`)
      
      // Corrigir cada missão
      for (const missao of missoesDoacao) {
        // Verificar se o usuário tem progresso nesta missão
        let missaoUsuario = await prisma.missaoUsuario.findFirst({
          where: {
            missaoId: missao.id,
            usuarioId: usuario.id
          }
        })
        
        if (!missaoUsuario) {
          // Criar progresso se não existir
          console.log(`   🔧 Criando progresso para ${missao.titulo}`)
          missaoUsuario = await prisma.missaoUsuario.create({
            data: {
              missaoId: missao.id,
              usuarioId: usuario.id,
              progresso: totalDoacoes,
              concluida: totalDoacoes >= missao.objetivo
            }
          })
        } else {
          // Atualizar progresso se estiver incorreto
          if (missaoUsuario.progresso !== totalDoacoes) {
            console.log(`   🔧 Corrigindo ${missao.titulo}: ${missaoUsuario.progresso} → ${totalDoacoes}`)
            await prisma.missaoUsuario.update({
              where: { id: missaoUsuario.id },
              data: {
                progresso: totalDoacoes,
                concluida: totalDoacoes >= missao.objetivo
              }
            })
          } else {
            console.log(`   ✅ ${missao.titulo}: ${totalDoacoes}/${missao.objetivo} (correto)`)
          }
        }
      }
    }
    
    // Verificar se a correção funcionou
    console.log('\n🔍 Verificando correção:')
    for (const usuario of usuarios) {
      console.log(`\n👤 ${usuario.nome}:`)
      
      const doacoes = await prisma.doacao.findMany({
        where: { doadorId: usuario.id }
      })
      
      const progressos = await prisma.missaoUsuario.findMany({
        where: {
          usuarioId: usuario.id,
          missao: {
            OR: [
              { titulo: { contains: 'Doador' } },
              { titulo: { contains: 'Doação' } }
            ]
          }
        },
        include: {
          missao: {
            select: {
              titulo: true,
              objetivo: true
            }
          }
        }
      })
      
      console.log(`   💸 Doações: ${doacoes.length}`)
      for (const progresso of progressos) {
        console.log(`   🎯 ${progresso.missao.titulo}: ${progresso.progresso}/${progresso.missao.objetivo}`)
      }
    }
    
    console.log('\n✅ Correção concluída!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

corrigirProgressoMissoes() 