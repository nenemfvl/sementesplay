const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function consultarRanking() {
  try {
    console.log('🏆 CONSULTANDO RANKING DOS CRIADORES...\n')
    
    // Buscar todos os criadores com seus dados
    const criadores = await prisma.criador.findMany({
      where: {
        usuario: {
          nivel: {
            in: ['criador-supremo', 'criador-parceiro', 'criador-comum', 'criador-iniciante']
          }
        },
        conteudos: {
          some: {} // Garante que o criador tenha pelo menos 1 conteúdo
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

    // Calcular pontuação para cada criador (mesmo critério da API)
    const criadoresComPontuacao = await Promise.all(criadores.map(async c => {
      try {
        // Pontuação base: sementes recebidas (1 semente = 1 ponto)
        const sementesRecebidas = c.doacoesRecebidas.reduce((total, doacao) => total + doacao.quantidade, 0)
        
        // Pontos do campo pontuacao do usuário
        const pontosUsuario = c.usuario.pontuacao || 0
        
        // Buscar dados adicionais
        const [conteudos, enquetes, recadosPublicos] = await Promise.all([
          // Total de visualizações dos conteúdos
          prisma.conteudo.aggregate({
            where: { criadorId: c.id },
            _sum: { visualizacoes: true }
          }).catch(() => ({ _sum: { visualizacoes: 0 } })),
          
          // Quantidade de enquetes criadas
          prisma.enquete.count({
            where: { criadorId: c.usuarioId }
          }).catch(() => 0),
          
          // Quantidade de recados públicos
          prisma.recado.count({
            where: { 
              destinatarioId: c.usuarioId,
              publico: true 
            }
          }).catch(() => 0)
        ])
        
        // Calcular pontuação por visualizações (1 visualização = 0.1 ponto)
        const pontosVisualizacoes = Math.floor((conteudos._sum.visualizacoes || 0) * 0.1)
        
        // Pontos por enquetes (5 pontos por enquete)
        const pontosEnquetes = enquetes * 5
        
        // Pontos por recados públicos (2 pontos por recado público)
        const pontosRecadosPublicos = recadosPublicos * 2
        
        // Pontuação total composta
        const pontuacaoTotal = sementesRecebidas + pontosUsuario + pontosVisualizacoes + pontosEnquetes + pontosRecadosPublicos
        
        return {
          id: c.id,
          usuarioId: c.usuarioId,
          nome: c.usuario.nome,
          nivel: c.usuario.nivel,
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
          nivel: c.usuario.nivel,
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

    // Mostrar ranking
    console.log('🏅 RANKING DOS CRIADORES (Ordenado por Pontuação Total)\n')
    console.log('Pos | Nome                    | Nível              | Pontuação Total | Detalhes')
    console.log('----|-------------------------|-------------------|-----------------|------------------')

    criadoresComPontuacao.forEach((criador, index) => {
      const posicao = index + 1
      const nome = criador.nome.padEnd(25)
      const nivel = criador.nivel.padEnd(20)
      const pontuacao = criador.pontuacaoTotal.toString().padStart(15)
      
      console.log(`${posicao.toString().padStart(3)} | ${nome} | ${nivel} | ${pontuacao} | ` +
        `S:${criador.sementesRecebidas} U:${criador.pontosUsuario} V:${criador.pontosVisualizacoes} E:${criador.pontosEnquetes} R:${criador.pontosRecadosPublicos}`)
    })

    console.log('\n📋 LEGENDA:')
    console.log('S = Sementes Recebidas, U = Pontos do Usuário, V = Pontos por Visualizações')
    console.log('E = Pontos por Enquetes, R = Pontos por Recados Públicos')

  } catch (error) {
    console.error('❌ Erro ao consultar ranking:', error)
  } finally {
    await prisma.$disconnect()
  }
}

consultarRanking()
