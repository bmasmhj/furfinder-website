import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useSubscription } from '@/lib/subscription-context';

const FEATURES = [
  { icon: 'infinite', label: 'Unlimited pet reports', free: '1 report', premium: 'Unlimited' },
  { icon: 'paw', label: 'Unlimited pet profiles', free: '1 profile', premium: 'Unlimited' },
  { icon: 'sparkles', label: 'AI-powered matching', free: 'Not available', premium: 'Included' },
  { icon: 'scan', label: 'Scan online posts', free: 'Not available', premium: 'Included' },
  { icon: 'images', label: 'Multi-photo uploads', free: '1 photo', premium: 'Up to 5' },
  { icon: 'notifications', label: 'Priority area alerts', free: 'Standard', premium: 'Priority' },
  { icon: 'rocket', label: 'Boost lost pet reports', free: 'Not available', premium: '1x per week' },
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const { isPremium, offerings, purchasePackage, restorePurchases } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  const handlePurchase = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsProcessing(true);
    const pkg = offerings.length > 0
      ? (offerings[selectedPlan === 'yearly' ? 1 : 0] || offerings[0])
      : null;
    const success = await purchasePackage(pkg);
    setIsProcessing(false);
    if (success) {
      Alert.alert('Welcome to Premium!', 'You now have access to all premium features.', [
        { text: 'Awesome!', onPress: () => router.canGoBack() ? router.back() : router.replace('/(tabs)') },
      ]);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsProcessing(true);
    const success = await restorePurchases();
    setIsProcessing(false);
    if (success) {
      Alert.alert('Restored!', 'Your premium subscription has been restored.', [
        { text: 'Great!', onPress: () => router.canGoBack() ? router.back() : router.replace('/(tabs)') },
      ]);
    } else {
      Alert.alert('No Subscription Found', 'We could not find an active subscription to restore.');
    }
  };

  if (isPremium) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
        <View style={styles.premiumActiveContainer}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </Pressable>
          <View style={styles.premiumActiveIcon}>
            <Ionicons name="diamond" size={48} color="#F59E0B" />
          </View>
          <Text style={styles.premiumActiveTitle}>You're Premium!</Text>
          <Text style={styles.premiumActiveSubtitle}>
            You have access to all premium features. Thank you for supporting The Fur Finder!
          </Text>
          <Pressable style={styles.premiumActiveBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}>
            <Text style={styles.premiumActiveBtnText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>

        <LinearGradient
          colors={['#F59E0B', '#F97316', '#EF4444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <Animated.View entering={FadeInUp.duration(400)} style={styles.heroContent}>
            <View style={styles.heroIconBg}>
              <Ionicons name="diamond" size={36} color="#F59E0B" />
            </View>
            <Text style={styles.heroTitle}>Unlock AI-Powered Recovery</Text>
            <Text style={styles.heroSubtitle}>
              Unlock powerful tools to find your pet faster
            </Text>
          </Animated.View>
        </LinearGradient>

        <View style={styles.content}>
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <Text style={styles.sectionTitle}>Choose your plan</Text>
            <View style={styles.plansRow}>
              <Pressable
                style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.planPriceSelected]}>$4.99</Text>
                <Text style={[styles.planPeriod, selectedPlan === 'monthly' && styles.planPeriodSelected]}>per month</Text>
              </Pressable>
              <Pressable
                style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected]}
                onPress={() => setSelectedPlan('yearly')}
              >
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>SAVE 17%</Text>
                </View>
                <Text style={[styles.planPrice, selectedPlan === 'yearly' && styles.planPriceSelected]}>$49.99</Text>
                <Text style={[styles.planPeriod, selectedPlan === 'yearly' && styles.planPeriodSelected]}>per year</Text>
                <Text style={[styles.planBreakdown, selectedPlan === 'yearly' && styles.planBreakdownSelected]}>~$4.17/month</Text>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <Text style={styles.sectionTitle}>What you get</Text>
            <View style={styles.featuresCard}>
              {FEATURES.map((feature, idx) => (
                <View key={idx} style={[styles.featureRow, idx < FEATURES.length - 1 && styles.featureRowBorder]}>
                  <View style={styles.featureIconBg}>
                    <Ionicons name={feature.icon as any} size={18} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.featureLabel}>{feature.label}</Text>
                    <View style={styles.featureComparison}>
                      <View style={styles.freeTag}>
                        <Text style={styles.freeTagText}>{feature.free}</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={12} color={Colors.textLight} />
                      <View style={styles.premiumTag}>
                        <Text style={styles.premiumTagText}>{feature.premium}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.ctaSection}>
            <Pressable
              style={[styles.purchaseBtn, isProcessing && { opacity: 0.7 }]}
              onPress={handlePurchase}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={['#F59E0B', '#F97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.purchaseBtnGradient}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="diamond" size={20} color="#fff" />
                    <Text style={styles.purchaseBtnText}>
                      {selectedPlan === 'yearly' ? 'Get Premium — $49.99/year' : 'Get Premium — $4.99/month'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable onPress={handleRestore} style={styles.restoreBtn}>
              <Text style={styles.restoreBtnText}>Restore Purchase</Text>
            </Pressable>

            <Text style={styles.legalText}>
              Cancel anytime. Subscription auto-renews unless cancelled at least 24 hours before the end of the current period.
            </Text>
          </Animated.View>
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
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    gap: 12,
  },
  heroIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginBottom: 12,
    marginTop: 4,
  },
  plansRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderLight,
  },
  planCardSelected: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  planPrice: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  planPriceSelected: {
    color: '#F59E0B',
  },
  planPeriod: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  planPeriodSelected: {
    color: '#B45309',
  },
  planBreakdown: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textLight,
    marginTop: 4,
  },
  planBreakdownSelected: {
    color: '#D97706',
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  saveBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featuresCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  featureIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
    marginBottom: 4,
  },
  featureComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freeTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  freeTagText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
  },
  premiumTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  premiumTagText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#B45309',
  },
  ctaSection: {
    alignItems: 'center',
    gap: 12,
  },
  purchaseBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  purchaseBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  purchaseBtnText: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },
  restoreBtn: {
    paddingVertical: 10,
  },
  restoreBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.primary,
  },
  legalText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  premiumActiveContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  premiumActiveIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumActiveTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  premiumActiveSubtitle: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  premiumActiveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  premiumActiveBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
});
