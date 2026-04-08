import { NextResponse } from 'next/server'

export interface ApiErrorResponse {
  success: false
  error: string
  code: string
  details?: any
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
} as const

export function errorResponse(
  statusCode: number,
  code: string,
  message: string,
  details?: any
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      ...(details && { details }),
    },
    { status: statusCode }
  )
}

export function successResponse<T>(data: T, statusCode = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: statusCode }
  )
}

export function handleError(error: any) {
  console.error('[API Error]', error)

  if (error instanceof ApiError) {
    return errorResponse(error.statusCode, error.code, error.message, error.details)
  }

  if (error instanceof Error) {
    return errorResponse(500, ERROR_CODES.INTERNAL_ERROR, error.message)
  }

  return errorResponse(500, ERROR_CODES.INTERNAL_ERROR, 'An unexpected error occurred')
}
