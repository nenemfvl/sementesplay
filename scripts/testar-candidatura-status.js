// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function testarCandidaturaStatus() {
  try {
    console.log('=== Testando Status de Candidatura ===\n')
    
    // Buscar usuário de teste
    const usuario = await prisma.usuario.findFirst({
      where: { email: 'flavia.duck.nenem@gmail.com' }
    })
    
    if (!usuario) {
      console.log('Usuário não encontrado')
      return
    }
    
    console.log(`Usuário: ${usuario.nome} (${usuario.email})`)
    console.log(`ID: ${usuario.id}`)
    console.log(`Tipo: ${usuario.tipo}`)
    console.log(`Nível: ${usuario.nivel}\n`)
    
    // Verificar candidatura existente
    const candidatura = await prisma.candidaturaCriador.findFirst({
      where: { usuarioId: usuario.id },
      orderBy: { dataCandidatura: 'desc' }
    })
    
    if (candidatura) {
      console.log('Candidatura encontrada:')
      console.log(`  ID: ${candidatura.id}`)
      console.log(`  Status: ${candidatura.status}`)
      console.log(`  Data: ${candidatura.dataCandidatura}`)
      console.log(`  Observações: ${candidatura.observacoes || 'Nenhuma'}`)
      
      // Verificar se o usuário tem nível de criador
      const niveisCriador = ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
      const temNivelCriador = niveisCriador.includes(usuario.nivel)
      
      console.log(`\nUsuário tem nível de criador: ${temNivelCriador}`)
      
      if (candidatura.status === 'aprovada' && !temNivelCriador) {
        console.log('⚠️  Candidatura aprovada mas usuário não tem nível de criador!')
      } else if (candidatura.status === 'aprovada' && temNivelCriador) {
        console.log('✅ Candidatura aprovada e usuário tem nível de criador!')
      }
    } else {
      console.log('Nenhuma candidatura encontrada')
    }
    
//   } catch (error) {
//     console.error('❌ Erro:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// testarCandidaturaStatus() 