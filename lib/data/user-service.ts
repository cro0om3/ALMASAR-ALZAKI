import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  email: string
  name: string
  pinCode: string // hashed
  role: 'admin' | 'user' | 'manager'
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  email: string
  name: string
  pinCode: string
  role: 'admin' | 'user' | 'manager'
}

export interface UpdateUserInput {
  email?: string
  name?: string
  pinCode?: string
  role?: 'admin' | 'user' | 'manager'
}

// Helper to check if Prisma is available
const checkPrisma = () => {
  if (!prisma) {
    throw new Error('Prisma is not set up. Please run: npx prisma generate')
  }
}

// Hash PIN code
async function hashPinCode(pinCode: string): Promise<string> {
  return bcrypt.hash(pinCode, 10)
}

// Verify PIN code
async function verifyPinCode(pinCode: string, hashedPinCode: string): Promise<boolean> {
  return bcrypt.compare(pinCode, hashedPinCode)
}

export const userService = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    checkPrisma()
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true, // This is the hashed PIN
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as any[]
  },

  // Get user by ID
  getById: async (id: string): Promise<User | null> => {
    checkPrisma()
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return null
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      pinCode: user.password, // hashed
      role: user.role as 'admin' | 'user' | 'manager',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  },

  // Get user by email
  getByEmail: async (email: string): Promise<User | null> => {
    checkPrisma()
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return null
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      pinCode: user.password, // hashed
      role: user.role as 'admin' | 'user' | 'manager',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  },

  // Verify PIN code (search all users and find matching PIN)
  verifyPinCode: async (pinCode: string): Promise<User | null> => {
    checkPrisma()
    // Get all users
    const users = await prisma.user.findMany()
    
    // Try to find user with matching PIN code
    for (const user of users) {
      const isValid = await verifyPinCode(pinCode, user.password)
      if (isValid) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          pinCode: user.password,
          role: user.role as 'admin' | 'user' | 'manager',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      }
    }
    
    return null
  },

  // Create user
  create: async (data: CreateUserInput): Promise<User> => {
    checkPrisma()
    const hashedPinCode = await hashPinCode(data.pinCode)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPinCode,
        role: data.role,
      },
    })
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      pinCode: user.password,
      role: user.role as 'admin' | 'user' | 'manager',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  },

  // Update user
  update: async (id: string, data: UpdateUserInput): Promise<User> => {
    checkPrisma()
    const updateData: any = {}
    if (data.email) updateData.email = data.email
    if (data.name) updateData.name = data.name
    if (data.role) updateData.role = data.role
    if (data.pinCode) {
      updateData.password = await hashPinCode(data.pinCode)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      pinCode: user.password,
      role: user.role as 'admin' | 'user' | 'manager',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    checkPrisma()
    await prisma.user.delete({ where: { id } })
  },
}
