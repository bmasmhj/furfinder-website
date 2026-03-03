import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
  TextInput,
  Switch,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import { useQueryClient } from '@tanstack/react-query';
import type { PetType, PetSize, IntakeType, AnimalStatus, OrganisationAnimal } from '@/lib/types';

const PET_TYPES: PetType[] = ['dog', 'cat', 'bird', 'rabbit', 'other'];
const SIZES: PetSize[] = ['small', 'medium', 'large'];
const INTAKE_TYPES: IntakeType[] = ['stray', 'surrendered', 'rescue', 'transferred'];
const ANIMAL_STATUSES: AnimalStatus[] = ['available', 'adopted', 'on_hold', 'fostered'];

function PickerRow<T extends string>({
  label,
  options,
  value,
  onChange,
  testID,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  testID: string;
}) {
  return (
    <View style={styles.fieldGroup} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerRow}>
        {options.map((opt) => (
          <Pressable
            key={opt}
            style={[styles.pickerChip, value === opt && styles.pickerChipActive]}
            onPress={() => onChange(opt)}
            testID={`${testID}-${opt}`}
          >
            <Text style={[styles.pickerChipText, value === opt && styles.pickerChipTextActive]}>
              {opt.replace('_', ' ')}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function OrgAnimalFormScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { animalId } = useLocalSearchParams<{ animalId?: string }>();
  const isEdit = !!animalId;

  const webTopPadding = Platform.OS === 'web' ? 67 : 0;
  const webBottomPadding = Platform.OS === 'web' ? 34 : 0;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [petType, setPetType] = useState<PetType>('dog');
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [size, setSize] = useState<PetSize>('medium');
  const [color, setColor] = useState('');
  const [markings, setMarkings] = useState('');
  const [description, setDescription] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [intakeDate, setIntakeDate] = useState('');
  const [intakeType, setIntakeType] = useState<IntakeType>('stray');
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [desexed, setDesexed] = useState(false);
  const [status, setStatus] = useState<AnimalStatus>('available');

  useEffect(() => {
    if (isEdit && token) {
      setFetching(true);
      const baseUrl = getApiUrl();
      fetch(new URL(`/api/org/animals/${animalId}`, baseUrl).toString(), {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (res.ok) {
            const animal: OrganisationAnimal = await res.json();
            setPetType(animal.petType);
            setPetName(animal.petName);
            setBreed(animal.breed || '');
            setSize(animal.size);
            setColor(animal.color || '');
            setMarkings(animal.markings || '');
            setDescription(animal.description || '');
            setPhotoUris(animal.photoUris || []);
            setIntakeDate(animal.intakeDate || '');
            setIntakeType(animal.intakeType);
            setMicrochipNumber(animal.microchipNumber || '');
            setDesexed(animal.desexed);
            setStatus(animal.status);
          }
        })
        .catch(() => {
          Alert.alert('Error', 'Failed to load animal data.');
        })
        .finally(() => setFetching(false));
    }
  }, [isEdit, animalId, token]);

  const handlePickPhoto = async () => {
    if (photoUris.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload up to 5 photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - photoUris.length,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets) {
      const newUris = result.assets.map((a) =>
        a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri
      );
      setPhotoUris((prev) => [...prev, ...newUris].slice(0, 5));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!petName.trim()) {
      Alert.alert('Required', 'Please enter the animal name.');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = getApiUrl();
      const body = {
        petType,
        petName: petName.trim(),
        breed: breed.trim(),
        size,
        color: color.trim(),
        markings: markings.trim(),
        description: description.trim(),
        photoUris,
        intakeDate: intakeDate.trim() || undefined,
        intakeType,
        microchipNumber: microchipNumber.trim() || undefined,
        desexed,
        ...(isEdit ? { status } : {}),
      };

      const url = isEdit
        ? new URL(`/api/org/animals/${animalId}`, baseUrl).toString()
        : new URL('/api/org/animals', baseUrl).toString();

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/org/animals'] });
        queryClient.invalidateQueries({ queryKey: ['/api/org/me'] });
        router.replace('/org-dashboard');
      } else {
        const errData = await res.json().catch(() => ({ message: 'Failed to save animal.' }));
        Alert.alert('Error', errData.message || 'Failed to save animal.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top + webTopPadding }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.container, { paddingTop: insets.top + webTopPadding }]} testID="org-animal-form-screen">
        <View style={styles.header}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/org-dashboard')} style={styles.backBtn} testID="back-button">
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Animal' : 'Add Animal'}</Text>
          <Pressable onPress={handleSubmit} style={styles.backBtn} disabled={loading} testID="submit-button">
            {loading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="checkmark" size={26} color={Colors.primary} />
            )}
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + webBottomPadding + 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.photosSection} testID="photos-section">
            <Text style={styles.label}>Photos (up to 5)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
              {photoUris.map((uri, index) => (
                <View key={`${uri}-${index}`} style={styles.photoWrapper}>
                  <Image source={{ uri }} style={styles.photoThumb} testID={`photo-${index}`} />
                  <Pressable
                    style={styles.removePhotoBtn}
                    onPress={() => handleRemovePhoto(index)}
                    testID={`remove-photo-${index}`}
                  >
                    <Ionicons name="close-circle" size={22} color={Colors.danger} />
                  </Pressable>
                </View>
              ))}
              {photoUris.length < 5 && (
                <Pressable style={styles.addPhotoBtn} onPress={handlePickPhoto} testID="add-photo-button">
                  <Ionicons name="camera-outline" size={28} color={Colors.textLight} />
                  <Text style={styles.addPhotoText}>Add</Text>
                </Pressable>
              )}
            </ScrollView>
          </View>

          <PickerRow
            label="Pet Type"
            options={PET_TYPES}
            value={petType}
            onChange={setPetType}
            testID="pet-type-picker"
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={petName}
              onChangeText={setPetName}
              placeholder="Animal name"
              placeholderTextColor={Colors.textLight}
              testID="name-input"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Breed</Text>
            <TextInput
              style={styles.input}
              value={breed}
              onChangeText={setBreed}
              placeholder="e.g. Labrador, Tabby"
              placeholderTextColor={Colors.textLight}
              testID="breed-input"
            />
          </View>

          <PickerRow
            label="Size"
            options={SIZES}
            value={size}
            onChange={setSize}
            testID="size-picker"
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              value={color}
              onChangeText={setColor}
              placeholder="e.g. Black, Brown & White"
              placeholderTextColor={Colors.textLight}
              testID="color-input"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Markings</Text>
            <TextInput
              style={styles.input}
              value={markings}
              onChangeText={setMarkings}
              placeholder="Any distinctive markings"
              placeholderTextColor={Colors.textLight}
              testID="markings-input"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Temperament, health notes, etc."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              testID="description-input"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Intake Date</Text>
            <TextInput
              style={styles.input}
              value={intakeDate}
              onChangeText={setIntakeDate}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={Colors.textLight}
              testID="intake-date-input"
            />
          </View>

          <PickerRow
            label="Intake Type"
            options={INTAKE_TYPES}
            value={intakeType}
            onChange={setIntakeType}
            testID="intake-type-picker"
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Microchip Number (optional)</Text>
            <TextInput
              style={styles.input}
              value={microchipNumber}
              onChangeText={setMicrochipNumber}
              placeholder="e.g. 900123456789012"
              placeholderTextColor={Colors.textLight}
              testID="microchip-input"
            />
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Desexed</Text>
              <Switch
                value={desexed}
                onValueChange={setDesexed}
                trackColor={{ false: Colors.border, true: Colors.secondaryLight }}
                thumbColor={desexed ? Colors.secondary : '#F4F3F4'}
                testID="desexed-toggle"
              />
            </View>
          </View>

          {isEdit && (
            <PickerRow
              label="Status"
              options={ANIMAL_STATUSES}
              value={status}
              onChange={setStatus}
              testID="status-picker"
            />
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
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
  photosSection: {
    padding: 20,
    gap: 10,
  },
  photosScroll: {
    flexDirection: 'row',
  },
  photoWrapper: {
    marginRight: 10,
    position: 'relative',
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.surface,
    borderRadius: 11,
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addPhotoText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textLight,
  },
  fieldGroup: {
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pickerChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerChipText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  pickerChipTextActive: {
    color: '#FFF',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
