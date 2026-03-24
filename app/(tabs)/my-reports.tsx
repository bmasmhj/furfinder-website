import { useState } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, Alert, Platform, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useTheme } from '@/hooks/useTheme';
import { usePets } from '@/lib/pet-context';
import { useSubscription } from '@/lib/subscription-context';
import { PetReport, PetProfile, PetStatus } from '@/lib/types';
import { getStatusColor, getStatusBg, getStatusLabel, getPetTypeIcon, formatDate, getSizeLabel } from '@/lib/helpers';
import EmptyState from '@/components/EmptyState';

export default function MyPetsScreen() {
  const Colors = useTheme();
  const styles = getStyles(Colors);
  const insets = useSafeAreaInsets();
  const { myReports, profiles, updateReportStatus, deleteReport } = usePets();
  const { isPremium } = useSubscription();
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;
  const [activeTab, setActiveTab] = useState<'pets' | 'reports'>('pets');

  const handleAddPet = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/register-pet');
  };

  const renderProfileCard = (profile: PetProfile, index: number) => {
    const handleProfilePress = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      router.push({ pathname: '/my-pet/[id]', params: { id: profile.id } });
    };

    return (
      <Animated.View entering={FadeInRight.delay(index * 60).duration(300)}>
        <Pressable
          onPress={handleProfilePress}
          style={({ pressed }) => [styles.profileCard, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
        >
          {profile.photoUris.length > 0 ? (
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: profile.photoUris[0] }}
                style={styles.profileImage}
                contentFit="cover"
              />
            </View>
          ) : (
            <View style={[styles.profileIconCircle]}>
              <MaterialCommunityIcons
                name={getPetTypeIcon(profile.petType) as any}
                size={28}
                color={Colors.secondary}
              />
            </View>
          )}
          <View style={styles.profileContent}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileName} numberOfLines={1}>{profile.petName}</Text>
              <View style={styles.registeredPill}>
                <Ionicons name="shield-checkmark" size={10} color={Colors.secondary} />
                <Text style={styles.registeredPillText}>Registered</Text>
              </View>
            </View>
            <Text style={styles.profileMeta} numberOfLines={1}>
              {profile.breed} · {getSizeLabel(profile.size)}
            </Text>
            <View style={styles.profileDetails}>
              {!!profile.microchipNumber && (
                <View style={styles.profileTag}>
                  <Ionicons name="hardware-chip-outline" size={12} color={Colors.secondary} />
                  <Text style={styles.profileTagText}>Chipped</Text>
                </View>
              )}
              {!!profile.suburb && (
                <View style={styles.profileTag}>
                  <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.profileTagText}>{profile.suburb}</Text>
                </View>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        </Pressable>
      </Animated.View>
    );
  };

  const renderReportItem = (report: PetReport, index: number) => {
    const statusColor = getStatusColor(report.status);

    const handleReportPress = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      router.push({ pathname: '/pet/[id]', params: { id: report.id } });
    };

    const handleStatusChange = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      if (report.status === 'reunited') return;

      Alert.alert(
        'Mark as Reunited?',
        'This will mark the pet as safely returned home.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Reunited!',
            onPress: () => updateReportStatus(report.id, 'reunited'),
          },
        ]
      );
    };

    const handleDelete = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      Alert.alert(
        'Delete Report?',
        'This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteReport(report.id),
          },
        ]
      );
    };

    return (
      <Animated.View entering={FadeInRight.delay(index * 60).duration(300)}>
        <Pressable
          onPress={handleReportPress}
          style={({ pressed }) => [styles.reportItem, pressed && { opacity: 0.9 }]}
        >
          <View style={[styles.iconCircle, { backgroundColor: getStatusBg(report.status) }]}>
            <MaterialCommunityIcons
              name={getPetTypeIcon(report.petType) as any}
              size={24}
              color={statusColor}
            />
          </View>
          <View style={styles.reportContent}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportName} numberOfLines={1}>
                {report.petName === 'Unknown' ? report.breed : report.petName}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: getStatusBg(report.status) }]}>
                <Text style={[styles.statusPillText, { color: statusColor }]}>
                  {getStatusLabel(report.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.reportMeta}>
              {report.locationName} · {formatDate(report.createdAt)}
            </Text>
            <View style={styles.reportActions}>
              {report.status !== 'reunited' && (
                <Pressable onPress={handleStatusChange} style={styles.actionBtn}>
                  <Ionicons name="heart" size={16} color={Colors.reunited} />
                  <Text style={[styles.actionText, { color: Colors.reunited }]}>Reunited</Text>
                </Pressable>
              )}
              <Pressable onPress={handleDelete} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={16} color={Colors.danger} />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopPadding + 20 }]}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.title}>My Pets</Text>
            {isPremium && (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 }}>
                <Ionicons name="diamond" size={12} color="#F59E0B" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#D97706' }}>PRO</Text>
              </View>
            )}
          </View>
          <Pressable onPress={handleAddPet} style={styles.addBtn}>
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.tabsRow}>
          <Pressable
            onPress={() => setActiveTab('pets')}
            style={[styles.tabBtn, activeTab === 'pets' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, activeTab === 'pets' && styles.tabBtnTextActive]}>
              My Pets ({profiles.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('reports')}
            style={[styles.tabBtn, activeTab === 'reports' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, activeTab === 'reports' && styles.tabBtnTextActive]}>
              My Reports ({myReports.length})
            </Text>
          </Pressable>
        </View>
      </View>

      {activeTab === 'pets' ? (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => renderProfileCard(item, index)}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons name="paw" size={48} color={Colors.secondary} />
              </View>
              <Text style={styles.emptyTitle}>No pets registered yet</Text>
              <Text style={styles.emptySubtitle}>
                Register your pets now with their details, photos, and microchip number. If they ever go missing, you can quickly create a lost report.
              </Text>
              <Pressable
                onPress={handleAddPet}
                style={({ pressed }) => [styles.emptyBtn, pressed && { opacity: 0.9 }]}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.emptyBtnText}>Register My Pet</Text>
              </Pressable>
            </View>
          }
          contentContainerStyle={[
            styles.listContent,
            profiles.length === 0 && styles.emptyList,
          ]}
          scrollEnabled={!!profiles.length || true}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={myReports}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => renderReportItem(item, index)}
          ListEmptyComponent={
            <EmptyState
              icon="clipboard-text-outline"
              title="No reports yet"
              subtitle="When you report a lost or found pet, it will appear here"
            />
          }
          contentContainerStyle={[
            styles.listContent,
            myReports.length === 0 && styles.emptyList,
          ]}
          scrollEnabled={!!myReports.length || true}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.foundBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContent: {
    flex: 1,
    gap: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    flex: 1,
  },
  registeredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.foundBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  registeredPillText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.secondary,
  },
  profileMeta: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  profileDetails: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  profileTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  profileTagText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.foundBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  reportItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportContent: {
    flex: 1,
    gap: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.3,
  },
  reportMeta: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
});
