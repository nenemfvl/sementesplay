const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarAprovacaoCandidatura() {
  try {
    console.log('=== Teste de Aprovação de Candidatura ===\n')
    
    // 1. Verificar candidaturas pendentes
    console.log('1. Verificando candidaturas pendentes...')
    const candidaturasPendentes = await prisma.candidaturaCriador.findMany({
      where: { status: 'pendente' },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            nivel: true
          }
        }
      }
    })
    
    console.log(`   Encontradas ${candidaturasPendentes.length} candidaturas pendentes`)
    
    if (candidaturasPendentes.length === 0) {
      console.log('   Nenhuma candidatura pendente para testar')
      return
    }
    
    // 2. Simular aprovação da primeira candidatura
    const candidatura = candidaturasPendentes[0]
    console.log(`\n2. Simulando aprovação da candidatura de: ${candidatura.nome}`)
    console.log(`   Usuário ID: ${candidatura.usuarioId}`)
    console.log(`   Nível atual: ${candidatura.usuario.nivel}`)
    console.log(`   Tipo atual: ${candidatura.usuario.tipo}`)
    
    // 3. Atualizar candidatura para aprovada
    await prisma.candidaturaCriador.update({
      where: { id: candidatura.id },
      data: {
        status: 'aprovada',
        dataRevisao: new Date(),
        observacoes: 'Teste de aprovação automática'
      }
    })
    
    // 4. Criar registro de criador
    await prisma.criador.create({
      data: {
        usuarioId: candidatura.usuarioId,
        nome: candidatura.nome,
        bio: candidatura.bio,
        categoria: candidatura.categoria,
        redesSociais: candidatura.redesSociais,
        portfolio: candidatura.portfolio,
        nivel: 'comum',
        sementes: 0,
        apoiadores: 0,
        doacoes: 0,
        dataCriacao: new Date()
      }
    })
    
    // 5. Atualizar usuário (apenas o nível, tipo permanece 'usuario')
    await prisma.usuario.update({
      where: { id: candidatura.usuarioId },
      data: { 
        nivel: 'criador-iniciante'
      }
    })
    
    // 6. Verificar resultado
    console.log('\n3. Verificando resultado da aprovação...')
    const usuarioAtualizado = await prisma.usuario.findUnique({
      where: { id: candidatura.usuarioId },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        nivel: true
      }
    })
    
    console.log(`   Novo nível: ${usuarioAtualizado.nivel}`)
    console.log(`   Novo tipo: ${usuarioAtualizado.tipo}`)
    
    // 7. Verificar se criador foi criado
    const criadorCriado = await prisma.criador.findFirst({
      where: { usuarioId: candidatura.usuarioId }
    })
    
    console.log(`   Criador criado: ${criadorCriado ? 'Sim' : 'Não'}`)
    
    // 8. Verificar se pode acessar painel criador
    const podeAcessarPainel = ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo'].includes(usuarioAtualizado.nivel)
    console.log(`   Pode acessar painel criador: ${podeAcessarPainel ? 'Sim' : 'Não'}`)
    
    console.log('\n✅ Teste concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarAprovacaoCandidatura() 