import { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { PetReport, PetStatus, PetProfile, Comment, TimelineEvent, PetNotification } from './types';

const REPORTS_KEY = '@pet_reports';
const PROFILES_KEY = '@pet_profiles';
const NOTIFICATIONS_KEY = '@pet_notifications';

const SAMPLE_REPORTS: PetReport[] = [
  {
    id: 'sample-1',
    status: 'lost',
    petType: 'dog',
    petName: 'Buddy',
    breed: 'Golden Retriever',
    size: 'large',
    color: 'Golden',
    markings: 'White patch on chest',
    photoUri: '',
    photoUris: [],
    description: 'Friendly golden retriever, responds to name. Wearing blue collar with tag.',
    latitude: -33.8688,
    longitude: 151.2093,
    locationName: 'Sydney CBD',
    lastSeenDate: '2026-02-20',
    reward: '$200',
    rewardPool: 0,
    contactName: 'Sarah M.',
    contactPhone: '0412 345 678',
    createdAt: '2026-02-20T10:30:00Z',
    isOwner: false,
    comments: [
      { id: 'c1', author: 'Mike D.', text: 'I think I saw a golden retriever near Hyde Park yesterday afternoon!', createdAt: '2026-02-20T14:00:00Z' },
    ],
    timeline: [
      { id: 't1', type: 'created', description: 'Report created by Sarah M.', createdAt: '2026-02-20T10:30:00Z' },
      { id: 't2', type: 'sighting', description: 'Possible sighting reported near Hyde Park', createdAt: '2026-02-20T14:00:00Z' },
    ],
  },
  {
    id: 'sample-2',
    status: 'found',
    petType: 'cat',
    petName: 'Unknown',
    breed: 'Tabby',
    size: 'small',
    color: 'Grey with stripes',
    markings: 'White paws',
    photoUri: '',
    photoUris: [],
    description: 'Found hiding under a car. Very timid but friendly once approached. No collar.',
    latitude: -33.8750,
    longitude: 151.2100,
    locationName: 'Darling Harbour',
    lastSeenDate: '2026-02-19',
    reward: '',
    rewardPool: 0,
    contactName: 'James K.',
    contactPhone: '0423 456 789',
    createdAt: '2026-02-19T15:45:00Z',
    isOwner: false,
    comments: [],
    timeline: [
      { id: 't3', type: 'created', description: 'Report created by James K.', createdAt: '2026-02-19T15:45:00Z' },
    ],
  },
  {
    id: 'sample-3',
    status: 'lost',
    petType: 'dog',
    petName: 'Max',
    breed: 'Border Collie',
    size: 'medium',
    color: 'Black and white',
    markings: 'Half white face',
    photoUri: '',
    photoUris: [],
    description: 'Very energetic, might be scared. Microchipped. Please contact ASAP.',
    latitude: -33.8600,
    longitude: 151.2050,
    locationName: 'The Rocks',
    lastSeenDate: '2026-02-21',
    reward: '$500',
    rewardPool: 0,
    contactName: 'Emma L.',
    contactPhone: '0434 567 890',
    createdAt: '2026-02-21T08:15:00Z',
    isOwner: false,
    comments: [],
    timeline: [
      { id: 't4', type: 'created', description: 'Report created by Emma L.', createdAt: '2026-02-21T08:15:00Z' },
    ],
  },
  {
    id: 'sample-4',
    status: 'found',
    petType: 'rabbit',
    petName: 'Unknown',
    breed: 'Holland Lop',
    size: 'small',
    color: 'White and brown',
    markings: 'Floppy ears',
    photoUri: '',
    photoUris: [],
    description: 'Found in backyard garden. Very tame, likely someone\'s pet.',
    latitude: -33.8800,
    longitude: 151.2150,
    locationName: 'Surry Hills',
    lastSeenDate: '2026-02-18',
    reward: '',
    rewardPool: 0,
    contactName: 'Tom R.',
    contactPhone: '0445 678 901',
    createdAt: '2026-02-18T12:00:00Z',
    isOwner: false,
    comments: [],
    timeline: [
      { id: 't5', type: 'created', description: 'Report created by Tom R.', createdAt: '2026-02-18T12:00:00Z' },
    ],
  },
];

function migrateReport(r: any): PetReport {
  return {
    ...r,
    photoUris: r.photoUris || (r.photoUri ? [r.photoUri] : []),
    comments: r.comments || [],
    timeline: r.timeline || [{ id: `t-${r.id}`, type: 'created', description: 'Report created', createdAt: r.createdAt }],
    rewardPool: r.rewardPool || 0,
  };
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const NEARBY_RADIUS_KM = 10;

interface PetContextValue {
  reports: PetReport[];
  myReports: PetReport[];
  addReport: (report: Omit<PetReport, 'id' | 'createdAt' | 'comments' | 'timeline' | 'rewardPool'>) => Promise<void>;
  updateReport: (id: string, updates: Partial<PetReport>) => Promise<void>;
  updateReportStatus: (id: string, status: PetStatus) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  getReport: (id: string) => PetReport | undefined;
  addComment: (reportId: string, author: string, text: string) => Promise<void>;
  addRewardContribution: (reportId: string, amount: number) => Promise<void>;
  profiles: PetProfile[];
  addProfile: (profile: Omit<PetProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PetProfile>;
  updateProfile: (id: string, updates: Partial<PetProfile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  getProfile: (id: string) => PetProfile | undefined;
  notifications: PetNotification[];
  unreadCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  isLoading: boolean;
}

const PetContext = createContext<PetContextValue | null>(null);

export function PetProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<PetReport[]>([]);
  const [profiles, setProfiles] = useState<PetProfile[]>([]);
  const [notifications, setNotifications] = useState<PetNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedReports, storedProfiles, storedNotifications] = await Promise.all([
        AsyncStorage.getItem(REPORTS_KEY),
        AsyncStorage.getItem(PROFILES_KEY),
        AsyncStorage.getItem(NOTIFICATIONS_KEY),
      ]);

      if (storedReports) {
        const parsed = JSON.parse(storedReports);
        setReports(parsed.map(migrateReport));
      } else {
        setReports(SAMPLE_REPORTS);
        await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(SAMPLE_REPORTS));
      }

      if (storedProfiles) {
        setProfiles(JSON.parse(storedProfiles));
      }

      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    } catch (e) {
      console.error('Failed to load data', e);
      setReports(SAMPLE_REPORTS);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReports = async (updated: PetReport[]) => {
    try {
      await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save reports', e);
    }
  };

  const saveProfiles = async (updated: PetProfile[]) => {
    try {
      await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save profiles', e);
    }
  };

  const saveNotifications = async (updated: PetNotification[]) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  };

  const generateNearbyAlerts = useCallback((newReport: PetReport, currentProfiles: PetProfile[], currentReports: PetReport[]) => {
    const newNotifications: PetNotification[] = [];
    const now = new Date().toISOString();

    if (newReport.status === 'lost') {
      currentProfiles.forEach(profile => {
        const locationName = newReport.locationName.toLowerCase();
        const suburb = profile.suburb.toLowerCase();
        const sameArea = suburb && locationName && (
          locationName.includes(suburb) ||
          suburb.includes(locationName) ||
          locationName.split(',').some(part => suburb.includes(part.trim())) ||
          suburb.split(',').some(part => locationName.includes(part.trim()))
        );

        if (sameArea || profile.petType === newReport.petType) {
          newNotifications.push({
            id: Crypto.randomUUID(),
            type: 'lost_nearby',
            title: `Lost ${newReport.petType} near ${newReport.locationName}`,
            message: `A ${newReport.color} ${newReport.breed} named "${newReport.petName}" has been reported lost near ${newReport.locationName}. Keep an eye out for this pet!`,
            reportId: newReport.id,
            profileId: profile.id,
            read: false,
            createdAt: now,
          });
        }
      });

      currentReports.forEach(report => {
        if (report.id === newReport.id) return;
        if (report.status !== 'found') return;
        if (report.petType !== newReport.petType) return;

        const distance = getDistanceKm(
          newReport.latitude, newReport.longitude,
          report.latitude, report.longitude
        );

        if (distance <= NEARBY_RADIUS_KM) {
          newNotifications.push({
            id: Crypto.randomUUID(),
            type: 'match_found',
            title: `Possible match found!`,
            message: `A found ${report.breed} (${report.color}) was reported ${distance.toFixed(1)}km from where "${newReport.petName}" went missing. Could this be a match?`,
            reportId: newReport.id,
            read: false,
            createdAt: now,
          });
        }
      });
    }

    if (newReport.status === 'found') {
      currentReports.forEach(report => {
        if (report.id === newReport.id) return;
        if (report.status !== 'lost') return;
        if (report.petType !== newReport.petType) return;

        const distance = getDistanceKm(
          newReport.latitude, newReport.longitude,
          report.latitude, report.longitude
        );

        if (distance <= NEARBY_RADIUS_KM) {
          newNotifications.push({
            id: Crypto.randomUUID(),
            type: 'found_nearby',
            title: `Found ${newReport.petType} near a lost report`,
            message: `A ${newReport.color} ${newReport.breed} was found near ${newReport.locationName}, ${distance.toFixed(1)}km from where "${report.petName}" was reported lost.`,
            reportId: report.id,
            read: false,
            createdAt: now,
          });
        }
      });
    }

    return newNotifications;
  }, []);

  const addReport = useCallback(async (report: Omit<PetReport, 'id' | 'createdAt' | 'comments' | 'timeline' | 'rewardPool'>) => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    const newReport: PetReport = {
      ...report,
      id,
      createdAt: now,
      comments: [],
      timeline: [{ id: Crypto.randomUUID(), type: 'created', description: `Report created by ${report.contactName}`, createdAt: now }],
      rewardPool: 0,
    };
    const updated = [newReport, ...reports];
    setReports(updated);
    await saveReports(updated);

    const alerts = generateNearbyAlerts(newReport, profiles, reports);
    if (alerts.length > 0) {
      const updatedNotifications = [...alerts, ...notifications];
      setNotifications(updatedNotifications);
      await saveNotifications(updatedNotifications);
    }
  }, [reports, profiles, notifications, generateNearbyAlerts]);

  const updateReport = useCallback(async (id: string, updates: Partial<PetReport>) => {
    const updated = reports.map(r => r.id === id ? { ...r, ...updates } : r);
    setReports(updated);
    await saveReports(updated);
  }, [reports]);

  const updateReportStatus = useCallback(async (id: string, status: PetStatus) => {
    const updated = reports.map(r => {
      if (r.id !== id) return r;
      const event: TimelineEvent = {
        id: Crypto.randomUUID(),
        type: 'status_change',
        description: `Status changed to ${status}`,
        createdAt: new Date().toISOString(),
      };
      return { ...r, status, timeline: [...(r.timeline || []), event] };
    });
    setReports(updated);
    await saveReports(updated);
  }, [reports]);

  const deleteReport = useCallback(async (id: string) => {
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    await saveReports(updated);
  }, [reports]);

  const getReport = useCallback((id: string) => {
    return reports.find(r => r.id === id);
  }, [reports]);

  const addComment = useCallback(async (reportId: string, author: string, text: string) => {
    const now = new Date().toISOString();
    const comment: Comment = { id: Crypto.randomUUID(), author, text, createdAt: now };
    const timelineEvent: TimelineEvent = {
      id: Crypto.randomUUID(),
      type: 'comment',
      description: `${author} commented: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`,
      createdAt: now,
    };
    const updated = reports.map(r => {
      if (r.id !== reportId) return r;
      return {
        ...r,
        comments: [...(r.comments || []), comment],
        timeline: [...(r.timeline || []), timelineEvent],
      };
    });
    setReports(updated);
    await saveReports(updated);
  }, [reports]);

  const addRewardContribution = useCallback(async (reportId: string, amount: number) => {
    const now = new Date().toISOString();
    const timelineEvent: TimelineEvent = {
      id: Crypto.randomUUID(),
      type: 'sighting',
      description: `$${amount} added to reward pool`,
      createdAt: now,
    };
    const updated = reports.map(r => {
      if (r.id !== reportId) return r;
      return {
        ...r,
        rewardPool: (r.rewardPool || 0) + amount,
        timeline: [...(r.timeline || []), timelineEvent],
      };
    });
    setReports(updated);
    await saveReports(updated);
  }, [reports]);

  const addProfile = useCallback(async (profile: Omit<PetProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProfile: PetProfile = {
      ...profile,
      id: Crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newProfile, ...profiles];
    setProfiles(updated);
    await saveProfiles(updated);
    return newProfile;
  }, [profiles]);

  const updateProfile = useCallback(async (id: string, updates: Partial<PetProfile>) => {
    const updated = profiles.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    setProfiles(updated);
    await saveProfiles(updated);
  }, [profiles]);

  const deleteProfile = useCallback(async (id: string) => {
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    await saveProfiles(updated);
  }, [profiles]);

  const getProfile = useCallback((id: string) => {
    return profiles.find(p => p.id === id);
  }, [profiles]);

  const markNotificationRead = useCallback(async (notifId: string) => {
    const updated = notifications.map(n => n.id === notifId ? { ...n, read: true } : n);
    setNotifications(updated);
    await saveNotifications(updated);
  }, [notifications]);

  const markAllNotificationsRead = useCallback(async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    await saveNotifications(updated);
  }, [notifications]);

  const clearNotifications = useCallback(async () => {
    setNotifications([]);
    await saveNotifications([]);
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const myReports = useMemo(() => reports.filter(r => r.isOwner), [reports]);

  const value = useMemo(() => ({
    reports,
    myReports,
    addReport,
    updateReport,
    updateReportStatus,
    deleteReport,
    getReport,
    addComment,
    addRewardContribution,
    profiles,
    addProfile,
    updateProfile,
    deleteProfile,
    getProfile,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    isLoading,
  }), [reports, myReports, addReport, updateReport, updateReportStatus, deleteReport, getReport, addComment, addRewardContribution, profiles, addProfile, updateProfile, deleteProfile, getProfile, notifications, unreadCount, markNotificationRead, markAllNotificationsRead, clearNotifications, isLoading]);

  return (
    <PetContext.Provider value={value}>
      {children}
    </PetContext.Provider>
  );
}

export function usePets() {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePets must be used within a PetProvider');
  }
  return context;
}
