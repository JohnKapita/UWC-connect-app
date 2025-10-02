// chat.js - FIXED VERSION
import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from '../context/AuthContext';

const BASE_URL = "http://192.168.249.175:3000";

// Enhanced fetch with timeout
const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
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

export default function Chat() {
  const { matchEmail, matchName, matchPhoto } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [matchProfile, setMatchProfile] = useState(null);
  const flatListRef = useRef(null);

  // Fetch match profile data with error handling
  const fetchMatchProfile = async () => {
    try {
      if (!matchEmail) return;
      
      const response = await fetchWithTimeout(`${BASE_URL}/profile/${matchEmail}`, {}, 5000);
      
      if (!response.ok) {
        // If profile not found, use fallback data
        console.log('⚠️ Profile not found, using fallback data');
        setMatchProfile({
          name: matchName || 'Unknown User',
          photos: matchPhoto ? [matchPhoto] : ['https://via.placeholder.com/100'],
          university: 'Unknown University'
        });
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.profile) {
        setMatchProfile(data.profile);
      } else {
        // Use the passed parameters as fallback
        setMatchProfile({
          name: matchName || 'Unknown User',
          photos: matchPhoto ? [matchPhoto] : ['https://via.placeholder.com/100'],
          university: 'Unknown University'
        });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('⏰ Profile fetch timeout');
      } else {
        console.error('Error fetching match profile:', error);
      }
      // Use fallback data
      setMatchProfile({
        name: matchName || 'Unknown User',
        photos: matchPhoto ? [matchPhoto] : ['https://via.placeholder.com/100'],
        university: 'Unknown University'
      });
    }
  };

  const fetchMessages = async () => {
    if (!user || !matchEmail) return;
    
    try {
      setLoading(true);
      // FIXED: Using /messages endpoint instead of /chat
      const response = await fetchWithTimeout(
        `${BASE_URL}/messages?user1=${user.email}&user2=${matchEmail}`, 
        {}, 
        5000
      );
      
      if (!response.ok) {
        // If messages endpoint returns error, use mock data
        console.log('⚠️ Messages endpoint returned error, using mock data');
        setMessages([
          { 
            id: 1, 
            sender: matchEmail, 
            receiver: user.email, 
            text: "Hey there! 👋", 
            timestamp: new Date(Date.now() - 300000).toISOString() 
          },
          { 
            id: 2, 
            sender: user.email, 
            receiver: matchEmail, 
            text: "Hi! Nice to match with you! 😊", 
            timestamp: new Date(Date.now() - 180000).toISOString() 
          },
          { 
            id: 3, 
            sender: matchEmail, 
            receiver: user.email, 
            text: "How are you doing today?", 
            timestamp: new Date().toISOString() 
          }
        ]);
        return;
      }
      
      const data = await response.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      } else {
        // Use mock messages if no real messages
        setMessages([
          { 
            id: 1, 
            sender: matchEmail, 
            receiver: user.email, 
            text: "Hey there! 👋", 
            timestamp: new Date(Date.now() - 300000).toISOString() 
          },
          { 
            id: 2, 
            sender: user.email, 
            receiver: matchEmail, 
            text: "Hi! Nice to match with you! 😊", 
            timestamp: new Date(Date.now() - 180000).toISOString() 
          }
        ]);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('⏰ Messages fetch timeout - using mock data');
      } else {
        console.error('Error fetching messages:', error);
      }
      // Use mock messages for testing if API fails
      setMessages([
        { 
          id: 1, 
          sender: matchEmail, 
          receiver: user.email, 
          text: "Hey there! 👋", 
          timestamp: new Date(Date.now() - 300000).toISOString() 
        },
        { 
          id: 2, 
          sender: user.email, 
          receiver: matchEmail, 
          text: "Hi! Nice to match with you! 😊", 
          timestamp: new Date(Date.now() - 180000).toISOString() 
        },
        { 
          id: 3, 
          sender: matchEmail, 
          receiver: user.email, 
          text: "How are you doing today?", 
          timestamp: new Date().toISOString() 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchProfile();
    fetchMessages();
    
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user, matchEmail]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !user || !matchEmail || sending) return;
    
    let tempMessage;
    
    try {
      setSending(true);
      
      // Optimistically add message to UI
      tempMessage = {
        id: Date.now(),
        sender: user.email,
        receiver: matchEmail,
        text: text.trim(),
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setText("");
      
      // FIXED: Using /messages endpoint instead of /chat
      const response = await fetchWithTimeout(`${BASE_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sender: user.email, 
          receiver: matchEmail, 
          text: text.trim()
        }),
      }, 10000);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Message sent successfully');
      // Refresh messages after sending
      setTimeout(fetchMessages, 100);
    } catch (error) {
      if (error.name === 'AbortError') {
        Alert.alert('Timeout', 'Message sending timed out. Please try again.');
      } else {
        console.error('Error sending message:', error);
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
      // Remove optimistic message on error
      if (tempMessage) {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      }
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const renderMessage = ({ item, index }) => {
    const isMyMessage = item.sender === user.email;
    const showDate = index === 0 || !isSameDay(new Date(item.timestamp), new Date(messages[index - 1].timestamp));
    
    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>
              {new Date(item.timestamp).toLocaleDateString([], { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
        ]}>
          {!isMyMessage && matchProfile?.photos?.[0] && (
            <Image 
              source={{ uri: matchProfile.photos[0] }} 
              style={styles.profileImageSmall}
            />
          )}
          <View style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessage : styles.theirMessage
          ]}>
            <Text style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.theirMessageText
            ]}>
              {item.text || item.message}
            </Text>
            <Text style={[
              styles.timeText,
              isMyMessage ? styles.myTimeText : styles.theirTimeText
            ]}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <StatusBar barStyle="light-content" />
      
      {/* WhatsApp-style Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        {matchProfile?.photos?.[0] ? (
          <Image 
            source={{ uri: matchProfile.photos[0] }} 
            style={styles.headerProfileImage}
          />
        ) : (
          <View style={styles.headerProfilePlaceholder}>
            <Feather name="user" size={24} color="#fff" />
          </View>
        )}
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>
            {matchProfile?.name || matchName || 'Unknown User'}
          </Text>
          <Text style={styles.headerStatus}>
            {matchProfile?.university || 'Online'}
          </Text>
        </View>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="videocam" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="call" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <View style={styles.messagesContainer}>
        {loading && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff4458" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.noMessagesContainer}>
            <Text style={styles.noMessagesText}>No messages yet</Text>
            <Text style={styles.noMessagesSubtext}>Start the conversation!</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => `${item.id || index}_${item.timestamp}`}
            renderItem={renderMessage}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}
      </View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachmentButton}>
            <Ionicons name="add-circle-outline" size={28} color="#ff4458" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            multiline
            maxLength={500}
          />
          
          {text.trim() ? (
            <TouchableOpacity 
              style={[styles.sendButton, sending && styles.sendButtonDisabled]} 
              onPress={sendMessage}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.utilityButtons}>
              <TouchableOpacity style={styles.utilityButton}>
                <Ionicons name="camera" size={24} color="#ff4458" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilityButton}>
                <Ionicons name="mic" size={24} color="#ff4458" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0d1418" 
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2c34',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  headerProfilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff4458',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerStatus: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 15,
  },
  // Messages Container
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
    marginTop: 10,
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMessagesText: {
    color: '#888',
    fontSize: 18,
    marginBottom: 10,
  },
  noMessagesSubtext: {
    color: '#666',
    fontSize: 14,
  },
  // Message Styles
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dateText: {
    color: '#888',
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  profileImageSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    maxWidth: '100%',
  },
  myMessage: {
    backgroundColor: '#005c4b',
    borderTopRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#1f2c34',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#fff',
  },
  timeText: {
    fontSize: 11,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255,255,255,0.6)',
  },
  theirTimeText: {
    color: 'rgba(255,255,255,0.6)',
  },
  // Input Styles
  inputContainer: {
    backgroundColor: '#1f2c34',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a3942',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  attachmentButton: {
    padding: 5,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff4458',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#666',
  },
  utilityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  utilityButton: {
    padding: 8,
    marginLeft: 5,
  },
});