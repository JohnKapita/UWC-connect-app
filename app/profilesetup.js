// app/profilesetup.js
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from '../context/AuthContext';

const BASE_URL = "http://192.168.249.38:3000";

export default function ProfileSetup() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { setUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state - with all original fields plus new ones
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    age: "",
    bio: "", // NEW FIELD
    gender: [],
    showGender: true, // NEW FIELD
    interestedIn: [],
    universityPreferences: [],
    lookingFor: [],
    university: "University of Western Cape",
    drinking: "",
    smoking: "",
    exercise: "",
    pets: "",
    communicationStyle: "",
    loveLanguage: "",
    studyField: "",
    starSign: "",
    interests: [],
    photos: Array(6).fill(null),
  });

  // Options for various sections
  const genderOptions = ["Woman", "Man", "Non-binary", "Transgender", "Genderqueer", "Agender", "Bigender", "Genderfluid", "Two-Spirit", "Prefer not to say"];
  const interestedInOptions = ["Women", "Men", "Non-binary", "Beyond binary", "Everyone"];
  const lookingForOptions = ["Relationship", "Gym partner", "Study buddy", "Friends", "Networking", "Something casual"];
  const frequencyOptions = ["Never", "Rarely", "Sometimes", "Often", "Very often", "Daily"];
  const yesNoOptions = ["Yes", "No"];
  const communicationOptions = ["Direct", "Reserved", "Expressive", "Thoughtful", "Spontaneous"];
  const loveLanguageOptions = ["Words of affirmation", "Quality time", "Receiving gifts", "Acts of service", "Physical touch"];
  const starSignOptions = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const interestOptions = ["Creativity", "Food & drinks", "Travel", "Sports", "Music", "Gaming", "Movies", "Tech", "Art", "Fitness", "Reading", "Photography"];

  const handleNext = () => {
    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleSelection = (field, value) => {
    setFormData(prev => {
      const currentValues = prev[field] || [];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
  };

const pickImage = async (index) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        console.log(`✅ Photo ${index} selected:`, result.assets[0].uri);
        
        const newPhotos = [...formData.photos];
        newPhotos[index] = {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: `photo_${index}_${Date.now()}.jpg`,
        };
        setFormData({ ...formData, photos: newPhotos });
        
        console.log(`🔄 Updated photos array, index ${index} now has photo`);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleRemovePhoto = (index) => {
    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove this photo?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => {
            const newPhotos = [...formData.photos];
            newPhotos[index] = null;
            setFormData({ ...formData, photos: newPhotos });
            Alert.alert("Photo Removed", "You can now upload a new photo");
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // DEBUG: Check what's in photos array
      console.log('📸 Photos array contents:', formData.photos);
      const photoCount = formData.photos.filter(p => p !== null).length;
      console.log('📸 Non-null photos count:', photoCount);

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add photos to FormData
      let photosAppended = 0;
      formData.photos.forEach((photo, index) => {
        if (photo && photo.uri) {
          console.log(`📤 Appending photo ${index}:`, photo.name);
          formDataToSend.append('photos', {
            uri: photo.uri,
            type: photo.type || 'image/jpeg',
            name: photo.name || `photo_${index}.jpg`,
          });
          photosAppended++;
        }
      });

      console.log(`✅ Photos appended to FormData: ${photosAppended}`);

      // Add other form data including new fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('surname', '');
      formDataToSend.append('bio', formData.bio); // NEW
      formDataToSend.append('showGender', formData.showGender.toString()); // NEW
      formDataToSend.append('interests', formData.interests.join(','));
      formDataToSend.append('lookingFor', formData.lookingFor.join(','));
      formDataToSend.append('university', formData.university);
      formDataToSend.append('studyField', formData.studyField);
      formDataToSend.append('age', formData.age || '');
      formDataToSend.append('gender', formData.gender.join(','));
      formDataToSend.append('communicationStyle', formData.communicationStyle);
      formDataToSend.append('loveLanguage', formData.loveLanguage);
      formDataToSend.append('starSign', formData.starSign);

      console.log('📤 Uploading profile with photos:', photosAppended);

      const res = await fetch(`${BASE_URL}/profile?email=${encodeURIComponent(email)}`, {
        method: "POST",
        body: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await res.json();
      console.log('✅ Profile save response:', data);
      
      if (data.success) {
        // SET USER AND NAVIGATE TO DISCOVER
        setUser({ 
          email: email, 
          profileCompleted: true,
          name: formData.name
        });
        
        Alert.alert("Success", `Profile saved with ${photosAppended} photos!`);
        console.log('🚀 Navigating to discover');
        router.replace('/discover');
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
      }
    } catch (err) {
      console.error('❌ Profile save error:', err);
      Alert.alert("Error", "Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Test photo upload function
  const testPhotoUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const testFormData = new FormData();
      testFormData.append('photo', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'test-photo.jpg',
      });

      try {
        const response = await fetch(`${BASE_URL}/test-s3`, {
          method: 'POST',
          body: testFormData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const data = await response.json();
        console.log('🧪 Test upload result:', data);
        Alert.alert("Test Upload", JSON.stringify(data));
      } catch (error) {
        console.error('Test upload error:', error);
        Alert.alert("Test Upload Error", error.message);
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            <Text style={styles.title}>Basic Information</Text>
            <Text style={styles.subtitle}>Let's start with the basics</Text>
            
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#888"
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            
            <TextInput
              placeholder="Date of Birth (DD/MM/YYYY)"
              placeholderTextColor="#888"
              style={styles.input}
              value={formData.dateOfBirth}
              onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
              keyboardType="numeric"
            />

            <TextInput
              placeholder="Age"
              placeholderTextColor="#888"
              style={styles.input}
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
              keyboardType="numeric"
            />

            {/* NEW BIO FIELD */}
            <TextInput
              placeholder="Bio (Tell us about yourself)"
              placeholderTextColor="#888"
              style={[styles.input, { height: 100 }]}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              multiline
              textAlignVertical="top"
            />
          </View>
        );
      
      case 2:
        return (
          <View>
            <Text style={styles.title}>What is your gender?</Text>
            <Text style={styles.subtitle}>Select all that describes you</Text>
            
            <View style={styles.optionsContainer}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.gender.includes(option) && styles.optionButtonSelected
                  ]}
                  onPress={() => toggleSelection('gender', option)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.gender.includes(option) && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* NEW GENDER TOGGLE */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>Show gender on profile</Text>
              <Switch
                value={formData.showGender}
                onValueChange={(value) => setFormData({ ...formData, showGender: value })}
                trackColor={{ false: "#767577", true: "#ff4458" }}
                thumbColor={formData.showGender ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>
        );
      
      case 3:
        return (
          <View>
            <Text style={styles.title}>Who are you interested in seeing?</Text>
            <Text style={styles.subtitle}>Select all that applies</Text>
            
            <View style={styles.optionsContainer}>
              {interestedInOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.interestedIn.includes(option) && styles.optionButtonSelected
                  ]}
                  onPress={() => toggleSelection('interestedIn', option)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.interestedIn.includes(option) && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 4:
        return (
          <View>
            <Text style={styles.title}>What are you looking for?</Text>
            <Text style={styles.subtitle}>Select all that applies</Text>
            
            <View style={styles.optionsContainer}>
              {lookingForOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.lookingFor.includes(option) && styles.optionButtonSelected
                  ]}
                  onPress={() => toggleSelection('lookingFor', option)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.lookingFor.includes(option) && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 5:
        return (
          <View>
            <Text style={styles.title}>What is your university?</Text>
            <Text style={styles.subtitle}>Type your university name</Text>
            
            <TextInput
              placeholder="University Name"
              placeholderTextColor="#888"
              style={styles.input}
              value={formData.university}
              onChangeText={(text) => setFormData({ ...formData, university: text })}
            />
          </View>
        );
      
      case 6:
        return (
          <View>
            <Text style={styles.title}>Lifestyle Habits</Text>
            <Text style={styles.subtitle}>Tell us about your lifestyle</Text>
            
            <Text style={styles.sectionTitle}>How often do you drink?</Text>
            <View style={styles.optionsContainer}>
              {frequencyOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.drinking === option && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData({ ...formData, drinking: option })}
                >
                  <Text style={[
                    styles.optionText,
                    formData.drinking === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>How often do you smoke?</Text>
            <View style={styles.optionsContainer}>
              {frequencyOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.smoking === option && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData({ ...formData, smoking: option })}
                >
                  <Text style={[
                    styles.optionText,
                    formData.smoking === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>Do you exercise regularly?</Text>
            <View style={styles.optionsContainer}>
              {yesNoOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.exercise === option && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData({ ...formData, exercise: option })}
                >
                  <Text style={[
                    styles.optionText,
                    formData.exercise === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>Do you have pets?</Text>
            <View style={styles.optionsContainer}>
              {yesNoOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.pets === option && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData({ ...formData, pets: option })}
                >
                  <Text style={[
                    styles.optionText,
                    formData.pets === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 7:
        return (
          <View>
            <Text style={styles.title}>What else makes you, you?</Text>
            <Text style={styles.subtitle}>Help others get to know you better</Text>
            
            <Text style={styles.sectionTitle}>What's your communication style?</Text>
            <View style={styles.optionsContainer}>
              {communicationOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.communicationStyle === option && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData({ ...formData, communicationStyle: option })}
                >
                  <Text style={[
                    styles.optionText,
                    formData.communicationStyle === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>How do you receive love?</Text>
            <View style={styles.optionsContainer}>
              {loveLanguageOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.loveLanguage === option && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData({ ...formData, loveLanguage: option })}
                >
                  <Text style={[
                    styles.optionText,
                    formData.loveLanguage === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>What are you studying?</Text>
            <TextInput
              placeholder="Field of study"
              placeholderTextColor="#888"
              style={styles.input}
              value={formData.studyField}
              onChangeText={(text) => setFormData({ ...formData, studyField: text })}
            />
            
            <Text style={styles.sectionTitle}>What is your star sign?</Text>
            <View style={styles.optionsContainer}>
              {starSignOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.starSign === option && styles.optionButtonSelected
                  ]}
                  onPress={() => setFormData({ ...formData, starSign: option })}
                >
                  <Text style={[
                    styles.optionText,
                    formData.starSign === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 8:
        return (
          <View>
            <Text style={styles.title}>What are you into?</Text>
            <Text style={styles.subtitle}>Select your interests</Text>
            
            <View style={styles.optionsContainer}>
              {interestOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.interests.includes(option) && styles.optionButtonSelected
                  ]}
                  onPress={() => toggleSelection('interests', option)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.interests.includes(option) && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 9:
        return (
          <View>
            <Text style={styles.title}>Add your recent pictures</Text>
            <Text style={styles.subtitle}>Upload 6 photos to complete your profile</Text>
            
            <View style={styles.photosContainer}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.photoSlot}
                  onPress={() => formData.photos[index] ? handleRemovePhoto(index) : pickImage(index)}
                >
                  {formData.photos[index] ? (
                    <View style={styles.photoWithRemove}>
                      <Image 
                        source={{ uri: formData.photos[index].uri }}
                        style={styles.photoImage}
                      />
                      <View style={styles.removeButton}>
                        <Text style={styles.removeButtonText}>×</Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.photoText}>+</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.photoCountText}>
              {formData.photos.filter(p => p !== null).length}/6 photos selected
            </Text>

            {/* Test button - temporary */}
            <TouchableOpacity 
              style={[styles.button, {backgroundColor: 'blue', marginBottom: 10}]}
              onPress={testPhotoUpload}
            >
              <Text style={styles.buttonText}>🧪 Test Photo Upload</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 10:
        return (
          <View>
            <Text style={styles.title}>Review Your Profile</Text>
            <Text style={styles.subtitle}>Make sure everything looks good before finishing</Text>
            
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Name:</Text>
              <Text style={styles.reviewValue}>{formData.name}</Text>
            </View>
            
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Age:</Text>
              <Text style={styles.reviewValue}>{formData.age}</Text>
            </View>
            
            {/* NEW BIO REVIEW */}
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Bio:</Text>
              <Text style={styles.reviewValue}>{formData.bio || 'Not added'}</Text>
            </View>
            
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Gender:</Text>
              <Text style={styles.reviewValue}>{formData.gender.join(', ') || 'Not specified'}</Text>
            </View>
            
            {/* NEW GENDER TOGGLE REVIEW */}
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Show Gender:</Text>
              <Text style={styles.reviewValue}>{formData.showGender ? 'Yes' : 'No'}</Text>
            </View>
            
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>University:</Text>
              <Text style={styles.reviewValue}>{formData.university}</Text>
            </View>
            
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Photos:</Text>
              <Text style={styles.reviewValue}>{formData.photos.filter(p => p !== null).length} photos</Text>
            </View>
          </View>
        );
      
      default:
        return <Text>Step not found</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Step {currentStep} of 10</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${currentStep * 10}%` }]} />
          </View>
        </View>

        {renderStep()}

        {/* Navigation buttons */}
        <View style={[
          styles.buttonContainer,
          currentStep > 1 ? styles.buttonContainerSpaceBetween : styles.buttonContainerCenter
        ]}>
          {currentStep > 1 && (
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={handleBack}
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {currentStep === 10 ? 'Complete Profile' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#888",
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    padding: 16,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
    color: "#fff",
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 15,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1a1a1a",
    margin: 5,
  },
  optionButtonSelected: {
    backgroundColor: "#ff4458",
    borderColor: "#ff4458",
  },
  optionText: {
    color: "#fff",
    fontSize: 14,
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    padding: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
  },
  toggleText: {
    color: "#fff",
    fontSize: 16,
  },
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  photoSlot: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  photoWithRemove: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.7)",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  photoText: {
    color: "#888",
    fontSize: 24,
    fontWeight: "bold",
  },
  photoCountText: {
    color: "#888",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressText: {
    color: "#888",
    textAlign: "center",
    marginBottom: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#333",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ff4458",
    borderRadius: 3,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 30,
  },
  buttonContainerSpaceBetween: {
    justifyContent: "space-between",
  },
  buttonContainerCenter: {
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#ff4458",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 120,
    shadowColor: "#ff4458",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: "#ff4458",
    shadowColor: "#ff4458",
  },
  buttonDisabled: {
    backgroundColor: "#888",
    shadowColor: "#000",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  reviewSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    marginBottom: 10,
  },
  reviewLabel: {
    color: "#888",
    fontSize: 16,
  },
  reviewValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});