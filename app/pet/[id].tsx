import { StyleSheet, Text, View, ScrollView, Pressable, Linking, Platform, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { usePets } from '@/lib/pet-context';
import { getStatusColor, getStatusBg, getStatusLabel, getPetTypeIcon, getSizeLabel, formatDate } from '@/lib/helpers';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getReport, updateReportStatus } = usePets();
  const report = getReport(id);
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  if (!report) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
        <View style={styles.notFound}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={Colors.textLight} />
          <Text style={styles.notFoundText}>Report not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const statusColor = getStatusColor(report.status);

  const handleCall = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Linking.openURL(`tel:${report.contactPhone}`);
  };

  const handleMessage = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Linking.openURL(`sms:${report.contactPhone}`);
  };

  const handleReunited = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      'Mark as Reunited?',
      'This will mark the pet as safely returned home.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes!',
          onPress: () => {
            updateReportStatus(report.id, 'reunited');
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 100 }}
      >
        <View style={styles.imageSection}>
          {report.photoUri ? (
            <Image source={{ uri: report.photoUri }} style={styles.heroImage} contentFit="cover" />
          ) : (
            <LinearGradient
              colors={report.status === 'lost' ? ['#FEE2E2', '#FECACA'] : ['#CCFBF1', '#99F6E4']}
              style={styles.heroPlaceholder}
            >
              <MaterialCommunityIcons
                name={getPetTypeIcon(report.petType) as any}
                size={80}
                color={statusColor}
              />
            </LinearGradient>
          )}

          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { top: insets.top + webTopPadding + 12 }]}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>

          <View style={[styles.statusOverlay, { backgroundColor: statusColor }]}>
            <Text style={styles.statusOverlayText}>{getStatusLabel(report.status)}</Text>
          </View>
        </View>

        <Animated.View entering={FadeInUp.duration(400)} style={styles.contentSection}>
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.petName}>
                {report.petName === 'Unknown' ? `${report.breed} ${report.petType}` : report.petName}
              </Text>
              <Text style={styles.breed}>{report.breed} · {report.color}</Text>
            </View>
            {!!report.reward && (
              <View style={styles.rewardChip}>
                <Ionicons name="gift" size={16} color={Colors.accent} />
                <Text style={styles.rewardAmount}>{report.reward}</Text>
              </View>
            )}
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name={getPetTypeIcon(report.petType) as any} size={20} color={Colors.primary} />
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{report.petType.charAt(0).toUpperCase() + report.petType.slice(1)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="resize" size={20} color={Colors.primary} />
              <Text style={styles.detailLabel}>Size</Text>
              <Text style={styles.detailValue}>{getSizeLabel(report.size)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="color-palette-outline" size={20} color={Colors.primary} />
              <Text style={styles.detailLabel}>Color</Text>
              <Text style={styles.detailValue}>{report.color}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(report.createdAt)}</Text>
            </View>
          </View>

          {!!report.markings && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Markings</Text>
              <Text style={styles.sectionText}>{report.markings}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionText}>{report.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationCard}>
              <Ionicons name="location-sharp" size={20} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationName}>{report.locationName}</Text>
                <Text style={styles.locationCoords}>
                  {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <View style={styles.contactCard}>
              <View style={styles.contactInfo}>
                <Ionicons name="person-circle" size={40} color={Colors.primary} />
                <View>
                  <Text style={styles.contactName}>{report.contactName}</Text>
                  <Text style={styles.contactPhone}>{report.contactPhone}</Text>
                </View>
              </View>
              <View style={styles.contactActions}>
                <Pressable onPress={handleCall} style={[styles.contactBtn, { backgroundColor: Colors.primary }]}>
                  <Ionicons name="call" size={20} color="#fff" />
                  <Text style={styles.contactBtnText}>Call</Text>
                </Pressable>
                <Pressable onPress={handleMessage} style={[styles.contactBtn, { backgroundColor: Colors.secondary }]}>
                  <Ionicons name="chatbubble" size={20} color="#fff" />
                  <Text style={styles.contactBtnText}>Text</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {report.isOwner && report.status !== 'reunited' && (
            <Pressable
              onPress={handleReunited}
              style={({ pressed }) => [styles.reunitedBtn, pressed && { opacity: 0.9 }]}
            >
              <Ionicons name="heart" size={20} color="#fff" />
              <Text style={styles.reunitedBtnText}>Mark as Reunited</Text>
            </Pressable>
          )}
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
    height: 300,
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
  statusOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusOverlayText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.5,
  },
  contentSection: {
    padding: 20,
    gap: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  petName: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  breed: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  rewardAmount: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#D97706',
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
  sectionText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  locationName: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
  },
  locationCoords: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
    marginTop: 2,
  },
  contactCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  contactPhone: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 10,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  contactBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  reunitedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.reunited,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  reunitedBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
});
