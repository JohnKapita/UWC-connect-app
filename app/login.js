// app/login.js
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const BASE_URL = "http://192.168.249.175:3000";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState('otp');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your university email');
      return;
    }

    if (!email.trim().includes('@') || !email.trim().includes('.ac.za')) {
      Alert.alert('Error', 'Please enter a valid university email address');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Sending OTP request:', { email: email.trim() });
      
      const res = await fetch(`${BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(),
          password: password.trim() || 'default123'
        }),
      });

      const data = await res.json();
      console.log('✅ OTP response:', data);

      if (data.success) {
        setIsOtpSent(true);
        Alert.alert('Success', 'OTP sent to your email! Check your inbox.');
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('❌ OTP send error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async () => {
    if (!email.trim() || !otp.trim()) {
      Alert.alert('Error', 'Please enter both email and OTP');
      return;
    }

    if (otp.trim().length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Verifying OTP:', { email: email.trim(), otp });
      
      const res = await fetch(`${BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          otp: otp.trim() 
        }),
      });

      const data = await res.json();
      console.log('✅ OTP verification response:', data);

      if (data.success) {
        const user = {
          email: email.trim(),
        };
        
        login(user);
        console.log('🚀 Login successful, navigating to discover');
        router.replace('/discover');
        
      } else {
        Alert.alert('Error', data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('❌ OTP login error:', error);
      Alert.alert('Error', 'Login failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Attempting password login:', { email: email.trim() });
      
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password.trim() 
        }),
      });

      const data = await res.json();
      console.log('✅ Password login response:', data);

      if (data.success) {
        const user = {
          email: email.trim(),
        };
        
        login(user);
        console.log('🚀 Password login successful, navigating to discover');
        router.replace('/discover');
        
      } else {
        Alert.alert('Error', data.message || 'Invalid email or password. Try OTP login instead.');
      }
    } catch (error) {
      console.error('❌ Password login error:', error);
      Alert.alert('Error', 'Password login not available. Please use OTP login.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
    setIsOtpSent(false);
    setOtp('');
    setPassword('');
  };

  const handleBackToWelcome = () => {
    router.push('/welcome');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToWelcome}
        >
          <Feather name="arrow-left" size={20} color="#ff4458" />
          <Text style={styles.backButtonText}>Welcome</Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" }}
            style={styles.logo}
          />
          <View style={styles.logoOverlay} />
        </View>
        
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
      </View>

      {/* Login Card */}
      <View style={styles.card}>
        {/* Login Method Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              loginMethod === 'otp' && styles.toggleButtonActive
            ]}
            onPress={() => setLoginMethod('otp')}
          >
            <Ionicons 
              name="phone-portrait" 
              size={20} 
              color={loginMethod === 'otp' ? '#fff' : '#888'} 
            />
            <Text style={[
              styles.toggleText,
              loginMethod === 'otp' && styles.toggleTextActive
            ]}>
              OTP Login
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              loginMethod === 'password' && styles.toggleButtonActive
            ]}
            onPress={() => setLoginMethod('password')}
          >
            <Feather 
              name="lock" 
              size={20} 
              color={loginMethod === 'password' ? '#fff' : '#888'} 
            />
            <Text style={[
              styles.toggleText,
              loginMethod === 'password' && styles.toggleTextActive
            ]}>
              Password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>University Email</Text>
          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color="#ff4458" />
            <TextInput
              placeholder="student@myuwc.ac.za"
              placeholderTextColor="#666"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
        </View>

        {/* Password Input */}
        {loginMethod === 'password' && (
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#ff4458" />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#666"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>
          </View>
        )}

        {/* OTP Flow */}
        {loginMethod === 'otp' && (
          <>
            {!isOtpSent ? (
              <TouchableOpacity 
                style={[styles.otpButton, loading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.otpButtonText}>
                  {loading ? 'Sending OTP...' : 'Send Verification Code'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Verification Code</Text>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="confirmation-number" size={20} color="#ff4458" />
                  <TextInput
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#666"
                    style={styles.input}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </View>
                <TouchableOpacity onPress={handleSendOtp} style={styles.resendLink}>
                  <Text style={styles.resendText}>Didn't receive code? Resend</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Login Button */}
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={loginMethod === 'password' ? handlePasswordLogin : handleOtpLogin}
          disabled={loading || (loginMethod === 'otp' && !isOtpSent)}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.loginButtonText}>
                {loginMethod === 'password' ? 'Sign In' : 'Verify & Continue'}
              </Text>
              <Feather name="arrow-right" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* App Tagline */}
      <Text style={styles.tagline}>
        Connecting UWC students worldwide 🌍
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    alignSelf: 'flex-start',
    marginLeft: -10,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#ff4458',
    fontSize: 16,
    fontWeight: '600',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1a1a1a",
  },
  logoOverlay: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#ff4458',
    opacity: 0.3,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#ff4458",
    textAlign: "center",
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    shadowColor: '#ff4458',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    marginBottom: 25,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#ff4458',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  toggleTextActive: {
    color: '#fff',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  otpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  otpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#ff4458",
    padding: 18,
    borderRadius: 14,
    gap: 10,
    shadowColor: "#ff4458",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonDisabled: {
    backgroundColor: '#666',
    shadowOpacity: 0,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  resendLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  resendText: {
    color: '#ff4458',
    fontSize: 12,
    fontWeight: '500',
  },
  tagline: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 20,
    fontWeight: '500',
  },
});