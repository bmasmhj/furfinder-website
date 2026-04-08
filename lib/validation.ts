import { z } from 'zod'

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  display_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  consent_privacy: z.boolean(),
  consent_terms: z.boolean(),
  consent_ai: z.boolean(),
  consent_data_storage: z.boolean(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Pet Report Schemas
export const petReportSchema = z.object({
  status: z.enum(['lost', 'found', 'reunited']),
  pet_type: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
  pet_name: z.string().min(1, 'Pet name is required'),
  breed: z.string().optional(),
  size: z.enum(['small', 'medium', 'large', 'extra-large']).optional(),
  color: z.string().optional(),
  markings: z.string().optional(),
  photo_uri: z.string().url().optional(),
  photo_uris: z.array(z.string().url()).optional(),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  location_name: z.string().optional(),
  last_seen_date: z.string().optional(),
  reward: z.string().optional(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  show_contact_public: z.boolean().default(true),
})

// Pet Profile Schemas
export const petProfileSchema = z.object({
  pet_type: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
  pet_name: z.string().min(1, 'Pet name is required'),
  breed: z.string().optional(),
  size: z.enum(['small', 'medium', 'large', 'extra-large']).optional(),
  color: z.string().optional(),
  markings: z.string().optional(),
  photo_uris: z.array(z.string().url()).optional(),
  biometric_photo_uris: z.array(z.string().url()).optional(),
  microchip_number: z.string().optional(),
  medical_notes: z.string().optional(),
  suburb: z.string().optional(),
  owner_name: z.string().optional(),
  owner_phone: z.string().optional(),
})

// Message Schemas
export const messageSchema = z.object({
  conversation_id: z.string().uuid(),
  text: z.string().min(1, 'Message cannot be empty').max(5000),
})

export const conversationSchema = z.object({
  participant_id: z.string().uuid(),
  report_id: z.string().uuid().optional(),
})

// Helper function to validate and parse
export function validateData<T>(schema: z.ZodSchema, data: unknown): T {
  return schema.parse(data) as T
}

// Helper function to safely validate with error handling
export function safeValidateData<T>(
  schema: z.ZodSchema,
  data: unknown
): { success: boolean; data?: T; error?: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated as T }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Validation failed' }
  }
}
