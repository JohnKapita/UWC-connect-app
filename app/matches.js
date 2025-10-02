// matches.js - UPDATED
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from '../context/AuthContext';


const BASE_URL = "http://192.168.249.175:3000";

export default function Matches() {
  const router = useRouter();
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`${BASE_URL}/matches?email=${user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setMatches(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Matches</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.matchItem}
            onPress={() => router.push(`/chat?to=${item}`)}
          >
            <Text style={styles.matchText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  matchItem: {
    padding: 15,
    backgroundColor: "#F0F0F0",
    marginBottom: 10,
    borderRadius: 8,
  },
  matchText: { fontSize: 18 },
});