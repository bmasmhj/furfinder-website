import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, ActivityIndicator, Platform, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { usePets } from '@/lib/pet-context';
import { PetMatch, PetReport, PetProfile } from '@/lib/types';
import { getPetTypeIcon, getStatusColor, getStatusLabel } from '@/lib/helpers';
import { apiRequest } from '@/lib/query-client';

const ORG_TYPE_LABELS: Record<string, string> = {
  vet: 'Vet Clinic',
  shelter: 'Shelter',
  rescue: 'Rescue Group',
};

export default function MatchesScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const insets = useSafeAreaInsets();
  const { getReport, reports, profiles, searchRadiusKm } = usePets();
  const [matches, setMatches] = useState<PetMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  const report = getReport(reportId);

  useEffect(() => {
    if (report) {
      findMatches();
    }
  }, [reportId]);

  const findMatches = async () => {
    if (!report) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest('POST', '/api/match', {
        report,
        reports,
        profiles,
        radiusKm: searchRadiusKm,
      });
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (e: any) {
      console.error('Match error:', e);
      setError('Could not find matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMatchedItem = (match: PetMatch): PetReport | PetProfile | null => {
    if (match.type === 'org_animal') return null;
    if (match.type === 'report') {
      return reports.find(r => r.id === match.id) || null;
    }
    return profiles.find(p => p.id === match.id) || null;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return Colors.success;
    if (confidence >= 50) return Colors.accent;
    return Colors.textSecondary;
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 75) return 'High';
    if (confidence >= 50) return 'Medium';
    return 'Low';
  };

  const handleMatchPress = (match: PetMatch) => {
    if (match.type === 'report') {
      router.push(`/pet/${match.id}`);
    } else if (match.type === 'org_animal') {
      // org animals don't have a dedicated detail page yet — no-op
    } else {
      router.push(`/my-pet/${match.id}`);
    }
  };

  const renderMatch = ({ item, index }: { item: PetMatch; index: number }) => {
    const isOrgAnimal = item.type === 'org_animal';
    const matched = getMatchedItem(item);
    if (!matched && !isOrgAnimal) return null;

    const isReport = item.type === 'report';
    const matchedReport = isReport ? (matched as PetReport) : null;
    const matchedProfile = !isReport && !isOrgAnimal ? (matched as PetProfile) : null;

    const name = isOrgAnimal
      ? (item.orgName || 'Partner Animal')
      : isReport
        ? (matchedReport!.petName === 'Unknown' ? `${matchedReport!.breed} ${matchedReport!.petType}` : matchedReport!.petName)
        : matchedProfile!.petName;

    const photoUri = isOrgAnimal ? '' : isReport ? matchedReport!.photoUri : (matchedProfile!.photoUris?.[0] || '');
    const petType = isOrgAnimal ? 'dog' : isReport ? matchedReport!.petType : matchedProfile!.petType;
    const breed = isOrgAnimal ? '' : isReport ? matchedReport!.breed : matchedProfile!.breed;
    const color = isOrgAnimal ? '' : isReport ? matchedReport!.color : matchedProfile!.color;
    const confidenceColor = getConfidenceColor(item.confidence);

    const orgTypeLabel = isOrgAnimal && item.orgType ? (ORG_TYPE_LABELS[item.orgType] || 'Partner') : '';

    return (
      <Animated.View entering={FadeInUp.duration(400).delay(index * 80)}>
        <Pressable
          style={({ pressed }) => [styles.matchCard, pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] }]}
          onPress={() => handleMatchPress(item)}
        >
          <View style={styles.matchHeader}>
            <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}>
              <Ionicons name="sparkles" size={12} color="#fff" />
              <Text style={styles.confidenceText}>{item.confidence}% {getConfidenceLabel(item.confidence)}</Text>
            </View>
            {isOrgAnimal ? (
              <View style={[styles.typeBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.typeText, { color: '#D97706' }]}>
                  {orgTypeLabel || 'PARTNER ORG'}
                </Text>
              </View>
            ) : (
              <View style={[styles.typeBadge, { backgroundColor: isReport ? (matchedReport!.status === 'found' ? Colors.foundBg : Colors.lostBg) : '#F0F0FF' }]}>
                <Text style={[styles.typeText, { color: isReport ? getStatusColor(matchedReport!.status) : '#6366F1' }]}>
                  {isReport ? getStatusLabel(matchedReport!.status) : 'REGISTERED'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.matchBody}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.matchImage} contentFit="cover" />
            ) : (
              <View style={styles.matchImagePlaceholder}>
                <MaterialCommunityIcons name={getPetTypeIcon(petType) as any} size={28} color={Colors.textLight} />
              </View>
            )}
            <View style={styles.matchInfo}>
              <Text style={styles.matchName} numberOfLines={1}>{name}</Text>
              {isOrgAnimal ? (
                <View style={styles.matchLocation}>
                  <Ionicons name="business" size={12} color="#D97706" />
                  <Text style={[styles.matchLocationText, { color: '#D97706' }]} numberOfLines={1}>
                    {item.orgName || 'Verified Partner'}
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.matchBreed} numberOfLines={1}>{breed} · {color}</Text>
                  {isReport && matchedReport && (
                    <View style={styles.matchLocation}>
                      <Ionicons name="location" size={12} color={Colors.textLight} />
                      <Text style={styles.matchLocationText} numberOfLines={1}>{matchedReport.locationName}</Text>
                    </View>
                  )}
                  {!isReport && matchedProfile && (
                    <View style={styles.matchLocation}>
                      <Ionicons name="home" size={12} color={Colors.textLight} />
                      <Text style={styles.matchLocationText} numberOfLines={1}>{matchedProfile.suburb || 'No suburb'}</Text>
                    </View>
                  )}
                </>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </View>

          <View style={styles.reasonContainer}>
            <Ionicons name="bulb-outline" size={14} color={Colors.secondary} />
            <Text style={styles.reasonText}>{item.reason}</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  if (!report) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={Colors.textLight} />
          <Text style={styles.errorText}>Report not found</Text>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}>
            <Text style={styles.backLink}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + webTopPadding + 12 }]}
      >
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerContent}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={22} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>AI Matches</Text>
          <Text style={styles.headerSubtitle}>
            Potential matches for {report.petName === 'Unknown' ? `${report.breed} ${report.petType}` : report.petName}
          </Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Analyzing pet details...</Text>
          <Text style={styles.loadingSubtext}>Our AI is comparing descriptions, breeds, and locations</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={Colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={findMatches} style={styles.retryBtn}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="magnify-close" size={48} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No Matches Found</Text>
          <Text style={styles.emptySubtitle}>
            No similar pets were found in current reports or registered profiles. Check back later as new reports come in.
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={renderMatch}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.resultHeader}>
              <Text style={styles.resultCount}>{matches.length} potential match{matches.length !== 1 ? 'es' : ''}</Text>
              <View style={styles.aiDisclaimer}>
                <Ionicons name="information-circle-outline" size={14} color="#6366F1" />
                <Text style={styles.aiDisclaimerText}>
                  AI suggestions only — not guaranteed. Always verify through direct contact and physical identification.
                </Text>
              </View>
            </View>
          }
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
  headerGradient: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerContent: {
    gap: 6,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.85)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginTop: 8,
  },
  loadingSubtext: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  backLink: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  retryText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  resultHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  resultCount: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  listContent: {
    paddingTop: 4,
  },
  matchCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.5,
  },
  matchBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  matchImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  matchImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchInfo: {
    flex: 1,
    gap: 2,
  },
  matchName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  matchBreed: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  matchLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  matchLocationText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0FDFA',
    padding: 12,
    borderRadius: 10,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  aiDisclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#EEF2FF',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  aiDisclaimerText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#4338CA',
    lineHeight: 16,
  },
});
