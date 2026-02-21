import { useState } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { usePets } from '@/lib/pet-context';
import { PetReport, PetStatus } from '@/lib/types';
import { getStatusColor, getStatusBg, getStatusLabel, getPetTypeIcon, formatDate } from '@/lib/helpers';
import EmptyState from '@/components/EmptyState';

function MyReportItem({ report, index }: { report: PetReport; index: number }) {
  const { updateReportStatus, deleteReport } = usePets();
  const statusColor = getStatusColor(report.status);

  const handlePress = () => {
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

    const newStatus: PetStatus = 'reunited';
    Alert.alert(
      'Mark as Reunited?',
      'This will mark the pet as safely returned home.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Reunited!',
          onPress: () => updateReportStatus(report.id, newStatus),
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
        onPress={handlePress}
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
}

export default function MyReportsScreen() {
  const insets = useSafeAreaInsets();
  const { myReports } = usePets();
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopPadding + 20 }]}>
        <Text style={styles.title}>My Reports</Text>
        <Text style={styles.subtitle}>{myReports.length} active reports</Text>
      </View>

      <FlatList
        data={myReports}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <MyReportItem report={item} index={index} />}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
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
