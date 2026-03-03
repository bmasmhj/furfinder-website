import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  isMe: boolean;
  readAt: string | null;
  createdAt: string;
}

interface ConversationInfo {
  otherUserName: string;
  reportPetName: string | null;
  reportStatus: string | null;
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return time;
  if (isYesterday) return `Yesterday ${time}`;
  return `${date.toLocaleDateString()} ${time}`;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;
  const [messages, setMessages] = useState<Message[]>([]);
  const [convInfo, setConvInfo] = useState<ConversationInfo | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!token || !id) return;
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL(`/api/conversations/${id}/messages`, baseUrl).toString(), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const msgs: Message[] = await res.json();
        setMessages(msgs.reverse());
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  const loadConvInfo = useCallback(async () => {
    if (!token) return;
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL('/api/conversations', baseUrl).toString(), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const convs = await res.json();
        const conv = convs.find((c: any) => c.id === id);
        if (conv) {
          setConvInfo({
            otherUserName: conv.otherUserName,
            reportPetName: conv.reportPetName,
            reportStatus: conv.reportStatus,
          });
        }
      }
    } catch {
    }
  }, [token, id]);

  useEffect(() => {
    loadMessages();
    loadConvInfo();
  }, [loadMessages, loadConvInfo]);

  useEffect(() => {
    if (!token || !id) return;
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages, token, id]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !token || sending) return;

    const tempMsg: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      senderName: user?.displayName || '',
      text,
      isMe: true,
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [tempMsg, ...prev]);
    setInputText('');
    setSending(true);

    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL(`/api/conversations/${id}/messages`, baseUrl).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const serverMsg: Message = await res.json();
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? serverMsg : m));
      }
    } catch {
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubbleContainer, item.isMe ? styles.myMessage : styles.theirMessage]}>
      {!item.isMe && (
        <View style={styles.senderAvatar}>
          <Ionicons name="person" size={14} color={Colors.textLight} />
        </View>
      )}
      <View style={[styles.messageBubble, item.isMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.messageText, item.isMe ? styles.myText : styles.theirText]}>{item.text}</Text>
        <Text style={[styles.messageTime, item.isMe ? styles.myTime : styles.theirTime]}>
          {formatMessageTime(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  const getStatusLabel = (status: string | null) => {
    if (status === 'lost') return 'Lost Pet';
    if (status === 'found') return 'Found Pet';
    return '';
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/conversations')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Chat</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + webTopPadding }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/conversations')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {convInfo?.otherUserName || 'Chat'}
          </Text>
          {convInfo?.reportPetName && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {getStatusLabel(convInfo.reportStatus)}: {convInfo.reportPetName}
            </Text>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted={messages.length > 0}
        contentContainerStyle={[
          styles.messagesList,
          messages.length === 0 && styles.emptyContainer,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Start the conversation</Text>
            <Text style={styles.emptySubtext}>
              Send a message about the pet report
            </Text>
          </View>
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        scrollEnabled={messages.length > 0}
      />

      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'web' ? 34 : 8) }]}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textLight}
          multiline
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          testID="chat-input"
        />
        <Pressable
          onPress={handleSend}
          style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
          disabled={!inputText.trim() || sending}
          testID="send-btn"
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  theirMessage: {
    justifyContent: 'flex-start',
  },
  senderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 20,
  },
  myText: {
    color: '#fff',
  },
  theirText: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    marginTop: 4,
  },
  myTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  theirTime: {
    color: Colors.textLight,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    marginRight: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
