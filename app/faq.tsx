import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import Colors from '@/constants/colors';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How do I report a lost pet?',
    answer: 'Tap the "Report" tab at the bottom, select "Lost", add your pet\'s photo, details like breed, colour, and size, the location where they were last seen, and your contact info. Submit the report and it\'ll be visible to all users in your area.',
  },
  {
    category: 'Getting Started',
    question: 'How do I report a found pet?',
    answer: 'Tap the "Report" tab, select "Found", take a photo of the pet you found, add as many details as you can (breed, colour, size), the location where you found them, and your contact info. Other users can then check if it matches their lost pet.',
  },
  {
    category: 'Getting Started',
    question: 'Is The Fur Finder free to use?',
    answer: 'Yes! Basic features are free, including reporting one lost or found pet, viewing the map, and accessing safety tips. Premium subscribers get unlimited reports, AI-powered photo matching, scan post feature, and multi-photo uploads.',
  },
  {
    category: 'Pet Registration',
    question: 'What is pet registration and why should I do it?',
    answer: 'Pet registration lets you pre-register your pet with their photo, microchip number, breed, and other details. If your pet ever goes missing, you can quickly create a lost report with all their information pre-filled — saving precious time.',
  },
  {
    category: 'Pet Registration',
    question: 'What are biometric photos?',
    answer: 'Biometric photos are close-up shots of your pet\'s nose, eyes, and face. These unique features help our AI more accurately match your pet against found reports, similar to how fingerprints work for humans. You can add them when registering your pet.',
  },
  {
    category: 'AI Matching',
    question: 'How does AI matching work?',
    answer: 'Our AI uses OpenAI Vision to compare photos of lost and found pets, looking at facial features, coat patterns, markings, and physical characteristics. It also considers breed, colour, size, and location proximity to rank potential matches with confidence scores.',
  },
  {
    category: 'AI Matching',
    question: 'How accurate is the AI matching?',
    answer: 'AI matching provides confidence scores from 0-100%. Higher scores mean a stronger match. While AI is very good at identifying similar-looking pets, it\'s not perfect — always verify matches in person. The system works best with clear, well-lit photos.',
  },
  {
    category: 'AI Matching',
    question: 'What is "Scan Online Post"?',
    answer: 'If you see a lost or found pet post on Facebook, Instagram, Nextdoor, or any website, you can copy the text and paste it into our Scan Post feature. Our AI will extract the pet details and search for matches in the app automatically.',
  },
  {
    category: 'Safety & Security',
    question: 'Is my personal information safe?',
    answer: 'Your data is stored locally on your device and is never shared without your consent. We comply with the Australian Privacy Act 1988. You can view our full Privacy Policy in Settings. Your contact details are only visible on your reports to help facilitate reunions.',
  },
  {
    category: 'Safety & Security',
    question: 'How can I avoid pet scams?',
    answer: 'Be cautious of anyone who:\n\n• Claims to have found your pet but asks for money before returning them\n• Refuses to send a photo or video of the pet\n• Wants to meet in a private or remote location\n• Pressures you to act immediately without verification\n\nAlways verify by asking for specific details only the real finder/owner would know, meet in a public place, and bring someone with you.',
  },
  {
    category: 'Safety & Security',
    question: 'What should I do immediately if my pet goes missing?',
    answer: '1. Search your home thoroughly — check small spaces, cupboards, under furniture\n2. Walk your neighbourhood calling their name\n3. Report them on The Fur Finder immediately\n4. Contact local vets, shelters, and council\n5. Share the flyer on social media\n6. Put their bedding or a worn piece of your clothing outside\n7. Check the map for any found pet reports nearby\n8. Don\'t give up — pets can be found weeks or months later!',
  },
  {
    category: 'Features',
    question: 'What is the flyer generator?',
    answer: 'The flyer generator creates a shareable lost or found pet flyer from your report. It includes the pet\'s photo, description, location, and your contact details in an easy-to-read format. You can share it via messaging apps, social media, or print it out to post in your neighbourhood.',
  },
  {
    category: 'Features',
    question: 'What are area alerts?',
    answer: 'When you register a pet, you\'ll receive notifications if a lost or found pet is reported near your pet\'s suburb (within your configured radius). This helps you stay aware of any lost pets in your area that might need help.',
  },
  {
    category: 'Features',
    question: 'What is "Quick Snap"?',
    answer: 'Quick Snap lets you photograph a pet you\'ve spotted and instantly search for matching lost pet reports using AI biometric analysis. It\'s perfect for when you see a pet that looks lost — just snap a photo and let the AI find potential matches.',
  },
  {
    category: 'Features',
    question: 'What is "Happy Tails"?',
    answer: 'Happy Tails is our reunion stories feed! When a pet is marked as reunited, the owner can share their reunion story. You can read, like, comment on, and share these heartwarming stories with the community.',
  },
  {
    category: 'Account & Data',
    question: 'How do I delete my data?',
    answer: 'Go to Settings > Data Management > Delete All My Data. This will permanently delete all your pet reports and profiles. You can also revoke your consent entirely, which will delete all data and reset the app.',
  },
  {
    category: 'Account & Data',
    question: 'Can I edit or delete a report?',
    answer: 'Yes! Go to the "My Pets" tab, find your report, tap on it to open the detail view, and you\'ll see options to edit or delete it. You can also update its status (lost, found, reunited) at any time.',
  },
];

