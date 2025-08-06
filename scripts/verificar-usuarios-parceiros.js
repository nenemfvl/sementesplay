// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function verificarUsuariosParceiros() {
  console.log('🔍 Verificando usuários parceiros...')

  try {
    // Buscar todos os parceiros
    const parceiros = await prisma.parceiro.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            nivel: true,
            dataCriacao: true
          }
        }
      }
    })

    console.log(`\n📊 Total de parceiros: ${parceiros.length}`)

    for (const parceiro of parceiros) {
      console.log(`\n🔍 Parceiro ID: ${parceiro.id}`)
      console.log(`   Nome: ${parceiro.nome}`)
      console.log(`   Usuário ID: ${parceiro.usuarioId}`)
      console.log(`   Email: ${parceiro.usuario?.email}`)
      console.log(`   Tipo: ${parceiro.usuario?.tipo}`)
      console.log(`   Nível: ${parceiro.usuario?.nivel}`)
      console.log(`   Data criação: ${parceiro.usuario?.dataCriacao}`)
      console.log(`   Status: ${parceiro.status || 'N/A'}`)
    }

    // Verificar usuários com nível 'parceiro'
    const usuariosParceiro = await prisma.usuario.findMany({
      where: {
        nivel: 'parceiro'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        nivel: true,
        dataCriacao: true
      }
    })

    console.log(`\n👥 Usuários com nível 'parceiro': ${usuariosParceiro.length}`)
    
    for (const usuario of usuariosParceiro) {
      console.log(`   • ${usuario.nome} (${usuario.email}) - ID: ${usuario.id}`)
    }

    // Verificar se há inconsistências
    const parceirosSemUsuario = parceiros.filter(p => !p.usuario)
    const usuariosSemParceiro = usuariosParceiro.filter(u => 
      !parceiros.find(p => p.usuarioId === u.id)
    )

    console.log(`\n⚠️  INCONSISTÊNCIAS:`)
    console.log(`   Parceiros sem usuário: ${parceirosSemUsuario.length}`)
    console.log(`   Usuários parceiro sem registro na tabela parceiros: ${usuariosSemParceiro.length}`)

    if (parceirosSemUsuario.length > 0) {
      console.log(`\n❌ Parceiros sem usuário:`)
      parceirosSemUsuario.forEach(p => {
        console.log(`   • ${p.nome} (ID: ${p.id})`)
      })
    }

    if (usuariosSemParceiro.length > 0) {
      console.log(`\n❌ Usuários parceiro sem registro:`)
      usuariosSemParceiro.forEach(u => {
        console.log(`   • ${u.nome} (${u.email}) - ID: ${u.id}`)
      })
    }

//   } catch (error) {
//     console.error('❌ Erro durante verificação:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// verificarUsuariosParceiros() 