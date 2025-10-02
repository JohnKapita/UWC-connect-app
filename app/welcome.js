import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo/App Icon */}
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" }}
        style={styles.logo}
      />
      
      <Text style={styles.title}>Welcome to Campus Connect </Text>
      <Text style={styles.subtitle}>Your community, your network.</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Footer text */}
      <Text style={styles.footerText}>
        Join thousands of UWC students connecting worldwide
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
    backgroundColor: "#1a1a1a",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ffffff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    color: "#ff4458",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#ff4458",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
    shadowColor: "#ff4458",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});