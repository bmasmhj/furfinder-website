import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, Pressable, ActivityIndicator,
  StyleSheet, Alert, RefreshControl, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetch } from 'expo/fetch';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/lib/auth-context';
import { getApiUrl } from '@/lib/query-client';

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: Colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: Colors.borderLight,
      gap: 10,
    },
    backBtn: { padding: 4 },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontFamily: 'Poppins_700Bold',
      color: Colors.text,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      padding: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: Colors.surface,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.borderLight,
    },
    statNum: {
      fontSize: 22,
      fontFamily: 'Poppins_700Bold',
      color: Colors.primary,
    },
    statLabel: {
      fontSize: 11,
      fontFamily: 'Poppins_400Regular',
      color: Colors.textLight,
      textAlign: 'center',
    },
    runBtnRow: { paddingHorizontal: 16, paddingBottom: 12 },
    runBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: Colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
    },
    runBtnText: {
      fontSize: 14,
      fontFamily: 'Poppins_600SemiBold',
      color: '#fff',
    },
    runningRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
    },
    runningText: {
      fontSize: 13,
      fontFamily: 'Poppins_500Medium',
      color: Colors.textLight,
    },
    tabRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 8,
      paddingBottom: 8,
    },
    tab: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors.borderLight,
      backgroundColor: Colors.surface,
    },
    tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    tabText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.textLight },
    tabTextActive: { color: '#fff' },
    card: {
      marginHorizontal: 16,
      marginBottom: 14,
      backgroundColor: Colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Colors.borderLight,
      overflow: 'hidden',
    },
    cardTop: { padding: 14 },
    confidenceBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginBottom: 12,
    },
    confidenceText: {
      fontSize: 12,
      fontFamily: 'Poppins_600SemiBold',
      color: '#fff',
    },
    petsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    petCard: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: Colors.background,
      borderWidth: 1,
      borderColor: Colors.borderLight,
    },
    petPhoto: { width: '100%', height: 100 },
    petPhotoPlaceholder: {
      width: '100%',
      height: 100,
      backgroundColor: Colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    petInfo: { padding: 8 },
    petTag: {
      alignSelf: 'flex-start',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 8,
      marginBottom: 4,
    },
    petTagText: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', color: '#fff' },
    petName: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
    petBreed: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textLight },
    petLoc: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: Colors.textLight, marginTop: 2 },
    ownerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: Colors.background,
      padding: 8,
      borderRadius: 8,
      marginBottom: 10,
    },
    ownerText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textLight, flex: 1 },
    reasonBox: {
      backgroundColor: Colors.background,
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
      borderLeftWidth: 3,
      borderLeftColor: '#6366F1',
    },
    reasonLabel: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: '#6366F1', marginBottom: 3 },
    reasonText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.text, lineHeight: 18 },
    actionsRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: Colors.borderLight,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 13,
      gap: 6,
    },
    actionBtnDivider: { width: 1, backgroundColor: Colors.borderLight },
    actionBtnText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold' },
    viewBtn: { paddingVertical: 13, alignItems: 'center', justifyContent: 'center', flex: 1 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyTitle: { fontSize: 17, fontFamily: 'Poppins_600SemiBold', color: Colors.text, marginTop: 12, textAlign: 'center' },
    emptyText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textLight, textAlign: 'center', marginTop: 6, lineHeight: 20 },
    lastRunText: {
      fontSize: 11,
      fontFamily: 'Poppins_400Regular',
      color: Colors.textLight,
      textAlign: 'center',
      paddingBottom: 8,
    },
  });

type MatchItem = {
  id: string;
  confidence: number;
  reason: string;
  status: string;
  createdAt: string;
  lostReport: {
    id: string; petName: string; petType: string; breed: string;
    color: string; location: string; date: string; thumbnail: string | null;
    ownerName: string; ownerEmail: string; ownerId: string;
  };
  foundReport: {
    id: string; petName: string; petType: string; breed: string;
    color: string; location: string; date: string; thumbnail: string | null;
    reporterName: string; reporterEmail: string;
  };
};

function confidenceColor(c: number): string {
  if (c >= 80) return '#10B981';
  if (c >= 65) return '#F59E0B';
  return '#6366F1';
}

function confidenceLabel(c: number): string {
  if (c >= 80) return 'Strong match';
  if (c >= 65) return 'Moderate match';
  return 'Possible match';
}

