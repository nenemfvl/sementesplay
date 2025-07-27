import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
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
    console.log('Prisma conectado com sucesso')
  })
  .catch((error) => {
    console.error('Erro ao conectar com Prisma:', error)
  })

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
}) 