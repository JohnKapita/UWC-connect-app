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

const BASE_URL = "http://192.168.249.175:3000";
const { width, height } = Dimensions.get('window');

// South African Universities
const SOUTH_AFRICAN_UNIVERSITIES = [
  'University of Western Cape',
  'University of Cape Town',
  'Stellenbosch University',
  'University of Pretoria',
  'University of the Witwatersrand',
  'University of Johannesburg',
  'Rhodes University',
  'University of KwaZulu-Natal',
  'North-West University',
  'University of the Free State',
  'Nelson Mandela University',
  'University of Limpopo',
  'University of Venda',
  'University of Fort Hare',
  'University of Zululand',
  'Sefako Makgatho Health Sciences University',
  'Cape Peninsula University of Technology',
  'Tshwane University of Technology',
  'Durban University of Technology',
  'Vaal University of Technology',
  'Central University of Technology',
  'Mangosuthu University of Technology',
  'Walter Sisulu University'
];

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
    university: 'University of Cape Town',
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
    email: 'sophia@uct.ac.za',
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
    university: 'Stellenbosch University',
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
    email: 'olivia@sun.ac.za',
    isFake: true
  }
];

// WhatsApp-style Groups Data
const WHATSAPP_GROUPS = [
  {
    id: '1',
    name: 'UWC Dating & Friends',
    description: 'Connect with UWC students for dating and friendships',
    members: '1.2K',
    icon: 'heart',
    color: '#ff4458',
    lastMessage: 'Sarah: Anyone for coffee tomorrow?',
    lastMessageTime: '2 min ago',
    unreadCount: 5,
    isActive: true
  },
  {
    id: '2',
    name: 'Cape Town Students',
    description: 'All Cape Town university students welcome',
    members: '2.4K',
    icon: 'users',
    color: '#4A90E2',
    lastMessage: 'Mike: Study session at the library?',
    lastMessageTime: '1 hour ago',
    unreadCount: 12,
    isActive: true
  },
  {
    id: '3',
    name: 'Gym Buddies CPT',
    description: 'Find workout partners in Cape Town',
    members: '856',
    icon: 'activity',
    color: '#00D2A0',
    lastMessage: 'David: Gym at 6 AM tomorrow!',
    lastMessageTime: '3 hours ago',
    unreadCount: 0,
    isActive: true
  },
  {
    id: '4',
    name: 'Study Groups Connect',
    description: 'Find study partners for your courses',
    members: '1.8K',
    icon: 'book',
    color: '#FF9500',
    lastMessage: 'Emma: Need help with Calculus?',
    lastMessageTime: '5 hours ago',
    unreadCount: 3,
    isActive: true
  },
  {
    id: '5',
    name: 'Foodies Cape Town',
    description: 'Share food spots and restaurant reviews',
    members: '924',
    icon: 'coffee',
    color: '#8B4513',
    lastMessage: 'Lisa: New burger place opened!',
    lastMessageTime: '1 day ago',
    unreadCount: 0,
    isActive: false
  }
];

// Mock chat data
const MOCK_CHATS = [
  {
    id: '1',
    name: 'Emma Johnson',
    lastMessage: 'Hey! How are you doing?',
    time: '2 min ago',
    unread: true,
    matchEmail: 'emma@uwc.ac.za',
    photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400']
  },
  {
    id: '2',
    name: 'Liam Smith',
    lastMessage: 'We should grab coffee sometime!',
    time: '1 hour ago',
    unread: false,
    matchEmail: 'liam@uwc.ac.za',
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400']
  },
  {
    id: '3',
    name: 'Sophia Williams',
    lastMessage: 'Thanks for the like! 😊',
    time: '3 hours ago',
    unread: true,
    matchEmail: 'sophia@uct.ac.za',
    photos: ['https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=400']
  }
];