const CATEGORIES = [...new Set(FAQ_DATA.map(item => item.category))];

function FAQAccordion({ item, index }: { item: FAQItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        style={[styles.faqItem, isOpen && styles.faqItemOpen]}
      >
        <View style={styles.faqQuestionRow}>
          <Text style={[styles.faqQuestion, isOpen && styles.faqQuestionOpen]}>
            {item.question}
          </Text>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={isOpen ? Colors.primary : Colors.textLight}
          />
        </View>
        {isOpen && (
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function FAQScreen() {
  const insets = useSafeAreaInsets();
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;
  const webBottomPadding = Platform.OS === 'web' ? 34 : 0;
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredFAQ = activeCategory
    ? FAQ_DATA.filter(item => item.category === activeCategory)
    : FAQ_DATA;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/settings')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + webBottomPadding + 40 }}
      >
        <View style={styles.heroSection}>
          <Ionicons name="help-circle" size={48} color={Colors.primary} />
          <Text style={styles.heroTitle}>Frequently Asked Questions</Text>
          <Text style={styles.heroSubtitle}>Find answers about Australia's AI-powered pet recovery app</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          <Pressable
            onPress={() => setActiveCategory(null)}
            style={[styles.categoryChip, !activeCategory && styles.categoryChipActive]}
          >
            <Text style={[styles.categoryChipText, !activeCategory && styles.categoryChipTextActive]}>
              All
            </Text>
          </Pressable>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat === activeCategory ? null : cat)}
              style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryChipText, activeCategory === cat && styles.categoryChipTextActive]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.faqList}>
          {filteredFAQ.map((item, index) => (
            <FAQAccordion key={index} item={item} index={index} />
          ))}
        </View>

        <View style={styles.scamSection}>
          <View style={styles.scamHeader}>
            <Ionicons name="warning" size={24} color="#D97706" />
            <Text style={styles.scamTitle}>Scam Awareness</Text>
          </View>
          <Text style={styles.scamText}>
            Be cautious when someone contacts you about your pet. Never send money to someone claiming to have found your pet without verifying in person first. Meet in a public place and bring someone with you.
          </Text>
          <View style={styles.scamTips}>
            <View style={styles.scamTipRow}>
              <Ionicons name="close-circle" size={16} color={Colors.danger} />
              <Text style={styles.scamTipText}>Never send money before seeing your pet</Text>
            </View>
            <View style={styles.scamTipRow}>
              <Ionicons name="close-circle" size={16} color={Colors.danger} />
              <Text style={styles.scamTipText}>Don't share banking details with strangers</Text>
            </View>
            <View style={styles.scamTipRow}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.scamTipText}>Ask for specific details only the real finder would know</Text>
            </View>
            <View style={styles.scamTipRow}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.scamTipText}>Always meet in a well-lit, public location</Text>
            </View>
          </View>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still have questions?</Text>
          <Pressable
            onPress={() => router.push('/settings')}
            style={styles.contactBtn}
          >
            <Ionicons name="mail" size={18} color="#fff" />
            <Text style={styles.contactBtnText}>Contact Us</Text>
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
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
    gap: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  categoryRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  faqList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  faqItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  faqItemOpen: {
    borderColor: Colors.primaryLight,
    backgroundColor: '#FFFBFA',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    lineHeight: 22,
  },
  faqQuestionOpen: {
    color: Colors.primary,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  scamSection: {
    margin: 20,
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  scamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scamTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: '#92400E',
  },
  scamText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#78350F',
    lineHeight: 21,
  },
  scamTips: {
    gap: 8,
  },
  scamTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scamTipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#78350F',
    lineHeight: 19,
  },
  contactSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  contactBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
});
