import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Colors from '@/constants/colors';

const STEPS = [
  {
    icon: 'camera-outline' as const,
    color: Colors.primary,
    bgColor: '#FEF2F2',
    title: 'Report a Lost or Found Pet',
    description: 'Take a photo, add details like breed, colour, and location, and submit a report. The more info you add, the better chance of a match.',
  },
  {
    icon: 'search' as const,
    color: '#6366F1',
    bgColor: '#EEF2FF',
    title: 'AI-Powered Matching',
    description: 'Our AI compares photos, breed info, markings, and location to find potential matches between lost and found reports — even using biometric scanning of nose prints and facial features.',
  },
  {
    icon: 'map-outline' as const,
    color: Colors.secondary,
    bgColor: '#F0FDFA',
    title: 'Explore the Map',
    description: 'View all reported pets near you on an interactive map. Find nearby vets, shelters, and rescue organisations across Australia.',
  },
  {
    icon: 'paw-outline' as const,
    color: '#D97706',
    bgColor: '#FEF3C7',
    title: 'Register Your Pet',
    description: 'Pre-register your pet with photos, microchip number, and details. If they ever go missing, quickly create a report with pre-filled information.',
  },
  {
    icon: 'notifications-outline' as const,
    color: '#E11D48',
    bgColor: '#FFF1F2',
    title: 'Get Area Alerts',
    description: 'Receive notifications when a lost or found pet is reported near your registered pet\'s suburb — so you can keep an eye out.',
  },
  {
    icon: 'document-text-outline' as const,
    color: Colors.secondary,
    bgColor: '#F0FDFA',
    title: 'Generate & Share Flyers',
    description: 'Create a shareable flyer from any pet report with all the important details. Send it via messaging apps, social media, or print it out.',
  },
  {
    icon: 'heart-outline' as const,
    color: Colors.reunited,
    bgColor: '#F0FDF4',
    title: 'Celebrate Reunions',
    description: 'When a pet is found, mark it as reunited and share your happy story in the Happy Tails feed. Like, comment, and share reunion stories with the community.',
  },
];

const TIPS = [
  {
    icon: 'time-outline' as const,
    title: 'Act Fast',
    text: 'Report within the first 24 hours for the best chance of reunion.',
  },
  {
    icon: 'images-outline' as const,
    title: 'Clear Photos',
    text: 'Upload multiple clear photos showing markings, face, and full body.',
  },
  {
    icon: 'location-outline' as const,
    title: 'Be Specific',
    text: 'Include the exact suburb and street where the pet was last seen.',
  },
  {
    icon: 'share-social-outline' as const,
    title: 'Share Widely',
    text: 'Use the flyer and sharing features to spread the word on social media.',
  },
];

export default function HowItWorksScreen() {
  const insets = useSafeAreaInsets();
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;
  const webBottomPadding = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>How It Works</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + webBottomPadding + 40 }}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.heroSection}
        >
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons name="paw" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Helping Pets{'\n'}Find Their Way Home</Text>
          <Text style={styles.heroSubtitle}>
            PetReunite uses AI-powered photo matching, community alerts, and an Australia-wide network of vets and shelters to reunite lost pets with their families.
          </Text>
        </LinearGradient>

        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>Step by Step</Text>
          {STEPS.map((step, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.delay(index * 80).duration(400)}
              style={styles.stepCard}
            >
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={[styles.stepIconBg, { backgroundColor: step.bgColor }]}>
                <Ionicons name={step.icon} size={24} color={step.color} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Top Tips for Success</Text>
          <View style={styles.tipsGrid}>
            {TIPS.map((tip, index) => (
              <Animated.View
                key={index}
                entering={FadeInUp.delay(index * 80 + 500).duration(400)}
                style={styles.tipCard}
              >
                <View style={styles.tipIconBg}>
                  <Ionicons name={tip.icon} size={20} color={Colors.secondary} />
                </View>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.text}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/report')}
            style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.9 }]}
          >
            <Ionicons name="add-circle" size={22} color="#fff" />
            <Text style={styles.ctaBtnText}>Report a Pet</Text>
          </Pressable>
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
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 16,
  },
  heroBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  stepsSection: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 4,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },
  stepIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  stepDescription: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tipsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tipCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tipIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  tipText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 16,
  },
  ctaTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
  },
  ctaBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
});
