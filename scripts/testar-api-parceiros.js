const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarParceiros() {
  try {
    console.log('🔍 Verificando parceiros no banco de dados...')
    
    // Verificar todos os usuários com nível 'parceiro'
    const usuariosParceiros = await prisma.usuario.findMany({
      where: {
        nivel: 'parceiro'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true
      }
    })
    
    console.log(`\n👥 Usuários com nível 'parceiro': ${usuariosParceiros.length}`)
    usuariosParceiros.forEach(user => {
      console.log(`  - ${user.nome} (${user.email}) - Nível: ${user.nivel}`)
    })
    
    // Verificar registros na tabela Parceiro
    const parceiros = await prisma.parceiro.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            nivel: true
          }
        }
      }
    })
    
    console.log(`\n🏢 Registros na tabela Parceiro: ${parceiros.length}`)
    parceiros.forEach(parceiro => {
      console.log(`  - ${parceiro.usuario.nome} (${parceiro.usuario.email})`)
      console.log(`    Cidade: ${parceiro.nomeCidade}`)
      console.log(`    Total Vendas: R$ ${parceiro.totalVendas}`)
      console.log(`    Códigos Gerados: ${parceiro.codigosGerados}`)
    })
    
    // Verificar se há inconsistências
    const usuariosSemParceiro = usuariosParceiros.filter(user => 
      !parceiros.find(p => p.usuarioId === user.id)
    )
    
    if (usuariosSemParceiro.length > 0) {
      console.log(`\n⚠️  Usuários com nível 'parceiro' mas sem registro na tabela Parceiro:`)
      usuariosSemParceiro.forEach(user => {
        console.log(`  - ${user.nome} (${user.email})`)
      })
    }
    
    const parceirosSemUsuario = parceiros.filter(parceiro => 
      !usuariosParceiros.find(u => u.id === parceiro.usuarioId)
    )
    
    if (parceirosSemUsuario.length > 0) {
      console.log(`\n⚠️  Registros na tabela Parceiro mas usuário não tem nível 'parceiro':`)
      parceirosSemUsuario.forEach(parceiro => {
        console.log(`  - ${parceiro.usuario.nome} (${parceiro.usuario.email})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarParceiros() 