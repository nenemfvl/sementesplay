const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function criarMissoesPadrao() {
  try {
    console.log('Criando missões padrão...')

    // Missões de doação
    const missoes = [
      {
        titulo: 'Primeira Doação',
        descricao: 'Faça sua primeira doação para um criador',
        tipo: 'doacao',
        objetivo: 1,
        recompensa: 0,
        emblema: '🎯',
        ativa: true
      },
      {
        titulo: 'Doador Frequente',
        descricao: 'Faça 10 doações para criadores',
        tipo: 'doacao',
        objetivo: 10,
        recompensa: 0,
        emblema: '🏆',
        ativa: true
      },
      {
        titulo: 'Apoiador de Criadores',
        descricao: 'Apoie 5 criadores diferentes',
        tipo: 'criadores_apoiados',
        objetivo: 5,
        recompensa: 0,
        emblema: '🌟',
        ativa: true
      },
      {
        titulo: 'Doador Generoso',
        descricao: 'Doe um total de 1000 Sementes',
        tipo: 'valor_doacao',
        objetivo: 1000,
        recompensa: 0,
        emblema: '💎',
        ativa: true
      }
    ]

    for (const missao of missoes) {
      const missaoExistente = await prisma.missao.findFirst({
        where: { titulo: missao.titulo }
      })

      if (!missaoExistente) {
        await prisma.missao.create({
          data: missao
        })
        console.log(`Missão criada: ${missao.titulo}`)
      } else {
        console.log(`Missão já existe: ${missao.titulo}`)
      }
    }

    // Criar conquistas correspondentes
    const conquistas = [
      {
        titulo: 'Primeira Doação',
        descricao: 'Realizou sua primeira doação',
        icone: '🎯',
        criterio: '1 doação',
        tipo: 'unica',
        ativa: true
      },
      {
        titulo: 'Doador Frequente',
        descricao: 'Realizou 10 doações',
        icone: '🏆',
        criterio: '10 doações',
        tipo: 'unica',
        ativa: true
      },
      {
        titulo: 'Apoiador de Criadores',
        descricao: 'Apoiou 5 criadores diferentes',
        icone: '🌟',
        criterio: '5 criadores diferentes',
        tipo: 'unica',
        ativa: true
      }
    ]

    for (const conquista of conquistas) {
      const conquistaExistente = await prisma.conquista.findFirst({
        where: { titulo: conquista.titulo }
      })

      if (!conquistaExistente) {
        await prisma.conquista.create({
          data: conquista
        })
        console.log(`Conquista criada: ${conquista.titulo}`)
      } else {
        console.log(`Conquista já existe: ${conquista.titulo}`)
      }
    }

    console.log('Missões e conquistas padrão criadas com sucesso!')
  } catch (error) {
    console.error('Erro ao criar missões padrão:', error)
  } finally {
    await prisma.$disconnect()
  }
}

criarMissoesPadrao() 