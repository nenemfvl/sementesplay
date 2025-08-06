// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function verificarDados() {
  try {
    console.log('=== VERIFICANDO DADOS ATUAIS ===\n')

    // Verificar solicitações de compra
    console.log('1. SOLICITAÇÕES DE COMPRA:')
    const solicitacoes = await prisma.solicitacaoCompra.findMany({
      include: {
        usuario: true,
        parceiro: true
      }
    })
    console.log(`Total: ${solicitacoes.length}`)
    solicitacoes.forEach(s => {
      console.log(`- ID: ${s.id}, Status: ${s.status}, Valor: R$ ${s.valorCompra}, Usuário: ${s.usuario.nome}, Parceiro: ${s.parceiro.nomeCidade}`)
    })

    console.log('\n2. COMPRAS PARCEIRO:')
    const compras = await prisma.compraParceiro.findMany({
      include: {
        usuario: true,
        parceiro: true
      }
    })
    console.log(`Total: ${compras.length}`)
    compras.forEach(c => {
      console.log(`- ID: ${c.id}, Status: ${c.status}, Valor: R$ ${c.valorCompra}, Usuário: ${c.usuario.nome}, Parceiro: ${c.parceiro.nomeCidade}`)
    })

    console.log('\n3. REPASSES PARCEIRO:')
    const repasses = await prisma.repasseParceiro.findMany({
      include: {
        parceiro: true,
        compraParceiro: {
          include: {
            usuario: true
          }
        }
      }
    })
    console.log(`Total: ${repasses.length}`)
    repasses.forEach(r => {
      console.log(`- ID: ${r.id}, Status: ${r.status}, Valor: R$ ${r.valorRepasse}, Parceiro: ${r.parceiro.nomeCidade}, Usuário: ${r.compraParceiro.usuario.nome}`)
    })

    console.log('\n4. PARCEIROS:')
    const parceiros = await prisma.parceiro.findMany({
      include: {
        usuario: true
      }
    })
    console.log(`Total: ${parceiros.length}`)
    parceiros.forEach(p => {
      console.log(`- ID: ${p.id}, Nome: ${p.nomeCidade}, Usuário: ${p.usuario.nome} (${p.usuario.email})`)
    })

    console.log('\n5. USUÁRIOS:')
    const usuarios = await prisma.usuario.findMany({
      take: 5
    })
    console.log(`Primeiros 5 usuários:`)
    usuarios.forEach(u => {
      console.log(`- ID: ${u.id}, Nome: ${u.nome}, Email: ${u.email}`)
    })

//   } catch (error) {
//     console.error('Erro:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// verificarDados() 