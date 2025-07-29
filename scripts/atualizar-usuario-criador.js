const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function atualizarUsuarioCriador() {
  try {
    console.log('=== Atualizando Usuário Criador ===\n')
    
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
    
    console.log('Candidatura encontrada:')
    console.log(`  Nome: ${candidatura.nome}`)
    console.log(`  Status: ${candidatura.status}`)
    console.log(`  Usuário ID: ${candidatura.usuarioId}`)
    console.log(`  Nível atual: ${candidatura.usuario.nivel}`)
    console.log(`  Tipo atual: ${candidatura.usuario.tipo}`)
    
    // Atualizar usuário para nível criador-iniciante (tipo permanece 'usuario')
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: candidatura.usuarioId },
      data: { 
        nivel: 'criador-iniciante'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        nivel: true
      }
    })
    
    console.log('\nUsuário atualizado:')
    console.log(`  Nome: ${usuarioAtualizado.nome}`)
    console.log(`  Novo tipo: ${usuarioAtualizado.tipo}`)
    console.log(`  Novo nível: ${usuarioAtualizado.nivel}`)
    
    // Verificar se pode acessar painel criador
    const niveisCriador = ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
    const podeAcessar = niveisCriador.includes(usuarioAtualizado.nivel)
    
    console.log('\nAcesso ao Painel Criador:')
    console.log(`  Pode acessar: ${podeAcessar ? 'Sim' : 'Não'}`)
    
    if (podeAcessar) {
      console.log('✅ Usuário agora tem acesso ao painel criador!')
    } else {
      console.log('❌ Usuário ainda não tem acesso ao painel criador')
    }
    
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

atualizarUsuarioCriador() 