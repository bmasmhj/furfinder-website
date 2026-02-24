import { useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { usePets } from '@/lib/pet-context';
import { getStatusColor, getStatusLabel, getPetTypeIcon, getSizeLabel } from '@/lib/helpers';

export default function FlyerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getReport } = usePets();
  const report = getReport(id);
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;
  const webBottomPadding = Platform.OS === 'web' ? 34 : 0;

  if (!report) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Report not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const photos = report.photoUris && report.photoUris.length > 0
    ? report.photoUris
    : report.photoUri ? [report.photoUri] : [];

  const statusColor = getStatusColor(report.status);
  const statusLabel = getStatusLabel(report.status);
  const isLost = report.status === 'lost';

  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const flyerText = `🚨 ${statusLabel} PET 🚨\n\n` +
      `Name: ${report.petName}\n` +
      `Type: ${report.petType.charAt(0).toUpperCase() + report.petType.slice(1)}\n` +
      `Breed: ${report.breed}\n` +
      `Colour: ${report.color}\n` +
      `Size: ${getSizeLabel(report.size)}\n` +
      `Location: ${report.locationName}\n` +
      (report.description ? `Description: ${report.description}\n` : '') +
      `\n📞 Contact: ${report.contactName}\n` +
      `📱 Phone: ${report.contactPhone}\n` +
      (report.reward ? `💰 Reward: $${report.reward}\n` : '') +
      `\nPlease share and help ${report.petName} get home!\n` +
      `\nShared from PetReunite`;
    try {
      await Share.share({ message: flyerText });
    } catch (_e) {}
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Pet Flyer</Text>
        <Pressable onPress={handleShare} style={styles.shareBtn}>
          <Ionicons name="share-social" size={22} color={Colors.secondary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + webBottomPadding + 100 }}
      >
        <Animated.View entering={FadeInUp.duration(400)} style={styles.flyerContainer}>
          <View style={styles.flyer}>
            <LinearGradient
              colors={isLost ? ['#EF4444', '#DC2626'] : ['#2CBCB6', '#14A89E']}
              style={styles.flyerHeader}
            >
              <Text style={styles.flyerStatusLabel}>{statusLabel}</Text>
              <Text style={styles.flyerStatusSubtitle}>
                {isLost ? 'PLEASE HELP ME FIND MY WAY HOME' : 'DO YOU RECOGNISE THIS PET?'}
              </Text>
            </LinearGradient>

            <View style={styles.flyerPhotoSection}>
              {photos.length > 0 ? (
                <View style={styles.flyerPhotosRow}>
                  {photos.slice(0, 3).map((uri, index) => (
                    <Image
                      key={index}
                      source={{ uri }}
                      style={[
                        styles.flyerPhoto,
                        photos.length === 1 && styles.flyerPhotoSingle,
                        photos.length === 2 && styles.flyerPhotoDouble,
                      ]}
                      contentFit="cover"
                      transition={200}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.flyerPhotoPlaceholder}>
                  <MaterialCommunityIcons name={getPetTypeIcon(report.petType) as any} size={80} color={statusColor} />
                  <Text style={styles.noPhotoText}>No photo available</Text>
                </View>
              )}
            </View>

            <View style={styles.flyerNameBanner}>
              <MaterialCommunityIcons name={getPetTypeIcon(report.petType) as any} size={24} color={statusColor} />
              <Text style={[styles.flyerPetName, { color: statusColor }]}>{report.petName}</Text>
            </View>

            <View style={styles.flyerDetailsSection}>
              <View style={styles.flyerDetailRow}>
                <View style={styles.flyerDetailItem}>
                  <Ionicons name="paw" size={16} color={Colors.textSecondary} />
                  <View>
                    <Text style={styles.flyerDetailLabel}>Breed</Text>
                    <Text style={styles.flyerDetailValue}>{report.breed}</Text>
                  </View>
                </View>
                <View style={styles.flyerDetailItem}>
                  <Ionicons name="color-palette" size={16} color={Colors.textSecondary} />
                  <View>
                    <Text style={styles.flyerDetailLabel}>Colour</Text>
                    <Text style={styles.flyerDetailValue}>{report.color}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.flyerDetailRow}>
                <View style={styles.flyerDetailItem}>
                  <Ionicons name="resize" size={16} color={Colors.textSecondary} />
                  <View>
                    <Text style={styles.flyerDetailLabel}>Size</Text>
                    <Text style={styles.flyerDetailValue}>{getSizeLabel(report.size)}</Text>
                  </View>
                </View>
                <View style={styles.flyerDetailItem}>
                  <Ionicons name="location" size={16} color={Colors.textSecondary} />
                  <View>
                    <Text style={styles.flyerDetailLabel}>Last Seen</Text>
                    <Text style={styles.flyerDetailValue} numberOfLines={2}>{report.locationName}</Text>
                  </View>
                </View>
              </View>
            </View>

            {!!report.description && (
              <View style={styles.flyerDescSection}>
                <Text style={styles.flyerDescLabel}>Description</Text>
                <Text style={styles.flyerDescText}>{report.description}</Text>
              </View>
            )}

            {!!report.reward && (
              <View style={[styles.rewardBanner, { backgroundColor: isLost ? '#FEF3C7' : '#F0FDFA' }]}>
                <Ionicons name="trophy" size={20} color="#D97706" />
                <Text style={styles.rewardText}>Reward: ${report.reward}</Text>
              </View>
            )}

            <View style={styles.flyerContactSection}>
              <LinearGradient
                colors={isLost ? ['#FEF2F2', '#FEE2E2'] : ['#F0FDFA', '#CCFBF1']}
                style={styles.contactCard}
              >
                <Text style={[styles.contactTitle, { color: statusColor }]}>
                  {isLost ? 'IF FOUND, PLEASE CONTACT:' : 'CONTACT:'}
                </Text>
                <View style={styles.contactRow}>
                  <Ionicons name="person" size={18} color={statusColor} />
                  <Text style={styles.contactValue}>{report.contactName}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Ionicons name="call" size={18} color={statusColor} />
                  <Text style={styles.contactValue}>{report.contactPhone}</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.flyerFooter}>
              <Text style={styles.flyerFooterText}>Created with PetReunite</Text>
              <Text style={styles.flyerFooterSubtext}>Help pets find their way home</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.actionButtons}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [styles.primaryActionBtn, pressed && { opacity: 0.9 }]}
          >
            <Ionicons name="share-social" size={20} color="#fff" />
            <Text style={styles.primaryActionText}>Share Flyer</Text>
          </Pressable>
          <Text style={styles.actionHint}>
            Share this flyer via messaging apps, social media, or email to help spread the word.
          </Text>
        </View>
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
  shareBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flyerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  flyer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  flyerHeader: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 4,
  },
  flyerStatusLabel: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    letterSpacing: 4,
  },
  flyerStatusSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.5,
  },
  flyerPhotoSection: {
    padding: 16,
  },
  flyerPhotosRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flyerPhoto: {
    flex: 1,
    height: 180,
    borderRadius: 12,
  },
  flyerPhotoSingle: {
    height: 250,
  },
  flyerPhotoDouble: {
    height: 200,
  },
  flyerPhotoPlaceholder: {
    height: 180,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  noPhotoText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
  },
  flyerNameBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  flyerPetName: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
  },
  flyerDetailsSection: {
    padding: 16,
    gap: 12,
  },
  flyerDetailRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flyerDetailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  flyerDetailLabel: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  flyerDetailValue: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  flyerDescSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 6,
  },
  flyerDescLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  flyerDescText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    lineHeight: 21,
  },
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  rewardText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#92400E',
  },
  flyerContactSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contactCard: {
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  contactTitle: {
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactValue: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  flyerFooter: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  flyerFooterText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textLight,
  },
  flyerFooterSubtext: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
    alignItems: 'center',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
  },
  primaryActionText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  actionHint: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
