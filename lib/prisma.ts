// Prisma Client - only available if Prisma is set up
let PrismaClient: any
try {
  PrismaClient = require('@prisma/client').PrismaClient
} catch (e) {
  // Prisma not generated yet
  PrismaClient = null
}

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

// Create Prisma Client with connection pool settings
export const prisma = PrismaClient 
  ? (globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    }))
  : null

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma
}
