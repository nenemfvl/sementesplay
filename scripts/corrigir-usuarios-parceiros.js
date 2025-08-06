const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function corrigirUsuariosParceiros() {
  console.log('🔧 Corrigindo usuários parceiros...')

  try {
    // Buscar usuários com nível 'parceiro'
    const usuariosParceiro = await prisma.usuario.findMany({
      where: {
        nivel: 'parceiro'
      },
      include: {
        parceiro: true
      }
    })

    console.log(`\n📊 Usuários com nível 'parceiro': ${usuariosParceiro.length}`)

    for (const usuario of usuariosParceiro) {
      console.log(`\n🔍 Processando: ${usuario.nome} (${usuario.email})`)
      
      // Verificar se tem registro na tabela parceiros
      if (!usuario.parceiro) {
        console.log(`   ❌ Usuário não tem registro na tabela parceiros`)
        console.log(`   🔧 Criando registro na tabela parceiros...`)
        
        try {
          const novoParceiro = await prisma.parceiro.create({
            data: {
              usuarioId: usuario.id,
              nome: usuario.nome,
              email: usuario.email,
              site: '',
              descricao: 'Parceiro criado automaticamente',
              status: 'ativo',
              saldoDevedor: 0
            }
          })
          
          console.log(`   ✅ Parceiro criado: ${novoParceiro.id}`)
        } catch (error) {
          console.log(`   ❌ Erro ao criar parceiro: ${error.message}`)
        }
      } else {
        console.log(`   ✅ Já tem registro na tabela parceiros: ${usuario.parceiro.id}`)
      }
      
      // Verificar se o tipo está correto
      if (usuario.tipo !== 'parceiro') {
        console.log(`   🔧 Atualizando tipo de '${usuario.tipo}' para 'parceiro'`)
        
        try {
          await prisma.usuario.update({
            where: { id: usuario.id },
            data: { tipo: 'parceiro' }
          })
          
          console.log(`   ✅ Tipo atualizado`)
        } catch (error) {
          console.log(`   ❌ Erro ao atualizar tipo: ${error.message}`)
        }
      } else {
        console.log(`   ✅ Tipo já está correto: ${usuario.tipo}`)
      }
    }

    console.log(`\n✅ Correção concluída!`)

  } catch (error) {
    console.error('❌ Erro durante correção:', error)
  } finally {
    await prisma.$disconnect()
  }
}

corrigirUsuariosParceiros() 