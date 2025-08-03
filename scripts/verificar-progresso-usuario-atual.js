const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verificarProgressoUsuarioAtual() {
  try {
    console.log('🔍 Verificando progresso do usuário atual...')
    
    // Buscar todos os usuários
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true
      }
    })
    
    console.log(`\n👥 Usuários encontrados:`)
    for (const usuario of usuarios) {
      console.log(`   - ${usuario.nome} (${usuario.email})`)
    }
    
    // Verificar doações de cada usuário
    for (const usuario of usuarios) {
      console.log(`\n👤 Verificando ${usuario.nome}:`)
      
      // Contar doações
      const doacoes = await prisma.doacao.findMany({
        where: {
          doadorId: usuario.id
        }
      })
      
      console.log(`   💸 Total de doações: ${doacoes.length}`)
      
      if (doacoes.length > 0) {
        console.log(`   📅 Últimas doações:`)
        const ultimasDoacoes = doacoes.slice(-5) // Últimas 5 doações
        for (const doacao of ultimasDoacoes) {
          console.log(`      - ${doacao.quantidade} sementes em ${doacao.data.toLocaleString('pt-BR')}`)
        }
      }
      
      // Verificar progresso nas missões
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
              objetivo: true,
              tipo: true
            }
          }
        }
      })
      
      console.log(`   🎯 Progresso nas missões:`)
      for (const progresso of progressos) {
        console.log(`      ${progresso.missao.titulo}: ${progresso.progresso}/${progresso.missao.objetivo} (${progresso.missao.tipo})`)
      }
      
      // Verificar se há inconsistência
      if (doacoes.length > 0 && progressos.length === 0) {
        console.log(`   ⚠️  PROBLEMA: Usuário fez ${doacoes.length} doações mas não tem progresso nas missões!`)
      } else if (doacoes.length !== progressos[0]?.progresso) {
        console.log(`   ⚠️  PROBLEMA: ${doacoes.length} doações vs ${progressos[0]?.progresso} progresso`)
      }
    }
    
    // Verificar missões específicas que podem estar com problema
    console.log('\n🎯 Verificando missões específicas:')
    const missoesProblema = await prisma.missao.findMany({
      where: {
        ativa: true,
        OR: [
          { titulo: { contains: 'Doador Frequente' } },
          { titulo: { contains: 'Apoiador Fiel' } },
          { titulo: { contains: 'Doador Mensal' } }
        ]
      },
      select: {
        id: true,
        titulo: true,
        tipo: true,
        objetivo: true,
        ativa: true
      }
    })
    
    for (const missao of missoesProblema) {
      console.log(`   ${missao.titulo}:`)
      console.log(`      ID: ${missao.id}`)
      console.log(`      Tipo: ${missao.tipo}`)
      console.log(`      Objetivo: ${missao.objetivo}`)
      console.log(`      Ativa: ${missao.ativa}`)
      
      // Verificar progresso de todos os usuários nesta missão
      const progressosMissao = await prisma.missaoUsuario.findMany({
        where: {
          missaoId: missao.id
        },
        include: {
          usuario: {
            select: {
              nome: true
            }
          }
        }
      })
      
      console.log(`      Progresso dos usuários:`)
      for (const progresso of progressosMissao) {
        console.log(`         ${progresso.usuario.nome}: ${progresso.progresso}/${missao.objetivo}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarProgressoUsuarioAtual() 