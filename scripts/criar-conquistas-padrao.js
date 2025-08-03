const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const conquistasPadrao = [
  // Conquistas de Login
  {
    titulo: 'Primeiro Login',
    descricao: 'Faça seu primeiro login na plataforma',
    icone: '🌟',
    criterio: '1',
    recompensaXp: 50,
    tipo: 'unica'
  },
  {
    titulo: 'Login Diário',
    descricao: 'Faça login por 7 dias consecutivos',
    icone: '🔥',
    criterio: '7',
    recompensaXp: 100,
    tipo: 'diaria'
  },
  {
    titulo: 'Viciado em Login',
    descricao: 'Faça login por 30 dias consecutivos',
    icone: '💎',
    criterio: '30',
    recompensaXp: 500,
    tipo: 'diaria'
  },

  // Conquistas de Doação
  {
    titulo: 'Primeira Doação',
    descricao: 'Faça sua primeira doação',
    icone: '💝',
    criterio: '1',
    recompensaXp: 100,
    tipo: 'unica'
  },
  {
    titulo: 'Doador Generoso',
    descricao: 'Faça 10 doações',
    icone: '🎁',
    criterio: '10',
    recompensaXp: 200,
    tipo: 'unica'
  },
  {
    titulo: 'Benfeitor',
    descricao: 'Faça 50 doações',
    icone: '👑',
    criterio: '50',
    recompensaXp: 500,
    tipo: 'unica'
  },

  // Conquistas de Missões
  {
    titulo: 'Primeira Missão',
    descricao: 'Complete sua primeira missão',
    icone: '🎯',
    criterio: '1',
    recompensaXp: 75,
    tipo: 'unica'
  },
  {
    titulo: 'Caçador de Missões',
    descricao: 'Complete 10 missões',
    icone: '🏆',
    criterio: '10',
    recompensaXp: 150,
    tipo: 'unica'
  },
  {
    titulo: 'Mestre das Missões',
    descricao: 'Complete 50 missões',
    icone: '⭐',
    criterio: '50',
    recompensaXp: 300,
    tipo: 'unica'
  },

  // Conquistas de Nível
  {
    titulo: 'Iniciante',
    descricao: 'Alcance o nível 5',
    icone: '🌱',
    criterio: '5',
    recompensaXp: 100,
    tipo: 'unica'
  },
  {
    titulo: 'Experiente',
    descricao: 'Alcance o nível 10',
    icone: '🌿',
    criterio: '10',
    recompensaXp: 200,
    tipo: 'unica'
  },
  {
    titulo: 'Veterano',
    descricao: 'Alcance o nível 20',
    icone: '🌳',
    criterio: '20',
    recompensaXp: 400,
    tipo: 'unica'
  },
  {
    titulo: 'Lendário',
    descricao: 'Alcance o nível 50',
    icone: '🏔️',
    criterio: '50',
    recompensaXp: 1000,
    tipo: 'unica'
  },

  // Conquistas de XP
  {
    titulo: 'Primeiros Passos',
    descricao: 'Acumule 100 XP',
    icone: '📈',
    criterio: '100',
    recompensaXp: 50,
    tipo: 'unica'
  },
  {
    titulo: 'Em Crescimento',
    descricao: 'Acumule 500 XP',
    icone: '📊',
    criterio: '500',
    recompensaXp: 100,
    tipo: 'unica'
  },
  {
    titulo: 'Experiência Máxima',
    descricao: 'Acumule 1000 XP',
    icone: '🚀',
    criterio: '1000',
    recompensaXp: 200,
    tipo: 'unica'
  }
]

async function criarConquistas() {
  try {
    console.log('🔄 Criando conquistas padrão...')

    for (const conquista of conquistasPadrao) {
      // Verificar se a conquista já existe
      const existe = await prisma.conquista.findFirst({
        where: {
          titulo: conquista.titulo
        }
      })

      if (!existe) {
        await prisma.conquista.create({
          data: conquista
        })
        console.log(`✅ Criada conquista: ${conquista.titulo}`)
      } else {
        console.log(`⏭️  Conquista já existe: ${conquista.titulo}`)
      }
    }

    console.log('🎉 Conquistas padrão criadas com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao criar conquistas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

criarConquistas() 