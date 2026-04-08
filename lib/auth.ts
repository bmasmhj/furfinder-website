import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import { headers } from 'next/headers'
import type { TokenPayload } from './types'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

export function createToken(userId: string, email: string): string {
  return jwt.sign(
    {
      sub: userId,
      email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    return null
  }
}

export async function getCurrentUser() {
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload) {
      return null
    }

    return {
      id: payload.sub,
      email: payload.email,
    }
  } catch (error) {
    return null
  }
}

export function generateAuthToken(userId: string, email: string): string {
  return createToken(userId, email)
}
