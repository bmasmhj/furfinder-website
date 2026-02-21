import { useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { usePets } from '@/lib/pet-context';
import PetCard from '@/components/PetCard';
import FilterBar from '@/components/FilterBar';
import EmptyState from '@/components/EmptyState';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { reports, isLoading } = usePets();
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
          <View>
            <Text style={styles.greeting}>PetReunite</Text>
            <Text style={styles.subtitle}>Help pets find their way home</Text>
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
  listContent: {
    paddingTop: 4,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
});
