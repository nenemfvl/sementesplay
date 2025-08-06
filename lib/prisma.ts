import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Tratamento de erro para conexões
prisma.$connect()
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Prisma conectado com sucesso')
    }
  })
  .catch((error) => {
    console.error('Erro ao conectar com Prisma:', error)
  })

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
}) 