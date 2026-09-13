// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Report types
export const REPORT_TYPES = {
  LOST: 'lost',
  FOUND: 'found',
} as const;

export const PET_TYPES = {
  DOG: 'dog',
  CAT: 'cat',
  RABBIT: 'rabbit',
  BIRD: 'bird',
  OTHER: 'other',
} as const;

// Status
export const REPORT_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  REUNITED: 'reunited',
  INACTIVE: 'inactive',
} as const;

export const MATCH_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CONFIRMED: 'confirmed',
} as const;

// Notifications
export const NOTIFICATION_TYPES = {
  MATCH_FOUND: 'match_found',
  NEW_MESSAGE: 'new_message',
  REPORT_UPDATED: 'report_updated',
  REPORT_RESOLVED: 'report_resolved',
} as const;

// Pagination
export const ITEMS_PER_PAGE = 20;

// Messages
export const EMPTY_STATES = {
  NO_REPORTS: 'You haven\'t created any reports yet.',
  NO_MATCHES: 'No matches found yet. Check back soon!',
  NO_MESSAGES: 'No conversations yet.',
  NO_RESULTS: 'No results found.',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please log in to continue.',
  INVALID_INPUT: 'Please check your input and try again.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  REPORT_CREATED: 'Report created successfully.',
  REPORT_UPDATED: 'Report updated successfully.',
  REPORT_DELETED: 'Report deleted successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
} as const;
