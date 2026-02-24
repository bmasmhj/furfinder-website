import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, Share, Linking, TextInput, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { usePets } from '@/lib/pet-context';
import { formatDate, getPetTypeIcon, getSizeLabel } from '@/lib/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HappyTailDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getReport, toggleLike, addComment } = usePets();
  const report = getReport(id);
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');

  if (!report) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
        <View style={styles.notFound}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={Colors.textLight} />
          <Text style={styles.notFoundText}>Story not found</Text>
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

  const handleLike = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleLike(report.id);
  };

  const getShareText = () => {
    return `${report.petName} has been reunited!\n\n${report.reunionMessage || ''}\n\nLocation: ${report.locationName}\n\nShared from PetReunite - helping pets find their way home.`;
  };

  const handleShareNative = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await Share.share({ message: getShareText() });
    } catch (_e) {}
  };

  const handleShareFacebook = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const text = encodeURIComponent(getShareText());
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?quote=${text}`;
    try {
      const canOpen = await Linking.canOpenURL(fbUrl);
      if (canOpen) {
        await Linking.openURL(fbUrl);
      } else {
        await Share.share({ message: getShareText() });
      }
    } catch (_e) {
      await Share.share({ message: getShareText() });
    }
  };

  const handleShareInstagram = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await Share.share({ message: getShareText() });
  };

  const handleShareTikTok = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await Share.share({ message: getShareText() });
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !authorName.trim()) return;
    await addComment(report.id, authorName.trim(), commentText.trim());
    setCommentText('');
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
                    <View key={index} style={[styles.dot, index === activePhotoIndex && styles.dotActive]} />
                  ))}
                </View>
              )}
            </>
          ) : (
            <LinearGradient colors={['#D1FAE5', '#A7F3D0']} style={styles.heroPlaceholder}>
              <MaterialCommunityIcons name={getPetTypeIcon(report.petType) as any} size={80} color={Colors.reunited} />
            </LinearGradient>
          )}

          <Pressable onPress={() => router.back()} style={[styles.backBtn, { top: insets.top + webTopPadding + 12 }]}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>

          <View style={styles.statusOverlay}>
            <Ionicons name="heart" size={14} color="#fff" />
            <Text style={styles.statusOverlayText}>REUNITED</Text>
          </View>
        </View>

        <Animated.View entering={FadeInUp.duration(400)} style={styles.contentSection}>
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.petName}>{report.petName}</Text>
              <Text style={styles.breed}>{report.breed} · {report.color}</Text>
            </View>
            <Pressable onPress={handleLike} style={styles.likeBtnLarge}>
              <Ionicons name={report.likedByMe ? 'heart' : 'heart-outline'} size={24} color={report.likedByMe ? '#EF4444' : Colors.textLight} />
              <Text style={[styles.likeCount, report.likedByMe && { color: '#EF4444' }]}>{report.likes || 0}</Text>
            </Pressable>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name={getPetTypeIcon(report.petType) as any} size={20} color={Colors.reunited} />
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{report.petType.charAt(0).toUpperCase() + report.petType.slice(1)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="resize" size={20} color={Colors.reunited} />
              <Text style={styles.detailLabel}>Size</Text>
              <Text style={styles.detailValue}>{getSizeLabel(report.size)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={20} color={Colors.reunited} />
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{report.locationName}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={20} color={Colors.reunited} />
              <Text style={styles.detailLabel}>Reunited</Text>
              <Text style={styles.detailValue}>{formatDate(report.reunionDate || report.createdAt)}</Text>
            </View>
          </View>

          {!!report.reunionMessage && (
            <View style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <Ionicons name="heart-circle" size={24} color={Colors.reunited} />
                <Text style={styles.storyTitle}>Reunion Story</Text>
              </View>
              <Text style={styles.storyAuthor}>From {report.contactName}:</Text>
              <Text style={styles.storyText}>"{report.reunionMessage}"</Text>
            </View>
          )}

          <View style={styles.shareSection}>
            <Text style={styles.shareSectionTitle}>Share this Happy Tail</Text>
            <View style={styles.shareButtons}>
              <Pressable onPress={handleShareFacebook} style={[styles.socialBtn, { backgroundColor: '#1877F2' }]}>
                <FontAwesome5 name="facebook-f" size={18} color="#fff" />
                <Text style={styles.socialBtnText}>Facebook</Text>
              </Pressable>
              <Pressable onPress={handleShareInstagram} style={[styles.socialBtn, { backgroundColor: '#E1306C' }]}>
                <FontAwesome5 name="instagram" size={18} color="#fff" />
                <Text style={styles.socialBtnText}>Instagram</Text>
              </Pressable>
              <Pressable onPress={handleShareTikTok} style={[styles.socialBtn, { backgroundColor: '#000' }]}>
                <FontAwesome5 name="tiktok" size={16} color="#fff" />
                <Text style={styles.socialBtnText}>TikTok</Text>
              </Pressable>
            </View>
            <Pressable onPress={handleShareNative} style={styles.nativeShareBtn}>
              <Ionicons name="share-social" size={20} color="#fff" />
              <Text style={styles.nativeShareText}>Share to Any App</Text>
            </Pressable>
          </View>

          <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.commentsSection}>
            <Text style={styles.commentsSectionTitle}>Community Messages</Text>
            {report.comments && report.comments.length > 0 ? (
              <View style={styles.commentsContainer}>
                {report.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <Ionicons name="person-circle-outline" size={28} color={Colors.reunited} />
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
              <Text style={styles.noCommentsText}>No messages yet. Be the first to congratulate!</Text>
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
                  placeholder="Send a congratulatory message..."
                  placeholderTextColor={Colors.textLight}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <Pressable
                  onPress={handlePostComment}
                  style={[styles.postBtn, (!commentText.trim() || !authorName.trim()) && styles.postBtnDisabled]}
                  disabled={!commentText.trim() || !authorName.trim()}
                >
                  <Text style={styles.postBtnText}>Post</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
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
    color: Colors.reunited,
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
  statusOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.reunited,
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
  likeBtnLarge: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
  },
  likeCount: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textLight,
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
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  storyCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storyTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: '#166534',
  },
  storyAuthor: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
  },
  storyText: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    lineHeight: 23,
    fontStyle: 'italic',
  },
  shareSection: {
    gap: 14,
  },
  shareSectionTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  socialBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  nativeShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nativeShareText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  commentsSection: {
    gap: 12,
  },
  commentsSectionTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
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
    borderColor: '#BBF7D0',
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
    borderColor: '#BBF7D0',
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
    borderColor: '#BBF7D0',
    maxHeight: 100,
  },
  postBtn: {
    backgroundColor: Colors.reunited,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  postBtnDisabled: {
    opacity: 0.4,
  },
  postBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
});
