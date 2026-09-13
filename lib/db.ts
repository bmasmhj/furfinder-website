import { Pool, QueryResult, type QueryResultRow } from 'pg'

let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return pool
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  const pool = getPool()
  try {
    const result = await pool.query<T>(sql, params)
    return result
  } catch (error) {
    console.error('[DB Error]', sql, params, error)
    throw error
  }
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const result = await query<T>(sql, params)
  return result.rows[0] || null
}

export async function queryMany<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const result = await query<T>(sql, params)
  return result.rows
}

export async function execute(
  sql: string,
  params: any[] = []
): Promise<number> {
  const result = await query(sql, params)
  return result.rowCount || 0
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// Alias for compatibility with route imports
export const db = { query, queryOne, queryMany, execute, closePool };
