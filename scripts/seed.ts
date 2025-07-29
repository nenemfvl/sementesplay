import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar banco
  await prisma.notificacao.deleteMany()
  await prisma.semente.deleteMany()
  await prisma.doacao.deleteMany()
  await prisma.codigoCashback.deleteMany()
  await prisma.criador.deleteMany()
  await prisma.parceiro.deleteMany()
  await prisma.usuario.deleteMany()

  // Criar usuários de exemplo
  const senhaHash = await bcrypt.hash('123456', 12)

  // Usuários comuns
  const usuario1 = await prisma.usuario.create({
    data: {
      nome: 'João Silva',
      email: 'joao@email.com',
      senha: senhaHash,
      tipo: 'comum',
      sementes: 1500,
      nivel: 'comum',
      pontuacao: 100
    }
  })

  const usuario2 = await prisma.usuario.create({
    data: {
      nome: 'Maria Santos',
      email: 'maria@email.com',
      senha: senhaHash,
      tipo: 'comum',
      sementes: 800,
      nivel: 'comum',
      pontuacao: 50
    }
  })

  // Criadores
  const criador1 = await prisma.usuario.create({
    data: {
      nome: 'JoãoGamer',
      email: 'joaogamer@email.com',
      senha: senhaHash,
      tipo: 'usuario',
      sementes: 25000,
      nivel: 'criador-supremo',
      pontuacao: 5000
    }
  })

  const criador2 = await prisma.usuario.create({
    data: {
      nome: 'MariaStream',
      email: 'mariastream@email.com',
      senha: senhaHash,
      tipo: 'usuario',
      sementes: 22000,
      nivel: 'criador-supremo',
      pontuacao: 4500
    }
  })

  const criador3 = await prisma.usuario.create({
    data: {
      nome: 'PedroFiveM',
      email: 'pedrofivem@email.com',
      senha: senhaHash,
      tipo: 'usuario',
      sementes: 18000,
      nivel: 'criador-parceiro',
      pontuacao: 3000
    }
  })

  // Perfis de criadores
  await prisma.criador.create({
    data: {
      usuarioId: criador1.id,
      nome: 'JoãoGamer',
      bio: 'Criador de conteúdo FiveM e RP. Foco em gameplay e tutoriais.',
      categoria: 'FiveM',
      redesSociais: JSON.stringify({
        youtube: 'https://youtube.com/@joaogamer',
        twitch: 'https://twitch.tv/joaogamer',
        instagram: 'https://instagram.com/joaogamer'
      }),
      portfolio: JSON.stringify({
        descricao: 'Conteúdo focado em FiveM e RP',
        links: ['https://youtube.com/watch?v=exemplo1', 'https://twitch.tv/joaogamer']
      }),
      nivel: 'supremo',
      sementes: 25000,
      apoiadores: 150
    }
  })

  await prisma.criador.create({
    data: {
      usuarioId: criador2.id,
      nome: 'MariaStreamer',
      bio: 'Streamer e criadora de conteúdo gaming. Especialista em FiveM.',
      categoria: 'Streaming',
      redesSociais: JSON.stringify({
        youtube: 'https://youtube.com/@mariastreamer',
        twitch: 'https://twitch.tv/mariastreamer',
        instagram: 'https://instagram.com/mariastreamer'
      }),
      portfolio: JSON.stringify({
        descricao: 'Streaming e conteúdo gaming',
        links: ['https://youtube.com/watch?v=exemplo2', 'https://twitch.tv/mariastreamer']
      }),
      nivel: 'supremo',
      sementes: 22000,
      apoiadores: 120,
      doacoes: 22000
    }
  })

  await prisma.criador.create({
    data: {
      usuarioId: criador3.id,
      nome: 'PedroFiveM',
      bio: 'Desenvolvedor de mods FiveM e criador de conteúdo técnico.',
      categoria: 'Desenvolvimento',
      redesSociais: JSON.stringify({
        youtube: 'https://youtube.com/@pedrofivem',
        github: 'https://github.com/pedrofivem',
        instagram: 'https://instagram.com/pedrofivem'
      }),
      portfolio: JSON.stringify({
        descricao: 'Desenvolvimento de mods e tutoriais técnicos',
        links: ['https://youtube.com/watch?v=exemplo3', 'https://github.com/pedrofivem']
      }),
      nivel: 'parceiro',
      sementes: 18000,
      apoiadores: 95,
      doacoes: 18000
    }
  })

  // Parceiro
  const parceiro1 = await prisma.usuario.create({
    data: {
      nome: 'CidadeFiveM',
      email: 'cidade@email.com',
      senha: senhaHash,
      tipo: 'parceiro',
      sementes: 0,
      nivel: 'parceiro',
      pontuacao: 0
    }
  })

  await prisma.parceiro.create({
    data: {
      usuarioId: parceiro1.id,
      nomeCidade: 'Cidade FiveM RP',
      comissaoMensal: 500.00,
      totalVendas: 15000.00,
      codigosGerados: 50
    }
  })

  // Códigos de cashback
  await prisma.codigoCashback.createMany({
    data: [
      {
        parceiroId: (await prisma.parceiro.findFirst())!.id,
        codigo: 'WELCOME50',
        valor: 50,
        usado: false
      },
      {
        parceiroId: (await prisma.parceiro.findFirst())!.id,
        codigo: 'BONUS100',
        valor: 100,
        usado: false
      },
      {
        parceiroId: (await prisma.parceiro.findFirst())!.id,
        codigo: 'EXTRA200',
        valor: 200,
        usado: false
      },
      {
        parceiroId: (await prisma.parceiro.findFirst())!.id,
        codigo: 'GIFT500',
        valor: 500,
        usado: false
      },
      {
        parceiroId: (await prisma.parceiro.findFirst())!.id,
        codigo: 'CASH001',
        valor: 1000,
        usado: false
      },
      {
        parceiroId: (await prisma.parceiro.findFirst())!.id,
        codigo: 'CASH002',
        valor: 500,
        usado: false
      },
      {
        parceiroId: (await prisma.parceiro.findFirst())!.id,
        codigo: 'CASH003',
        valor: 2000,
        usado: false
      }
    ]
  })

  // Histórico de sementes
  await prisma.semente.createMany({
    data: [
      {
        usuarioId: usuario1.id,
        quantidade: 1500,
        tipo: 'gerada',
        descricao: 'Sementes iniciais'
      },
      {
        usuarioId: usuario2.id,
        quantidade: 800,
        tipo: 'gerada',
        descricao: 'Sementes iniciais'
      },
      {
        usuarioId: criador1.id,
        quantidade: 25000,
        tipo: 'gerada',
        descricao: 'Sementes iniciais'
      },
      {
        usuarioId: criador2.id,
        quantidade: 22000,
        tipo: 'gerada',
        descricao: 'Sementes iniciais'
      },
      {
        usuarioId: criador3.id,
        quantidade: 18000,
        tipo: 'gerada',
        descricao: 'Sementes iniciais'
      }
    ]
  })

  // Notificações de exemplo
  await prisma.notificacao.createMany({
    data: [
      {
        usuarioId: usuario1.id,
        tipo: 'sistema',
        titulo: 'Bem-vindo ao SementesPLAY!',
        mensagem: 'Sua conta foi criada com sucesso. Comece a explorar a plataforma!',
        lida: false
      },
      {
        usuarioId: criador1.id,
        tipo: 'doacao',
        titulo: 'Nova doação recebida!',
        mensagem: 'João Silva doou 100 Sementes para você!',
        lida: false
      }
    ]
  })

  console.log('✅ Seed concluído com sucesso!')
  console.log('📧 Emails de teste:')
  console.log('- joao@email.com (senha: 123456)')
  console.log('- joaogamer@email.com (senha: 123456)')
  console.log('- cidade@email.com (senha: 123456)')
  console.log('💳 Códigos de cashback: WELCOME50, BONUS100, EXTRA200, GIFT500, CASH001, CASH002, CASH003')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 