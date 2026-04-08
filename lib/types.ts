// User Types
export interface User {
  id: string
  email: string
  display_name: string
  phone?: string
  role: 'user' | 'admin' | 'moderator'
  consent_privacy: boolean
  consent_terms: boolean
  consent_ai: boolean
  consent_data_storage: boolean
  consent_date?: Date
  referral_code?: string
  referred_by?: string
  premium_until?: Date
  push_token?: string
  created_at: Date
}

// Pet Report Types
export type PetStatus = 'lost' | 'found' | 'reunited'
export type PetType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
export type PetSize = 'small' | 'medium' | 'large' | 'extra-large'

export interface PetReport {
  id: string
  user_id: string
  status: PetStatus
  pet_type: PetType
  pet_name: string
  breed: string
  size: PetSize
  color: string
  markings: string
  photo_uri: string
  photo_uris: string[]
  description: string
  latitude: number
  longitude: number
  location_name: string
  last_seen_date: string
  reward: string
  reward_pool: number
  contact_name: string
  contact_phone: string
  show_contact_public: boolean
  reunion_message?: string
  reunion_date?: Date
  is_boosted: boolean
  boosted_at?: Date
  boost_expires_at?: Date
  created_at: Date
}

export interface Comment {
  id: string
  report_id: string
  user_id?: string
  author: string
  text: string
  created_at: Date
}

export interface TimelineEvent {
  id: string
  report_id: string
  type: string
  description: string
  created_at: Date
}

// Pet Profile Types
export interface PetProfile {
  id: string
  user_id: string
  pet_type: PetType
  pet_name: string
  breed: string
  size: PetSize
  color: string
  markings: string
  photo_uris: string[]
  biometric_photo_uris: string[]
  microchip_number: string
  medical_notes: string
  suburb: string
  owner_name: string
  owner_phone: string
  created_at: Date
  updated_at: Date
}

// Notification Types
export type NotificationType =
  | 'match'
  | 'message'
  | 'report_update'
  | 'report_comment'
  | 'referral'
  | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  report_id?: string
  profile_id?: string
  read: boolean
  created_at: Date
}

// Message Types
export interface Conversation {
  id: string
  report_id?: string
  participant1_id: string
  participant2_id: string
  last_message_text: string
  last_message_at: Date
  created_at: Date
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  text: string
  read_at?: Date
  created_at: Date
}

// Organisation Types
export interface Organisation {
  id: string
  user_id: string
  name: string
  type: string
  abn?: string
  address: string
  phone: string
  email: string
  website?: string
  latitude: number
  longitude: number
  description?: string
  logo_uri?: string
  status: 'pending' | 'approved' | 'rejected'
  approved_at?: Date
  created_at: Date
}

export interface OrganisationAnimal {
  id: string
  org_id: string
  pet_type: PetType
  pet_name: string
  breed: string
  size: PetSize
  color: string
  markings: string
  photo_uris: string[]
  description: string
  intake_date?: Date
  intake_type: string
  microchip_number?: string
  desexed: boolean
  status: 'available' | 'adopted' | 'transferred'
  created_at: Date
  updated_at: Date
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    per_page: number
    total: number
    pages: number
  }
}

// Auth Types
export interface TokenPayload {
  sub: string
  email: string
  iat: number
  exp: number
}
