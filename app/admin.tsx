import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/lib/auth-context';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';

interface PendingOrg {
  id: string;
  name: string;
  type: 'vet' | 'shelter' | 'rescue';
  abn?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  createdAt: string;
  registrantName?: string;
  registrantEmail?: string;
}

export default function AdminScreen() {
  const Colors = useTheme();
  const styles = getStyles(Colors);
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const [pendingOrgs, setPendingOrgs] = useState<PendingOrg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const webTopPadding = Platform.OS === 'web' ? 67 : 0;
  const webBottomPadding = Platform.OS === 'web' ? 34 : 0;

  const fetchPendingOrgs = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const baseUrl = getApiUrl();
      const res = await fetch(new URL('/api/admin/org/pending', baseUrl).toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingOrgs(Array.isArray(data) ? data : []);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPendingOrgs();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchPendingOrgs]);

  const handleApprove = async (orgId: string, orgName: string) => {
    setActionLoading(orgId);
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL(`/api/admin/org/${orgId}/approve`, baseUrl).toString(), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPendingOrgs(prev => prev.filter(o => o.id !== orgId));
        Alert.alert('Approved', `${orgName} has been approved.`);
      } else {
        Alert.alert('Error', 'Failed to approve organisation.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (orgId: string, orgName: string) => {
    Alert.alert(
      'Reject Organisation',
      `Are you sure you want to reject "${orgName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(orgId);
            try {
              const baseUrl = getApiUrl();
              const res = await fetch(new URL(`/api/admin/org/${orgId}/reject`, baseUrl).toString(), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                setPendingOrgs(prev => prev.filter(o => o.id !== orgId));
                Alert.alert('Rejected', `${orgName} has been rejected.`);
              } else {
                Alert.alert('Error', 'Failed to reject organisation.');
              }
            } catch {
              Alert.alert('Error', 'Something went wrong.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vet': return 'Veterinary Clinic';
      case 'shelter': return 'Animal Shelter';
      case 'rescue': return 'Rescue Organisation';
      default: return type;
    }
  };

  const getTypeIcon = (type: string): React.ComponentProps<typeof MaterialCommunityIcons>['name'] => {
    switch (type) {
      case 'vet': return 'hospital-building';
      case 'shelter': return 'home-heart';
      case 'rescue': return 'hand-heart';
      default: return 'office-building';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vet': return '#6366F1';
      case 'shelter': return Colors.secondary;
      case 'rescue': return Colors.primary;
      default: return Colors.textSecondary;
    }
  };

  if (user?.role !== 'admin') {
    return (
      <View style={[styles.container, styles.centeredContainer, { paddingTop: insets.top + webTopPadding }]}>
        <View style={styles.accessDeniedCard}>
          <View style={styles.accessDeniedIcon}>
            <Ionicons name="lock-closed" size={48} color={Colors.danger} />
          </View>
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You do not have permission to view this page. Admin access is required.
          </Text>
          <Pressable
            testID="admin-back-button"
            style={styles.accessDeniedBackBtn}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/settings')}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.surface} />
            <Text style={styles.accessDeniedBackText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
      <View style={styles.header}>
        <Pressable testID="admin-header-back" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/settings')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading pending organisations...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + webBottomPadding + 40 }}
        >
          <View style={styles.statsBar}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={Colors.warning} />
              <Text style={styles.statNumber}>{pendingOrgs.length}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 12, backgroundColor: Colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderLight }}
            onPress={() => router.push('/admin-match-queue' as any)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MaterialCommunityIcons name="magnify-scan" size={22} color="#6366F1" />
              <View>
                <Text style={{ fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text }}>AI Match Queue</Text>
                <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textLight }}>Review AI-found pet matches</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </Pressable>

          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 16, backgroundColor: Colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderLight }}
            onPress={() => router.push('/admin-ads')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="megaphone" size={22} color="#D97706" />
              <View>
                <Text style={{ fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text }}>Manage Ads</Text>
                <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textLight }}>Approve, pause, or remove ads</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </Pressable>

          {pendingOrgs.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="check-circle-outline" size={64} color={Colors.success} />
              <Text style={styles.emptyTitle}>No pending organisations</Text>
              <Text style={styles.emptySubtext}>All organisation registrations have been reviewed.</Text>
            </View>
          ) : (
            <View style={styles.orgList}>
              {pendingOrgs.map(org => {
                const typeColor = getTypeColor(org.type);
                const isActionPending = actionLoading === org.id;

                return (
                  <View key={org.id} style={styles.orgCard}>
                    <View style={styles.orgCardHeader}>
                      <View style={[styles.typeIconContainer, { backgroundColor: typeColor + '15' }]}>
                        <MaterialCommunityIcons name={getTypeIcon(org.type)} size={24} color={typeColor} />
                      </View>
                      <View style={styles.orgHeaderInfo}>
                        <Text style={styles.orgName}>{org.name}</Text>
                        <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
                          <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                            {getTypeLabel(org.type)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {org.abn ? (
                      <View style={styles.detailRow}>
                        <Ionicons name="document-text-outline" size={16} color={Colors.textSecondary} />
                        <Text style={styles.detailLabel}>ABN:</Text>
                        <Text style={styles.detailValue}>{org.abn}</Text>
                      </View>
                    ) : null}

                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.detailValue}>{org.address}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="call-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.detailValue}>{org.phone}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="mail-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.detailValue}>{org.email}</Text>
                    </View>

                    {(org.registrantName || org.registrantEmail) ? (
                      <View style={styles.registrantSection}>
                        <Text style={styles.registrantTitle}>Registrant</Text>
                        {org.registrantName ? (
                          <View style={styles.detailRow}>
                            <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
                            <Text style={styles.detailValue}>{org.registrantName}</Text>
                          </View>
                        ) : null}
                        {org.registrantEmail ? (
                          <View style={styles.detailRow}>
                            <Ionicons name="mail-outline" size={16} color={Colors.textSecondary} />
                            <Text style={styles.detailValue}>{org.registrantEmail}</Text>
                          </View>
                        ) : null}
                      </View>
                    ) : null}

                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.detailLabel}>Registered:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(org.createdAt).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>

                    <View style={styles.actionRow}>
                      <Pressable
                        testID={`approve-org-${org.id}`}
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => handleApprove(org.id, org.name)}
                        disabled={isActionPending}
                      >
                        {isActionPending ? (
                          <ActivityIndicator size="small" color={Colors.surface} />
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle" size={20} color={Colors.surface} />
                            <Text style={styles.actionBtnText}>Approve</Text>
                          </>
                        )}
                      </Pressable>

                      <Pressable
                        testID={`reject-org-${org.id}`}
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => handleReject(org.id, org.name)}
                        disabled={isActionPending}
                      >
                        <Ionicons name="close-circle" size={20} color={Colors.surface} />
                        <Text style={styles.actionBtnText}>Reject</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  orgList: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
  },
  orgCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 18,
    gap: 10,
  },
  orgCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 4,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  orgName: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    flex: 1,
  },
  registrantSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 10,
    gap: 6,
  },
  registrantTitle: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  approveBtn: {
    backgroundColor: Colors.success,
  },
  rejectBtn: {
    backgroundColor: Colors.danger,
  },
  actionBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.surface,
  },
  accessDeniedCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    maxWidth: 360,
    width: '100%',
  },
  accessDeniedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lostBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  accessDeniedTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  accessDeniedText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  accessDeniedBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  accessDeniedBackText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.surface,
  },
});
