const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarSistemaMissoes() {
  try {
    console.log('=== TESTE DO SISTEMA DE MISSÕES ===')
    
    // 1. Verificar missões existentes
    console.log('\n1. Verificando missões existentes...')
    const missoes = await prisma.missao.findMany({
      where: { ativa: true }
    })
    console.log(`Encontradas ${missoes.length} missões ativas:`)
    missoes.forEach(missao => {
      console.log(`- ${missao.titulo} (${missao.tipo}) - Objetivo: ${missao.objetivo}`)
    })
    
    // 2. Verificar conquistas existentes
    console.log('\n2. Verificando conquistas existentes...')
    const conquistas = await prisma.conquista.findMany({
      where: { ativa: true }
    })
    console.log(`Encontradas ${conquistas.length} conquistas ativas:`)
    conquistas.forEach(conquista => {
      console.log(`- ${conquista.titulo} (${conquista.tipo})`)
    })
    
    // 3. Verificar usuários
    console.log('\n3. Verificando usuários...')
    const usuarios = await prisma.usuario.findMany({
      take: 5,
      select: { id: true, nome: true, email: true, sementes: true }
    })
    console.log(`Primeiros 5 usuários:`)
    usuarios.forEach(usuario => {
      console.log(`- ${usuario.nome} (${usuario.email}) - Sementes: ${usuario.sementes}`)
    })
    
    // 4. Verificar missões de um usuário específico
    if (usuarios.length > 0) {
      const usuarioId = usuarios[0].id
      console.log(`\n4. Verificando missões do usuário ${usuarios[0].nome}...`)
      
      const missoesUsuario = await prisma.missaoUsuario.findMany({
        where: { usuarioId: usuarioId },
        include: { missao: true }
      })
      
      console.log(`Usuário tem ${missoesUsuario.length} missões em progresso:`)
      missoesUsuario.forEach(mu => {
        console.log(`- ${mu.missao.titulo}: ${mu.progresso}/${mu.missao.objetivo} (${mu.concluida ? 'Concluída' : 'Em progresso'})`)
      })
      
      // 5. Verificar conquistas do usuário
      console.log(`\n5. Verificando conquistas do usuário ${usuarios[0].nome}...`)
      const conquistasUsuario = await prisma.conquistaUsuario.findMany({
        where: { usuarioId: usuarioId },
        include: { conquista: true }
      })
      
      console.log(`Usuário tem ${conquistasUsuario.length} conquistas:`)
      conquistasUsuario.forEach(cu => {
        console.log(`- ${cu.conquista.titulo} (${cu.concluida ? 'Concluída' : 'Em progresso'})`)
      })
      
      // 6. Verificar doações do usuário
      console.log(`\n6. Verificando doações do usuário ${usuarios[0].nome}...`)
      const doacoes = await prisma.doacao.findMany({
        where: { doadorId: usuarioId }
      })
      
      console.log(`Usuário fez ${doacoes.length} doações:`)
      doacoes.forEach(doacao => {
        console.log(`- ${doacao.quantidade} sementes em ${doacao.data.toLocaleDateString()}`)
      })
    }
    
    console.log('\n=== FIM DO TESTE ===')
    
  } catch (error) {
    console.error('Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarSistemaMissoes() 