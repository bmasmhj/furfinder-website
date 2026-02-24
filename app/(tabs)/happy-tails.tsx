import { useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, Platform, Share, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { usePets } from '@/lib/pet-context';
import { PetReport } from '@/lib/types';
import { formatDate, getPetTypeIcon } from '@/lib/helpers';
import EmptyState from '@/components/EmptyState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function StoryCard({ report, index }: { report: PetReport; index: number }) {
  const { toggleLike } = usePets();

  const photos = report.photoUris && report.photoUris.length > 0
    ? report.photoUris
    : report.photoUri ? [report.photoUri] : [];

  const handleLike = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleLike(report.id);
  };

  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const shareText = `${report.petName} has been reunited! ${report.reunionMessage || ''}\n\nShared from PetReunite - helping pets find their way home.`;
    try {
      await Share.share({ message: shareText });
    } catch (_e) {}
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/happy-tail/[id]', params: { id: report.id } });
  };

  const timeAgo = formatDate(report.reunionDate || report.createdAt);

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400).springify()}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.97, transform: [{ scale: 0.99 }] }]}
      >
        <View style={styles.cardImageContainer}>
          {photos.length > 0 ? (
            <Image source={{ uri: photos[0] }} style={styles.cardImage} contentFit="cover" transition={200} />
          ) : (
            <LinearGradient colors={['#D1FAE5', '#A7F3D0']} style={styles.cardImagePlaceholder}>
              <MaterialCommunityIcons name={getPetTypeIcon(report.petType) as any} size={60} color={Colors.reunited} />
            </LinearGradient>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardName}>{report.petName}</Text>
            <Text style={styles.cardTime}>{timeAgo}</Text>
          </View>

          <View style={styles.cardReactionsRow}>
            <Pressable onPress={handleLike} style={styles.reactionBtn}>
              <Ionicons name={report.likedByMe ? 'heart' : 'heart-outline'} size={18} color={report.likedByMe ? '#EF4444' : Colors.textLight} />
              <Text style={[styles.reactionCount, report.likedByMe && { color: '#EF4444' }]}>{report.likes || 0}</Text>
            </Pressable>
            <View style={styles.reactionBtn}>
              <Ionicons name="chatbubble-outline" size={16} color={Colors.textLight} />
              <Text style={styles.reactionCount}>{report.comments?.length || 0}</Text>
            </View>
            <Pressable onPress={handleShare} style={styles.reactionBtn}>
              <Ionicons name="share-social-outline" size={16} color={Colors.textLight} />
              <Text style={styles.reactionCount}>0</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardStorySection}>
          <View style={styles.cardLocationRow}>
            <Text style={styles.cardLocation}>{report.locationName}</Text>
            <View style={styles.reunitedBadge}>
              <Text style={styles.reunitedBadgeText}>REUNITED</Text>
            </View>
          </View>
          {!!report.reunionMessage && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Message from {report.contactName}:</Text>
              <Text style={styles.messageText} numberOfLines={3}>
                "{report.reunionMessage}"
              </Text>
            </View>
          )}

          <View style={styles.cardActions}>
            <Pressable onPress={handlePress} style={styles.readMoreBtn}>
              <FontAwesome5 name="book-open" size={12} color={Colors.secondary} />
              <Text style={styles.readMoreText}>Read More</Text>
            </Pressable>
            <Pressable onPress={handleShare} style={styles.shareStoryBtn}>
              <Ionicons name="share-social" size={14} color="#fff" />
              <Text style={styles.shareStoryText}>Share</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HappyTailsScreen() {
  const insets = useSafeAreaInsets();
  const { reunitedReports } = usePets();
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  const reuniteCount = reunitedReports.length;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#22C55E', '#16A34A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + webTopPadding + 16 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>Happy Tails</Text>
              <Text style={styles.subtitle}>Celebrating reunited pets</Text>
            </View>
            <View style={styles.heartIconBg}>
              <Ionicons name="heart" size={24} color="#fff" />
            </View>
          </View>
          {reuniteCount > 0 && (
            <View style={styles.statsRow}>
              <View style={styles.statBubble}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.reunited} />
                <Text style={styles.statText}>{reuniteCount} Reunited</Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>

      <FlatList
        data={reunitedReports}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <StoryCard report={item} index={index} />}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="No reunion stories yet"
            subtitle="When a pet is marked as reunited, their happy story will appear here"
          />
        }
        contentContainerStyle={[
          styles.listContent,
          reunitedReports.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!reunitedReports.length || true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  headerGradient: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.85)',
  },
  heartIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageContainer: {
    height: 220,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 14,
    gap: 6,
  },
  cardNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  cardTime: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textLight,
    textTransform: 'uppercase',
  },
  cardReactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 2,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  reactionCount: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textLight,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 14,
  },
  cardStorySection: {
    padding: 14,
    gap: 10,
  },
  cardLocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLocation: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
    flex: 1,
  },
  reunitedBadge: {
    backgroundColor: Colors.reunited,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reunitedBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  messageContainer: {
    gap: 4,
  },
  messageLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  readMoreText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.secondary,
  },
  shareStoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
  },
  shareStoryText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
});
