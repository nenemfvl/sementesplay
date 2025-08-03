const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const missoesGamificacao = [
  // 🎯 MISSÕES DIÁRIAS
  {
    titulo: 'Login Diário',
    descricao: 'Faça login por 7 dias consecutivos',
    tipo: 'diaria',
    objetivo: 7,
    recompensa: 10,
    emblema: '🔥'
  },
  {
    titulo: 'Explorador',
    descricao: 'Visite 3 páginas diferentes',
    tipo: 'diaria',
    objetivo: 3,
    recompensa: 15,
    emblema: '🗺️'
  },
  {
    titulo: 'Social',
    descricao: 'Adicione 1 novo amigo',
    tipo: 'diaria',
    objetivo: 1,
    recompensa: 20,
    emblema: '👥'
  },
  {
    titulo: 'Doador Diário',
    descricao: 'Faça 1 doação',
    tipo: 'diaria',
    objetivo: 1,
    recompensa: 25,
    emblema: '💝'
  },

  // 📅 MISSÕES SEMANAIS
  {
    titulo: 'Doador Semanal',
    descricao: 'Faça 5 doações',
    tipo: 'semanal',
    objetivo: 5,
    recompensa: 100,
    emblema: '💎'
  },
  {
    titulo: 'Apoiador',
    descricao: 'Doe para 3 criadores diferentes',
    tipo: 'semanal',
    objetivo: 3,
    recompensa: 75,
    emblema: '🤝'
  },
  {
    titulo: 'Social Ativo',
    descricao: 'Adicione 5 novos amigos',
    tipo: 'semanal',
    objetivo: 5,
    recompensa: 50,
    emblema: '🌟'
  },
  {
    titulo: 'Explorador',
    descricao: 'Visite todas as seções do site',
    tipo: 'semanal',
    objetivo: 8,
    recompensa: 60,
    emblema: '🔍'
  },

  // 🌟 MISSÕES MENSAIS
  {
    titulo: 'Doador Mensal',
    descricao: 'Faça 20 doações',
    tipo: 'mensal',
    objetivo: 20,
    recompensa: 300,
    emblema: '👑'
  },
  {
    titulo: 'Apoiador Fiel',
    descricao: 'Doe para 10 criadores diferentes',
    tipo: 'mensal',
    objetivo: 10,
    recompensa: 250,
    emblema: '🏆'
  },
  {
    titulo: 'Comunidade',
    descricao: 'Adicione 20 novos amigos',
    tipo: 'mensal',
    objetivo: 20,
    recompensa: 200,
    emblema: '🌍'
  },
  {
    titulo: 'Explorador Completo',
    descricao: 'Visite todas as páginas',
    tipo: 'mensal',
    objetivo: 15,
    recompensa: 150,
    emblema: '🎯'
  },

  // ⭐ MISSÕES ÚNICAS (ESPECIAIS)
  {
    titulo: 'Primeira Doação',
    descricao: 'Faça sua primeira doação',
    tipo: 'unica',
    objetivo: 1,
    recompensa: 100,
    emblema: '💖'
  },
  {
    titulo: 'Primeiro Amigo',
    descricao: 'Adicione seu primeiro amigo',
    tipo: 'unica',
    objetivo: 1,
    recompensa: 50,
    emblema: '🤗'
  },
  {
    titulo: 'Primeiro Comentário',
    descricao: 'Deixe seu primeiro comentário',
    tipo: 'unica',
    objetivo: 1,
    recompensa: 25,
    emblema: '💬'
  },
  {
    titulo: 'Explorador Iniciante',
    descricao: 'Visite 5 páginas diferentes',
    tipo: 'unica',
    objetivo: 5,
    recompensa: 75,
    emblema: '🧭'
  },

  // 🔥 MISSÕES DE STREAK
  {
    titulo: 'Login Streak 7',
    descricao: '7 dias consecutivos de login',
    tipo: 'unica',
    objetivo: 7,
    recompensa: 100,
    emblema: '🔥'
  },
  {
    titulo: 'Login Streak 30',
    descricao: '30 dias consecutivos de login',
    tipo: 'unica',
    objetivo: 30,
    recompensa: 500,
    emblema: '🔥🔥'
  },
  {
    titulo: 'Login Streak 100',
    descricao: '100 dias consecutivos de login',
    tipo: 'unica',
    objetivo: 100,
    recompensa: 1000,
    emblema: '🔥🔥🔥'
  },

  // 🏅 MISSÕES DE CONQUISTA
  {
    titulo: 'Doador Bronze',
    descricao: '10 doações totais',
    tipo: 'unica',
    objetivo: 10,
    recompensa: 200,
    emblema: '🥉'
  },
  {
    titulo: 'Doador Prata',
    descricao: '50 doações totais',
    tipo: 'unica',
    objetivo: 50,
    recompensa: 500,
    emblema: '🥈'
  },
  {
    titulo: 'Doador Ouro',
    descricao: '100 doações totais',
    tipo: 'unica',
    objetivo: 100,
    recompensa: 1000,
    emblema: '🥇'
  },
  {
    titulo: 'Doador Diamante',
    descricao: '500 doações totais',
    tipo: 'unica',
    objetivo: 500,
    recompensa: 2500,
    emblema: '💎'
  },

  // 🎮 MISSÕES INTERATIVAS
  {
    titulo: 'Compartilhador',
    descricao: 'Compartilhe 5 conteúdos',
    tipo: 'unica',
    objetivo: 5,
    recompensa: 50,
    emblema: '📤'
  },
  {
    titulo: 'Curtidor',
    descricao: 'Curta 20 conteúdos',
    tipo: 'unica',
    objetivo: 20,
    recompensa: 30,
    emblema: '👍'
  },
  {
    titulo: 'Favoritos',
    descricao: 'Adicione 10 criadores aos favoritos',
    tipo: 'unica',
    objetivo: 10,
    recompensa: 40,
    emblema: '⭐'
  },

  // 📊 MISSÕES DE NÍVEL
  {
    titulo: 'Nível 5',
    descricao: 'Alcance o nível 5',
    tipo: 'unica',
    objetivo: 5,
    recompensa: 100,
    emblema: '🌱'
  },
  {
    titulo: 'Nível 10',
    descricao: 'Alcance o nível 10',
    tipo: 'unica',
    objetivo: 10,
    recompensa: 200,
    emblema: '🌿'
  },
  {
    titulo: 'Nível 25',
    descricao: 'Alcance o nível 25',
    tipo: 'unica',
    objetivo: 25,
    recompensa: 500,
    emblema: '🌳'
  },
  {
    titulo: 'Nível 50',
    descricao: 'Alcance o nível 50',
    tipo: 'unica',
    objetivo: 50,
    recompensa: 1000,
    emblema: '🏔️'
  }
]

