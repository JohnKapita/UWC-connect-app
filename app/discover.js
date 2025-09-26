// app/discover.js
import { Feather, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { useAuth } from '../context/AuthContext';

const BASE_URL = "http://192.168.249.38:3000";
const { width, height } = Dimensions.get('window');

// Fake profiles with 6 pictures each
const FAKE_PROFILES = [
  {
    id: '1',
    name: 'Emma Johnson',
    age: 22,
    university: 'University of Western Cape',
    studyField: 'Computer Science',
    bio: 'Love hiking and coding. Looking for someone to explore the city with!',
    gender: 'Woman',
    showGender: true,
    lookingFor: 'Relationship',
    photos: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
      'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=400',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    ],
    email: 'emma@uwc.ac.za',
    isFake: true
  },
  {
    id: '2',
    name: 'Liam Smith',
    age: 24,
    university: 'University of Western Cape',
    studyField: 'Business Administration',
    bio: 'Football player and coffee enthusiast. Always up for a good conversation.',
    gender: 'Man',
    showGender: true,
    lookingFor: 'Friends',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
      'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=400',
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400'
    ],
    email: 'liam@uwc.ac.za',
    isFake: true
  },
  {
    id: '3',
    name: 'Sophia Williams',
    age: 21,
    university: 'University of Western Cape',
    studyField: 'Psychology',
    bio: 'Book lover and amateur photographer. Let\'s chat about life and dreams!',
    gender: 'Woman',
    showGender: false,
    lookingFor: 'Study buddy',
    photos: [
      'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=400',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
      'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      'https://images.unsplash.com/phone-1529626455594-4ff0802cfb7e?w=400'
    ],
    email: 'sophia@uwc.ac.za',
    isFake: true
  },
  {
    id: '4',
    name: 'Noah Brown',
    age: 23,
    university: 'University of Western Cape',
    studyField: 'Engineering',
    bio: 'Gym enthusiast and tech geek. Always working on new projects.',
    gender: 'Man',
    showGender: true,
    lookingFor: 'Networking',
    photos: [
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400',
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=400',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
    ],
    email: 'noah@uwc.ac.za',
    isFake: true
  },
  {
    id: '5',
    name: 'Olivia Davis',
    age: 20,
    university: 'University of Western Cape',
    studyField: 'Medicine',
    bio: 'Future doctor who loves dancing and traveling. Always up for an adventure!',
    gender: 'Woman',
    showGender: true,
    lookingFor: 'Something casual',
    photos: [
      'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
      'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=400',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400'
    ],
    email: 'olivia@uwc.ac.za',
    isFake: true
  }
];

// Explore groups data
const EXPLORE_GROUPS = [
  {
    id: '1',
    name: 'Serious Lovers',
    description: 'Find meaningful relationships',
    members: '11K',
    icon: 'heart',
    color: '#ff4458'
  },
  {
    id: '2',
    name: 'Friends',
    description: 'Find people with similar who are looking for  friends',
    members: '1.4K',
    icon: 'target',
    color: '#4A90E2'
  },
  {
    id: '3',
    name: 'Gym Buddies',
    description: 'Find Gym Partners',
    members: '2.3K',
    icon: 'moon',
    color: '#FF69B4'
  },
  {
    id: '4',
    name: 'Study Buddies',
    description: 'Connect with fellow students',
    members: '5.7K',
    icon: 'book',
    color: '#28a745'
  },
  {
    id: '5',
    name: 'Coffee Dates',
    description: 'Casual coffee meetings',
    members: '3.2K',
    icon: 'coffee',
    color: '#8B4513'
  }
];

// Campus Connect automated chat
const CAMPUS_CHAT = [
  {
    id: '1',
    name: 'Campus Connect',
    message: 'Welcome to Campus-Connect! Ready to meet amazing people from our campus?',
    photo: 'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=100',
    isSystem: true,
    time: '2 min ago'
  },
  {
    id: '2',
    name: 'Campus Connect',
    message: 'Pro Tip: Complete your profile with 6 photos to get 10x more matches!',
    photo: 'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=100',
    isSystem: true,
    time: '1 hour ago'
  },
  {
    id: '3',
    name: 'Campus Connect',
    message: 'Question: What\'s your favorite spot on campus to study?',
    photo: 'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=100',
    isSystem: true,
    time: '3 hours ago'
  },
  {
    id: '4',
    name: 'Campus Connect',
    message: 'Did you know? Over 500 matches made this month on UWC Connect!',
    photo: 'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=100',
    isSystem: true,
    time: '1 day ago'
  }
];

