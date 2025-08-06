// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function verificarSolicitacoes() {
//   try {
//     console.log('🔍 Verificando solicitações de compra...')
//     
//     // Buscar todas as solicitações
//     const solicitacoes = await prisma.solicitacaoCompra.findMany({
//       include: {
//         usuario: true,
//         parceiro: {
//           include: {
//             usuario: true
//           }
//         }
//       },
//       orderBy: {
//         dataCompra: 'desc'
//       }
//     })
//     
//     console.log(`📋 Total de solicitações: ${solicitacoes.length}`)
//     
//     if (solicitacoes.length === 0) {
//       console.log('❌ Nenhuma solicitação encontrada')
//       return
//     }
//     
//     // Agrupar por status
//     const solicitacoesPorStatus = {}
//     solicitacoes.forEach(solicitacao => {
//       const status = solicitacao.status
//       if (!solicitacoesPorStatus[status]) {
//         solicitacoesPorStatus[status] = []
//       }
//       solicitacoesPorStatus[status].push(solicitacao)
//     })
//     
//     // Mostrar solicitações por status
//     Object.keys(solicitacoesPorStatus).forEach(status => {
//       const solicitacoesStatus = solicitacoesPorStatus[status]
//       console.log(`\n📊 STATUS: ${status.toUpperCase()} (${solicitacoesStatus.length} solicitações)`)
//       
//       solicitacoesStatus.forEach((solicitacao, index) => {
//         console.log(`  ${index + 1}. ID: ${solicitacao.id}`)
//         console.log(`     Usuário: ${solicitacao.usuario.nome}`)
//         console.log(`     Parceiro: ${solicitacao.parceiro.usuario.nome}`)
//         console.log(`     Valor: R$ ${solicitacao.valorCompra.toFixed(2)}`)
//         console.log(`     Data: ${solicitacao.dataCompra.toLocaleDateString('pt-BR')}`)
//         console.log(`     Comprovante: ${solicitacao.comprovanteUrl ? 'Sim' : 'Não'}`)
//         console.log('')
//       })
//     })
//     
//     // Verificar se há compras correspondentes
//     console.log('🔍 Verificando compras correspondentes...')
//     
//     for (const solicitacao of solicitacoes) {
//       const compraCorrespondente = await prisma.compraParceiro.findFirst({
//         where: {
//           usuarioId: solicitacao.usuarioId,
//           parceiroId: solicitacao.parceiroId,
//           valorCompra: solicitacao.valorCompra,
//           dataCompra: solicitacao.dataCompra
//         }
//       })
//       
//       if (compraCorrespondente) {
//         console.log(`✅ Encontrada compra correspondente para solicitação ${solicitacao.id}:`)
//         console.log(`   ID da Compra: ${compraCorrespondente.id}`)
//         console.log(`   Status da Compra: ${compraCorrespondente.status}`)
//         console.log('')
//       } else {
//         console.log(`❌ Nenhuma compra correspondente encontrada para solicitação ${solicitacao.id}`)
//         console.log('')
//       }
//     }
//     
//   } catch (error) {
//     console.error('❌ Erro ao verificar solicitações:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// verificarSolicitacoes() 