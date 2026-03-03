import { StyleSheet, Text, View, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { usePets } from '@/lib/pet-context';
import { getPetTypeIcon, getSizeLabel, formatDate } from '@/lib/helpers';

export default function MyPetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getProfile, deleteProfile } = usePets();
  const profile = getProfile(id);
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
        <View style={styles.notFound}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={Colors.textLight} />
          <Text style={styles.notFoundText}>Pet not found</Text>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/my-reports')}>
            <Text style={styles.backLink}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleEdit = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/register-pet', params: { editId: profile.id } });
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    Alert.alert(
      'Remove Pet?',
      'This will remove the pet profile. You can always re-register.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            deleteProfile(profile.id);
            router.canGoBack() ? router.back() : router.replace('/(tabs)/my-reports');
          },
        },
      ]
    );
  };

  const handleReportLost = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push({
      pathname: '/report-form',
      params: {
        type: 'lost',
        fromProfileId: profile.id,
      },
    });
  };

  const heroPhoto = profile.photoUris.length > 0 ? profile.photoUris[0] : null;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 100 }}
      >
        <View style={styles.imageSection}>
          {heroPhoto ? (
            <Image source={{ uri: heroPhoto }} style={styles.heroImage} contentFit="cover" />
          ) : (
            <LinearGradient
              colors={['#E0F2FE', '#BAE6FD']}
              style={styles.heroPlaceholder}
            >
              <MaterialCommunityIcons
                name={getPetTypeIcon(profile.petType) as any}
                size={80}
                color={Colors.secondary}
              />
            </LinearGradient>
          )}

          <Pressable
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/my-reports')}
            style={[styles.backBtn, { top: insets.top + webTopPadding + 12 }]}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>

          <Pressable
            onPress={handleEdit}
            style={[styles.editBtn, { top: insets.top + webTopPadding + 12 }]}
          >
            <Ionicons name="create-outline" size={22} color={Colors.text} />
          </Pressable>

          <View style={styles.registeredBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#fff" />
            <Text style={styles.registeredText}>REGISTERED</Text>
          </View>
        </View>

        <Animated.View entering={FadeInUp.duration(400)} style={styles.contentSection}>
          <Text style={styles.petName}>{profile.petName}</Text>
          <Text style={styles.breed}>{profile.breed} · {profile.color}</Text>

          {profile.photoUris.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
              {profile.photoUris.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={styles.thumbPhoto}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
          )}

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name={getPetTypeIcon(profile.petType) as any} size={20} color={Colors.primary} />
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{profile.petType.charAt(0).toUpperCase() + profile.petType.slice(1)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="resize" size={20} color={Colors.primary} />
              <Text style={styles.detailLabel}>Size</Text>
              <Text style={styles.detailValue}>{getSizeLabel(profile.size)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="color-palette-outline" size={20} color={Colors.primary} />
              <Text style={styles.detailLabel}>Color</Text>
              <Text style={styles.detailValue}>{profile.color || 'Not set'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <Text style={styles.detailLabel}>Suburb</Text>
              <Text style={styles.detailValue}>{profile.suburb || 'Not set'}</Text>
            </View>
          </View>

          {profile.biometricPhotoUris && profile.biometricPhotoUris.length > 0 && (
            <View style={styles.section}>
              <View style={styles.biometricHeaderRow}>
                <MaterialCommunityIcons name="fingerprint" size={20} color={Colors.secondary} />
                <Text style={styles.sectionTitle}>Biometric ID Scans</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.biometricRow}>
                {profile.biometricPhotoUris.map((uri, index) => (
                  <View key={index} style={styles.biometricThumb}>
                    <Image source={{ uri }} style={styles.biometricImage} contentFit="cover" />
                    <View style={styles.biometricBadge}>
                      <MaterialCommunityIcons name="fingerprint" size={10} color="#fff" />
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {!!profile.microchipNumber && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Microchip Number</Text>
              <View style={styles.chipCard}>
                <Ionicons name="hardware-chip-outline" size={20} color={Colors.secondary} />
                <Text style={styles.chipNumber}>{profile.microchipNumber}</Text>
              </View>
            </View>
          )}

          {!!profile.markings && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Markings</Text>
              <Text style={styles.sectionText}>{profile.markings}</Text>
            </View>
          )}

          {!!profile.medicalNotes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medical Notes</Text>
              <View style={styles.medicalCard}>
                <Ionicons name="medkit-outline" size={18} color={Colors.warning} />
                <Text style={styles.medicalText}>{profile.medicalNotes}</Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <View style={styles.ownerCard}>
              <Ionicons name="person-circle" size={40} color={Colors.primary} />
              <View>
                <Text style={styles.ownerName}>{profile.ownerName}</Text>
                <Text style={styles.ownerPhone}>{profile.ownerPhone}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.registeredDate}>
            Registered {formatDate(profile.createdAt)}
          </Text>

          <Pressable
            onPress={handleReportLost}
            style={({ pressed }) => [styles.reportLostBtn, pressed && { opacity: 0.9 }]}
          >
            <MaterialCommunityIcons name="alert-circle-outline" size={22} color="#fff" />
            <Text style={styles.reportLostText}>Report as Lost</Text>
          </Pressable>

          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            <Text style={styles.deleteText}>Remove Pet Profile</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  backLink: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },
  imageSection: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editBtn: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registeredBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  registeredText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.5,
  },
  contentSection: {
    padding: 20,
    gap: 16,
  },
  petName: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  breed: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: -8,
  },
  photosRow: {
    gap: 8,
  },
  thumbPhoto: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailItem: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  biometricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  biometricRow: {
    gap: 10,
  },
  biometricThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  biometricImage: {
    width: '100%',
    height: '100%',
  },
  biometricBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  chipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.foundBg,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  chipNumber: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    letterSpacing: 1,
  },
  medicalCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  medicalText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    lineHeight: 20,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  ownerName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  ownerPhone: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  registeredDate: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
    textAlign: 'center',
  },
  reportLostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.lost,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  reportLostText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  deleteText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.danger,
  },
});
