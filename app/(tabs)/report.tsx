import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Colors from '@/constants/colors';

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  const handleReport = (type: 'lost' | 'found') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push({ pathname: '/report-form', params: { type } });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopPadding + 20 }]}>
        <Text style={styles.title}>Report a Pet</Text>
        <Text style={styles.subtitle}>Help a pet get back home safely</Text>
      </View>

      <View style={styles.cardsContainer}>
        <Animated.View entering={FadeInUp.delay(100).duration(500).springify()}>
          <Pressable
            onPress={() => handleReport('lost')}
            style={({ pressed }) => [pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.cardIconContainer}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.9)" />
              </View>
              <Text style={styles.cardTitle}>I Lost My Pet</Text>
              <Text style={styles.cardDescription}>
                Report your missing pet so the community can help you find them
              </Text>
              <View style={styles.cardAction}>
                <Text style={styles.cardActionText}>Report Lost Pet</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(500).springify()}>
          <Pressable
            onPress={() => handleReport('found')}
            style={({ pressed }) => [pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
          >
            <LinearGradient
              colors={['#2CBCB6', '#1A9E98']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.cardIconContainer}>
                <MaterialCommunityIcons name="magnify" size={48} color="rgba(255,255,255,0.9)" />
              </View>
              <Text style={styles.cardTitle}>I Found a Pet</Text>
              <Text style={styles.cardDescription}>
                Report a pet you found so their owner can be reunited with them
              </Text>
              <View style={styles.cardAction}>
                <Text style={styles.cardActionText}>Report Found Pet</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Quick Tips</Text>
        <View style={styles.tipRow}>
          <Ionicons name="camera" size={18} color={Colors.primary} />
          <Text style={styles.tipText}>Take clear photos from multiple angles</Text>
        </View>
        <View style={styles.tipRow}>
          <Ionicons name="location" size={18} color={Colors.primary} />
          <Text style={styles.tipText}>Pin the exact location where you last saw them</Text>
        </View>
        <View style={styles.tipRow}>
          <Ionicons name="call" size={18} color={Colors.primary} />
          <Text style={styles.tipText}>Add your contact info so finders can reach you</Text>
        </View>
      </View>
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
    paddingBottom: 20,
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
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    gap: 8,
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  cardActionText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  tipsContainer: {
    marginTop: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    flex: 1,
  },
});
