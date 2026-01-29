import { createServerClient } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  email: string
  name: string
  pinCode: string // hashed (stored as password in DB)
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

async function hashPinCode(pinCode: string): Promise<string> {
  return bcrypt.hash(pinCode, 10)
}

async function verifyPinCodePlain(pinCode: string, hashedPinCode: string): Promise<boolean> {
  return bcrypt.compare(pinCode, hashedPinCode)
}

function rowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    pinCode: row.password,
    role: (row.role || 'user') as 'admin' | 'user' | 'manager',
    createdAt: typeof row.createdAt === 'string' ? new Date(row.createdAt) : row.createdAt,
    updatedAt: typeof row.updatedAt === 'string' ? new Date(row.updatedAt) : row.updatedAt,
  }
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('createdAt', { ascending: false })
    if (error) throw new Error(error.message)
    return (data || []).map(rowToUser)
  },

  getById: async (id: string): Promise<User | null> => {
    const supabase = createServerClient()
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
    if (error || !data) return null
    return rowToUser(data)
  },

  getByEmail: async (email: string): Promise<User | null> => {
    const supabase = createServerClient()
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single()
    if (error || !data) return null
    return rowToUser(data)
  },

  verifyPinCode: async (pinCode: string): Promise<User | null> => {
    const supabase = createServerClient()
    const { data: users, error } = await supabase.from('users').select('*').limit(100)
    if (error || !users || users.length === 0) return null
    for (const user of users) {
      if (!user.password) continue
      try {
        const isValid = await verifyPinCodePlain(pinCode, user.password)
        if (isValid) return rowToUser(user)
      } catch {
        continue
      }
    }
    return null
  },

  create: async (data: CreateUserInput): Promise<User> => {
    const supabase = createServerClient()
    const hashedPin = await hashPinCode(data.pinCode)
    const now = new Date().toISOString()
    const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const row = {
      id,
      email: data.email,
      name: data.name,
      password: hashedPin,
      role: data.role,
      createdAt: now,
      updatedAt: now,
    }
    const { data: inserted, error } = await supabase.from('users').insert(row).select().single()
    if (error) throw new Error(error.message)
    return rowToUser(inserted)
  },

  update: async (id: string, data: UpdateUserInput): Promise<User> => {
    const supabase = createServerClient()
    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() }
    if (data.email != null) update.email = data.email
    if (data.name != null) update.name = data.name
    if (data.role != null) update.role = data.role
    if (data.pinCode) update.password = await hashPinCode(data.pinCode)
    const { data: updated, error } = await supabase
      .from('users')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return rowToUser(updated)
  },

  delete: async (id: string): Promise<void> => {
    const supabase = createServerClient()
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}
