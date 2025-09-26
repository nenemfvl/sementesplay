const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCriadores() {
  try {
    console.log('🔍 Testando tabela de criadores...')
    
    // Verificar todos os criadores
    const todosCriadores = await prisma.criador.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            nivel: true,
            dataCriacao: true
          }
        }
      }
    })
    
    console.log(`📊 Total de criadores na tabela: ${todosCriadores.length}`)
    
    if (todosCriadores.length > 0) {
      console.log('\n🎯 Detalhes dos criadores:')
      todosCriadores.forEach((criador, index) => {
        console.log(`${index + 1}. ${criador.nome || criador.usuario.nome}`)
        console.log(`   Email: ${criador.usuario.email}`)
        console.log(`   Nível: ${criador.usuario.nivel}`)
        console.log(`   ID Criador: ${criador.id}`)
        console.log(`   ID Usuário: ${criador.usuarioId}`)
        console.log('   ---')
      })
    } else {
      console.log('❌ Nenhum criador encontrado na tabela')
      
      // Verificar candidaturas aprovadas
      console.log('\n🔍 Verificando candidaturas aprovadas...')
      const candidaturasAprovadas = await prisma.candidaturaCriador.findMany({
        where: { status: 'aprovada' },
        select: {
          id: true,
          usuarioId: true,
          nome: true,
          status: true,
          dataRevisao: true
        }
      })
      
      console.log(`📋 Candidaturas aprovadas: ${candidaturasAprovadas.length}`)
      candidaturasAprovadas.forEach(c => {
        console.log(`- ${c.nome} (${c.usuarioId}) - Aprovada em: ${c.dataRevisao}`)
      })
    }
    
    // Verificar usuários com nível de criador
    console.log('\n👥 Verificando usuários com nível de criador...')
    const usuariosCriadores = await prisma.usuario.findMany({
      where: {
        nivel: {
          in: ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        dataCriacao: true
      }
    })
    
    console.log(`🎭 Usuários com nível de criador: ${usuariosCriadores.length}`)
    usuariosCriadores.forEach(u => {
      console.log(`- ${u.nome} (${u.email}) - Nível: ${u.nivel}`)
    })
    
  } catch (error) {
    console.error('❌ Erro ao testar criadores:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCriadores()
