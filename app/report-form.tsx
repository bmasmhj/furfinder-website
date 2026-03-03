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

export default function ReportFormScreen() {
  const { type, fromProfileId } = useLocalSearchParams<{ type: string; fromProfileId?: string }>();
  const insets = useSafeAreaInsets();
  const { addReport, getProfile, reports } = usePets();
  const { canUseMultiPhoto, canAddReport, isPremium } = useSubscription();
  const isLost = type === 'lost';
  const webTopPadding = Platform.OS === 'web' ? 67 : 0;

  const prefillProfile = fromProfileId ? getProfile(fromProfileId) : undefined;

  const [photoUris, setPhotoUris] = useState<string[]>(prefillProfile?.photoUris || []);
  const [petType, setPetType] = useState<PetType>(prefillProfile?.petType || 'dog');
  const [petName, setPetName] = useState(prefillProfile?.petName || '');
  const [breed, setBreed] = useState(prefillProfile?.breed || '');
  const [size, setSize] = useState<PetSize>(prefillProfile?.size || 'medium');
  const [color, setColor] = useState(prefillProfile?.color || '');
  const [markings, setMarkings] = useState(prefillProfile?.markings || '');
  const [collarDescription, setCollarDescription] = useState('');
  const [description, setDescription] = useState(prefillProfile ? `${prefillProfile.petName} is missing. ${prefillProfile.microchipNumber ? `Microchip: ${prefillProfile.microchipNumber}. ` : ''}Please contact if found.` : '');
  const [locationName, setLocationName] = useState(prefillProfile?.suburb || '');
  const [latitude, setLatitude] = useState(-33.8688);
  const [longitude, setLongitude] = useState(151.2093);
  const [reward, setReward] = useState('');
  const [contactName, setContactName] = useState(prefillProfile?.ownerName || '');
  const [contactPhone, setContactPhone] = useState(prefillProfile?.ownerPhone || '');
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const photoLimit = canUseMultiPhoto() ? 5 : 1;

  const pickImage = async () => {
    if (photoUris.length >= photoLimit) {
      if (!canUseMultiPhoto()) {
        Alert.alert('Premium Feature', 'Upgrade to Premium to add up to 5 photos per report.', [
          { text: 'Maybe Later' },
          { text: 'Upgrade', onPress: () => router.push('/paywall') },
        ]);
      } else {
        Alert.alert('Limit reached', 'You can add up to 5 photos.');
      }
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 5242880) {
        Alert.alert('Photo too large', 'Please choose a photo under 5MB, or take a new one.');
        return;
      }
      const dataUri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setPhotoUris(prev => [...prev, dataUri].slice(0, photoLimit));
    }
  };

  const takePhoto = async () => {
    if (photoUris.length >= photoLimit) {
      if (!canUseMultiPhoto()) {
        Alert.alert('Premium Feature', 'Upgrade to Premium to add up to 5 photos per report.', [
          { text: 'Maybe Later' },
          { text: 'Upgrade', onPress: () => router.push('/paywall') },
        ]);
      } else {
        Alert.alert('Limit reached', 'You can add up to 5 photos.');
      }
      return;
    }
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

    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 5242880) {
        Alert.alert('Photo too large', 'The photo exceeds 5MB. Please try again with a smaller image.');
        return;
      }
      const dataUri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setPhotoUris(prev => [...prev, dataUri].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotoUris(prev => prev.filter((_, i) => i !== index));
  };

  const detectLocation = async () => {
    setIsLocating(true);
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          'Location Services Off',
          'Please enable Location Services in your iPhone Settings → Privacy & Security → Location Services.',
          [{ text: 'OK' }]
        );
        setIsLocating(false);
        return;
      }

      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!canAskAgain) {
          Alert.alert(
            'Location Permission Denied',
            'Please allow location access in your iPhone Settings → Privacy & Security → Location Services → Fur Finder.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Permission needed', 'Location access is needed to pinpoint where the pet was last seen.');
        }
        setIsLocating(false);
        return;
      }

      let loc: Location.LocationObject | null = await Location.getLastKnownPositionAsync({ maxAge: 300000 });

      if (!loc) {
        loc = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 15000)),
        ]);
      }

      if (!loc) {
        Alert.alert(
          'Location Unavailable',
          'Could not detect your location right now. Please type it in manually.',
          [{ text: 'OK' }]
        );
        setIsLocating(false);
        return;
      }

      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);

      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geocode.length > 0) {
          const addr = geocode[0];
          const name = [addr.suburb, addr.city, addr.region].filter(Boolean).join(', ');
          setLocationName(name || 'Current Location');
        } else {
          setLocationName('Current Location');
        }
      } catch (_e) {
        setLocationName('Current Location');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not detect location. Please enter it manually.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!canAddReport(reports.length)) {
      Alert.alert('Report Limit', 'Free users can create 1 report. Upgrade to Premium for unlimited reports.', [
        { text: 'Maybe Later' },
        { text: 'Upgrade', onPress: () => router.push('/paywall') },
      ]);
      return;
    }
    setSubmitError('');

    if (!breed.trim()) {
      setSubmitError('Please enter the pet breed.');
      return;
    }
    if (!color.trim()) {
      setSubmitError('Please enter the pet colour.');
      return;
    }
    if (!locationName.trim()) {
      setSubmitError('Please enter or detect the location.');
      return;
    }
    if (!contactName.trim() || !contactPhone.trim()) {
      setSubmitError('Please enter your contact name and phone number.');
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
        markings: `${markings.trim()}${collarDescription.trim() ? ` | Collar: ${collarDescription.trim()}` : ''}`,
        photoUri: photoUris[0] || '',
        photoUris,
        description: description.trim(),
        latitude,
        longitude,
        locationName: locationName.trim(),
        lastSeenDate: new Date().toISOString().split('T')[0],
        reward: isLost ? reward.trim() : '',
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        isOwner: true,
      });

      setShowSuccess(true);
    } catch (e) {
      setSubmitError('Failed to save report. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopPadding + 12 }]}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}>
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
          {photoUris.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
              {photoUris.map((uri, index) => (
                <View key={`${uri}-${index}`} style={styles.photoThumbWrap}>
                  <Image source={{ uri }} style={styles.photoThumb} contentFit="cover" />
                  <Pressable onPress={() => removePhoto(index)} style={styles.photoRemoveBtn}>
                    <Ionicons name="close" size={14} color="#fff" />
                  </Pressable>
                </View>
              ))}
              {photoUris.length < 5 && (
                <Pressable onPress={pickImage} style={styles.photoAddBtn}>
                  <Ionicons name="add" size={28} color={Colors.primary} />
                  <Text style={styles.photoAddBadge}>{photoUris.length}/5</Text>
                </Pressable>
              )}
            </ScrollView>
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

        <Text style={styles.sectionLabel}>Markings (optional)</Text>
        <TextInput
          style={styles.input}
          value={markings}
          onChangeText={setMarkings}
          placeholder="Any distinctive markings"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={styles.sectionLabel}>Collar Description (optional)</Text>
        <TextInput
          style={styles.input}
          value={collarDescription}
          onChangeText={setCollarDescription}
          placeholder="e.g. Red collar with name tag"
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

        {submitError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={Colors.danger} />
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        ) : null}

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
              <Ionicons name={submitError ? 'refresh' : 'checkmark-circle'} size={22} color="#fff" />
              <Text style={styles.submitBtnText}>
                {submitError ? 'Try Again' : isLost ? 'Submit Lost Report' : 'Submit Found Report'}
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark-circle" size={64} color={Colors.secondary} />
            </View>
            <Text style={styles.successTitle}>Report Submitted!</Text>
            <Text style={styles.successMessage}>
              {isLost
                ? 'Your lost pet report is now live. We\'ll notify you if a match is found.'
                : 'Your found pet report is now live. We\'ll notify you if an owner is found.'}
            </Text>
            <Pressable
              style={styles.successBtn}
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
            >
              <Text style={styles.successBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      )}
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
  photoRow: {
    gap: 10,
    paddingVertical: 4,
  },
  photoThumbWrap: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddBtn: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  photoAddBadge: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    marginTop: 2,
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.danger,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    zIndex: 100,
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  successIconWrap: {
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  successBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginTop: 8,
  },
  successBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
});
