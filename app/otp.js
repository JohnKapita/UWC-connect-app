// app/otp.js
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from '../context/AuthContext';

const BASE_URL = "http://192.168.249.38:3000";

export default function OTP() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { setUser } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp.trim()) {
      return Alert.alert("Error", "Please enter the OTP");
    }

    setLoading(true);
    try {
      const payload = {
        email: String(email).trim(),
        otp: otp.trim(),
      };

      console.log("📤 Verifying OTP:", payload);

      const res = await fetch(`${BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("✅ OTP response:", data);

      if (data.success) {
        // SET USER AND GO TO PROFILE SETUP
        setUser({ email: email, otpVerified: true });
        console.log('🚀 Navigating to profile setup');
        router.replace({
          pathname: "/profilesetup",
          params: { email: String(email).trim() },
        });
      } else {
        Alert.alert("Error", data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("❌ OTP error:", err);
      Alert.alert("Error", "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text>

      <TextInput
        placeholder="Enter OTP"
        placeholderTextColor="#888"
        style={styles.input}
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
        autoCapitalize="none"
        maxLength={6}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify OTP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Back to Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000",
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
  input: {
    borderWidth: 1,
    borderColor: "#333",
    padding: 16,
    marginBottom: 25,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    letterSpacing: 4,
  },
  button: {
    backgroundColor: "#ff4458",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: "#333",
  },
  buttonDisabled: {
    backgroundColor: "#888",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});