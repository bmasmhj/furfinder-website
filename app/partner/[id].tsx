import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fetch } from 'expo/fetch';
import Colors from '@/constants/colors';
import { getApiUrl } from '@/lib/query-client';
import type { Organisation, OrganisationAnimal, OrgType } from '@/lib/types';

const TYPE_COLORS: Record<OrgType, string> = {
  vet: '#3B82F6',
  shelter: '#22C55E',
  rescue: '#F97316',
};

const TYPE_LABELS: Record<OrgType, string> = {
  vet: 'Vet',
  shelter: 'Shelter',
  rescue: 'Rescue',
};

const INTAKE_LABELS: Record<string, string> = {
  stray: 'Stray',
  surrendered: 'Surrendered',
  rescue: 'Rescue',
  transferred: 'Transferred',
};

export default function PartnerDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;
  const webBottomPadding = Platform.OS === 'web' ? 34 : 0;

  const [org, setOrg] = useState<Organisation | null>(null);
  const [animals, setAnimals] = useState<OrganisationAnimal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const baseUrl = getApiUrl();
        const [orgRes, animalsRes] = await Promise.all([
          fetch(new URL(`/api/org/public`, baseUrl).toString()),
          fetch(new URL(`/api/org/${id}/animals`, baseUrl).toString()),
        ]);
        if (orgRes.ok) {
          const orgs: Organisation[] = await orgRes.json();
          const found = orgs.find((o) => o.id === id);
          if (found) setOrg(found);
        }
        if (animalsRes.ok) {
          const data = await animalsRes.json();
          setAnimals(data);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top + webTopPadding }]}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }

  if (!org) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
        <View style={styles.header}>
          <Pressable testID="partner-detail-back" onPress={() => router.canGoBack() ? router.back() : router.replace('/partners')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Partner</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={[styles.center, { flex: 1 }]}>
          <Text style={styles.emptyTitle}>Organisation not found</Text>
        </View>
      </View>
    );
  }

  const typeColor = TYPE_COLORS[org.type];

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
      <View style={styles.header}>
        <Pressable testID="partner-detail-back" onPress={() => router.canGoBack() ? router.back() : router.replace('/partners')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Partner Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + webBottomPadding + 40 }}
      >
        <View style={styles.orgHeader}>
          <Text style={styles.orgName}>{org.name}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: typeColor + '18' }]}>
              <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                {TYPE_LABELS[org.type]}
              </Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: Colors.secondary + '18' }]}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.secondary} />
              <Text style={[styles.typeBadgeText, { color: Colors.secondary, marginLeft: 4 }]}>
                Verified Partner
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          {org.address ? (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{org.address}</Text>
            </View>
          ) : null}
          {org.phone ? (
            <Pressable
              testID="partner-call"
              style={styles.infoRow}
              onPress={() => Linking.openURL(`tel:${org.phone}`)}
            >
              <Ionicons name="call-outline" size={18} color={Colors.secondary} />
              <Text style={[styles.infoText, { color: Colors.secondary }]}>{org.phone}</Text>
            </Pressable>
          ) : null}
          {org.email ? (
            <Pressable
              testID="partner-email"
              style={styles.infoRow}
              onPress={() => Linking.openURL(`mailto:${org.email}`)}
            >
              <Ionicons name="mail-outline" size={18} color={Colors.secondary} />
              <Text style={[styles.infoText, { color: Colors.secondary }]}>{org.email}</Text>
            </Pressable>
          ) : null}
          {org.website ? (
            <Pressable
              testID="partner-website"
              style={styles.infoRow}
              onPress={() => Linking.openURL(org.website!)}
            >
              <Ionicons name="globe-outline" size={18} color={Colors.secondary} />
              <Text style={[styles.infoText, { color: Colors.secondary }]} numberOfLines={1}>
                {org.website}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {org.description ? (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{org.description}</Text>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>
            Available Animals ({animals.length})
          </Text>
        </View>

        {animals.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="paw-off" size={40} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No animals available</Text>
            <Text style={styles.emptySubtext}>
              This organisation has no animals listed at the moment
            </Text>
          </View>
        ) : (
          animals.map((animal) => (
            <View key={animal.id} style={styles.animalCard}>
              {animal.photoUris?.[0] ? (
                <Image source={{ uri: animal.photoUris[0] }} style={styles.animalPhoto} />
              ) : (
                <View style={[styles.animalPhoto, styles.animalPhotoPlaceholder]}>
                  <MaterialCommunityIcons name="paw" size={28} color={Colors.textLight} />
                </View>
              )}
              <View style={styles.animalInfo}>
                <Text style={styles.animalName} numberOfLines={1}>{animal.petName}</Text>
                {animal.breed ? (
                  <Text style={styles.animalDetail} numberOfLines={1}>{animal.breed}</Text>
                ) : null}
                {animal.color ? (
                  <View style={styles.animalRow}>
                    <MaterialCommunityIcons name="palette-outline" size={13} color={Colors.textSecondary} />
                    <Text style={styles.animalDetailSmall}>{animal.color}</Text>
                  </View>
                ) : null}
                {animal.intakeType ? (
                  <View style={styles.intakeBadge}>
                    <Text style={styles.intakeBadgeText}>
                      {INTAKE_LABELS[animal.intakeType] || animal.intakeType}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
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
    flex: 1,
    textAlign: 'center',
  },
  orgHeader: {
    padding: 20,
    backgroundColor: Colors.surface,
    gap: 10,
  },
  orgName: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    flex: 1,
  },
  descriptionCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 16,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  animalCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  animalPhoto: {
    width: 90,
    height: 90,
  },
  animalPhotoPlaceholder: {
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animalInfo: {
    flex: 1,
    padding: 12,
    gap: 3,
  },
  animalName: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  animalDetail: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  animalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  animalDetailSmall: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  intakeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  intakeBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
