// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function testarSistemaMissoes() {
//   try {
//     console.log('=== TESTE DO SISTEMA DE MISSÕES ===')
//     console.log('')
//     console.log('1. Verificando missões no banco...')
//     const missoes = await prisma.missao.findMany()
//     console.log(`   Encontradas ${missoes.length} missões`)
//     missoes.forEach((missao, index) => {
//       console.log(`   ${index + 1}. ${missao.titulo} (${missao.tipo}) - ${missao.ativa ? 'Ativa' : 'Inativa'}`)
//     })
//     console.log('')
//     console.log('2. Verificando usuários...')
//     const usuarios = await prisma.usuario.findMany({
//       take: 3
//     })
//     console.log(`   Encontrados ${usuarios.length} usuários`)
//     usuarios.forEach((usuario, index) => {
//       console.log(`   ${index + 1}. ${usuario.nome} (${usuario.id})`)
//     })
//     console.log('')
//     console.log('3. Verificando progresso nas missões...')
//     const missoesUsuarios = await prisma.missaoUsuario.findMany({
//       include: {
//         missao: true,
//         usuario: true
//       }
//     })
//     console.log(`   Encontrados ${missoesUsuarios.length} registros de progresso`)
//     missoesUsuarios.forEach((mu, index) => {
//       console.log(`   ${index + 1}. ${mu.usuario.nome} - ${mu.missao.titulo}: ${mu.progresso}/${mu.missao.objetivo}`)
//     })
//     console.log('')
//     console.log('4. Testando criação de missão...')
//     const novaMissao = await prisma.missao.create({
//       data: {
//         titulo: 'Teste de Missão',
//         descricao: 'Missão criada para teste',
//         tipo: 'teste',
//         objetivo: 1,
//         recompensa: 100,
//         ativa: true
//       }
//     })
//     console.log(`   ✅ Missão criada: ${novaMissao.id}`)
//     console.log('')
//     console.log('5. Testando progresso de usuário...')
//     if (usuarios.length > 0 && missoes.length > 0) {
//       const missaoUsuario = await prisma.missaoUsuario.create({
//         data: {
//           missaoId: missoes[0].id,
//           usuarioId: usuarios[0].id,
//           progresso: 1,
//           concluida: true
//         }
//       })
//       console.log(`   ✅ Progresso criado: ${missaoUsuario.id}`)
//     }
//     console.log('')
//     console.log('6. Limpando dados de teste...')
//     await prisma.missaoUsuario.deleteMany({
//       where: {
//         missao: {
//           titulo: 'Teste de Missão'
//         }
//       }
//     })
//     await prisma.missao.deleteMany({
//       where: {
//         titulo: 'Teste de Missão'
//       }
//     })
//     console.log('   ✅ Dados de teste removidos')
//     console.log('')
//     console.log('=== FIM DO TESTE ===')
//     
//   } catch (error) {
//     console.error('Erro no teste:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// testarSistemaMissoes() 