function PetThumb({ uri, label, Colors }: { uri: string | null; label: string; Colors: any }) {
  const styles = getStyles(Colors);
  if (!uri) {
    return (
      <View style={styles.petPhotoPlaceholder}>
        <MaterialCommunityIcons name="paw" size={28} color={Colors.textLight} />
      </View>
    );
  }
  return <Image source={{ uri }} style={styles.petPhoto} contentFit="cover" />;
}

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'actioned', label: 'Actioned' },
  { key: 'dismissed', label: 'Dismissed' },
];

export default function AdminMatchQueueScreen() {
  const Colors = useTheme();
  const styles = getStyles(Colors);
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [runningNow, setRunningNow] = useState(false);

  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const { data: statusData } = useQuery({
    queryKey: ['/api/admin/batch-match/status'],
    queryFn: async () => {
      const res = await fetch(new URL('/api/admin/batch-match/status', getApiUrl()).toString(), { headers: authHeaders });
      return res.json();
    },
    refetchInterval: runningNow ? 5000 : 30000,
    staleTime: 0,
  });

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['/api/admin/match-queue', activeTab],
    queryFn: async () => {
      const url = new URL('/api/admin/match-queue', getApiUrl());
      url.searchParams.set('status', activeTab);
      const res = await fetch(url.toString(), { headers: authHeaders });
      return res.json() as Promise<{ items: MatchItem[]; total: number }>;
    },
    staleTime: 0,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(new URL(`/api/admin/match-queue/${id}/status`, getApiUrl()).toString(), {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/match-queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/batch-match/status'] });
    },
  });

  const notifyOwner = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(new URL(`/api/admin/match-queue/${id}/notify-owner`, getApiUrl()).toString(), {
        method: 'POST',
        headers: authHeaders,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/match-queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/batch-match/status'] });
    },
  });

  const handleRunNow = useCallback(async () => {
    Alert.alert(
      'Run Batch Scan',
      'This will scan all active lost and found reports using AI. It may take several minutes and incur API costs. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Run Now',
          onPress: async () => {
            try {
              setRunningNow(true);
              const res = await fetch(new URL('/api/admin/batch-match/run', getApiUrl()).toString(), {
                method: 'POST',
                headers: authHeaders,
              });
              const json = await res.json();
              if (!res.ok) {
                Alert.alert('Error', json.message || 'Failed to start scan');
                setRunningNow(false);
              } else {
                Alert.alert('Scan Started', 'The AI scan is running in the background. Check back in a few minutes.');
                setTimeout(() => {
                  setRunningNow(false);
                  refetch();
                  queryClient.invalidateQueries({ queryKey: ['/api/admin/batch-match/status'] });
                }, 60000);
              }
            } catch {
              Alert.alert('Error', 'Could not start scan');
              setRunningNow(false);
            }
          },
        },
      ]
    );
  }, [token]);

  const handleNotifyOwner = useCallback((item: MatchItem) => {
    Alert.alert(
      'Notify Pet Owner?',
      `Send a push notification and in-app alert to ${item.lostReport.ownerName} about this potential match for their lost ${item.lostReport.petName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Notify',
          onPress: () => notifyOwner.mutate(item.id, {
            onSuccess: () => Alert.alert('Done', 'The owner has been notified!'),
            onError: () => Alert.alert('Error', 'Could not send notification'),
          }),
        },
      ]
    );
  }, []);

  const handleDismiss = useCallback((item: MatchItem) => {
    Alert.alert(
      'Dismiss Match?',
      'Mark this as a false positive? It will move to the Dismissed tab.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Dismiss', style: 'destructive', onPress: () => updateStatus.mutate({ id: item.id, status: 'dismissed' }) },
      ]
    );
  }, []);

  const renderItem = useCallback(({ item }: { item: MatchItem }) => {
    const badgeColor = confidenceColor(item.confidence);
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.confidenceBadge, { backgroundColor: badgeColor }]}>
            <MaterialCommunityIcons name="paw" size={13} color="#fff" />
            <Text style={styles.confidenceText}>{item.confidence}% — {confidenceLabel(item.confidence)}</Text>
          </View>

          <View style={styles.petsRow}>
            <Pressable style={styles.petCard} onPress={() => router.push(`/pet/${item.lostReport.id}` as any)}>
              <PetThumb uri={item.lostReport.thumbnail} label="lost" Colors={Colors} />
              <View style={styles.petInfo}>
                <View style={[styles.petTag, { backgroundColor: '#EF4444' }]}>
                  <Text style={styles.petTagText}>LOST</Text>
                </View>
                <Text style={styles.petName} numberOfLines={1}>{item.lostReport.petName}</Text>
                <Text style={styles.petBreed} numberOfLines={1}>{item.lostReport.breed || item.lostReport.petType}</Text>
                <Text style={styles.petLoc} numberOfLines={1}>{item.lostReport.location}</Text>
              </View>
            </Pressable>

            <View style={{ alignSelf: 'center', alignItems: 'center', gap: 4 }}>
              <MaterialCommunityIcons name="swap-horizontal" size={20} color={badgeColor} />
            </View>

            <Pressable style={styles.petCard} onPress={() => router.push(`/pet/${item.foundReport.id}` as any)}>
              <PetThumb uri={item.foundReport.thumbnail} label="found" Colors={Colors} />
              <View style={styles.petInfo}>
                <View style={[styles.petTag, { backgroundColor: Colors.secondary }]}>
                  <Text style={styles.petTagText}>FOUND</Text>
                </View>
                <Text style={styles.petName} numberOfLines={1}>{item.foundReport.petName || 'Unknown'}</Text>
                <Text style={styles.petBreed} numberOfLines={1}>{item.foundReport.breed || item.foundReport.petType}</Text>
                <Text style={styles.petLoc} numberOfLines={1}>{item.foundReport.location}</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.ownerRow}>
            <Ionicons name="person" size={13} color={Colors.textLight} />
            <Text style={styles.ownerText} numberOfLines={1}>
              Lost owner: {item.lostReport.ownerName} ({item.lostReport.ownerEmail})
            </Text>
          </View>

          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>AI Analysis</Text>
            <Text style={styles.reasonText}>{item.reason}</Text>
          </View>
        </View>

        {item.status === 'pending' && (
          <View style={styles.actionsRow}>
            <Pressable style={styles.actionBtn} onPress={() => handleNotifyOwner(item)}>
              <Ionicons name="notifications" size={16} color={Colors.secondary} />
              <Text style={[styles.actionBtnText, { color: Colors.secondary }]}>Notify Owner</Text>
            </Pressable>
            <View style={styles.actionBtnDivider} />
            <Pressable style={styles.actionBtn} onPress={() => handleDismiss(item)}>
              <Ionicons name="close-circle" size={16} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Dismiss</Text>
            </Pressable>
          </View>
        )}

        {item.status !== 'pending' && (
          <View style={[styles.actionsRow, { justifyContent: 'center', paddingVertical: 10 }]}>
            <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textLight }}>
              {item.status === 'actioned' ? 'Owner notified' : 'Dismissed as false positive'}
            </Text>
          </View>
        )}
      </View>
    );
  }, [Colors, handleNotifyOwner, handleDismiss]);

  const pendingCount = statusData?.pendingCount ?? 0;
  const lastRun = statusData?.lastRun;
  const isRunning = statusData?.running || runningNow;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/admin' as any)}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>AI Match Queue</Text>
        {pendingCount > 0 && (
          <View style={{ backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ fontSize: 12, fontFamily: 'Poppins_700Bold', color: '#fff' }}>{pendingCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{statusData?.pendingCount ?? '—'}</Text>
          <Text style={styles.statLabel}>Pending{'\n'}Review</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{statusData?.totalCount ?? '—'}</Text>
          <Text style={styles.statLabel}>Total{'\n'}Found</Text>
        </View>
        <View style={[styles.statCard, { borderColor: lastRun?.newMatches > 0 ? Colors.secondary : Colors.borderLight }]}>
          <Text style={[styles.statNum, { color: Colors.secondary }]}>{lastRun?.newMatches ?? '—'}</Text>
          <Text style={styles.statLabel}>Last Scan{'\n'}Matches</Text>
        </View>
      </View>

      <View style={styles.runBtnRow}>
        {isRunning ? (
          <View style={styles.runningRow}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.runningText}>Scan running in background...</Text>
          </View>
        ) : (
          <Pressable style={styles.runBtn} onPress={handleRunNow}>
            <MaterialCommunityIcons name="magnify-scan" size={18} color="#fff" />
            <Text style={styles.runBtnText}>Run Batch Scan Now</Text>
          </Pressable>
        )}
      </View>

      {lastRun && (
        <Text style={styles.lastRunText}>
          Last scan: {new Date(lastRun.startedAt).toLocaleString()} · {lastRun.processed} reports scanned
        </Text>
      )}

      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: insets.bottom + 24,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="check-all" size={56} color={Colors.success} />
              <Text style={styles.emptyTitle}>
                {activeTab === 'pending' ? 'No pending matches' : activeTab === 'actioned' ? 'No actioned matches' : 'No dismissed matches'}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === 'pending'
                  ? 'Run a batch scan to find potential matches across all lost and found reports.'
                  : 'Matches you act on or dismiss will appear here.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
