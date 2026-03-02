import { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';

interface Conversation {
  id: string;
  reportId: string | null;
  reportPetName: string | null;
  reportStatus: string | null;
  reportPhoto: string | null;
  otherUserId: string;
  otherUserName: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}

export default function ConversationsScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL('/api/conversations', baseUrl).toString(), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setConversations(await res.json());
      }
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadConversations();
    }, [loadConversations])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const getStatusColor = (status: string | null) => {
    if (status === 'lost') return Colors.primary;
    if (status === 'found') return Colors.success;
    return Colors.secondary;
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <Pressable
      style={styles.conversationCard}
      onPress={() => router.push(`/chat/${item.id}`)}
      testID={`conversation-${item.id}`}
    >
      <View style={styles.avatarContainer}>
        {item.reportPhoto ? (
          <Image source={{ uri: item.reportPhoto }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={24} color={Colors.textLight} />
          </View>
        )}
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount > 9 ? '9+' : item.unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.otherUserName, item.unreadCount > 0 && styles.unreadName]} numberOfLines={1}>
            {item.otherUserName}
          </Text>
          <Text style={styles.timeText}>{formatTime(item.lastMessageAt)}</Text>
        </View>
        {item.reportPetName && (
          <View style={styles.reportBadge}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.reportStatus) }]} />
            <Text style={styles.reportPetName} numberOfLines={1}>
              {item.reportStatus === 'lost' ? 'Lost' : item.reportStatus === 'found' ? 'Found' : ''}: {item.reportPetName}
            </Text>
          </View>
        )}
        <Text
          style={[styles.lastMessage, item.unreadCount > 0 && styles.unreadMessage]}
          numberOfLines={1}
        >
          {item.lastMessageText || 'No messages yet'}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
    </Pressable>
  );

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={[
          styles.listContent,
          conversations.length === 0 && styles.emptyContainer,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              When you message someone about a pet report, your conversations will appear here
            </Text>
          </View>
        }
        scrollEnabled={conversations.length > 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    position: 'relative' as const,
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  unreadBadge: {
    position: 'absolute' as const,
    top: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  unreadText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  conversationContent: {
    flex: 1,
    marginRight: 8,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  otherUserName: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  unreadName: {
    fontFamily: 'Poppins_700Bold',
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
  },
  reportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  reportPetName: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textLight,
    flex: 1,
  },
  lastMessage: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
  },
  unreadMessage: {
    color: Colors.text,
    fontFamily: 'Poppins_500Medium',
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
});
