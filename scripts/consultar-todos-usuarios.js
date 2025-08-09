const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function consultarTodosUsuarios() {
  try {
    console.log('👥 CONSULTANDO TODOS OS USUÁRIOS DO SISTEMA...\n')
    
    // Buscar todos os usuários
    const usuarios = await prisma.usuario.findMany({
      include: {
        criador: {
          include: {
            doacoesRecebidas: {
              select: {
                quantidade: true
              }
            }
          }
        },
        doacoesFeitas: {
          select: {
            quantidade: true
          }
        }
      },
      orderBy: {
        nivel: 'asc'
      }
    })

    console.log(`📊 Total de usuários encontrados: ${usuarios.length}\n`)

    // Mostrar usuários por nível
    const niveis = ['admin', 'criador-supremo', 'criador-parceiro', 'criador-comum', 'criador-iniciante', 'usuario']
    
    niveis.forEach(nivel => {
      const usuariosNivel = usuarios.filter(u => u.nivel === nivel)
      if (usuariosNivel.length > 0) {
        console.log(`\n🔸 NÍVEL: ${nivel.toUpperCase()} (${usuariosNivel.length} usuários)`)
        console.log('='.repeat(80))
        
        usuariosNivel.forEach((usuario, index) => {
          const nome = usuario.nome.padEnd(25)
          const email = (usuario.email || '').padEnd(30)
          const sementes = (usuario.sementes || 0).toString().padStart(8)
          const pontuacao = (usuario.pontuacao || 0).toString().padStart(8)
          
          let infoCriador = ''
          if (usuario.criador) {
            const doacoesRecebidas = usuario.criador.doacoesRecebidas.reduce((total, d) => total + d.quantidade, 0)
            infoCriador = ` | Criador ID: ${usuario.criador.id} | Doações Recebidas: ${doacoesRecebidas}`
          }
          
          const doacoesFeitas = usuario.doacoesFeitas.reduce((total, d) => total + d.quantidade, 0)
          
          console.log(`${(index + 1).toString().padStart(2)} | ${nome} | ${email} | S:${sementes} | P:${pontuacao} | Doações Feitas: ${doacoesFeitas}${infoCriador}`)
        })
      }
    })

    // Mostrar estatísticas gerais
    console.log('\n📈 ESTATÍSTICAS GERAIS')
    console.log('='.repeat(50))
    
    const totalSementes = usuarios.reduce((total, u) => total + (u.sementes || 0), 0)
    const totalPontuacao = usuarios.reduce((total, u) => total + (u.pontuacao || 0), 0)
    const totalCriadores = usuarios.filter(u => u.nivel.startsWith('criador')).length
    const totalUsuariosComuns = usuarios.filter(u => u.nivel === 'usuario').length
    const totalAdmins = usuarios.filter(u => u.nivel === 'admin').length
    
    console.log(`💰 Total de sementes no sistema: ${totalSementes}`)
    console.log(`🏆 Total de pontuação no sistema: ${totalPontuacao}`)
    console.log(`🎭 Total de criadores: ${totalCriadores}`)
    console.log(`👤 Total de usuários comuns: ${totalUsuariosComuns}`)
    console.log(`⚡ Total de administradores: ${totalAdmins}`)

  } catch (error) {
    console.error('❌ Erro ao consultar usuários:', error)
  } finally {
    await prisma.$disconnect()
  }
}

consultarTodosUsuarios()
