// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// // Simular o PermissionsManager para o script
// const PermissionsManager = {
//   async removeCriadorPermissions(usuarioId) {
//     try {
//       await prisma.usuario.update({
//         where: { id: usuarioId },
//         data: { nivel: 'comum' }
//       })

//       await prisma.logAuditoria.create({
//         data: {
//           usuarioId,
//           acao: 'PERMISSAO_REMOVIDA',
//           detalhes: 'Permissões de criador removidas - usuário voltou para nível comum',
//           nivel: 'warning'
//         }
//       })

//       console.log(`✅ Permissões de criador removidas para usuário ${usuarioId}`)
//       return true
//     } catch (error) {
//       console.error('❌ Erro ao remover permissões de criador:', error)
//       return false
//     }
//   },

//   async removeParceiroPermissions(usuarioId) {
//     try {
//       await prisma.usuario.update({
//         where: { id: usuarioId },
//         data: { nivel: 'comum' }
//       })

//       await prisma.logAuditoria.create({
//         data: {
//           usuarioId,
//           acao: 'PERMISSAO_REMOVIDA',
//           detalhes: 'Permissões de parceiro removidas - usuário voltou para nível comum',
//           nivel: 'warning'
//         }
//       })

//       console.log(`✅ Permissões de parceiro removidas para usuário ${usuarioId}`)
//       return true
//     } catch (error) {
//       console.error('❌ Erro ao remover permissões de parceiro:', error)
//       return false
//     }
//   },

//   async removeAdminPermissions(usuarioId) {
//     try {
//       await prisma.usuario.update({
//         where: { id: usuarioId },
//         data: { nivel: 'comum' }
//       })

//       await prisma.logAuditoria.create({
//         data: {
//           usuarioId,
//           acao: 'PERMISSAO_REMOVIDA',
//           detalhes: 'Permissões de admin removidas - usuário voltou para nível comum',
//           nivel: 'warning'
//         }
//       })

//       console.log(`✅ Permissões de admin removidas para usuário ${usuarioId}`)
//       return true
//     } catch (error) {
//       console.error('❌ Erro ao remover permissões de admin:', error)
//       return false
//     }
//   }
// }

// async function verificarPermissoes() {
//   try {
//     console.log('🔍 === VERIFICAÇÃO DE PERMISSÕES ===\n')

//     // 1. Verificar criadores inconsistentes
//     console.log('📋 Verificando criadores inconsistentes...')
//     const criadoresInconsistentes = await prisma.usuario.findMany({
//       where: {
//         OR: [
//           { nivel: 'criador-iniciante' },
//           { nivel: 'criador-comum' },
//           { nivel: 'criador-parceiro' },
//           { nivel: 'criador-supremo' }
//         ],
//         criador: null
//       },
//       select: {
//         id: true,
//         nome: true,
//         email: true,
//         nivel: true
//       }
//     })

//     console.log(`Encontrados ${criadoresInconsistentes.length} criadores inconsistentes`)
//     criadoresInconsistentes.forEach(usuario => {
//       console.log(`- ${usuario.nome} (${usuario.email}): ${usuario.nivel}`)
//     })

//     // 2. Verificar parceiros inconsistentes
//     console.log('\n📋 Verificando parceiros inconsistentes...')
//     const parceirosInconsistentes = await prisma.usuario.findMany({
//       where: {
//         nivel: 'parceiro',
//         parceiro: null
//       },
//       select: {
//         id: true,
//         nome: true,
//         email: true,
//         nivel: true
//       }
//     })

//     console.log(`Encontrados ${parceirosInconsistentes.length} parceiros inconsistentes`)
//     parceirosInconsistentes.forEach(usuario => {
//       console.log(`- ${usuario.nome} (${usuario.email}): ${usuario.nivel}`)
//     })

//     // 3. Verificar admins inconsistentes
//     console.log('\n📋 Verificando admins inconsistentes...')
//     const adminsInconsistentes = await prisma.usuario.findMany({
//       where: {
//         nivel: 'admin',
//         admin: null
//       },
//       select: {
//         id: true,
//         nome: true,
//         email: true,
//         nivel: true
//       }
//     })

//     console.log(`Encontrados ${adminsInconsistentes.length} admins inconsistentes`)
//     adminsInconsistentes.forEach(usuario => {
//       console.log(`- ${usuario.nome} (${usuario.email}): ${usuario.nivel}`)
//     })

//     // 4. Verificar usuários com múltiplas permissões
//     console.log('\n📋 Verificando usuários com múltiplas permissões...')
//     const usuariosMultiplos = await prisma.usuario.findMany({
//       where: {
//         OR: [
//           {
//             AND: [
//               { criador: { not: null } },
//               { parceiro: { not: null } }
//             ]
//           },
//           {
//             AND: [
//               { criador: { not: null } },
//               { admin: { not: null } }
//             ]
//           },
//           {
//             AND: [
//               { parceiro: { not: null } },
//               { admin: { not: null } }
//             ]
//           }
//         ]
//       },
//       include: {
//         criador: true,
//         parceiro: true,
//         admin: true
//       }
//     })

//     console.log(`Encontrados ${usuariosMultiplos.length} usuários com múltiplas permissões`)
//     usuariosMultiplos.forEach(usuario => {
//       console.log(`- ${usuario.nome} (${usuario.email}):`)
//       if (usuario.criador) console.log(`  * Criador: ${usuario.criador.nome}`)
//       if (usuario.parceiro) console.log(`  * Parceiro: ${usuario.parceiro.nomeCidade}`)
//       if (usuario.admin) console.log(`  * Admin: ${usuario.admin.nivel}`)
//     })

//     // 5. Resumo e recomendações
//     console.log('\n📊 RESUMO:')
//     console.log(`- Criadores inconsistentes: ${criadoresInconsistentes.length}`)
//     console.log(`- Parceiros inconsistentes: ${parceirosInconsistentes.length}`)
//     console.log(`- Admins inconsistentes: ${adminsInconsistentes.length}`)
//     console.log(`- Usuários com múltiplas permissões: ${usuariosMultiplos.length}`)

//     const totalInconsistentes = criadoresInconsistentes.length + parceirosInconsistentes.length + adminsInconsistentes.length

//     if (totalInconsistentes > 0) {
//       console.log('\n⚠️  RECOMENDAÇÕES:')
//       console.log('1. Corrigir permissões inconsistentes')
//       console.log('2. Verificar se há dados órfãos')
//       console.log('3. Revisar lógica de atribuição de permissões')
//     } else {
//       console.log('\n✅ Todas as permissões estão consistentes!')
//     }

//   } catch (error) {
//     console.error('❌ Erro ao verificar permissões:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// verificarPermissoes() 