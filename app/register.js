// app/register.js
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getEmailError } from "../utils/emailValidation";

const BASE_URL = "http://192.168.249.175:3000";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = () => {
    const error = getEmailError(email);
    setEmailError(error);
    return !error;
  };

  const handleRegister = async () => {
    if (!email || !password)
      return Alert.alert("Error", "Email and password required");

    if (!validateEmail()) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("OTP Sent", "Check your UWC email for OTP");
        router.push(
          `/otp?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        );
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      Alert.alert("Error", "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create UWC Account</Text>
      
      <TextInput
        placeholder="UWC Email (e.g., 4173759@myuwc.ac.za)"
        placeholderTextColor="#888"
        style={[styles.input, emailError && styles.inputError]}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailError("");
        }}
        onBlur={validateEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={[styles.button, (loading || emailError) && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading || !!emailError}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Back to Welcome</Text>
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
    marginBottom: 30,
    textAlign: "center",
    color: "#fff",
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
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 15,
    marginLeft: 5,
  },
  button: {
    backgroundColor: "#ff4458",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#ff4458",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
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
  backButton: {
    marginTop: 20,
    alignItems: "center",
  },
  backButtonText: {
    color: "#ff4458",
    fontSize: 14,
    fontWeight: "600",
  },
});