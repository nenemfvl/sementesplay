// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function verificarParceiroUsuario() {
  try {
    console.log('🔍 Verificando associação entre usuários e parceiros...\n')

    // Buscar todos os parceiros
    const parceiros = await prisma.parceiro.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    })

    console.log(`🏢 Parceiros encontrados: ${parceiros.length}`)
    parceiros.forEach(parceiro => {
      console.log(`  - ${parceiro.nomeCidade} (ID: ${parceiro.id})`)
      console.log(`    Usuário: ${parceiro.usuario?.nome} (${parceiro.usuario?.email})`)
      console.log(`    UsuarioId: ${parceiro.usuarioId}`)
      console.log('')
    })

    // Buscar compras e verificar parceiros
    const compras = await prisma.compraParceiro.findMany({
      include: {
        parceiro: {
          include: {
            usuario: {
              select: {
                nome: true,
                email: true
              }
            }
          }
        },
        usuario: {
          select: {
            nome: true,
            email: true
          }
        }
      }
    })

    console.log(`🛒 Compras encontradas: ${compras.length}`)
    compras.forEach(compra => {
      console.log(`  - ${compra.usuario.nome} → ${compra.parceiro.nomeCidade}`)
      console.log(`    Parceiro usuário: ${compra.parceiro.usuario?.nome || 'N/A'}`)
      console.log(`    Status: ${compra.status}`)
      console.log('')
    })

    // Verificar usuário vanvan
    const vanvan = await prisma.usuario.findUnique({
      where: { email: 'vanislanleopoldinodasilva@gmail.com' },
      include: {
        parceiro: true
      }
    })

    if (vanvan) {
      console.log(`👤 Usuário vanvan:`)
      console.log(`  - Nome: ${vanvan.nome}`)
      console.log(`  - Email: ${vanvan.email}`)
      console.log(`  - ID: ${vanvan.id}`)
      console.log(`  - É parceiro: ${vanvan.parceiro ? 'SIM' : 'NÃO'}`)
      if (vanvan.parceiro) {
        console.log(`  - Parceiro: ${vanvan.parceiro.nomeCidade}`)
      }
    }

//   } catch (error) {
//     console.error('❌ Erro:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// verificarParceiroUsuario() 