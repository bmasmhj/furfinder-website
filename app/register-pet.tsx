import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { usePets } from '@/lib/pet-context';
import { useSubscription } from '@/lib/subscription-context';
import { PetType, PetSize } from '@/lib/types';

const PET_TYPES: { key: PetType; label: string; icon: string }[] = [
  { key: 'dog', label: 'Dog', icon: 'dog' },
  { key: 'cat', label: 'Cat', icon: 'cat' },
  { key: 'bird', label: 'Bird', icon: 'bird' },
  { key: 'rabbit', label: 'Rabbit', icon: 'rabbit' },
  { key: 'other', label: 'Other', icon: 'paw' },
];

const PET_SIZES: { key: PetSize; label: string }[] = [
  { key: 'small', label: 'Small' },
  { key: 'medium', label: 'Medium' },
  { key: 'large', label: 'Large' },
];

export default function RegisterPetScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const insets = useSafeAreaInsets();
  const { addProfile, updateProfile, getProfile, profiles } = usePets();
  const { canAddProfile } = useSubscription();
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  const existingProfile = editId ? getProfile(editId) : undefined;

  const [photoUris, setPhotoUris] = useState<string[]>(existingProfile?.photoUris || []);
  const [biometricPhotoUris, setBiometricPhotoUris] = useState<string[]>(existingProfile?.biometricPhotoUris || []);
  const [petType, setPetType] = useState<PetType>(existingProfile?.petType || 'dog');
  const [petName, setPetName] = useState(existingProfile?.petName || '');
  const [breed, setBreed] = useState(existingProfile?.breed || '');
  const [size, setSize] = useState<PetSize>(existingProfile?.size || 'medium');
  const [color, setColor] = useState(existingProfile?.color || '');
  const [markings, setMarkings] = useState(existingProfile?.markings || '');
  const [microchipNumber, setMicrochipNumber] = useState(existingProfile?.microchipNumber || '');
  const [medicalNotes, setMedicalNotes] = useState(existingProfile?.medicalNotes || '');
  const [suburb, setSuburb] = useState(existingProfile?.suburb || '');
  const [ownerName, setOwnerName] = useState(existingProfile?.ownerName || '');
  const [ownerPhone, setOwnerPhone] = useState(existingProfile?.ownerPhone || '');
  const [isSaving, setIsSaving] = useState(false);

  const addPhoto = async (source: 'camera' | 'gallery') => {
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera access is needed to take pet photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets[0].base64) {
        setPhotoUris(prev => [...prev, `data:image/jpeg;base64,${result.assets[0].base64}`]);
      }
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets[0].base64) {
        setPhotoUris(prev => [...prev, `data:image/jpeg;base64,${result.assets[0].base64}`]);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotoUris(prev => prev.filter((_, i) => i !== index));
  };

  const addBiometricPhoto = async (source: 'camera' | 'gallery') => {
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera access is needed to take biometric scans.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets[0].base64) {
        setBiometricPhotoUris(prev => [...prev, `data:image/jpeg;base64,${result.assets[0].base64}`]);
      }
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets[0].base64) {
        setBiometricPhotoUris(prev => [...prev, `data:image/jpeg;base64,${result.assets[0].base64}`]);
      }
    }
  };

  const removeBiometricPhoto = (index: number) => {
    setBiometricPhotoUris(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!petName.trim()) {
      Alert.alert('Missing info', 'Please enter your pet\'s name.');
      return;
    }
    if (!breed.trim()) {
      Alert.alert('Missing info', 'Please enter the breed.');
      return;
    }
    if (!ownerName.trim() || !ownerPhone.trim()) {
      Alert.alert('Missing info', 'Please enter your contact details.');
      return;
    }

    if (!existingProfile && !canAddProfile(profiles.length)) {
      Alert.alert('Profile Limit', 'Free users can register 1 pet profile. Upgrade to Premium for unlimited profiles.', [
        { text: 'Maybe Later' },
        { text: 'Upgrade', onPress: () => router.push('/paywall') },
      ]);
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setIsSaving(true);
    try {
      if (existingProfile) {
        await updateProfile(existingProfile.id, {
          petType,
          petName: petName.trim(),
          breed: breed.trim(),
          size,
          color: color.trim(),
          markings: markings.trim(),
          photoUris,
          biometricPhotoUris,
          microchipNumber: microchipNumber.trim(),
          medicalNotes: medicalNotes.trim(),
          suburb: suburb.trim(),
          ownerName: ownerName.trim(),
          ownerPhone: ownerPhone.trim(),
        });
      } else {
        await addProfile({
          petType,
          petName: petName.trim(),
          breed: breed.trim(),
          size,
          color: color.trim(),
          markings: markings.trim(),
          photoUris,
          biometricPhotoUris,
          microchipNumber: microchipNumber.trim(),
          medicalNotes: medicalNotes.trim(),
          suburb: suburb.trim(),
          ownerName: ownerName.trim(),
          ownerPhone: ownerPhone.trim(),
        });
      }
      router.canGoBack() ? router.back() : router.replace('/(tabs)/my-reports');
    } catch (e) {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopPadding + 12 }]}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/my-reports')}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {existingProfile ? 'Edit Pet Profile' : 'Register My Pet'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.secondary} />
          <Text style={styles.infoText}>
            Register your pet now so if they ever go missing, you can quickly create a lost report with all their details.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
          {photoUris.map((uri, index) => (
            <View key={index} style={styles.photoThumb}>
              <Image source={{ uri }} style={styles.photoThumbImage} contentFit="cover" />
              <Pressable onPress={() => removePhoto(index)} style={styles.removePhotoBtn}>
                <Ionicons name="close-circle" size={22} color={Colors.danger} />
              </Pressable>
            </View>
          ))}
          <View style={styles.addPhotoButtons}>
            <Pressable onPress={() => addPhoto('camera')} style={styles.addPhotoBtn}>
              <Ionicons name="camera" size={22} color={Colors.primary} />
            </Pressable>
            <Pressable onPress={() => addPhoto('gallery')} style={styles.addPhotoBtn}>
              <Ionicons name="images" size={22} color={Colors.primary} />
            </Pressable>
          </View>
        </ScrollView>

        <Text style={styles.sectionLabel}>Pet Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
          {PET_TYPES.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => {
                setPetType(t.key);
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[styles.typeChip, petType === t.key && styles.typeChipActive]}
            >
              <MaterialCommunityIcons
                name={t.icon as any}
                size={22}
                color={petType === t.key ? '#fff' : Colors.textSecondary}
              />
              <Text style={[styles.typeChipText, petType === t.key && styles.typeChipTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>Pet Name *</Text>
        <TextInput
          style={styles.input}
          value={petName}
          onChangeText={setPetName}
          placeholder="Enter your pet's name"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.sectionLabel}>Breed *</Text>
        <TextInput
          style={styles.input}
          value={breed}
          onChangeText={setBreed}
          placeholder="e.g. Golden Retriever, Tabby"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.sectionLabel}>Size</Text>
        <View style={styles.sizeRow}>
          {PET_SIZES.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => {
                setSize(s.key);
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[styles.sizeChip, size === s.key && styles.sizeChipActive]}
            >
              <Text style={[styles.sizeChipText, size === s.key && styles.sizeChipTextActive]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Color</Text>
        <TextInput
          style={styles.input}
          value={color}
          onChangeText={setColor}
          placeholder="e.g. Black and white, Golden"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.sectionLabel}>Markings</Text>
        <TextInput
          style={styles.input}
          value={markings}
          onChangeText={setMarkings}
          placeholder="Any distinctive markings or features"
          placeholderTextColor={Colors.textLight}
        />

        <View style={styles.divider} />

        <View style={styles.biometricSection}>
          <View style={styles.biometricHeader}>
            <MaterialCommunityIcons name="fingerprint" size={22} color={Colors.secondary} />
            <Text style={styles.sectionLabel}>Biometric ID Scans</Text>
          </View>
          <Text style={styles.biometricHint}>
            Take close-up photos of your pet's unique features for better AI matching. Focus on nose, eyes, and face from different angles.
          </Text>
          <View style={styles.biometricGuide}>
            {[
              { icon: 'dog-side' as const, label: 'Nose close-up' },
              { icon: 'eye-outline' as const, label: 'Eyes close-up' },
              { icon: 'emoticon-outline' as const, label: 'Face front' },
            ].map((guide, idx) => (
              <View key={idx} style={styles.guideItem}>
                <MaterialCommunityIcons name={guide.icon} size={16} color={Colors.textSecondary} />
                <Text style={styles.guideText}>{guide.label}</Text>
              </View>
            ))}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
            {biometricPhotoUris.map((uri, index) => (
              <View key={index} style={styles.bioPhotoThumb}>
                <Image source={{ uri }} style={styles.photoThumbImage} contentFit="cover" />
                <Pressable onPress={() => removeBiometricPhoto(index)} style={styles.removePhotoBtn}>
                  <Ionicons name="close-circle" size={22} color={Colors.danger} />
                </Pressable>
                <View style={styles.bioLabel}>
                  <MaterialCommunityIcons name="fingerprint" size={10} color="#fff" />
                </View>
              </View>
            ))}
            <View style={styles.addPhotoButtons}>
              <Pressable onPress={() => addBiometricPhoto('camera')} style={styles.addBioPhotoBtn}>
                <MaterialCommunityIcons name="camera-iris" size={22} color={Colors.secondary} />
              </Pressable>
              <Pressable onPress={() => addBiometricPhoto('gallery')} style={styles.addBioPhotoBtn}>
                <Ionicons name="images" size={22} color={Colors.secondary} />
              </Pressable>
            </View>
          </ScrollView>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Microchip Number</Text>
        <TextInput
          style={styles.input}
          value={microchipNumber}
          onChangeText={setMicrochipNumber}
          placeholder="Enter microchip number (if available)"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.sectionLabel}>Medical Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={medicalNotes}
          onChangeText={setMedicalNotes}
          placeholder="Any medical conditions, allergies, medications..."
          placeholderTextColor={Colors.textLight}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.sectionLabel}>Suburb</Text>
        <TextInput
          style={styles.input}
          value={suburb}
          onChangeText={setSuburb}
          placeholder="Suburb where your pet lives"
          placeholderTextColor={Colors.textLight}
        />

        <View style={styles.divider} />

        <Text style={[styles.sectionLabel, { marginTop: 4 }]}>Owner Contact Details</Text>
        <TextInput
          style={styles.input}
          value={ownerName}
          onChangeText={setOwnerName}
          placeholder="Your name *"
          placeholderTextColor={Colors.textLight}
        />
        <TextInput
          style={styles.input}
          value={ownerPhone}
          onChangeText={setOwnerPhone}
          placeholder="Phone number *"
          placeholderTextColor={Colors.textLight}
          keyboardType="phone-pad"
        />

        <Pressable
          onPress={handleSubmit}
          disabled={isSaving}
          style={({ pressed }) => [
            styles.submitBtn,
            pressed && { opacity: 0.9 },
            isSaving && { opacity: 0.6 },
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.submitBtnText}>
                {existingProfile ? 'Save Changes' : 'Register Pet'}
              </Text>
            </>
          )}
        </Pressable>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  form: {
    padding: 20,
    gap: 12,
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.foundBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#99F6E4',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    lineHeight: 19,
  },
  photosRow: {
    gap: 10,
    paddingVertical: 4,
  },
  photoThumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 11,
  },
  addPhotoButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addPhotoBtn: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  biometricSection: {
    gap: 8,
  },
  biometricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  biometricHint: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  biometricGuide: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  guideText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  bioPhotoThumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  bioLabel: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBioPhotoBtn: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.foundBg,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginTop: 4,
  },
  typeRow: {
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeChipText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  typeChipTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 80,
    paddingTop: 14,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sizeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sizeChipText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  sizeChipTextActive: {
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
    backgroundColor: Colors.secondary,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
});