// Enhanced fetch with timeout
const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export default function Discover() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [profileData, setProfileData] = useState(null);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const [likes, setLikes] = useState([]);
  const [matches, setMatches] = useState([]);
  const [chats, setChats] = useState(MOCK_CHATS);
  const [activeHomeTab, setActiveHomeTab] = useState('forYou');

  // Settings state
  const [settings, setSettings] = useState({
    university: 'University of Western Cape',
    maxDistance: 50,
    ageRange: [18, 30],
    showMe: 'Everyone',
    notifications: true,
    emailNotifications: true,
    darkMode: true,
    showOnlineStatus: true,
    readReceipts: true
  });

  // WhatsApp-style photo viewer state
  const [photoSwiperVisible, setPhotoSwiperVisible] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentProfilePhotos, setCurrentProfilePhotos] = useState([]);

  // Slideshow state for visible card only
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const swiperRef = useRef(null);

  // Filter profiles based on active home tab and showMe preference
  const filteredProfiles = profiles.filter(profile => {
    if (activeHomeTab === 'forYou') {
      if (profile.university !== settings.university) {
        return false;
      }
    }
    
    if (settings.showMe === 'Men' && profile.gender !== 'Man') {
      return false;
    }
    if (settings.showMe === 'Women' && profile.gender !== 'Woman') {
      return false;
    }
    
    return true;
  });

  // Fetch real profiles from backend with improved error handling
  const fetchRealProfiles = async () => {
    try {
      console.log('🔄 Fetching real profiles from backend...');
      
      const response = await fetchWithTimeout(`${BASE_URL}/discover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email
        })
      }, 8000);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.profiles && data.profiles.length > 0) {
        console.log('✅ Loaded real profiles:', data.profiles.length);
        const combinedProfiles = [...data.profiles, ...FAKE_PROFILES];
        setProfiles(combinedProfiles);
      } else {
        console.log('❌ No real profiles found, using fake profiles only');
        setProfiles(FAKE_PROFILES);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('⏰ Request timeout - using fake profiles');
      } else {
        console.error('❌ Error fetching real profiles:', error);
      }
      console.log('🔄 Using fake profiles as fallback');
      setProfiles(FAKE_PROFILES);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users data with improved error handling
  const fetchAllUsers = async () => {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/profiles`, {}, 5000);
      
      if (!response.ok) {
        console.log('⚠️ /profiles endpoint returned non-OK response');
        setUsers([]);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const usersData = await response.json();
        setUsers(usersData);
      } else {
        console.log('⚠️ /profiles endpoint returned non-JSON response');
        setUsers([]);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching users:', error);
      }
      setUsers([]);
    }
  };

  // Fetch likes data with improved error handling
  const fetchLikesData = async () => {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/likes`, {}, 5000);
      
      if (!response.ok) {
        console.log('⚠️ /likes endpoint returned non-OK response');
        setLikes([]);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const likesData = await response.json();
        setLikes(likesData);
      } else {
        console.log('⚠️ /likes endpoint returned non-JSON response');
        setLikes([]);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching likes:', error);
      }
      setLikes([]);
    }
  };

  // Fetch matches data with improved error handling
  const fetchMatchesData = async () => {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/matches?email=${user.email}`, {}, 5000);
      
      if (!response.ok) {
        console.log('⚠️ /matches endpoint returned non-OK response');
        setMatches([]);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const matchesData = await response.json();
        setMatches(matchesData);
      } else {
        console.log('⚠️ /matches endpoint returned non-JSON response');
        setMatches([]);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching matches:', error);
      }
      setMatches([]);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchRealProfiles();
    fetchProfile();
    fetchAllUsers();
    fetchLikesData();
    fetchMatchesData();
    setCurrentCardIndex(0);
    setActivePhotoIndex(0);
  }, [user]);

  // FIXED: Better profile fetching with improved photo handling
  const fetchProfile = async () => {
    try {
      console.log('🔄 Fetching profile for discover:', user.email);

      try {
        const response = await fetchWithTimeout(`${BASE_URL}/profile/${user.email}`, {}, 8000);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('📊 Profile API response:', data);
        
        if (data.success && data.profile) {
          const profileWithPhotos = {
            ...data.profile,
            photos: data.profile.photos && Array.isArray(data.profile.photos) 
              ? data.profile.photos
                  .filter(photo => 
                    photo !== null && 
                    photo !== undefined && 
                    photo !== '' &&
                    typeof photo === 'string'
                  )
                  .map(photo => {
                    if (photo.startsWith('http')) {
                      return photo;
                    }
                    if (photo.startsWith('/')) {
                      return `${BASE_URL}${photo}`;
                    }
                    return photo;
                  })
              : []
          };
          
          console.log('✅ Loaded actual profile with photos:', profileWithPhotos.photos.length);
          setProfileData(profileWithPhotos);
          return;
        } else {
          console.log('❌ No profile data in response');
        }
      } catch (err) {
        console.warn("⚠️ Could not fetch profile from backend", err);
      }

      // Fallback sample profile
      const sampleProfile = {
        name: user.email.split('@')[0] || 'User',
        age: 22,
        university: 'University of Western Cape',
        studyField: 'Student',
        bio: 'Welcome to my profile! Complete your profile to share more about yourself.',
        gender: 'Prefer not to say',
        showGender: true,
        lookingFor: 'Friends',
        photos: []
      };
      setProfileData(sampleProfile);
      
    } catch (error) {
      console.error('❌ Error fetching profile in discover:', error);
      setProfileData({
        name: user.email.split('@')[0] || 'User',
        photos: []
      });
    }
  };

  // Get people who liked current user but aren't matches yet
  const getPeopleWhoLikedYou = () => {
    return likes.filter(like => 
      like.toEmail === user.email && 
      !matches.some(match => match.email === like.fromEmail)
    );
  };

  // WhatsApp-style photo viewer functions
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

  // NEW: Instagram-style chat functionality
  const startChat = (matchEmail, matchName, matchPhoto) => {
    router.push({
      pathname: '/chat',
      params: { 
        matchEmail: matchEmail,
        matchName: matchName,
        matchPhoto: matchPhoto
      }
    });
  };

  // NEW: Join group chat
  const joinGroupChat = (groupId) => {
    const group = WHATSAPP_GROUPS.find(g => g.id === groupId);
    if (group) {
      Alert.alert(
        'Join Group',
        `Would you like to join "${group.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Join', 
            onPress: () => {
              setJoinedGroups(prev => [...prev, groupId]);
              Alert.alert('Success', `You've joined ${group.name}!`);
            }
          }
        ]
      );
    }
  };

  // NEW: Update settings
  const updateSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // NEW: Share app link
  const shareAppLink = () => {
    const appLink = 'https://uwc-connect.app.link/download';
    Alert.alert(
      'Invite Friends',
      `Share this link with your friends: ${appLink}`,
      [
        { text: 'Copy Link', onPress: () => {
          Alert.alert('Link Copied!', 'The app link has been copied to your clipboard.');
        }},
        { text: 'OK' }
      ]
    );
  };

  // NEW: Enhanced complete profile with options
  const handleCompleteProfile = () => {
    Alert.alert(
      'Complete Your Profile',
      'Which section would you like to update?',
      [
        {
          text: 'Basic Info',
          onPress: () => navigateToEditProfileSection('basic')
        },
        {
          text: 'Photos',
          onPress: () => navigateToEditProfileSection('photos')
        },
        {
          text: 'Bio & Interests',
          onPress: () => navigateToEditProfileSection('bio')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  // NEW: Navigate to specific profile section
  const navigateToEditProfileSection = (section) => {
    router.push({
      pathname: '/profilesetup',
      params: { 
        email: user.email, 
        editMode: 'true',
        section: section
      }
    });
  };

  const calculateProfileCompletion = () => {
    if (!profileData) return 0;
    let completedFields = 0;
    const totalFields = 8;
    
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
    
    const likedProfile = filteredProfiles[index];
    console.log("Liked:", likedProfile.email);

    if (!likedProfile.isFake) {
      fetch(`${BASE_URL}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fromEmail: user.email,
          toEmail: likedProfile.email 
        }),
      }).then(() => {
        setTimeout(() => {
          fetchLikesData();
          fetchMatchesData();
        }, 500);
      });
    } else {
      console.log("💖 Liked a fake profile (for testing)");
    }
  };

  const handleSwipeLeft = (index) => {
    const skippedProfile = filteredProfiles[index];
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
      const res = await fetchWithTimeout(`${BASE_URL}/delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, reason: deleteReason }),
      }, 10000);

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

  // WhatsApp-style Group Item
  const renderGroupItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.groupCard}
      onPress={() => joinGroupChat(item.id)}
    >
      <View style={styles.groupHeader}>
        <View style={[styles.groupIcon, { backgroundColor: item.color }]}>
          <Feather name={item.icon} size={24} color="#fff" />
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDescription}>{item.description}</Text>
          <Text style={styles.groupLastMessage}>{item.lastMessage}</Text>
        </View>
      </View>
      
      <View style={styles.groupMeta}>
        <Text style={styles.groupTime}>{item.lastMessageTime}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Slideshow effect
  useEffect(() => {
    if (!filteredProfiles || filteredProfiles.length === 0) return;
    const currentProfile = filteredProfiles[currentCardIndex];
    if (!currentProfile || !currentProfile.photos || currentProfile.photos.length <= 1) return;

    const interval = setInterval(() => {
      setActivePhotoIndex(prev => {
        const photoCount = currentProfile.photos.length;
        return (prev + 1) % photoCount;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentCardIndex, filteredProfiles]);

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
  const peopleWhoLikedYou = getPeopleWhoLikedYou();

  // Dynamic styles based on dark mode setting
  const dynamicStyles = {
    settingsModalContent: {
      backgroundColor: settings.darkMode ? '#1a1a1a' : '#fff',
      borderRadius: 15,
      width: '90%',
      maxHeight: '80%',
    },
    settingText: {
      color: settings.darkMode ? '#fff' : '#000',
      fontSize: 16,
      marginLeft: 15,
      flex: 1,
    },
    settingValue: {
      color: settings.darkMode ? '#888' : '#666',
      fontSize: 14,
      marginTop: 2,
    },
    settingsSectionTitle: {
      color: '#ff4458',
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 15,
      marginLeft: 10,
    },
    modalHeader: {
      borderBottomColor: settings.darkMode ? '#333' : '#ddd',
    },
    settingItem: {
      borderBottomColor: settings.darkMode ? '#333' : '#ddd',
    }
  };

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
          {filteredProfiles.length} profiles
        </Text>
        
        {/* Home Tab Sub-navigation */}
        {activeTab === 'home' && (
          <View style={styles.homeTabs}>
            <TouchableOpacity 
              style={[styles.homeTab, activeHomeTab === 'forYou' && styles.activeHomeTab]}
              onPress={() => setActiveHomeTab('forYou')}
            >
              <Text style={[styles.homeTabText, activeHomeTab === 'forYou' && styles.activeHomeTabText]}>
                For You
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.homeTab, activeHomeTab === 'discover' && styles.activeHomeTab]}
              onPress={() => setActiveHomeTab('discover')}
            >
              <Text style={[styles.homeTabText, activeHomeTab === 'discover' && styles.activeHomeTabText]}>
                Discover
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content based on active tab */}
      {activeTab === 'home' ? (
        filteredProfiles.length === 0 ? (
          <View style={[styles.container, { justifyContent: "center", alignItems: "center", paddingBottom: 80 }]}>
            <Text style={styles.noProfiles}>No profiles available</Text>
            <Text style={{ color: '#666', marginTop: 10, textAlign: 'center' }}>
              {activeHomeTab === 'forYou' 
                ? `No profiles found from ${settings.university}. Try Discover tab!`
                : 'Check back later or try refreshing'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.swiperContainer}>
            <Swiper
              cards={filteredProfiles}
              ref={swiperRef}
              renderCard={(profile, index) => (
                <View style={styles.card}>
                  <TouchableOpacity onPress={() => profile.photos && profile.photos.length > 0 && openPhotoSwiper(profile.photos, index === currentCardIndex ? activePhotoIndex : 0)}>
                    <Image
                      source={{ 
                        uri: profile.photos && profile.photos.length > 0 
                          ? (index === currentCardIndex ? profile.photos[activePhotoIndex] : profile.photos[0])
                          : "https://via.placeholder.com/400x500" 
                      }}
                      style={styles.photo}
                    />
                    <View style={[
                      styles.profileTypeBadge,
                      { backgroundColor: profile.isFake ? '#ff9500' : '#00C851' }
                    ]}>
                      <Text style={styles.profileTypeText}>
                        {profile.isFake ? 'FAKE' : 'REAL'}
                      </Text>
                    </View>
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
                const nextIndex = cardIndex + 1;
                if (nextIndex < filteredProfiles.length) {
                  setCurrentCardIndex(nextIndex);
                } else {
                  setCurrentCardIndex(filteredProfiles.length - 1);
                }
                setActivePhotoIndex(0);
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
        <ScrollView contentContainerStyle={styles.profileScrollContainer}>
          {/* REDESIGNED: Profile Header Section */}
          <View style={styles.profileHeader}>
            <View style={styles.profileImageSection}>
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
              
              <View style={styles.profileCompletion}>
                <View style={styles.completionRing}>
                  <Text style={styles.completionPercentage}>{profileCompletion}%</Text>
                </View>
                <Text style={styles.completionLabel}>Profile Complete</Text>
              </View>
            </View>
            
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>
                {profileData?.name || 'User'}, {profileData?.age || 25}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              
              {profileData?.university && (
                <View style={styles.detailItem}>
                  <Ionicons name="school" size={16} color="#ff4458" />
                  <Text style={styles.detailText}>{profileData.university}</Text>
                </View>
              )}
              
              {profileData?.studyField && (
                <View style={styles.detailItem}>
                  <Ionicons name="book" size={16} color="#ff4458" />
                  <Text style={styles.detailText}>{profileData.studyField}</Text>
                </View>
              )}
              
              {profileData?.bio && (
                <View style={styles.bioSection}>
                  <Text style={styles.bioLabel}>About Me</Text>
                  <Text style={styles.profileBio}>{profileData.bio}</Text>
                </View>
              )}
            </View>
          </View>

          {/* REDESIGNED: Profile Actions in Pink Cards */}
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.pinkActionCard} onPress={handleCompleteProfile}>
              <View style={styles.actionIcon}>
                <Feather name="edit-3" size={24} color="#fff" />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Complete Profile</Text>
                <Text style={styles.actionSubtitle}>Add photos and info</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.pinkActionCard} onPress={showComingSoon}>
              <View style={styles.actionIcon}>
                <Feather name="users" size={24} color="#fff" />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Try Double Date</Text>
                <Text style={styles.actionSubtitle}>Find other pairs</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.pinkActionCard} onPress={shareAppLink}>
              <View style={styles.actionIcon}>
                <Feather name="share-2" size={24} color="#fff" />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Invite Friends</Text>
                <Text style={styles.actionSubtitle}>Get rewards</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Settings Card */}
          <TouchableOpacity 
            style={styles.settingsCard}
            onPress={() => setSettingsModalVisible(true)}
          >
            <View style={styles.settingsIcon}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.settingsText}>Settings & Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>

          {/* Photos Section */}
          {profileData?.photos && profileData.photos.length > 0 ? (
            <View style={styles.photosSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Photos</Text>
                <Text style={styles.photoCount}>{profileData.photos.length}/6</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.photosContainer}>
                  {profileData.photos.map((photoUrl, index) => (
                    <TouchableOpacity 
                      key={index} 
                      onPress={() => openPhotoSwiper(profileData.photos, index)}
                      style={styles.photoThumbnailContainer}
                    >
                      <Image
                        source={{ uri: photoUrl }}
                        style={styles.photoThumbnail}
                      />
                    </TouchableOpacity>
                  ))}
                  {profileData.photos.length < 6 && (
                    <TouchableOpacity 
                      style={styles.addPhotoButton}
                      onPress={() => navigateToEditProfileSection('photos')}
                    >
                      <Feather name="plus" size={30} color="#ff4458" />
                      <Text style={styles.addPhotoText}>Add Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </View>
          ) : (
            <View style={styles.noPhotosSection}>
              <Text style={styles.sectionTitle}>My Photos</Text>
              <TouchableOpacity 
                style={styles.addPhotosCard}
                onPress={() => navigateToEditProfileSection('photos')}
              >
                <Feather name="camera" size={40} color="#ff4458" />
                <Text style={styles.addPhotosText}>Add Photos to Your Profile</Text>
                <Text style={styles.addPhotosSubtext}>Upload up to 6 photos</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Premium Features */}
          <View style={styles.premiumSection}>
            <Text style={styles.premiumTitle}>UWC Connect Premium</Text>
            <View style={styles.premiumFeatures}>
              <View style={styles.premiumFeature}>
                <Ionicons name="heart" size={20} color="#ff4458" />
                <Text style={styles.featureText}>See Who Likes You</Text>
              </View>
              <View style={styles.premiumFeature}>
                <Ionicons name="rocket" size={20} color="#ff4458" />
                <Text style={styles.featureText}>Boost Your Profile</Text>
              </View>
              <View style={styles.premiumFeature}>
                <Ionicons name="infinite" size={20} color="#ff4458" />
                <Text style={styles.featureText}>Unlimited Likes</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : activeTab === 'likes' ? (
        <ScrollView contentContainerStyle={styles.likesContainer}>
          <View style={styles.likesHeader}>
            {/* Show mutual matches */}
            {matches && matches.length > 0 && (
              <>
                <Text style={styles.likesTitle}>Your Matches ({matches.length})</Text>
                {matches.map((match, index) => (
                  <View key={index} style={styles.matchCard}>
                    <Image 
                      source={{ uri: match.photos && match.photos[0] ? match.photos[0] : 'https://via.placeholder.com/100' }} 
                      style={styles.matchPhoto}
                    />
                    <View style={styles.matchInfo}>
                      <Text style={styles.matchName}>{match.name}, {match.age}</Text>
                      <Text style={styles.matchBio} numberOfLines={2}>{match.bio || 'No bio yet'}</Text>
                      <Text style={styles.matchUniversity}>{match.university}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.chatButton} 
                      onPress={() => startChat(match.email, match.name, match.photos?.[0])}
                    >
                      <Ionicons name="chatbubble" size={20} color="#fff" />
                      <Text style={styles.chatButtonText}>Chat</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
            
            {/* Show blurred profiles of people who liked you */}
            {peopleWhoLikedYou.length > 0 && (
              <>
                <Text style={styles.likesTitle}>
                  People Who Liked You ({peopleWhoLikedYou.length})
                </Text>
                <Text style={styles.likesSubtitle}>Like them back to see who they are!</Text>
                
                <View style={styles.blurredProfilesContainer}>
                  {peopleWhoLikedYou.map((like, index) => {
                    const likerUser = users.find(u => u.email === like.fromEmail);
                    const likerProfile = likerUser ? likerUser.profile : null;
                    
                    return likerProfile ? (
                      <View key={index} style={styles.blurredProfileCard}>
                        <View style={styles.blurredImageContainer}>
                          <Image 
                            source={{ uri: likerProfile.photos && likerProfile.photos[0] ? likerProfile.photos[0] : 'https://via.placeholder.com/100' }} 
                            style={styles.blurredPhoto}
                            blurRadius={15}
                          />
                          <View style={styles.lockIcon}>
                            <FontAwesome name="lock" size={30} color="#fff" />
                          </View>
                        </View>
                        <Text style={styles.blurredProfileText}>Someone liked you!</Text>
                        <Text style={styles.blurredProfileHint}>Swipe right to match</Text>
                      </View>
                    ) : (
                      <View key={index} style={styles.blurredProfileCard}>
                        <View style={styles.blurredImageContainer}>
                          <Image 
                            source={{ uri: 'https://via.placeholder.com/100' }} 
                            style={styles.blurredPhoto}
                            blurRadius={15}
                          />
                          <View style={styles.lockIcon}>
                            <FontAwesome name="lock" size={30} color="#fff" />
                          </View>
                        </View>
                        <Text style={styles.blurredProfileText}>Someone liked you!</Text>
                        <Text style={styles.blurredProfileHint}>Swipe right to match</Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
            
            {/* Show message if no likes yet */}
            {matches.length === 0 && peopleWhoLikedYou.length === 0 && (
              <Text style={styles.likesMessage}>People who like you will appear here</Text>
            )}
          </View>
        </ScrollView>
      ) : activeTab === 'explore' ? (
        <ScrollView contentContainerStyle={styles.exploreContainer}>
          <Text style={styles.exploreTitle}>Student Groups</Text>
          <Text style={styles.exploreSubtitle}>Join groups and connect with students</Text>
          
          <FlatList
            data={WHATSAPP_GROUPS}
            renderItem={renderGroupItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </ScrollView>
      ) : activeTab === 'chats' ? (
        <ScrollView contentContainerStyle={styles.chatsContainer}>
          <View style={styles.chatsHeader}>
            <Text style={styles.chatsTitle}>Your Messages</Text>
            <Text style={styles.chatsSubtitle}>Chat with your matches</Text>
          </View>

          <View style={styles.messagesSection}>
            {chats && chats.length > 0 ? (
              chats.map((chat, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.chatCard} 
                  onPress={() => startChat(chat.matchEmail, chat.name, chat.photos[0])}
                >
                  <View style={styles.chatPhotoContainer}>
                    <Image 
                      source={{ uri: chat.photos[0] }} 
                      style={styles.chatPhoto}
                    />
                    {chat.unread && <View style={styles.unreadBadge} />}
                  </View>
                  <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                      <Text style={styles.chatName}>{chat.name}</Text>
                      <Text style={styles.chatTime}>{chat.time}</Text>
                    </View>
                    <Text style={[styles.chatMessage, chat.unread && styles.unreadMessage]} 
                          numberOfLines={1}>
                      {chat.lastMessage}
                    </Text>
                  </View>
                  {chat.unread && (
                    <View style={styles.unreadIndicator}>
                      <Text style={styles.unreadDot}>●</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noChatsContainer}>
                <Text style={styles.noChatsText}>No messages yet</Text>
                <Text style={styles.noChatsSubtext}>Match with people to start chatting</Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : null}

      {/* WhatsApp-style Photo Swiper Modal */}
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
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setPhotoSwiperVisible(false)}
              >
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.photoCounter}>
                <Text style={styles.photoCounterText}>
                  {currentPhotoIndex + 1} / {currentProfilePhotos.length}
                </Text>
              </View>
              
              <Image
                source={{ uri: currentProfilePhotos[currentPhotoIndex] }}
                style={styles.fullScreenPhoto}
                resizeMode="contain"
              />
              
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

      {/* Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={dynamicStyles.settingsModalContent}>
            <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close" size={24} color={settings.darkMode ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.settingsList}>
              <Text style={dynamicStyles.settingsSectionTitle}>Discovery Settings</Text>
              
              <View style={[styles.settingItem, dynamicStyles.settingItem]}>
                <Ionicons name="school" size={24} color={settings.darkMode ? "#fff" : "#000"} />
                <View style={styles.settingInfo}>
                  <Text style={dynamicStyles.settingText}>University</Text>
                  <Text style={dynamicStyles.settingValue}>{settings.university}</Text>
                </View>
                <TouchableOpacity onPress={() => {
                  Alert.alert(
                    'Select University', 
                    'Choose your university:', 
                    [
                      ...SOUTH_AFRICAN_UNIVERSITIES.map(university => ({
                        text: university,
                        onPress: () => updateSettings('university', university)
                      })),
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }}>
                  <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>
              </View>

              <View style={[styles.settingItem, dynamicStyles.settingItem]}>
                <Ionicons name="male-female" size={24} color={settings.darkMode ? "#fff" : "#000"} />
                <View style={styles.settingInfo}>
                  <Text style={dynamicStyles.settingText}>Show Me</Text>
                  <Text style={dynamicStyles.settingValue}>{settings.showMe}</Text>
                </View>
                <TouchableOpacity onPress={() => {
                  Alert.alert('Show Me', 'Choose who to see:', [
                    { text: 'Everyone', onPress: () => updateSettings('showMe', 'Everyone') },
                    { text: 'Men', onPress: () => updateSettings('showMe', 'Men') },
                    { text: 'Women', onPress: () => updateSettings('showMe', 'Women') },
                    { text: 'Cancel', style: 'cancel' }
                  ]);
                }}>
                  <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>
              </View>

              <Text style={dynamicStyles.settingsSectionTitle}>Privacy</Text>
              
              <View style={[styles.settingItem, dynamicStyles.settingItem]}>
                <Ionicons name="eye" size={24} color={settings.darkMode ? "#fff" : "#000"} />
                <Text style={dynamicStyles.settingText}>Show Online Status</Text>
                <Switch
                  value={settings.showOnlineStatus}
                  onValueChange={(value) => updateSettings('showOnlineStatus', value)}
                  trackColor={{ false: "#767577", true: "#ff4458" }}
                />
              </View>

              <View style={[styles.settingItem, dynamicStyles.settingItem]}>
                <Ionicons name="checkmark-done" size={24} color={settings.darkMode ? "#fff" : "#000"} />
                <Text style={dynamicStyles.settingText}>Read Receipts</Text>
                <Switch
                  value={settings.readReceipts}
                  onValueChange={(value) => updateSettings('readReceipts', value)}
                  trackColor={{ false: "#767577", true: "#ff4458" }}
                />
              </View>

              <Text style={dynamicStyles.settingsSectionTitle}>Notifications</Text>
              
              <View style={[styles.settingItem, dynamicStyles.settingItem]}>
                <Ionicons name="notifications" size={24} color={settings.darkMode ? "#fff" : "#000"} />
                <Text style={dynamicStyles.settingText}>Push Notifications</Text>
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => updateSettings('notifications', value)}
                  trackColor={{ false: "#767577", true: "#ff4458" }}
                />
              </View>

              <View style={[styles.settingItem, dynamicStyles.settingItem]}>
                <Ionicons name="mail" size={24} color={settings.darkMode ? "#fff" : "#000"} />
                <Text style={dynamicStyles.settingText}>Email Notifications</Text>
                <Switch
                  value={settings.emailNotifications}
                  onValueChange={(value) => updateSettings('emailNotifications', value)}
                  trackColor={{ false: "#767577", true: "#ff4458" }}
                />
              </View>

              <Text style={dynamicStyles.settingsSectionTitle}>Appearance</Text>
              
              <View style={[styles.settingItem, dynamicStyles.settingItem]}>
                <Ionicons name="moon" size={24} color={settings.darkMode ? "#fff" : "#000"} />
                <Text style={dynamicStyles.settingText}>Dark Mode</Text>
                <Switch
                  value={settings.darkMode}
                  onValueChange={(value) => updateSettings('darkMode', value)}
                  trackColor={{ false: "#767577", true: "#ff4458" }}
                />
              </View>

              <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
                <Ionicons name="log-out" size={24} color="#ff4458" />
                <Text style={[styles.settingText, { color: '#ff4458' }]}>Log Out</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.settingItem, styles.deleteItem]}
                onPress={() => {
                  setSettingsModalVisible(false);
                  setDeleteConfirmModalVisible(true);
                }}
              >
                <MaterialIcons name="delete" size={24} color="#ff4458" />
                <Text style={[styles.settingText, { color: '#ff4458' }]}>Delete Account</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Existing Modals */}
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
  // Home tabs styles
  homeTabs: {
    flexDirection: 'row',
    marginTop: 15,
    width: '80%',
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    padding: 4,
  },
  homeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeHomeTab: {
    backgroundColor: '#ff4458',
  },
  homeTabText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 14,
  },
  activeHomeTabText: {
    color: '#fff',
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
  
  // REDESIGNED: Profile Section Styles
  profileScrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  profileImageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  noPhotoText: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  profileCompletion: {
    alignItems: 'center',
  },
  completionRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#ff4458',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  completionPercentage: {
    color: '#ff4458',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completionLabel: {
    color: '#888',
    fontSize: 12,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
  },
  bioSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  bioLabel: {
    color: '#ff4458',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileBio: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  
  // REDESIGNED: Actions Section
  actionsSection: {
    marginBottom: 20,
  },
  pinkActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 88, 0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 88, 0.3)',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff4458',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  
  // Settings Card
  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  settingsIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingsText: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Photos Section
  photosSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  photoCount: {
    color: '#888',
    fontSize: 14,
  },
  photosContainer: {
    flexDirection: 'row',
  },
  photoThumbnailContainer: {
    marginRight: 10,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff4458',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    color: '#ff4458',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  noPhotosSection: {
    marginBottom: 20,
  },
  addPhotosCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  addPhotosText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  addPhotosSubtext: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  
  // Premium Section
  premiumSection: {
    backgroundColor: 'rgba(255, 68, 88, 0.1)',
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 88, 0.3)',
  },
  premiumTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  premiumFeatures: {
    marginBottom: 20,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  upgradeButton: {
    backgroundColor: '#ff4458',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // WhatsApp-style Groups
  groupCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  groupLastMessage: {
    fontSize: 14,
    color: '#ccc',
  },
  groupMeta: {
    alignItems: 'flex-end',
  },
  groupTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  unreadBadge: {
    backgroundColor: '#ff4458',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Rest of the styles remain the same as previous version
  likesContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  likesHeader: {
    flex: 1,
  },
  likesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  likesSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  matchCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  matchPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  matchBio: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  matchUniversity: {
    fontSize: 12,
    color: '#ff4458',
  },
  chatButton: {
    flexDirection: 'row',
    backgroundColor: '#ff4458',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '600',
  },
  blurredProfilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  blurredProfileCard: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  blurredImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  blurredPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  lockIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  blurredProfileText: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  blurredProfileHint: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  likesMessage: {
    color: '#888',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  exploreContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  exploreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  exploreSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  // UPDATED: Instagram-style chat interface
  chatsContainer: {
    flex: 1,
    paddingBottom: 80,
  },
  chatsHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  chatsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  chatsSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
  messagesSection: {
    flex: 1,
  },
  chatCard: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  chatPhotoContainer: {
    position: 'relative',
    marginRight: 15,
  },
  chatPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: '#ff4458',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  chatTime: {
    fontSize: 12,
    color: '#888',
  },
  chatMessage: {
    fontSize: 14,
    color: '#888',
  },
  unreadMessage: {
    color: '#fff',
    fontWeight: '500',
  },
  unreadIndicator: {
    marginLeft: 10,
  },
  unreadDot: {
    color: '#ff4458',
    fontSize: 12,
  },
  noChatsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noChatsText: {
    color: '#888',
    fontSize: 18,
    marginBottom: 10,
  },
  noChatsSubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
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
  // Settings modal styles
  settingsModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  settingsList: {
    padding: 20,
  },
  settingsSectionTitle: {
    color: '#ff4458',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    marginLeft: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 15,
  },
  settingText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  settingValue: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
  logoutItem: {
    marginTop: 20,
    borderBottomWidth: 0,
  },
  deleteItem: {
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
  // Delete modal styles
  deleteContent: {
    padding: 20,
  },
  deleteWarning: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  reasonInput: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 80,
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
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#ff4458',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  confirmDeleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});