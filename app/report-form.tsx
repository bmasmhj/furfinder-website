import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { usePets } from '@/lib/pet-context';
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

export default function ReportFormScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const insets = useSafeAreaInsets();
  const { addReport } = usePets();
  const isLost = type === 'lost';
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  const [photoUri, setPhotoUri] = useState('');
  const [petType, setPetType] = useState<PetType>('dog');
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [size, setSize] = useState<PetSize>('medium');
  const [color, setColor] = useState('');
  const [markings, setMarkings] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(-33.8688);
  const [longitude, setLongitude] = useState(151.2093);
  const [reward, setReward] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is needed to take pet photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const detectLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location access helps others find the pet.');
        setIsLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);

      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geocode.length > 0) {
        const addr = geocode[0];
        const name = [addr.street, addr.city, addr.region].filter(Boolean).join(', ');
        setLocationName(name || 'Current Location');
      } else {
        setLocationName('Current Location');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not detect location. Please enter it manually.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!breed.trim()) {
      Alert.alert('Missing info', 'Please enter the pet breed.');
      return;
    }
    if (!contactName.trim() || !contactPhone.trim()) {
      Alert.alert('Missing info', 'Please enter your contact details.');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setIsSaving(true);
    try {
      await addReport({
        status: isLost ? 'lost' : 'found',
        petType,
        petName: petName.trim() || 'Unknown',
        breed: breed.trim(),
        size,
        color: color.trim(),
        markings: markings.trim(),
        photoUri,
        description: description.trim(),
        latitude,
        longitude,
        locationName: locationName.trim() || 'Unknown location',
        lastSeenDate: new Date().toISOString().split('T')[0],
        reward: isLost ? reward.trim() : '',
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        isOwner: true,
      });

      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save report. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopPadding + 12 }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {isLost ? 'Report Lost Pet' : 'Report Found Pet'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.photoSection}>
          {photoUri ? (
            <Pressable onPress={pickImage} style={styles.photoPreview}>
              <Image source={{ uri: photoUri }} style={styles.photoImage} contentFit="cover" />
              <View style={styles.photoOverlay}>
                <Ionicons name="camera" size={24} color="#fff" />
              </View>
            </Pressable>
          ) : (
            <View style={styles.photoButtons}>
              <Pressable onPress={takePhoto} style={styles.photoBtn}>
                <Ionicons name="camera" size={28} color={Colors.primary} />
                <Text style={styles.photoBtnText}>Camera</Text>
              </Pressable>
              <Pressable onPress={pickImage} style={styles.photoBtn}>
                <Ionicons name="images" size={28} color={Colors.primary} />
                <Text style={styles.photoBtnText}>Gallery</Text>
              </Pressable>
            </View>
          )}
        </View>

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

        {isLost && (
          <>
            <Text style={styles.sectionLabel}>Pet Name</Text>
            <TextInput
              style={styles.input}
              value={petName}
              onChangeText={setPetName}
              placeholder="Enter pet name"
              placeholderTextColor={Colors.textLight}
            />
          </>
        )}

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
          placeholder="Any distinctive markings"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.sectionLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add any details that might help identify this pet..."
          placeholderTextColor={Colors.textLight}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.sectionLabel}>Location</Text>
        <Pressable onPress={detectLocation} style={styles.locationBtn}>
          {isLocating ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons name="locate" size={20} color={Colors.primary} />
          )}
          <Text style={styles.locationBtnText}>
            {locationName || 'Detect Current Location'}
          </Text>
        </Pressable>
        {!locationName && (
          <TextInput
            style={styles.input}
            value={locationName}
            onChangeText={setLocationName}
            placeholder="Or enter location manually"
            placeholderTextColor={Colors.textLight}
          />
        )}

        {isLost && (
          <>
            <Text style={styles.sectionLabel}>Reward (optional)</Text>
            <TextInput
              style={styles.input}
              value={reward}
              onChangeText={setReward}
              placeholder="e.g. $100"
              placeholderTextColor={Colors.textLight}
            />
          </>
        )}

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Your Contact Details</Text>
        <TextInput
          style={styles.input}
          value={contactName}
          onChangeText={setContactName}
          placeholder="Your name *"
          placeholderTextColor={Colors.textLight}
        />
        <TextInput
          style={styles.input}
          value={contactPhone}
          onChangeText={setContactPhone}
          placeholder="Phone number *"
          placeholderTextColor={Colors.textLight}
          keyboardType="phone-pad"
        />

        <Pressable
          onPress={handleSubmit}
          disabled={isSaving}
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: isLost ? Colors.lost : Colors.found },
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
                {isLost ? 'Submit Lost Report' : 'Submit Found Report'}
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
  photoSection: {
    marginBottom: 8,
  },
  photoPreview: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoBtn: {
    flex: 1,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
  },
  photoBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
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
    height: 100,
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
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  locationBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.primary,
    flex: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
});
