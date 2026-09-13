// Alias for compatibility with route imports
export const handleApiError = handleError;
import { NextResponse } from 'next/server'

export interface ApiErrorResponse {
  success: false
  error: string
  code: string
  details?: any
}

export class ApiError extends Error {
  public statusCode: number
  public code: string
  public details?: any

  constructor(statusCode: number, code: string, message: string, details?: any)
  constructor(message: string, statusCode?: number, code?: string, details?: any)
  constructor(
    statusCodeOrMessage: number | string,
    codeOrStatusCode?: string | number,
    messageOrCode?: string,
    details?: any
  ) {
    const statusCode =
      typeof statusCodeOrMessage === 'number'
        ? statusCodeOrMessage
        : typeof codeOrStatusCode === 'number'
          ? codeOrStatusCode
          : 500

    const message =
      typeof statusCodeOrMessage === 'string'
        ? statusCodeOrMessage
        : messageOrCode ?? 'An unexpected error occurred'

    const code =
      typeof statusCodeOrMessage === 'number'
        ? typeof codeOrStatusCode === 'string'
          ? codeOrStatusCode
          : ERROR_CODES.INTERNAL_ERROR
        : messageOrCode ?? ERROR_CODES.INTERNAL_ERROR

    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
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
      message, // Re-added for mobile app compatibility
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
