import { useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { usePets } from '@/lib/pet-context';
import { useSubscription } from '@/lib/subscription-context';
import PetCard from '@/components/PetCard';
import FilterBar from '@/components/FilterBar';
import EmptyState from '@/components/EmptyState';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { reports, isLoading, unreadCount } = usePets();
  const { isPremium, canUseScanPost } = useSubscription();
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredReports = useMemo(() => {
    if (filter === 'all') return reports;
    return reports.filter(r => r.status === filter);
  }, [reports, filter]);

  const lostCount = useMemo(() => reports.filter(r => r.status === 'lost').length, [reports]);
  const foundCount = useMemo(() => reports.filter(r => r.status === 'found').length, [reports]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  };

  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B4A', '#FF8A6E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + webTopPadding + 16 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>PetReunite</Text>
              <Text style={styles.subtitle}>Help pets find their way home</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Pressable
                style={styles.bellBtn}
                onPress={() => router.push('/settings')}
              >
                <Ionicons name="settings-outline" size={20} color="#fff" />
              </Pressable>
              <Pressable
                style={styles.bellBtn}
                onPress={() => router.push('/notifications')}
              >
                <Ionicons name="notifications-outline" size={22} color="#fff" />
                {unreadCount > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBubble}>
              <Ionicons name="alert-circle" size={14} color={Colors.lost} />
              <Text style={styles.statText}>{lostCount} Lost</Text>
            </View>
            <View style={styles.statBubble}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.found} />
              <Text style={styles.statText}>{foundCount} Found</Text>
            </View>
            <Pressable
              style={styles.scanBubble}
              onPress={() => {
                if (!canUseScanPost()) {
                  router.push('/paywall');
                  return;
                }
                router.push('/scan-post');
              }}
            >
              <Feather name="search" size={14} color="#F97316" />
              <Text style={styles.scanBubbleText}>Scan Post</Text>
              {!canUseScanPost() && <Ionicons name="diamond" size={10} color="#F59E0B" style={{ marginLeft: 2 }} />}
            </Pressable>
          </View>
          <View style={styles.statsRow}>
            <Pressable
              style={styles.tipsBubble}
              onPress={() => router.push('/safety-tips')}
            >
              <Ionicons name="shield-checkmark" size={14} color="#059669" />
              <Text style={styles.tipsBubbleText}>Safety Tips</Text>
            </Pressable>
            {!isPremium && (
              <Pressable
                style={styles.upgradeBubble}
                onPress={() => router.push('/paywall')}
              >
                <Ionicons name="diamond" size={14} color="#F59E0B" />
                <Text style={styles.upgradeBubbleText}>Upgrade</Text>
              </Pressable>
            )}
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <PetCard report={item} index={index} />}
        ListHeaderComponent={<FilterBar selected={filter} onSelect={setFilter} />}
        ListEmptyComponent={
          <EmptyState
            icon="paw-off"
            title="No reports yet"
            subtitle="Be the first to report a lost or found pet in your area"
          />
        }
        contentContainerStyle={[
          styles.listContent,
          filteredReports.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filteredReports.length || true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  bellBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.85)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
  },
  scanBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  scanBubbleText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#F97316',
  },
  tipsBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  tipsBubbleText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#059669',
  },
  upgradeBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  upgradeBubbleText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#D97706',
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
});
