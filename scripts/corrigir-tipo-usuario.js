const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function corrigirTipoUsuario() {
  try {
    console.log('=== Corrigindo Tipo do Usuário ===\n')
    
    // Buscar candidatura aprovada
    const candidatura = await prisma.candidaturaCriador.findFirst({
      where: { status: 'aprovada' },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            nivel: true
          }
        }
      }
    })
    
    if (!candidatura) {
      console.log('Nenhuma candidatura aprovada encontrada')
      return
    }
    
    console.log('Usuário atual:')
    console.log(`  Nome: ${candidatura.usuario.nome}`)
    console.log(`  Tipo atual: ${candidatura.usuario.tipo}`)
    console.log(`  Nível atual: ${candidatura.usuario.nivel}`)
    
    // Corrigir tipo para 'usuario'
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: candidatura.usuarioId },
      data: { 
        tipo: 'usuario'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        nivel: true
      }
    })
    
    console.log('\nUsuário corrigido:')
    console.log(`  Nome: ${usuarioAtualizado.nome}`)
    console.log(`  Novo tipo: ${usuarioAtualizado.tipo}`)
    console.log(`  Nível: ${usuarioAtualizado.nivel}`)
    
    console.log('\n✅ Tipo do usuário corrigido para "usuario"!')
    console.log('Agora o usuário mantém o tipo "usuario" e apenas o nível determina as permissões.')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

corrigirTipoUsuario() 