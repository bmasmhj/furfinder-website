import { PetType, PetSize, PetStatus } from './types';
import Colors from '@/constants/colors';

export function getStatusColor(status: PetStatus): string {
  switch (status) {
    case 'lost': return Colors.lost;
    case 'found': return Colors.found;
    case 'reunited': return Colors.reunited;
  }
}

export function getStatusBg(status: PetStatus): string {
  switch (status) {
    case 'lost': return Colors.lostBg;
    case 'found': return Colors.foundBg;
    case 'reunited': return Colors.reunitedBg;
  }
}

export function getStatusLabel(status: PetStatus): string {
  switch (status) {
    case 'lost': return 'LOST';
    case 'found': return 'FOUND';
    case 'reunited': return 'REUNITED';
  }
}

export function getPetTypeIcon(type: PetType): string {
  switch (type) {
    case 'dog': return 'dog';
    case 'cat': return 'cat';
    case 'bird': return 'bird';
    case 'rabbit': return 'rabbit';
    case 'other': return 'paw';
  }
}

export function getSizeLabel(size: PetSize): string {
  switch (size) {
    case 'small': return 'Small';
    case 'medium': return 'Medium';
    case 'large': return 'Large';
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export function getDistanceText(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  if (d < 1) return `${Math.round(d * 1000)}m away`;
  return `${d.toFixed(1)}km away`;
}
