// app/login.js
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const BASE_URL = "http://192.168.249.38:3000";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setIsOtpSent(true);
        Alert.alert('Success', 'OTP sent to your email!');
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Check your connection.');
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
      console.log('📤 Sending password login:', { email: email.trim() });
      
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password.trim() 
        }),
      });

      const data = await res.json();
      console.log('✅ Response from backend:', data);

      if (data.success) {
        // Login successful - navigate directly to discover
        login(data.user);
        console.log('🚀 Navigating to discover page');
        router.replace('/discover');
        
      } else {
        Alert.alert('Error', data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert('Error', 'Login failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async () => {
    if (!email.trim() || !otp.trim()) {
      Alert.alert('Error', 'Please enter both email and OTP');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Sending OTP login:', { email: email.trim(), otp });
      
      const res = await fetch(`${BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          otp: otp.trim() 
        }),
      });

      const data = await res.json();
      console.log('✅ Response from backend:', data);

      if (data.success) {
        // Login successful - navigate directly to discover
        login(data.user);
        console.log('🚀 Navigating to discover page');
        router.replace('/discover');
        
      } else {
        Alert.alert('Error', data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('❌ OTP login error:', error);
      Alert.alert('Error', 'Login failed. Check your connection.');
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

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=400' }}
        style={styles.logo}
      />
      
      <Text style={styles.title}>UWC Connect</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

      <View style={styles.form}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color="#888" />
          <TextInput
            placeholder="University Email"
            placeholderTextColor="#888"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input (shown when using password login) */}
        {loginMethod === 'password' && (
          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#888" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#888"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        )}

        {/* OTP Input (shown when using OTP login) */}
        {loginMethod === 'otp' && (
          <>
            {!isOtpSent ? (
              <TouchableOpacity 
                style={styles.sendOtpButton}
                onPress={handleSendOtp}
                disabled={loading}
              >
                <Text style={styles.sendOtpButtonText}>
                  {loading ? 'Sending...' : 'Send OTP to Email'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.inputContainer}>
                <Ionicons name="key" size={20} color="#888" />
                <TextInput
                  placeholder="Enter OTP"
                  placeholderTextColor="#888"
                  style={styles.input}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            )}
          </>
        )}

        {/* Login Button */}
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={loginMethod === 'password' ? handlePasswordLogin : handleOtpLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        {/* Toggle between Password and OTP */}
        <TouchableOpacity 
          style={styles.toggleMethodButton}
          onPress={toggleLoginMethod}
        >
          <Text style={styles.toggleMethodText}>
            {loginMethod === 'password' 
              ? 'Login with OTP instead' 
              : 'Login with password instead'}
          </Text>
        </TouchableOpacity>

        {/* Sign up link */}
        <TouchableOpacity 
          style={styles.signupLink}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.signupLinkText}>
            Don't have an account? <Text style={styles.signupLinkBold}>Sign up</Text>
          </Text>
        </TouchableOpacity>

        {/* Back to welcome */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/welcome')}
        >
          <Text style={styles.backButtonText}>Back to Welcome</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  sendOtpButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  sendOtpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#ff4458',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#888',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleMethodButton: {
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleMethodText: {
    color: '#ff4458',
    fontSize: 14,
  },
  signupLink: {
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  signupLinkText: {
    color: '#888',
    fontSize: 14,
  },
  signupLinkBold: {
    color: '#ff4458',
    fontWeight: '600',
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ff4458',
    fontSize: 14,
  },
});