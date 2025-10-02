// app/profile.js
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const BASE_URL = "http://192.168.249.175:3000";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Sample profile data with all original fields plus new ones
  const sampleProfile = {
    name: 'John Doe',
    age: 22,
    university: 'University of Western Cape',
    studyField: 'Computer Science',
    bio: 'Love hiking and coding. Looking for someone to explore the city with!',
    gender: 'Man',
    showGender: true,
    lookingFor: 'Relationship',
    communicationStyle: 'Direct',
    loveLanguage: 'Quality time',
    starSign: 'Leo',
    interests: ['Hiking', 'Coding', 'Music', 'Travel'],
    drinking: 'Sometimes',
    smoking: 'Never',
    exercise: 'Yes',
    pets: 'No',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
      'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=400',
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400'
    ],
    matches: ['emma@uwc.ac.za', 'sophia@uwc.ac.za'],
    email: user?.email
  };

  // Fetch user profile data with better logging
  const fetchProfile = async () => {
    try {
      console.log('🔄 Fetching profile for:', user.email);
      // Use sample data instead of API call to maintain all functionality
      setProfile(sampleProfile);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setProfile(sampleProfile); // Fallback to sample data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.email) {
        console.log('🎯 Screen focused, refreshing profile...');
        fetchProfile();
      }
    }, [user])
  );

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/welcome');
  };

  const handleDeleteAccount = async () => {
    if (!deleteReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for deleting your account');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, reason: deleteReason }),
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Your account has been deleted');
        logout();
        router.push('/welcome');
      } else {
        Alert.alert('Error', data.message || 'Failed to delete account');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account');
    }
  };

  const navigateToEditProfile = () => {
    router.push({
      pathname: '/profilesetup',
      params: { email: user.email, editMode: 'true' }
    });
  };

  // Photo handling functions
  const handlePhotoPress = (index) => {
    setSelectedPhotoIndex(index);
    setPhotoModalVisible(true);
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove this photo?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => {
            setPhotoModalVisible(false);
            Alert.alert("Photo Removed", "You can now upload a new photo");
            // Here you would update the profile to remove the photo
          }
        }
      ]
    );
  };

  // Test function to check what's in the profile
  const debugProfile = () => {
    console.log('🐛 Current profile state:', profile);
    console.log('🐛 Photos array:', profile?.photos);
    console.log('🐛 Photos count:', profile?.photos?.length);
    if (profile?.photos) {
      profile.photos.forEach((photo, index) => {
        console.log(`🐛 Photo ${index}:`, photo);
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff4458" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Debug button - temporary */}
        <TouchableOpacity style={styles.debugButton} onPress={debugProfile}>
          <Text style={styles.debugButtonText}>🐛 Debug Profile</Text>
        </TouchableOpacity>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={() => handlePhotoPress(0)}
          >
            {profile?.photos?.[0] ? (
              <Image
                source={{ uri: profile.photos[0] }}
                style={styles.profileImage}
                onError={(e) => console.log('❌ Profile image load error:', e.nativeEvent.error)}
                onLoad={() => console.log('✅ Profile image loaded successfully')}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Feather name="user" size={40} color="#888" />
                <Text style={styles.noPhotoText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.name || 'User'}, {profile?.age || 25}
            </Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            {profile?.university && (
              <Text style={styles.profileUniversity}>{profile.university}</Text>
            )}
            {profile?.photos && (
              <Text style={styles.photoCount}>{profile.photos.length} photos</Text>
            )}
          </View>
        </View>

        {/* Profile Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile?.matches?.length || 0}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>128</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Chats</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={navigateToEditProfile}
          >
            <Feather name="edit" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setSettingsModalVisible(true)}
          >
            <Feather name="settings" size={20} color="#fff" />
            <Text style={styles.settingsButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Bio Section - NEW */}
        {profile?.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* Gender Section - Only show if enabled - NEW */}
        {profile?.showGender && profile?.gender && (
          <View style={styles.genderSection}>
            <Text style={styles.sectionTitle}>Gender</Text>
            <Text style={styles.genderText}>{profile.gender}</Text>
          </View>
        )}

        {/* Photo Gallery */}
        {profile?.photos && profile.photos.length > 0 ? (
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>Photos ({profile.photos.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photosContainer}>
                {profile.photos.map((photoUrl, index) => (
                  <TouchableOpacity 
                    key={index} 
                    onPress={() => handlePhotoPress(index)}
                  >
                    <Image
                      source={{ uri: photoUrl }}
                      style={styles.photoThumbnail}
                      onError={(e) => console.log(`❌ Photo ${index} load error:`, e.nativeEvent.error)}
                      onLoad={() => console.log(`✅ Photo ${index} loaded successfully`)}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (
          <View style={styles.noPhotosSection}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <Text style={styles.noPhotosText}>No photos uploaded yet</Text>
          </View>
        )}

        {/* Profile Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>About Me</Text>
          {profile?.bio ? (
            <Text style={styles.bioText}>{profile.bio}</Text>
          ) : (
            <Text style={styles.noBioText}>No bio added yet</Text>
          )}
          
          {profile?.studyField && (
            <View style={styles.detailRow}>
              <Feather name="book" size={20} color="#ff4458" />
              <Text style={styles.detailText}>
                Studying: {profile.studyField}
              </Text>
            </View>
          )}

          {profile?.age && (
            <View style={styles.detailRow}>
              <Feather name="calendar" size={20} color="#ff4458" />
              <Text style={styles.detailText}>
                Age: {profile.age}
              </Text>
            </View>
          )}

          {profile?.gender && (
            <View style={styles.detailRow}>
              <Feather name="user" size={20} color="#ff4458" />
              <Text style={styles.detailText}>
                Gender: {profile.gender}
              </Text>
            </View>
          )}

          {profile?.lookingFor && (
            <View style={styles.detailRow}>
              <Feather name="heart" size={20} color="#ff4458" />
              <Text style={styles.detailText}>
                Looking for: {profile.lookingFor}
              </Text>
            </View>
          )}

          {profile?.communicationStyle && (
            <View style={styles.detailRow}>
              <Feather name="message-circle" size={20} color="#ff4458" />
              <Text style={styles.detailText}>
                Communication: {profile.communicationStyle}
              </Text>
            </View>
          )}

          {profile?.loveLanguage && (
            <View style={styles.detailRow}>
              <Feather name="gift" size={20} color="#ff4458" />
              <Text style={styles.detailText}>
                Love Language: {profile.loveLanguage}
              </Text>
            </View>
          )}

          {profile?.starSign && (
            <View style={styles.detailRow}>
              <Feather name="star" size={20} color="#ff4458" />
              <Text style={styles.detailText}>
                Star Sign: {profile.starSign}
              </Text>
            </View>
          )}

          {profile?.drinking && (
            <View style={styles.detailRow}>
              <Feather name="coffee" size={20} color="#ff4458" />
              <Text style={styles.detailText}>
                Drinking: {profile.drinking}
              </Text>
            </View>
          )}

          {profile?.smoking && (
            <View style={styles.detailRow}>
              <Feather name="wind" size={20} color="#ff4458" />
              <Text style={styles.detailText}>
                Smoking: {profile.smoking}
              </Text>
            </View>
          )}

          {profile?.exercise && (
            <View style={styles.detailRow}>
              <Feather name="activity" size={20} color="#ff4458" />
              <Text style={styles.detailText}>
                Exercise: {profile.exercise}
              </Text>
            </View>
          )}

          {profile?.pets && (
            <View style={styles.detailRow}>
              <Feather name="github" size={20} color="#ff4458" />
              <Text style={styles.detailText}>
                Pets: {profile.pets}
              </Text>
            </View>
          )}

          {profile?.interests && profile.interests.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.interestsContainer}>
                {profile.interests.map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Additional sections that were in original code */}
        <View style={styles.premiumSection}>
          <View style={styles.premiumItem}>
            <Text style={styles.premiumNumber}>0</Text>
            <Text style={styles.premiumLabel}>Super Likes</Text>
            <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}>
              <Text style={styles.premiumButton}>GET MORE</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.premiumItem}>
            <Text style={styles.premiumNumber}>0</Text>
            <Text style={styles.premiumLabel}>My Boosts</Text>
            <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}>
              <Text style={styles.premiumButton}>GET MORE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.goldSection}>
          <Text style={styles.goldTitle}>UWC Connect GOLD</Text>
          <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}>
            <Text style={styles.goldUpgrade}>Upgrade</Text>
          </TouchableOpacity>
          <Text style={styles.goldFeature}>What's Included</Text>
          <Text style={styles.goldFeature}>See Who Likes You</Text>
        </View>
      </ScrollView>

      {/* Photo Modal - NEW */}
      <Modal
        visible={photoModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.photoModalContainer}>
          <View style={styles.photoModalContent}>
            <Text style={styles.photoModalTitle}>Photo Options</Text>
            <TouchableOpacity style={styles.photoModalOption} onPress={handleRemovePhoto}>
              <Text style={styles.photoModalOptionText}>Remove Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoModalOption} onPress={() => setPhotoModalVisible(false)}>
              <Text style={styles.photoModalOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.settingsList}>
              <TouchableOpacity style={styles.settingItem} onPress={onRefresh}>
                <Ionicons name="refresh" size={24} color="#fff" />
                <Text style={styles.settingText}>Refresh Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <Ionicons name="notifications" size={24} color="#fff" />
                <Text style={styles.settingText}>Notifications</Text>
                <Switch
                  value={true}
                  onValueChange={() => {}}
                  trackColor={{ false: "#767577", true: "#ff4458" }}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                <Ionicons name="log-out" size={24} color="#ff4458" />
                <Text style={[styles.settingText, { color: '#ff4458' }]}>Log Out</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.settingItem, styles.deleteItem]}
                onPress={() => setDeleteConfirmModalVisible(true)}
              >
                <MaterialIcons name="delete" size={24} color="#ff4458" />
                <Text style={[styles.settingText, { color: '#ff4458' }]}>Delete Account</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDeleteConfirmModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete Account</Text>
              <TouchableOpacity onPress={() => setDeleteConfirmModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.deleteContent}>
              <Text style={styles.deleteWarning}>
                Are you sure you want to delete your account? This action cannot be undone.
              </Text>
              
              <TextInput
                style={styles.reasonInput}
                placeholder="Reason for deleting account"
                placeholderTextColor="#888"
                value={deleteReason}
                onChangeText={setDeleteReason}
                multiline
              />

              <View style={styles.deleteButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setDeleteConfirmModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmDeleteButton}
                  onPress={handleDeleteAccount}
                >
                  <Text style={styles.confirmDeleteButtonText}>Delete Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  debugButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImageContainer: {
    marginRight: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoText: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  profileUniversity: {
    fontSize: 14,
    color: '#ff4458',
    marginBottom: 4,
  },
  photoCount: {
    fontSize: 12,
    color: '#888',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ff4458',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  settingsButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  settingsButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  // New sections
  bioSection: {
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
  },
  genderSection: {
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  bioText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  genderText: {
    color: '#fff',
    fontSize: 14,
  },
  photosSection: {
    marginBottom: 30,
  },
  noPhotosSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  noPhotosText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
  photosContainer: {
    flexDirection: 'row',
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
  },
  detailsSection: {
    marginBottom: 30,
  },
  bioText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  noBioText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    color: '#fff',
    marginLeft: 12,
    fontSize: 14,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#ff4458',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#fff',
    fontSize: 12,
  },
  premiumSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  premiumItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  premiumNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  premiumLabel: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
    marginLeft: 15,
  },
  premiumButton: {
    color: '#ff4458',
    fontWeight: '600',
  },
  goldSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
  },
  goldTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 10,
  },
  goldUpgrade: {
    color: '#ff4458',
    fontWeight: '600',
    marginBottom: 15,
  },
  goldFeature: {
    color: '#fff',
    marginBottom: 5,
  },
  // Photo Modal Styles
  photoModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: '80%',
  },
  photoModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  photoModalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  photoModalOptionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  // Existing modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsList: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
  deleteItem: {
    marginTop: 20,
    borderBottomWidth: 0,
  },
  deleteContent: {
    padding: 10,
  },
  deleteWarning: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  reasonInput: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  deleteButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#ff4458',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmDeleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});