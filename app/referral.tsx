import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';

interface ReferralData {
  referralCode: string;
  referralCount: number;
  premiumUntil: string | null;
  rewards: { type: string; daysAwarded: number; reason: string; createdAt: string }[];
  sharesThisMonth: number;
  shares: { platform: string; date: string }[];
}

const REFERRAL_MILESTONES = [
  { count: 3, reward: '1 free week', days: 7 },
  { count: 5, reward: '1 free month', days: 30 },
  { count: 10, reward: 'Another free month', days: 30 },
];

const SHARE_TARGET = 20;

export default function ReferralScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loggingShare, setLoggingShare] = useState<string | null>(null);
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;
  const webBottomPadding = Platform.OS === 'web' ? 34 : 0;

  const fetchData = useCallback(async () => {
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL('/api/referral', baseUrl).toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error('Failed to load referral data', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopyCode = async () => {
    if (!data?.referralCode) return;
    await Clipboard.setStringAsync(data.referralCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareCode = async () => {
    if (!data?.referralCode) return;
    try {
      await Share.share({
        message: `Join The Fur Finder — Australia's AI-powered lost & found pet app! Use my referral code: ${data.referralCode}\n\nDownload the app and enter the code when you sign up to get 3 free days of Premium!`,
      });
    } catch {}
  };

  const handleLogShare = async (platform: string) => {
    setLoggingShare(platform);
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL('/api/referral/log-share', baseUrl).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ platform }),
      });
      const result = await res.json();

      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (result.rewardEarned) {
          Alert.alert(
            'Reward Earned!',
            'You reached 20 shares this month! You\'ve earned 1 free week of Premium.',
            [{ text: 'Awesome!' }]
          );
        } else {
          Alert.alert('Share Logged', `${platform.charAt(0).toUpperCase() + platform.slice(1)} share logged for today! ${SHARE_TARGET - result.sharesThisMonth} more shares to earn a free week.`);
        }
        await fetchData();
      } else {
        Alert.alert('Note', result.message || 'Could not log share');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to log share');
    } finally {
      setLoggingShare(null);
    }
  };

  const nextMilestone = data ? REFERRAL_MILESTONES.find(m => data.referralCount < m.count) : REFERRAL_MILESTONES[0];
  const progress = data && nextMilestone ? Math.min(data.referralCount / nextMilestone.count, 1) : 0;
  const shareProgress = data ? Math.min(data.sharesThisMonth / SHARE_TARGET, 1) : 0;

  const premiumDaysLeft = data?.premiumUntil
    ? Math.max(0, Math.ceil((new Date(data.premiumUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopPadding, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/settings')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Earn Free Premium</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + webBottomPadding + 40 }}
      >
        {premiumDaysLeft > 0 && (
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.premiumBanner}
          >
            <Ionicons name="star" size={20} color="#FDE68A" />
            <Text style={styles.premiumBannerText}>
              {premiumDaysLeft} day{premiumDaysLeft !== 1 ? 's' : ''} of free Premium remaining
            </Text>
          </LinearGradient>
        )}

        <LinearGradient
          colors={['#FF6B4A', '#FF8A6E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <MaterialCommunityIcons name="gift-outline" size={40} color="#FFF" />
          <Text style={styles.heroTitle}>Invite Friends, Get Rewarded</Text>
          <Text style={styles.heroSubtitle}>
            Share your code with friends. When they join, you both win!
          </Text>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Your Referral Code</Text>
        </View>

        <View style={styles.codeCard}>
          <View style={styles.codeDisplay}>
            <Text style={styles.codeText}>{data?.referralCode || '------'}</Text>
          </View>
          <View style={styles.codeActions}>
            <Pressable style={styles.codeBtn} onPress={handleCopyCode}>
              <Ionicons name={copied ? "checkmark" : "copy-outline"} size={18} color={Colors.primary} />
              <Text style={styles.codeBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
            </Pressable>
            <View style={styles.codeDivider} />
            <Pressable style={styles.codeBtn} onPress={handleShareCode}>
              <Ionicons name="share-outline" size={18} color={Colors.primary} />
              <Text style={styles.codeBtnText}>Share</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Referral Progress</Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressCountRow}>
              <Text style={styles.progressCount}>{data?.referralCount || 0}</Text>
              <Text style={styles.progressCountLabel}> friend{(data?.referralCount || 0) !== 1 ? 's' : ''} joined</Text>
            </View>
            {nextMilestone && (
              <Text style={styles.progressNext}>
                {nextMilestone.count - (data?.referralCount || 0)} more for {nextMilestone.reward}
              </Text>
            )}
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>

          <View style={styles.milestonesRow}>
            {REFERRAL_MILESTONES.map((m) => {
              const reached = (data?.referralCount || 0) >= m.count;
              return (
                <View key={m.count} style={styles.milestone}>
                  <View style={[styles.milestoneIcon, reached && styles.milestoneIconReached]}>
                    <Ionicons
                      name={reached ? "checkmark" : "gift-outline"}
                      size={16}
                      color={reached ? '#FFF' : Colors.textLight}
                    />
                  </View>
                  <Text style={[styles.milestoneCount, reached && styles.milestoneReached]}>
                    {m.count}
                  </Text>
                  <Text style={styles.milestoneReward}>{m.reward}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>How It Works</Text>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <Text style={styles.stepText}>Share your code with friends</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <Text style={styles.stepText}>They enter your code when signing up</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <Text style={styles.stepText}>They get 3 free days of Premium instantly</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
            <Text style={styles.stepText}>You earn free Premium at 3, 5, and 10 referrals</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Social Ambassador</Text>
        </View>

        <LinearGradient
          colors={['#2CBCB6', '#5DD4CF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ambassadorHero}
        >
          <Feather name="trending-up" size={28} color="#FFF" />
          <Text style={styles.ambassadorTitle}>Share Our Story, Earn Rewards</Text>
          <Text style={styles.ambassadorSubtitle}>
            Post about The Fur Finder on your social media stories. Log 20 shares in a month and get 1 free week of Premium!
          </Text>
        </LinearGradient>

        <View style={styles.shareProgressCard}>
          <View style={styles.shareProgressHeader}>
            <Text style={styles.shareProgressTitle}>This Month's Shares</Text>
            <Text style={styles.shareProgressCount}>
              {data?.sharesThisMonth || 0}/{SHARE_TARGET}
            </Text>
          </View>

          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={['#2CBCB6', '#5DD4CF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFillGradient, { width: `${shareProgress * 100}%` }]}
            />
          </View>

          <Text style={styles.shareProgressHint}>
            {(data?.sharesThisMonth || 0) >= SHARE_TARGET
              ? 'You earned your free week this month!'
              : `${SHARE_TARGET - (data?.sharesThisMonth || 0)} more shares to earn 1 free week`}
          </Text>
        </View>

        <View style={styles.shareInstructions}>
          <Text style={styles.shareInstructionsTitle}>How to earn</Text>
          <Text style={styles.shareInstructionsText}>
            1. Share a The Fur Finder promo story on Instagram, Facebook, or TikTok{'\n'}
            2. Come back here and tap the platform button to log it{'\n'}
            3. You can log one share per platform per day{'\n'}
            4. Reach 20 shares in a calendar month to earn your reward
          </Text>
        </View>

        <Text style={styles.logShareTitle}>Log Today's Share</Text>

        <View style={styles.platformRow}>
          <Pressable
            style={[styles.platformBtn, { backgroundColor: '#E1306C' }]}
            onPress={() => handleLogShare('instagram')}
            disabled={loggingShare !== null}
          >
            {loggingShare === 'instagram' ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="logo-instagram" size={24} color="#FFF" />
            )}
            <Text style={styles.platformBtnText}>Instagram</Text>
          </Pressable>

          <Pressable
            style={[styles.platformBtn, { backgroundColor: '#1877F2' }]}
            onPress={() => handleLogShare('facebook')}
            disabled={loggingShare !== null}
          >
            {loggingShare === 'facebook' ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="logo-facebook" size={24} color="#FFF" />
            )}
            <Text style={styles.platformBtnText}>Facebook</Text>
          </Pressable>

          <Pressable
            style={[styles.platformBtn, { backgroundColor: '#000' }]}
            onPress={() => handleLogShare('tiktok')}
            disabled={loggingShare !== null}
          >
            {loggingShare === 'tiktok' ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="logo-tiktok" size={24} color="#FFF" />
            )}
            <Text style={styles.platformBtnText}>TikTok</Text>
          </Pressable>
        </View>

        {data?.rewards && data.rewards.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Reward History</Text>
            </View>

            {data.rewards.map((reward, idx) => (
              <View key={idx} style={styles.rewardItem}>
                <View style={[styles.rewardIcon, { backgroundColor: reward.type === 'referral' ? '#FEF3C7' : reward.type === 'ambassador' ? '#F0FDFA' : '#EEF2FF' }]}>
                  <Ionicons
                    name={reward.type === 'referral' ? 'people' : reward.type === 'ambassador' ? 'megaphone' : 'gift'}
                    size={18}
                    color={reward.type === 'referral' ? '#D97706' : reward.type === 'ambassador' ? Colors.secondary : '#6366F1'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rewardText}>{reward.reason}</Text>
                  <Text style={styles.rewardDate}>
                    {new Date(reward.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardBadgeText}>+{reward.daysAwarded}d</Text>
                </View>
              </View>
            ))}
          </>
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
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  premiumBannerText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
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
  codeCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  codeDisplay: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFF5F3',
  },
  codeText: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: Colors.primary,
    letterSpacing: 4,
  },
  codeActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  codeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  codeBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },
  codeDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  progressCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 16,
  },
  progressHeader: {
    gap: 4,
  },
  progressCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressCount: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: Colors.primary,
  },
  progressCountLabel: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  progressNext: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textLight,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressBarFillGradient: {
    height: '100%',
    borderRadius: 4,
  },
  milestonesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  milestone: {
    alignItems: 'center',
    gap: 4,
  },
  milestoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneIconReached: {
    backgroundColor: Colors.success,
  },
  milestoneCount: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textLight,
  },
  milestoneReached: {
    color: Colors.success,
  },
  milestoneReward: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  howItWorksCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 12,
  },
  howItWorksTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
  },
  stepText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    flex: 1,
  },
  ambassadorHero: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  ambassadorTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    textAlign: 'center',
  },
  ambassadorSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 19,
  },
  shareProgressCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 12,
  },
  shareProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareProgressTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  shareProgressCount: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.secondary,
  },
  shareProgressHint: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  shareInstructions: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  shareInstructionsTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.secondary,
  },
  shareInstructionsText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  logShareTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  platformRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 10,
  },
  platformBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 14,
  },
  platformBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rewardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
  },
  rewardDate: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
    marginTop: 2,
  },
  rewardBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardBadgeText: {
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
    color: Colors.success,
  },
});
