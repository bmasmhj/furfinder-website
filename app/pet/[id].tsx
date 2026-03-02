import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Linking, Platform, Alert, Share, TextInput, Dimensions, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { usePets } from '@/lib/pet-context';
import { useSubscription } from '@/lib/subscription-context';
import { useAuth } from '@/lib/auth-context';
import { Comment, TimelineEvent, PetReport } from '@/lib/types';
import { getStatusColor, getStatusBg, getStatusLabel, getPetTypeIcon, getSizeLabel, formatDate } from '@/lib/helpers';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function getTimelineColor(type: TimelineEvent['type']): string {
  switch (type) {
    case 'created': return Colors.primary;
    case 'status_change': return Colors.secondary;
    case 'comment': return Colors.accent;
    case 'sighting': return '#6366F1';
    case 'photo_added': return Colors.success;
    default: return Colors.textLight;
  }
}

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getReport, updateReportStatus, markReunited, addComment, addRewardContribution, boostReport } = usePets();
  const { canUseAIMatching } = useSubscription();
  const { token, user } = useAuth();
  const cachedReport = getReport(id);
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  const [fullReport, setFullReport] = useState<PetReport | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [showContributeInput, setShowContributeInput] = useState(false);
  const [showReunionInput, setShowReunionInput] = useState(false);
  const [reunionMessage, setReunionMessage] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const baseUrl = getApiUrl();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(new URL(`/api/reports/${id}`, baseUrl).toString(), { headers });
        if (res.ok) {
          setFullReport(await res.json());
        }
      } catch (e) {
        console.error('Failed to fetch report detail', e);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [id, token]);

  const report = fullReport || cachedReport;

  if (!report && loadingDetail) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopPadding, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

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

  const photos = report.photoUris && report.photoUris.length > 0
    ? report.photoUris
    : report.photoUri ? [report.photoUri] : [];

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

  const handleInAppMessage = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (!token || !user) {
      Alert.alert('Login Required', 'Please log in to send messages.');
      return;
    }
    const reportOwnerId = (report as any).userId;
    if (!reportOwnerId || reportOwnerId === user.id) return;
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL('/api/conversations', baseUrl).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reportId: report.id, recipientId: reportOwnerId }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/chat/${data.conversationId}`);
      } else {
        Alert.alert('Error', 'Could not start conversation');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server');
    }
  };

  const isActiveBoosted = !!(report.isBoosted && report.boostExpiresAt && new Date(report.boostExpiresAt).getTime() > Date.now());

  const boostDaysRemaining = isActiveBoosted && report.boostExpiresAt
    ? Math.max(0, Math.ceil((new Date(report.boostExpiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  const handleBoost = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (isActiveBoosted) {
      Alert.alert('Already Boosted', `This report is boosted for ${boostDaysRemaining} more day${boostDaysRemaining !== 1 ? 's' : ''}. It appears at the top of the feed for maximum visibility.`);
      return;
    }
    Alert.alert(
      'Boost This Report',
      `For just $0.99, your report will be pinned to the top of the home feed for 7 days so more people can see it.\n\nThis gives ${report.petName} the best chance of being found!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Boost for $0.99',
          onPress: async () => {
            await boostReport(report.id);
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert('Report Boosted!', `${report.petName}'s report is now pinned to the top of the feed for 7 days. More eyes mean a better chance of reunion!`);
          },
        },
      ]
    );
  };

  const handleReunited = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowReunionInput(true);
  };

  const handleSubmitReunion = async () => {
    const msg = reunionMessage.trim() || `${report.petName} has been reunited with their owner!`;
    await markReunited(report.id, msg);
    setShowReunionInput(false);
    setReunionMessage('');
    router.back();
  };

  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const shareText = `Help find ${report.petName}! ${getStatusLabel(report.status)} ${report.petType} - ${report.breed}, ${report.color}. Last seen near ${report.locationName}. Contact: ${report.contactPhone}`;
    try {
      await Share.share({ message: shareText });
    } catch (_e) {}
  };

  const handleBlockUser = async () => {
    if (!token || !report.userId) return;
    setShowMoreMenu(false);
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${report.contactName || 'this user'}? You won't see their reports anymore.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              const baseUrl = getApiUrl();
              await fetch(new URL(`/api/users/${report.userId}/block`, baseUrl).toString(), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert('User Blocked', 'You will no longer see content from this user.');
            } catch {
              Alert.alert('Error', 'Failed to block user');
            }
          },
        },
      ]
    );
  };

  const handleReportContent = async (reason: string) => {
    if (!token) return;
    setShowMoreMenu(false);
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL('/api/content-report', baseUrl).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reportId: report.id, reason }),
      });
      const result = await res.json();
      Alert.alert('Content Reported', result.message || 'Thank you. We will review this content.');
    } catch {
      Alert.alert('Error', 'Failed to report content');
    }
  };

  const showReportOptions = () => {
    setShowMoreMenu(false);
    Alert.alert(
      'Report Content',
      'Why are you reporting this?',
      [
        { text: 'Spam or scam', onPress: () => handleReportContent('spam') },
        { text: 'Inappropriate content', onPress: () => handleReportContent('inappropriate') },
        { text: 'False or misleading', onPress: () => handleReportContent('misleading') },
        { text: 'Harassment or abuse', onPress: () => handleReportContent('harassment') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !authorName.trim()) return;
    await addComment(report.id, authorName.trim(), commentText.trim());
    setCommentText('');
  };

  const handleContribute = async () => {
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) return;
    await addRewardContribution(report.id, amount);
    setContributionAmount('');
    setShowContributeInput(false);
  };

  const onPhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActivePhotoIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 100 }}
      >
        <View style={styles.imageSection}>
          {photos.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onPhotoScroll}
                scrollEventThrottle={16}
                style={styles.photoGallery}
              >
                {photos.map((uri, index) => (
                  <Image key={index} source={{ uri }} style={styles.heroImage} contentFit="cover" />
                ))}
              </ScrollView>
              {photos.length > 1 && (
                <View style={styles.dotContainer}>
                  {photos.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        index === activePhotoIndex && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
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

          <View style={[styles.topRightBtns, { top: insets.top + webTopPadding + 12 }]}>
            <Pressable onPress={handleShare} style={styles.shareBtn}>
              <Ionicons name="share-outline" size={22} color={Colors.text} />
            </Pressable>
            {token && report.userId && report.userId !== (undefined) && (
              <Pressable onPress={() => setShowMoreMenu(true)} style={styles.moreBtn}>
                <Ionicons name="ellipsis-vertical" size={20} color={Colors.text} />
              </Pressable>
            )}
          </View>

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

          {report.status === 'lost' && (
            <View style={styles.rewardPoolCard}>
              <View style={styles.rewardPoolHeader}>
                <Ionicons name="wallet-outline" size={22} color={Colors.accent} />
                <Text style={styles.rewardPoolTitle}>Reward Pool</Text>
              </View>
              <Text style={styles.rewardPoolAmount}>${report.rewardPool?.toFixed(2) ?? '0.00'}</Text>
              {showContributeInput ? (
                <View style={styles.contributeInputRow}>
                  <TextInput
                    style={styles.contributeInput}
                    placeholder="Amount ($)"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                    value={contributionAmount}
                    onChangeText={setContributionAmount}
                  />
                  <Pressable onPress={handleContribute} style={styles.contributeSubmitBtn}>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </Pressable>
                  <Pressable onPress={() => { setShowContributeInput(false); setContributionAmount(''); }} style={styles.contributeCancelBtn}>
                    <Ionicons name="close" size={20} color={Colors.textSecondary} />
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => setShowContributeInput(true)} style={styles.contributeBtn}>
                  <Ionicons name="add-circle-outline" size={18} color="#fff" />
                  <Text style={styles.contributeBtnText}>Contribute</Text>
                </Pressable>
              )}
            </View>
          )}

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
              {!report.isOwner && token && (
                <Pressable onPress={handleInAppMessage} style={[styles.contactBtn, { backgroundColor: '#0284C7', marginTop: 10, alignSelf: 'stretch' }]}>
                  <Ionicons name="chatbubbles" size={20} color="#fff" />
                  <Text style={styles.contactBtnText}>Message in App</Text>
                </Pressable>
              )}
            </View>
          </View>

          {report.timeline && report.timeline.length > 0 && (
            <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.section}>
              <Text style={styles.sectionTitle}>Timeline</Text>
              <View style={styles.timelineContainer}>
                {report.timeline.map((event, index) => {
                  const color = getTimelineColor(event.type);
                  const isLast = index === report.timeline.length - 1;
                  return (
                    <View key={event.id} style={styles.timelineItem}>
                      <View style={styles.timelineLeft}>
                        <View style={[styles.timelineDot, { backgroundColor: color }]} />
                        {!isLast && <View style={[styles.timelineLine, { backgroundColor: color + '40' }]} />}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineDescription}>{event.description}</Text>
                        <Text style={styles.timelineDate}>{formatDate(event.createdAt)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          )}

          <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>Community Tips</Text>
            {report.comments && report.comments.length > 0 ? (
              <View style={styles.commentsContainer}>
                {report.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <Ionicons name="person-circle-outline" size={28} color={Colors.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.commentAuthor}>{comment.author}</Text>
                        <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                      </View>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noCommentsText}>No tips yet. Be the first to share!</Text>
            )}
            <View style={styles.addCommentContainer}>
              <TextInput
                style={styles.authorInput}
                placeholder="Your name"
                placeholderTextColor={Colors.textLight}
                value={authorName}
                onChangeText={setAuthorName}
              />
              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Share a tip or sighting..."
                  placeholderTextColor={Colors.textLight}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <Pressable
                  onPress={handlePostComment}
                  style={[
                    styles.postBtn,
                    (!commentText.trim() || !authorName.trim()) && styles.postBtnDisabled,
                  ]}
                  disabled={!commentText.trim() || !authorName.trim()}
                >
                  <Text style={styles.postBtnText}>Post</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {report.status !== 'reunited' && (
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                if (!canUseAIMatching()) {
                  router.push('/paywall');
                  return;
                }
                router.push(`/matches?reportId=${report.id}`);
              }}
              style={({ pressed }) => [styles.findMatchesBtn, pressed && { opacity: 0.9 }]}
            >
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.findMatchesBtnText}>Find AI Matches</Text>
              {!canUseAIMatching() && (
                <View style={styles.premiumLockBadge}>
                  <Ionicons name="diamond" size={10} color="#F59E0B" />
                  <Text style={styles.premiumLockText}>PRO</Text>
                </View>
              )}
            </Pressable>
          )}

          {report.status !== 'reunited' && (
            <Pressable
              onPress={() => router.push(`/flyer?id=${report.id}`)}
              style={({ pressed }) => [styles.flyerBtn, pressed && { opacity: 0.9 }]}
            >
              <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
              <Text style={styles.flyerBtnText}>Generate Flyer</Text>
            </Pressable>
          )}

          {report.status !== 'reunited' && (
            <Pressable
              onPress={handleBoost}
              style={({ pressed }) => [
                isActiveBoosted ? styles.boostBtnActive : styles.boostBtn,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Ionicons name="rocket" size={20} color={isActiveBoosted ? '#fff' : '#F59E0B'} />
              <Text style={isActiveBoosted ? styles.boostBtnActiveText : styles.boostBtnText}>
                {isActiveBoosted ? `Boosted · ${boostDaysRemaining}d left` : 'Boost Report · $0.99'}
              </Text>
            </Pressable>
          )}

          {report.isOwner && report.status !== 'reunited' && !showReunionInput && (
            <Pressable
              onPress={handleReunited}
              style={({ pressed }) => [styles.reunitedBtn, pressed && { opacity: 0.9 }]}
            >
              <Ionicons name="heart" size={20} color="#fff" />
              <Text style={styles.reunitedBtnText}>Mark as Reunited</Text>
            </Pressable>
          )}

          {showReunionInput && (
            <Animated.View entering={FadeInUp.duration(300)} style={styles.reunionInputCard}>
              <View style={styles.reunionInputHeader}>
                <Ionicons name="heart-circle" size={28} color={Colors.reunited} />
                <Text style={styles.reunionInputTitle}>Share Your Reunion Story</Text>
              </View>
              <Text style={styles.reunionInputHint}>
                Tell the community how {report.petName} was found! This will appear in Happy Tails.
              </Text>
              <TextInput
                style={styles.reunionTextInput}
                placeholder={`How was ${report.petName} reunited? Share your story...`}
                placeholderTextColor={Colors.textLight}
                value={reunionMessage}
                onChangeText={setReunionMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.reunionBtnRow}>
                <Pressable
                  onPress={() => { setShowReunionInput(false); setReunionMessage(''); }}
                  style={styles.reunionCancelBtn}
                >
                  <Text style={styles.reunionCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmitReunion}
                  style={({ pressed }) => [styles.reunionSubmitBtn, pressed && { opacity: 0.9 }]}
                >
                  <Ionicons name="heart" size={18} color="#fff" />
                  <Text style={styles.reunionSubmitText}>Reunited!</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      {showMoreMenu && (
        <Pressable style={styles.menuOverlay} onPress={() => setShowMoreMenu(false)}>
          <View style={[styles.menuDropdown, { top: insets.top + webTopPadding + 60 }]}>
            <Pressable style={styles.menuOption} onPress={showReportOptions}>
              <Ionicons name="flag-outline" size={20} color={Colors.danger} />
              <Text style={styles.menuOptionText}>Report Content</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable style={styles.menuOption} onPress={handleBlockUser}>
              <Ionicons name="ban-outline" size={20} color={Colors.danger} />
              <Text style={styles.menuOptionText}>Block User</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
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
  photoGallery: {
    width: '100%',
    height: '100%',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
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
  topRightBtns: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  shareBtn: {
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
  moreBtn: {
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
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 100,
  },
  menuDropdown: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  menuOptionText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: Colors.danger,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 14,
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
  rewardPoolCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  rewardPoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardPoolTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#92400E',
  },
  rewardPoolAmount: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#D97706',
  },
  contributeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    paddingVertical: 10,
    borderRadius: 10,
  },
  contributeBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  contributeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contributeInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  contributeSubmitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contributeCancelBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
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
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 50,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  timelineDescription: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    lineHeight: 20,
  },
  timelineDate: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
    marginTop: 2,
  },
  commentsContainer: {
    gap: 12,
  },
  commentItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentAuthor: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  commentDate: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
    paddingLeft: 38,
  },
  noCommentsText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: 16,
  },
  addCommentContainer: {
    marginTop: 8,
    gap: 8,
  },
  authorInput: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    maxHeight: 80,
  },
  postBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  postBtnDisabled: {
    opacity: 0.5,
  },
  postBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  findMatchesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 14,
  },
  findMatchesBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  flyerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginTop: 8,
  },
  flyerBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },
  boostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    marginTop: 8,
  },
  boostBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#D97706',
  },
  boostBtnActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  boostBtnActiveText: {
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
  premiumLockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
    marginLeft: 4,
  },
  premiumLockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FEF3C7',
    letterSpacing: 0.5,
  },
  reunionInputCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  reunionInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reunionInputTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: '#166534',
  },
  reunionInputHint: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#4ADE80',
    lineHeight: 19,
  },
  reunionTextInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    minHeight: 100,
  },
  reunionBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  reunionCancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  reunionCancelText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
  },
  reunionSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.reunited,
  },
  reunionSubmitText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
});
