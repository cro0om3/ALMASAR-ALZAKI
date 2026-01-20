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

export const prisma = PrismaClient 
  ? (globalForPrisma.prisma ?? new PrismaClient())
  : null

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma
}