export default function Discover() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'explore', 'likes', 'chats', 'profile'
  const [profileData, setProfileData] = useState(null);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // NEW: WhatsApp-style photo viewer state
  const [photoSwiperVisible, setPhotoSwiperVisible] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentProfilePhotos, setCurrentProfilePhotos] = useState([]);

  // NEW: slideshow state for visible card only
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const swiperRef = useRef(null);

  // NEW: Function to fetch real profiles from backend
  const fetchRealProfiles = async () => {
    try {
      console.log('🔄 Fetching real profiles from backend...');
      
      const response = await fetch(`${BASE_URL}/discover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email // Send current user's email to exclude from results
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.profiles && data.profiles.length > 0) {
        console.log('✅ Loaded real profiles:', data.profiles.length);
        
        // Combine real profiles with fake profiles
        const combinedProfiles = [...data.profiles, ...FAKE_PROFILES];
        console.log('📊 Total profiles (real + fake):', combinedProfiles.length);
        setProfiles(combinedProfiles);
      } else {
        console.log('❌ No real profiles found, using fake profiles only');
        setProfiles(FAKE_PROFILES);
      }
    } catch (error) {
      console.error('❌ Error fetching real profiles:', error);
      console.log('🔄 Using fake profiles as fallback');
      setProfiles(FAKE_PROFILES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // ✅ FIXED: Fetch both real and fake profiles
    fetchRealProfiles();

    // Fetch user profile data (now attempts to use uploaded photos if available)
    fetchProfile();

    // reset slideshow indexes when profiles are set/changed
    setCurrentCardIndex(0);
    setActivePhotoIndex(0);
  }, [user]);

  const fetchProfile = async () => {
    try {
      console.log('🔄 Fetching profile for discover:', user.email);

      // Try to fetch actual profile data from backend
      try {
        const response = await fetch(`${BASE_URL}/profile/${user.email}`);
        const data = await response.json();
        
        console.log('📊 Profile API response:', data);
        
        if (data.success && data.profile) {
          // Ensure photos array is properly handled
          const profileWithPhotos = {
            ...data.profile,
            photos: data.profile.photos && Array.isArray(data.profile.photos) 
              ? data.profile.photos.filter(photo => photo !== null && photo !== undefined && photo !== '')
              : []
          };
          
          console.log('✅ Loaded actual profile with photos:', profileWithPhotos.photos);
          setProfileData(profileWithPhotos);
          return;
        }
      } catch (err) {
        console.warn("⚠️ Could not fetch profile from backend, falling back to sample profile", err);
      }

      // Fallback: Use sample data but with empty photos array
      const sampleProfile = {
        name: user.email.split('@')[0] || 'User',
        age: 22,
        university: 'University of Western Cape',
        studyField: 'Student',
        bio: 'Welcome to my profile! Complete your profile to share more about yourself.',
        gender: 'Prefer not to say',
        showGender: true,
        lookingFor: 'Friends',
        photos: [] // Empty photos array - will be populated from actual uploads
      };
      setProfileData(sampleProfile);
      console.log('📝 Using fallback profile data');
      
    } catch (error) {
      console.error('❌ Error fetching profile in discover:', error);
      // Minimal fallback
      setProfileData({
        name: user.email.split('@')[0] || 'User',
        photos: []
      });
    }
  };

  // NEW: WhatsApp-style photo viewer functions
  const openPhotoSwiper = (profilePhotos, startIndex = 0) => {
    if (!profilePhotos || profilePhotos.length === 0) return;
    
    setCurrentProfilePhotos(profilePhotos);
    setCurrentPhotoIndex(startIndex);
    setPhotoSwiperVisible(true);
  };

  const handleNextPhoto = () => {
    if (currentPhotoIndex < currentProfilePhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const calculateProfileCompletion = () => {
    if (!profileData) return 0;
    
    let completedFields = 0;
    const totalFields = 8; // name, photos, bio, studyField, lookingFor, interests, university, age
    
    if (profileData.name) completedFields++;
    if (profileData.photos && profileData.photos.length > 0) completedFields++;
    if (profileData.bio) completedFields++;
    if (profileData.studyField) completedFields++;
    if (profileData.lookingFor) completedFields++;
    if (profileData.interests && profileData.interests.length > 0) completedFields++;
    if (profileData.university) completedFields++;
    if (profileData.age) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const handleSwipeRight = (index) => {
    if (!user) return;
    
    const likedProfile = profiles[index];
    console.log("Liked:", likedProfile.email);

    // Only send likes for real profiles (not fake ones)
    if (!likedProfile.isFake) {
      fetch(`${BASE_URL}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fromEmail: user.email,
          toEmail: likedProfile.email 
        }),
      });
    } else {
      console.log("💖 Liked a fake profile (for testing)");
    }
  };

  const handleSwipeLeft = (index) => {
    const skippedProfile = profiles[index];
    console.log("Skipped:", skippedProfile.email, skippedProfile.isFake ? "(fake)" : "(real)");
  };

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

  const handleJoinGroup = (groupId) => {
    if (joinedGroups.includes(groupId)) {
      setJoinedGroups(joinedGroups.filter(id => id !== groupId));
    } else {
      setJoinedGroups([...joinedGroups, groupId]);
    }
  };

  const showComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature will be available soon!');
  };

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
          }
        }
      ]
    );
  };

  const renderGroupItem = ({ item }) => (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={[styles.groupIcon, { backgroundColor: item.color }]}>
          <Feather name={item.icon} size={24} color="#fff" />
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDescription}>{item.description}</Text>
          <Text style={styles.groupMembers}>{item.members} members</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[
          styles.joinButton, 
          joinedGroups.includes(item.id) && styles.joinedButton
        ]}
        onPress={() => handleJoinGroup(item.id)}
      >
        <Text style={styles.joinButtonText}>
          {joinedGroups.includes(item.id) ? 'Joined' : 'Join Group'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderChatItem = ({ item }) => (
    <View style={styles.chatCard}>
      <Image source={{ uri: item.photo }} style={styles.chatPhoto} />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatMessage}>{item.message}</Text>
        <Text style={styles.chatTime}>{item.time}</Text>
        {item.isSystem && <Text style={styles.systemTag}>Campus Connect</Text>}
      </View>
    </View>
  );

  // Slideshow effect for the currently visible card only
  useEffect(() => {
    // Make sure profiles exist and currentCardIndex is within bounds
    if (!profiles || profiles.length === 0) return;
    const currentProfile = profiles[currentCardIndex];
    if (!currentProfile || !currentProfile.photos || currentProfile.photos.length <= 1) return;

    const interval = setInterval(() => {
      setActivePhotoIndex(prev => {
        const photoCount = currentProfile.photos.length;
        return (prev + 1) % photoCount;
      });
    }, 3000); // 3 seconds per photo

    return () => clearInterval(interval);
  }, [currentCardIndex, profiles]);

  // Reset activePhotoIndex when current card changes
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [currentCardIndex]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#ff4458" />
        <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>
          Loading profiles...
        </Text>
      </View>
    );
  }

  const profileCompletion = calculateProfileCompletion();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {activeTab === 'home' ? 'Discover' : 
           activeTab === 'explore' ? 'Explore' :
           activeTab === 'likes' ? 'Likes' :
           activeTab === 'chats' ? 'Messages' : 'Profile'}
        </Text>
        <Text style={styles.profileCount}>
          {profiles.length} profiles ({profiles.filter(p => !p.isFake).length} real + {profiles.filter(p => p.isFake).length} fake)
        </Text>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'home' ? (
        // Home Section - Card Swiping
        profiles.length === 0 ? (
          <View style={[styles.container, { justifyContent: "center", alignItems: "center", paddingBottom: 80 }]}>
            <Text style={styles.noProfiles}>No profiles available</Text>
            <Text style={{ color: '#666', marginTop: 10, textAlign: 'center' }}>
              Check back later or try refreshing
            </Text>
          </View>
        ) : (
          <View style={styles.swiperContainer}>
            <Swiper
              cards={profiles}
              ref={swiperRef}
              renderCard={(profile, index) => (
                <View style={styles.card}>
                  <TouchableOpacity onPress={() => profile.photos && profile.photos.length > 0 && openPhotoSwiper(profile.photos, index === currentCardIndex ? activePhotoIndex : 0)}>
                    <Image
                      source={{ 
                        uri: profile.photos && profile.photos.length > 0 
                          ? // Show activePhotoIndex only for the visible card
                            (index === currentCardIndex ? profile.photos[activePhotoIndex] : profile.photos[0])
                          : "https://via.placeholder.com/400x500" 
                      }}
                      style={styles.photo}
                    />
                    {/* Profile type badge */}
                    <View style={[
                      styles.profileTypeBadge,
                      { backgroundColor: profile.isFake ? '#ff9500' : '#00C851' }
                    ]}>
                      <Text style={styles.profileTypeText}>
                        {profile.isFake ? 'FAKE' : 'REAL'}
                      </Text>
                    </View>
                    {/* Photo count overlay */}
                    {profile.photos && profile.photos.length > 1 && (
                      <View style={styles.photoCountOverlay}>
                        <Text style={styles.photoCountBadge}>
                          {profile.photos.length} photos
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  
                  <View style={styles.profileInfo}>
                    <View style={styles.nameContainer}>
                      <Text style={styles.name}>
                        {profile.name}, {profile.age || 24}
                      </Text>
                      <Text style={styles.distance}>💺 1 km away</Text>
                    </View>
                    <Text style={styles.university}>{profile.university}</Text>
                    {profile.bio && (
                      <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
                    )}
                    {profile.showGender && profile.gender && (
                      <Text style={styles.gender}>{profile.gender}</Text>
                    )}
                    {profile.lookingFor && (
                      <Text style={styles.lookingFor}>
                        Looking for: {profile.lookingFor}
                      </Text>
                    )}
                  </View>
                </View>
              )}
              onSwipedRight={handleSwipeRight}
              onSwipedLeft={handleSwipeLeft}
              onSwiped={(cardIndex) => {
                // When a card is swiped, the next visible card index is cardIndex + 1
                const nextIndex = cardIndex + 1;
                if (nextIndex < profiles.length) {
                  setCurrentCardIndex(nextIndex);
                } else {
                  // if we've swiped past last card, reset to 0 (or keep it at length)
                  setCurrentCardIndex(profiles.length - 1);
                }
                setActivePhotoIndex(0); // reset slideshow for next profile
              }}
              stackSize={3}
              backgroundColor="transparent"
              cardVerticalMargin={20}
              overlayLabels={{
                left: { 
                  title: "NOPE", 
                  style: { 
                    label: { 
                      color: "red", 
                      fontSize: 32,
                      fontWeight: 'bold',
                      borderWidth: 2,
                      borderColor: 'red',
                      paddingHorizontal: 15,
                      paddingVertical: 5,
                      borderRadius: 8
                    }, 
                    wrapper: {
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      marginTop: 30,
                      marginLeft: 30
                    } 
                  } 
                },
                right: { 
                  title: "LIKE", 
                  style: { 
                    label: { 
                      color: "#00C851", 
                      fontSize: 32,
                      fontWeight: 'bold',
                      borderWidth: 2,
                      borderColor: '#00C851',
                      paddingHorizontal: 15,
                      paddingVertical: 5,
                      borderRadius: 8
                    }, 
                    wrapper: {
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-start',
                      marginTop: 30,
                      marginRight: 30
                    } 
                  } 
                },
              }}
            />
          </View>
        )
      ) : activeTab === 'profile' ? (
        // Profile Section - UPDATED to show actual uploaded photos
        <ScrollView contentContainerStyle={styles.profileScrollContainer}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <TouchableOpacity onPress={() => profileData?.photos?.[0] && openPhotoSwiper(profileData.photos, 0)}>
                {profileData?.photos?.[0] ? (
                  <Image
                    source={{ uri: profileData.photos[0] }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Feather name="user" size={40} color="#888" />
                    <Text style={styles.noPhotoText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              {/* Profile Completion Circle */}
              <View style={[
                styles.completionCircle,
                { borderColor: profileCompletion === 100 ? '#00C851' : '#ff4458' }
              ]}>
                <Text style={styles.completionText}>{profileCompletion}%</Text>
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profileData?.name || 'User'}, {profileData?.age || 25}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              {profileData?.university && (
                <Text style={styles.profileUniversity}>{profileData.university}</Text>
              )}
              {profileData?.bio && (
                <Text style={styles.profileBio}>{profileData.bio}</Text>
              )}
              {profileData?.showGender && profileData?.gender && (
                <Text style={styles.profileGender}>{profileData.gender}</Text>
              )}
              {profileData?.photos && (
                <Text style={styles.photoCount}>{profileData.photos.length} photos</Text>
              )}
            </View>
          </View>

          {/* Profile Actions */}
          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.profileAction} onPress={navigateToEditProfile}>
              <Text style={styles.profileActionText}>Complete profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileAction} onPress={showComingSoon}>
              <Text style={styles.profileActionText}>Try Double Date</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileAction} onPress={showComingSoon}>
              <Text style={styles.profileActionText}>Invite your friends and find other pairs.</Text>
            </TouchableOpacity>
          </View>

          {/* Photo Gallery */}
          {profileData?.photos && profileData.photos.length > 0 ? (
            <View style={styles.photosSection}>
              <Text style={styles.sectionTitle}>Photos ({profileData.photos.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.photosContainer}>
                  {profileData.photos.map((photoUrl, index) => (
                    <TouchableOpacity key={index} onPress={() => openPhotoSwiper(profileData.photos, index)}>
                      <Image
                        source={{ uri: photoUrl }}
                        style={styles.photoThumbnail}
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

          {/* Premium Features */}
          <View style={styles.premiumSection}>
            <View style={styles.premiumItem}>
              <Text style={styles.premiumNumber}>0</Text>
              <Text style={styles.premiumLabel}>Super Likes</Text>
              <TouchableOpacity onPress={showComingSoon}>
                <Text style={styles.premiumButton}>GET MORE</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.premiumItem}>
              <Text style={styles.premiumNumber}>0</Text>
              <Text style={styles.premiumLabel}>My Boosts</Text>
              <TouchableOpacity onPress={showComingSoon}>
                <Text style={styles.premiumButton}>GET MORE</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.premiumItem}>
              <Text style={styles.premiumLabel}>Subscriptions</Text>
            </View>
          </View>

          {/* Gold Upgrade */}
          <View style={styles.goldSection}>
            <Text style={styles.goldTitle}>UWC Connect GOLD</Text>
            <TouchableOpacity onPress={showComingSoon}>
              <Text style={styles.goldUpgrade}>Upgrade</Text>
            </TouchableOpacity>
            <Text style={styles.goldFeature}>What's Included</Text>
            <Text style={styles.goldFeature}>See Who Likes You</Text>
          </View>
        </ScrollView>
      ) : activeTab === 'likes' ? (
        // Likes Section - Updated with new message
        <ScrollView contentContainerStyle={styles.likesContainer}>
          <View style={styles.likesHeader}>
            <Text style={styles.likesMessage}>People who like you will appear here</Text>
          </View>
        </ScrollView>
      ) : activeTab === 'explore' ? (
        // Explore Section
        <ScrollView contentContainerStyle={styles.exploreContainer}>
          <Text style={styles.exploreTitle}>Welcome to Explore</Text>
          
          <FlatList
            data={EXPLORE_GROUPS}
            renderItem={renderGroupItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </ScrollView>
      ) : activeTab === 'chats' ? (
        // Chats Section - Updated with Campus Connect
        <ScrollView contentContainerStyle={styles.chatsContainer}>
          <View style={styles.chatsHeader}>
            <Text style={styles.chatsTitle}>Campus Connect</Text>
          </View>

          <View style={styles.messagesSection}>
            <Text style={styles.messagesTitle}>Messages</Text>
            <FlatList
              data={CAMPUS_CHAT}
              renderItem={renderChatItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      ) : null}

      {/* NEW: WhatsApp-style Photo Swiper Modal */}
      <Modal
        visible={photoSwiperVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPhotoSwiperVisible(false)}
      >
        <View style={styles.photoSwiperContainer}>
          <TouchableOpacity 
            style={styles.photoSwiperBackground}
            onPress={() => setPhotoSwiperVisible(false)}
            activeOpacity={1}
          >
            <View style={styles.photoSwiperContent}>
              {/* Close button */}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setPhotoSwiperVisible(false)}
              >
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
              
              {/* Photo counter */}
              <View style={styles.photoCounter}>
                <Text style={styles.photoCounterText}>
                  {currentPhotoIndex + 1} / {currentProfilePhotos.length}
                </Text>
              </View>
              
              {/* Photo display */}
              <Image
                source={{ uri: currentProfilePhotos[currentPhotoIndex] }}
                style={styles.fullScreenPhoto}
                resizeMode="contain"
              />
              
              {/* Navigation arrows */}
              {currentPhotoIndex > 0 && (
                <TouchableOpacity 
                  style={[styles.navArrow, styles.leftArrow]}
                  onPress={handlePrevPhoto}
                >
                  <Ionicons name="chevron-back" size={40} color="#fff" />
                </TouchableOpacity>
              )}
              
              {currentPhotoIndex < (currentProfilePhotos.length - 1) && (
                <TouchableOpacity 
                  style={[styles.navArrow, styles.rightArrow]}
                  onPress={handleNextPhoto}
                >
                  <Ionicons name="chevron-forward" size={40} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Existing Photo Modal */}
      <Modal
        visible={photoModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Photo Options</Text>
            <TouchableOpacity style={styles.modalOption} onPress={handleRemovePhoto}>
              <Text style={styles.modalOptionText}>Remove Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => setPhotoModalVisible(false)}>
              <Text style={styles.modalOptionText}>Cancel</Text>
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
              <TouchableOpacity style={styles.settingItem}>
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

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setActiveTab('home')}
        >
          <Ionicons name="home" size={24} color={activeTab === 'home' ? "#ff4458" : "#888"} />
          <Text style={[styles.navText, { color: activeTab === 'home' ? '#ff4458' : '#888' }]}>
            Home
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('explore')}
        >
          <Feather name="search" size={24} color={activeTab === 'explore' ? "#ff4458" : "#888"} />
          <Text style={[styles.navText, { color: activeTab === 'explore' ? '#ff4458' : '#888' }]}>
            Explore
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setActiveTab('likes')}
        >
          <FontAwesome name="heart" size={24} color={activeTab === 'likes' ? "#ff4458" : "#888"} />
          <Text style={[styles.navText, { color: activeTab === 'likes' ? '#ff4458' : '#888' }]}>
            Likes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setActiveTab('chats')}
        >
          <Ionicons name="chatbubble" size={24} color={activeTab === 'chats' ? "#ff4458" : "#888"} />
          <Text style={[styles.navText, { color: activeTab === 'chats' ? '#ff4458' : '#888' }]}>
            Chats
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setActiveTab('profile')}
        >
          <Feather name="user" size={24} color={activeTab === 'profile' ? "#ff4458" : "#888"} />
          <Text style={[styles.navText, { color: activeTab === 'profile' ? '#ff4458' : '#888' }]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000" 
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileCount: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  swiperContainer: {
    flex: 1,
    marginBottom: 80,
  },
  card: {
    flex: 0.8,
    borderRadius: 16,
    backgroundColor: "#000000ff",
    overflow: 'hidden',
    marginHorizontal: 10,
    position: 'relative',
  },
  photo: { 
    width: '100%', 
    height: '78%',
  },
  profileInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: '#fff',
  },
  distance: {
    fontSize: 14,
    color: '#fff',
  },
  university: {
    fontSize: 16,
    color: '#ff4458',
    fontWeight: '600',
    marginBottom: 5,
  },
  bio: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  gender: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 5,
  },
  lookingFor: {
    fontSize: 12,
    color: '#fff',
    fontStyle: 'italic',
  },
  profileTypeBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  profileTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  photoCountOverlay: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  photoCountBadge: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noProfiles: { 
    fontSize: 18, 
    color: "#888", 
    textAlign: "center" 
  },
  profileScrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
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
  completionCircle: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 55,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 5,
    borderRadius: 10,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 28,
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
  profileBio: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  profileGender: {
    fontSize: 12,
    color: '#ccc',
  },
  photoCount: {
    fontSize: 12,
    color: '#888',
  },
  profileActions: {
    marginBottom: 30,
  },
  profileAction: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  profileActionText: {
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
  likesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  likesMessage: {
    color: '#888',
    fontSize: 18,
    textAlign: 'center',
  },
  exploreContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  exploreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  groupCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 11,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#ff4458',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  joinedButton: {
    backgroundColor: '#28a745',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  chatsContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  chatsHeader: {
    marginBottom: 20,
  },
  chatsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  messagesSection: {
    marginTop: 20,
  },
  messagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  chatPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  chatMessage: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  chatTime: {
    color: '#666',
    fontSize: 12,
  },
  systemTag: {
    color: '#ff4458',
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalOptionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  // NEW: WhatsApp-style photo swiper styles
  photoSwiperContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  photoSwiperBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoSwiperContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  photoCounter: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    zIndex: 1000,
  },
  photoCounterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fullScreenPhoto: {
    width: '100%',
    height: '70%',
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 30,
    zIndex: 1000,
  },
  leftArrow: {
    left: 20,
  },
  rightArrow: {
    right: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#222',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});