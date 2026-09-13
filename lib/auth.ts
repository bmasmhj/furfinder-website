
// Alias for compatibility with route imports
export const generateToken = createToken;
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import { headers } from 'next/headers'
import { ApiError } from './api-errors'
import type { Secret, SignOptions } from 'jsonwebtoken'

const JWT_SECRET: Secret = process.env.SESSION_SECRET || 'thefurfinder-dev-secret'
const JWT_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN || '30d') as SignOptions['expiresIn']

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  phone: string;
  role: string;
}

export function createToken(user: AuthUser): string {
  return jwt.sign(
    user,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

export function verifyToken(token: string): AuthUser {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser
  } catch (error) {
    throw new ApiError(401, 'INVALID_TOKEN', 'Invalid or expired token')
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    return verifyToken(token)
  } catch (error) {
    return null
  }
}

export function generateAuthToken(user: AuthUser): string {
  return createToken(user)
}

export async function awardPremiumDays(userId: string, days: number, type: string, reason: string) {
  const { db } = await import('./db');
  const current = await db.query('SELECT premium_until FROM users WHERE id = $1', [userId]);
  const now = new Date();
  const currentPremium = current.rows[0]?.premium_until;
  const baseDate = (currentPremium && new Date(currentPremium) > now) ? new Date(currentPremium) : now;
  const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

  await db.query('UPDATE users SET premium_until = $1 WHERE id = $2', [newExpiry.toISOString(), userId]);
  await db.query(
    'INSERT INTO referral_rewards (user_id, type, days_awarded, reason) VALUES ($1, $2, $3, $4)',
    [userId, type, days, reason]
  );
}