async function criarMissoesGamificacao() {
  try {
    console.log('🔄 Criando missões de gamificação...')

    for (const missao of missoesGamificacao) {
      // Verificar se a missão já existe
      const existe = await prisma.missao.findFirst({
        where: {
          titulo: missao.titulo
        }
      })

      if (!existe) {
        await prisma.missao.create({
          data: {
            titulo: missao.titulo,
            descricao: missao.descricao,
            tipo: missao.tipo,
            objetivo: missao.objetivo,
            recompensa: missao.recompensa,
            emblema: missao.emblema,
            ativa: true,
            criadorOnly: false
          }
        })
        console.log(`✅ Criada missão: ${missao.titulo} (${missao.tipo})`)
      } else {
        console.log(`⏭️  Missão já existe: ${missao.titulo}`)
      }
    }

    console.log('🎉 Missões de gamificação criadas com sucesso!')
    console.log(`📊 Total de missões: ${missoesGamificacao.length}`)
    
    // Estatísticas por tipo
    const stats = missoesGamificacao.reduce((acc, missao) => {
      acc[missao.tipo] = (acc[missao.tipo] || 0) + 1
      return acc
    }, {})
    
    console.log('📈 Distribuição por tipo:')
    Object.entries(stats).forEach(([tipo, quantidade]) => {
      console.log(`   ${tipo}: ${quantidade} missões`)
    })

  } catch (error) {
    console.error('❌ Erro ao criar missões:', error)
  } finally {
    await prisma.$disconnect()
  }
}

criarMissoesGamificacao() 