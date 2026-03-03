import { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, TextInput, Image, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import { getApiUrl } from '@/lib/query-client';
import { useAuth } from '@/lib/auth-context';

const petTypeIcons: Record<string, string> = {
  dog: 'dog',
  cat: 'cat',
  bird: 'bird',
  rabbit: 'rabbit',
  other: 'paw',
};

interface SuburbInfo {
  suburb: string;
  count: number;
  petTypes: string[];
}

interface SuburbProfile {
  id: string;
  petType: string;
  petName: string;
  breed: string;
  size: string;
  color: string;
  photoUris: string[];
  suburb: string;
  hasChip: boolean;
  ownerDisplayName?: string;
  createdAt: string;
}

export default function SuburbDirectoryScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedSuburb, setSelectedSuburb] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  const { data: suburbs = [], isLoading: loadingSuburbs } = useQuery<SuburbInfo[]>({
    queryKey: ['suburbs'],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/suburbs`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch suburbs');
      return res.json();
    },
    staleTime: 0,
  });

  const { data: profiles = [], isLoading: loadingProfiles } = useQuery<SuburbProfile[]>({
    queryKey: ['suburb-profiles', selectedSuburb],
    queryFn: async () => {
      if (!selectedSuburb) return [];
      const res = await fetch(`${getApiUrl()}/api/profiles/suburb/${encodeURIComponent(selectedSuburb)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch profiles');
      return res.json();
    },
    enabled: !!selectedSuburb,
    staleTime: 0,
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['suburbs'] });
    await queryClient.invalidateQueries({ queryKey: ['suburb-profiles'] });
    setRefreshing(false);
  }, [queryClient]);

  const filteredSuburbs = useMemo(() => {
    if (!search.trim()) return suburbs;
    return suburbs.filter(s => s.suburb.toLowerCase().includes(search.toLowerCase().trim()));
  }, [suburbs, search]);

  const totalPets = useMemo(() => suburbs.reduce((sum, s) => sum + s.count, 0), [suburbs]);

  if (selectedSuburb) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + webTopPadding + 12 }]}>
          <Pressable onPress={() => setSelectedSuburb(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{selectedSuburb}</Text>
            <Text style={styles.headerSubtitle}>
              {profiles.length} registered {profiles.length === 1 ? 'pet' : 'pets'}
            </Text>
          </View>
        </View>

        {loadingProfiles ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={profiles}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
            }
            renderItem={({ item }) => (
              <View style={styles.profileCard}>
                <View style={styles.profilePhotoWrap}>
                  {item.photoUris && item.photoUris.length > 0 ? (
                    <Image source={{ uri: item.photoUris[0] }} style={styles.profilePhoto} />
                  ) : (
                    <View style={[styles.profilePhoto, styles.profilePhotoPlaceholder]}>
                      <MaterialCommunityIcons
                        name={(petTypeIcons[item.petType] || 'paw') as any}
                        size={28}
                        color={Colors.secondary}
                      />
                    </View>
                  )}
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{item.petName}</Text>
                  <Text style={styles.profileBreed}>
                    {item.breed || item.petType} · {item.size} · {item.color || 'No colour'}
                  </Text>
                  {item.ownerDisplayName ? (
                    <Text style={styles.profileOwner}>Owner: {item.ownerDisplayName}</Text>
                  ) : null}
                  <View style={styles.profileTags}>
                    <View style={styles.typeTag}>
                      <MaterialCommunityIcons
                        name={(petTypeIcons[item.petType] || 'paw') as any}
                        size={12}
                        color={Colors.secondary}
                      />
                      <Text style={styles.typeTagText}>{item.petType}</Text>
                    </View>
                    {item.hasChip ? (
                      <View style={[styles.typeTag, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                        <Ionicons name="hardware-chip" size={12} color="#059669" />
                        <Text style={[styles.typeTagText, { color: '#059669' }]}>Chipped</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.centered}>
                <MaterialCommunityIcons name="paw-off" size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>No pets registered in this suburb yet</Text>
              </View>
            }
            contentContainerStyle={profiles.length === 0 ? { flexGrow: 1 } : { paddingBottom: 100 }}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopPadding + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Suburb Directory</Text>
          <Text style={styles.headerSubtitle}>
            {totalPets} pets across {suburbs.length} suburbs
          </Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} style={{ marginLeft: 12 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search suburb..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} style={{ padding: 8 }}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {loadingSuburbs ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSuburbs}
          keyExtractor={(item) => item.suburb}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          renderItem={({ item }) => (
            <Pressable style={styles.suburbCard} onPress={() => setSelectedSuburb(item.suburb)}>
              <View style={styles.suburbIcon}>
                <Ionicons name="location" size={20} color={Colors.primary} />
              </View>
              <View style={styles.suburbInfo}>
                <Text style={styles.suburbName}>{item.suburb}</Text>
                <View style={styles.suburbMeta}>
                  <Text style={styles.suburbCount}>
                    {item.count} {item.count === 1 ? 'pet' : 'pets'}
                  </Text>
                  <View style={styles.petTypeDots}>
                    {item.petTypes.slice(0, 4).map((type, i) => (
                      <MaterialCommunityIcons
                        key={i}
                        name={(petTypeIcons[type] || 'paw') as any}
                        size={14}
                        color={Colors.textSecondary}
                      />
                    ))}
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="location-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>
                {search ? `No suburbs matching "${search}"` : 'No pets registered yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                Register your pet with a suburb to appear here
              </Text>
            </View>
          }
          contentContainerStyle={filteredSuburbs.length === 0 ? { flexGrow: 1 } : { paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
  },
  suburbCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  suburbIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF1EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suburbInfo: {
    flex: 1,
  },
  suburbName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  suburbMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  suburbCount: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  petTypeDots: {
    flexDirection: 'row',
    gap: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  profilePhotoWrap: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
  },
  profilePhoto: {
    width: 60,
    height: 60,
  },
  profilePhotoPlaceholder: {
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  profileBreed: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 1,
  },
  profileOwner: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 1,
  },
  profileTags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  typeTagText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.secondary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
