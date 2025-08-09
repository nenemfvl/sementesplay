const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function rankingComNiveis() {
  try {
    console.log('🏆 RANKING COM SUGESTÃO DE NÍVEIS BASEADO NA POSIÇÃO...\n')
    
    // Buscar todos os criadores com seus dados
    const criadores = await prisma.criador.findMany({
      where: {
        usuario: {
          nivel: {
            in: ['criador-supremo', 'criador-parceiro', 'criador-comum', 'criador-iniciante']
          }
        }
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            nivel: true,
            pontuacao: true,
            sementes: true
          }
        },
        doacoesRecebidas: {
          select: {
            quantidade: true
          }
        }
      }
    })

    console.log(`📊 Total de criadores encontrados: ${criadores.length}\n`)

    // Calcular pontuação para cada criador
    const criadoresComPontuacao = await Promise.all(criadores.map(async c => {
      try {
        const sementesRecebidas = c.doacoesRecebidas.reduce((total, doacao) => total + doacao.quantidade, 0)
        const pontosUsuario = c.usuario.pontuacao || 0
        
        const [conteudos, enquetes, recadosPublicos] = await Promise.all([
          prisma.conteudo.aggregate({
            where: { criadorId: c.id },
            _sum: { visualizacoes: true }
          }).catch(() => ({ _sum: { visualizacoes: 0 } })),
          
          prisma.enquete.count({
            where: { criadorId: c.usuarioId }
          }).catch(() => 0),
          
          prisma.recado.count({
            where: { 
              destinatarioId: c.usuarioId,
              publico: true 
            }
          }).catch(() => 0)
        ])
        
        const pontosVisualizacoes = Math.floor((conteudos._sum.visualizacoes || 0) * 0.1)
        const pontosEnquetes = enquetes * 5
        const pontosRecadosPublicos = recadosPublicos * 2
        
        const pontuacaoTotal = sementesRecebidas + pontosUsuario + pontosVisualizacoes + pontosEnquetes + pontosRecadosPublicos
        
        return {
          id: c.id,
          usuarioId: c.usuarioId,
          nome: c.usuario.nome,
          nivelAtual: c.usuario.nivel,
          sementesRecebidas,
          pontosUsuario,
          pontosVisualizacoes,
          pontosEnquetes,
          pontosRecadosPublicos,
          pontuacaoTotal
        }
      } catch (error) {
        console.error(`Erro ao calcular pontuação do criador ${c.id}:`, error)
        return {
          id: c.id,
          usuarioId: c.usuarioId,
          nome: c.usuario.nome,
          nivelAtual: c.usuario.nivel,
          sementesRecebidas: 0,
          pontosUsuario: 0,
          pontosVisualizacoes: 0,
          pontosEnquetes: 0,
          pontosRecadosPublicos: 0,
          pontuacaoTotal: 0
        }
      }
    }))

    // Ordenar por pontuação total (maior para menor)
    criadoresComPontuacao.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal)

    // Função para sugerir nível baseado na posição
    function sugerirNivel(posicao, totalCriadores) {
      if (totalCriadores === 1) return 'criador-supremo'
      if (posicao === 1) return 'criador-supremo'
      if (posicao <= Math.ceil(totalCriadores * 0.1)) return 'criador-supremo' // Top 10%
      if (posicao <= Math.ceil(totalCriadores * 0.3)) return 'criador-parceiro' // Top 30%
      if (posicao <= Math.ceil(totalCriadores * 0.6)) return 'criador-comum' // Top 60%
      return 'criador-iniciante'
    }

    // Mostrar ranking com sugestões de nível
    console.log('🏅 RANKING DOS CRIADORES COM SUGESTÃO DE NÍVEIS\n')
    console.log('Pos | Nome                    | Nível Atual        | Nível Sugerido    | Pontuação Total | Detalhes')
    console.log('----|-------------------------|-------------------|-------------------|-----------------|------------------')

    criadoresComPontuacao.forEach((criador, index) => {
      const posicao = index + 1
      const nome = criador.nome.padEnd(25)
      const nivelAtual = criador.nivelAtual.padEnd(20)
      const nivelSugerido = sugerirNivel(posicao, criadoresComPontuacao.length).padEnd(20)
      const pontuacao = criador.pontuacaoTotal.toString().padStart(15)
      
      console.log(`${posicao.toString().padStart(3)} | ${nome} | ${nivelAtual} | ${nivelSugerido} | ${pontuacao} | ` +
        `S:${criador.sementesRecebidas} U:${criador.pontosUsuario} V:${criador.pontosVisualizacoes} E:${criador.pontosEnquetes} R:${criador.pontosRecadosPublicos}`)
    })

    console.log('\n📋 LEGENDA:')
    console.log('S = Sementes Recebidas, U = Pontos do Usuário, V = Pontos por Visualizações')
    console.log('E = Pontos por Enquetes, R = Pontos por Recados Públicos')
    
    console.log('\n🎯 SISTEMA DE NÍVEIS SUGERIDOS:')
    console.log('- 1º lugar: criador-supremo (elite)')
    console.log('- Top 10%: criador-supremo')
    console.log('- Top 30%: criador-parceiro')
    console.log('- Top 60%: criador-comum')
    console.log('- Restante: criador-iniciante')
    
    console.log('\n💡 OBSERVAÇÃO:')
    console.log('Os níveis atuais são MANUAIS e não mudam automaticamente com o ranking.')
    console.log('Para implementar evolução automática, seria necessário criar um sistema de promoção.')

  } catch (error) {
    console.error('❌ Erro ao consultar ranking:', error)
  } finally {
    await prisma.$disconnect()
  }
}

rankingComNiveis()
