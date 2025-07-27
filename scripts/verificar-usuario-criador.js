const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarUsuarioCriador() {
  try {
    console.log('=== Verificando Usuário Criador ===\n')
    
    // Buscar candidatura
    const candidatura = await prisma.candidaturaCriador.findFirst({
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
      console.log('Nenhuma candidatura encontrada')
      return
    }
    
    console.log('Candidatura encontrada:')
    console.log(`  ID: ${candidatura.id}`)
    console.log(`  Nome: ${candidatura.nome}`)
    console.log(`  Status: ${candidatura.status}`)
    console.log(`  Data: ${candidatura.dataCandidatura}`)
    
    console.log('\nUsuário:')
    console.log(`  ID: ${candidatura.usuario.id}`)
    console.log(`  Nome: ${candidatura.usuario.nome}`)
    console.log(`  Email: ${candidatura.usuario.email}`)
    console.log(`  Tipo: ${candidatura.usuario.tipo}`)
    console.log(`  Nível: ${candidatura.usuario.nivel}`)
    
    // Verificar se existe registro de criador
    const criador = await prisma.criador.findFirst({
      where: { usuarioId: candidatura.usuarioId }
    })
    
    console.log('\nRegistro de Criador:')
    console.log(`  Existe: ${criador ? 'Sim' : 'Não'}`)
    if (criador) {
      console.log(`  ID: ${criador.id}`)
      console.log(`  Nome: ${criador.nome}`)
      console.log(`  Categoria: ${criador.categoria}`)
      console.log(`  Nível: ${criador.nivel}`)
    }
    
    // Verificar se pode acessar painel criador
    const niveisCriador = ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
    const podeAcessar = niveisCriador.includes(candidatura.usuario.nivel)
    
    console.log('\nAcesso ao Painel Criador:')
    console.log(`  Pode acessar: ${podeAcessar ? 'Sim' : 'Não'}`)
    console.log(`  Nível atual: ${candidatura.usuario.nivel}`)
    console.log(`  Níveis válidos: ${niveisCriador.join(', ')}`)
    
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarUsuarioCriador() 