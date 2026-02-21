import { StyleSheet, Text, View, Pressable, ScrollView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface FilterBarProps {
  selected: string;
  onSelect: (filter: string) => void;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'lost', label: 'Lost' },
  { key: 'found', label: 'Found' },
  { key: 'reunited', label: 'Reunited' },
];

export default function FilterBar({ selected, onSelect }: FilterBarProps) {
  const handlePress = (key: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelect(key);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((filter) => {
        const isActive = selected === filter.key;
        return (
          <Pressable
            key={filter.key}
            onPress={() => handlePress(filter.key)}
            style={[
              styles.chip,
              isActive && styles.chipActive,
            ]}
          >
            <Text style={[
              styles.chipText,
              isActive && styles.chipTextActive,
            ]}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
  },
});
