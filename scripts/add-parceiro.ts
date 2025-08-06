// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// async function main() {
//   try {
//     // Criar usuário parceiro
//     const usuario = await prisma.usuario.create({
//       data: {
//         nome: 'Parceiro Teste',
//         email: 'parceiro@teste.com',
//         senha: '123456', // Em produção seria hash
//         tipo: 'parceiro',
//         nivel: 'parceiro',
//         sementes: 0
//       }
//     })

//     console.log('Usuário parceiro criado:', usuario.id)

//     // Criar perfil de parceiro
//     const parceiro = await prisma.parceiro.create({
//       data: {
//         usuarioId: usuario.id,
//         nomeCidade: 'Cidade Teste FiveM',
//         comissaoMensal: 500.00,
//         totalVendas: 0,
//         codigosGerados: 0
//       }
//     })

//     console.log('Perfil de parceiro criado:', parceiro.id)

//     // Gerar alguns códigos de exemplo
//     const codigos = [
//       { codigo: 'TESTE001', valor: 10.00 },
//       { codigo: 'TESTE002', valor: 25.00 },
//       { codigo: 'TESTE003', valor: 50.00 },
//       { codigo: 'TESTE004', valor: 100.00 }
//     ]

//     for (const codigoData of codigos) {
//       await prisma.codigoCashback.create({
//         data: {
//           parceiroId: parceiro.id,
//           codigo: codigoData.codigo,
//           valor: codigoData.valor,
//           usado: false
//         }
//       })
//     }

//     console.log('Códigos de exemplo criados')

//     // Criar algumas transações de exemplo
//     const transacoes = [
//       { codigo: 'TESTE001', valor: 10.00, usuarioId: usuario.id },
//       { codigo: 'TESTE002', valor: 25.00, usuarioId: usuario.id }
//     ]

//     for (const transacaoData of transacoes) {
//       await prisma.transacao.create({
//         data: {
//           usuarioId: transacaoData.usuarioId,
//           tipo: 'CASHBACK',
//           valor: transacaoData.valor,
//           codigoParceiro: transacaoData.codigo,
//           status: 'aprovada'
//         }
//       })
//     }

//     console.log('Transações de exemplo criadas')

//     console.log('\n=== PARCEIRO DE TESTE CRIADO ===')
//     console.log('Email: parceiro@teste.com')
//     console.log('Senha: 123456')
//     console.log('Tipo: parceiro')
//     console.log('Cidade: Cidade Teste FiveM')
//     console.log('Comissão Mensal: R$ 500,00')
//     console.log('\nCódigos de exemplo:')
//     codigos.forEach(c => console.log(`- ${c.codigo}: R$ ${c.valor.toFixed(2)}`))

//   } catch (error) {
//     console.error('Erro ao criar parceiro de teste:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// main() 