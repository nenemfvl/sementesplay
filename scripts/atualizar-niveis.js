// ⚠️ SCRIPT DESABILITADO - SISTEMA DE NÍVEIS AUTOMÁTICOS IMPLEMENTADO VIA API CRON
// 
// Este script foi substituído pela API automática:
// POST /api/cron/promover-niveis-automatico
// 
// A API cron executa automaticamente a cada 5 minutos e é a implementação oficial
// do sistema de níveis automáticos do SementesPLAY.
//
// Para executar manualmente, use:
// curl -X POST "https://sementesplay.vercel.app/api/cron/promover-niveis-automatico?secret=CRON_SECRET"
//
// Para mais informações, consulte: CRON_PROMOCOES_README.md

/*
// CÓDIGO ORIGINAL COMENTADO - NÃO UTILIZAR

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function atualizarNiveis() {
  console.log('🔄 Iniciando atualização automática de níveis...')

  try {
    // Buscar apenas criadores com níveis específicos (excluindo admin nível 5)
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
          include: {
            conteudos: true,
            enquetes: true,
            recados: true
          }
        },
        doacoesRecebidas: true
      }
    })

    console.log(`📊 Encontrados ${criadores.length} criadores`)

    // Calcular pontuação composta para cada criador
    const criadoresComPontuacao = criadores.map(criador => {
      // Pontuação base: sementes recebidas (1 semente = 1 ponto)
      const sementesRecebidas = criador.doacoesRecebidas.reduce((total, doacao) => total + doacao.quantidade, 0)
      
      // Pontos por visualizações (conteúdos × 0.1)
      const pontosVisualizacoes = (criador.usuario.conteudos?.length || 0) * 0.1
      
      // Pontos por enquetes (quantidade × 5)
      const pontosEnquetes = (criador.usuario.enquetes?.length || 0) * 5
      
      // Pontos por recados públicos (quantidade × 2)
      const pontosRecados = (criador.usuario.recados?.length || 0) * 2
      
      // Pontos do campo pontuacao do usuário (se existir)
      const pontosUsuario = criador.usuario.pontuacao || 0
      
      // Pontuação total composta
      const pontuacaoTotal = sementesRecebidas + pontosVisualizacoes + pontosEnquetes + pontosRecados + pontosUsuario

      return {
        id: criador.usuario.id,
        nome: criador.usuario.nome,
        nivelAtual: criador.usuario.nivel,
        pontuacaoTotal,
        sementesRecebidas,
        pontosVisualizacoes,
        pontosEnquetes,
        pontosRecados,
        pontosUsuario
      }
    })

    // Ordenar por pontuação total (maior para menor)
    criadoresComPontuacao.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal)

    console.log('\n🏆 Ranking dos criadores:')
    criadoresComPontuacao.slice(0, 10).forEach((criador, index) => {
      console.log(`${index + 1}. ${criador.nome} - ${criador.pontuacaoTotal} pontos (${criador.nivelAtual})`)
    })

    // Atualizar níveis baseado na posição no ranking
    let atualizados = 0
    
    for (let i = 0; i < criadoresComPontuacao.length; i++) {
      const criador = criadoresComPontuacao[i]
      const posicao = i + 1
      let novoNivel = 'comum'
      
      // Definir nível baseado na posição
      if (posicao <= 50) {
        novoNivel = 'supremo'
      } else if (posicao <= 100) {
        novoNivel = 'parceiro'
      } else if (posicao <= 150) {
        novoNivel = 'criador'
      } else {
        novoNivel = 'comum'
      }

      // Só atualizar se o nível mudou
      if (criador.nivelAtual !== novoNivel) {
        await prisma.usuario.update({
          where: { id: criador.id },
          data: { nivel: novoNivel }
        })
        
        console.log(`✅ ${criador.nome}: ${criador.nivelAtual} → ${novoNivel} (posição #${posicao})`)
        atualizados++
      }
    }

    console.log(`\n🎉 Atualização concluída! ${atualizados} criadores tiveram seus níveis atualizados.`)

    // Estatísticas finais
    const estatisticas = {
      supremo: criadoresComPontuacao.filter(c => c.nivelAtual === 'supremo').length,
      parceiro: criadoresComPontuacao.filter(c => c.nivelAtual === 'parceiro').length,
      criador: criadoresComPontuacao.filter(c => c.nivelAtual === 'criador').length,
      comum: criadoresComPontuacao.filter(c => c.nivelAtual === 'comum').length
    }

    console.log('\n📈 Estatísticas finais:')
    console.log(`- Supremo: ${estatisticas.supremo}`)
    console.log(`- Parceiro: ${estatisticas.parceiro}`)
    console.log(`- Criador: ${estatisticas.criador}`)
    console.log(`- Comum: ${estatisticas.comum}`)
  } catch (error) {
    console.error('❌ Erro ao atualizar níveis:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  atualizarNiveis()
}

module.exports = { atualizarNiveis }

*/ 