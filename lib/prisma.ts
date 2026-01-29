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

// Create Prisma Client only when DATABASE_URL is set (required by Prisma: { url: "CONNECTION_STRING" })
// At Vercel build time DATABASE_URL may be missing — avoid instantiating so build succeeds.
const connectionString = process.env.DATABASE_URL
export const prisma = PrismaClient && connectionString
  ? (globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: { url: connectionString },
      },
    }))
  : null

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma
}
