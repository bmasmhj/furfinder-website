import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useConsent } from '@/lib/consent-context';
import { usePets } from '@/lib/pet-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { consentDate, revokeConsent } = useConsent();
  const { reports, profiles, deleteReport, deleteProfile } = usePets();
  const [isDeleting, setIsDeleting] = useState(false);
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;
  const webBottomPadding = Platform.OS === 'web' ? 34 : 0;

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your pet reports, profiles, and personal data from the app. This action cannot be undone.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              for (const report of reports) {
                deleteReport(report.id);
              }
              for (const profile of profiles) {
                deleteProfile(profile.id);
              }
              Alert.alert('Done', 'All your data has been deleted.');
            } catch (e) {
              Alert.alert('Error', 'Failed to delete data. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleRevokeConsent = () => {
    Alert.alert(
      'Revoke Consent & Delete Data',
      'This will revoke your consent, delete all your data, and return you to the welcome screen. You will need to accept the policies again to use the app.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke & Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const report of reports) {
                deleteReport(report.id);
              }
              for (const profile of profiles) {
                deleteProfile(profile.id);
              }
              await revokeConsent();
              router.replace('/consent');
            } catch (e) {
              Alert.alert('Error', 'Failed to revoke consent. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formattedDate = consentDate
    ? new Date(consentDate).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Not recorded';

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + webBottomPadding + 40 }}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Legal</Text>
        </View>

        <Pressable style={styles.menuItem} onPress={() => router.push('/privacy-policy')}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="shield-checkmark" size={18} color="#6366F1" />
            </View>
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </Pressable>

        <Pressable style={styles.menuItem} onPress={() => router.push('/terms-of-use')}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="document-text" size={18} color="#EA580C" />
            </View>
            <Text style={styles.menuItemText}>Terms of Use</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Consent</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Consent given</Text>
            <Text style={styles.infoValue}>{formattedDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Privacy Policy version</Text>
            <Text style={styles.infoValue}>1.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Terms of Use version</Text>
            <Text style={styles.infoValue}>1.0</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Your Data</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pet reports</Text>
            <Text style={styles.infoValue}>{reports.length}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pet profiles</Text>
            <Text style={styles.infoValue}>{profiles.length}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Storage</Text>
            <Text style={styles.infoValue}>Local device only</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Data Management</Text>
        </View>

        <Pressable
          style={styles.menuItem}
          onPress={handleDeleteAllData}
          disabled={isDeleting}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="trash" size={18} color={Colors.danger} />
            </View>
            <View>
              <Text style={[styles.menuItemText, { color: Colors.danger }]}>
                Delete All My Data
              </Text>
              <Text style={styles.menuItemSubtext}>
                Remove all reports and profiles
              </Text>
            </View>
          </View>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={handleRevokeConsent}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="close-circle" size={18} color={Colors.danger} />
            </View>
            <View>
              <Text style={[styles.menuItemText, { color: Colors.danger }]}>
                Revoke Consent & Delete Data
              </Text>
              <Text style={styles.menuItemSubtext}>
                Withdraw consent and remove all data
              </Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textLight} />
          <Text style={styles.footerNoteText}>
            Under the Australian Privacy Act, you have the right to access, correct, and delete your personal information at any time.
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
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
  },
  menuItemSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 14,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
  },
  footerNoteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
    lineHeight: 18,
  },
});
