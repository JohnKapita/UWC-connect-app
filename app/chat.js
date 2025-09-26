// chat.js - UPDATED
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from '../context/AuthContext';

const BASE_URL = "http://192.168.249.38:3000";

export default function Chat() {
  const { to } = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const fetchMessages = () => {
    if (!user) return;
    
    fetch(`${BASE_URL}/chat?user1=${user.email}&user2=${to}`)
      .then((res) => res.json())
      .then(setMessages);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [user, to]);

  const sendMessage = () => {
    if (!text || !user) return;
    
    fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        fromEmail: user.email, 
        toEmail: to, 
        message: text 
      }),
    }).then(() => {
      setText("");
      fetchMessages();
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text
            style={[
              styles.msg,
              item.fromEmail === user.email ? styles.mine : styles.theirs,
            ]}
          >
            {item.message}
          </Text>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000ff", padding: 10 },
  msg: { padding: 10, marginVertical: 5, borderRadius: 8, maxWidth: "70%" },
  mine: { backgroundColor: "#DCF8C6", alignSelf: "flex-end" },
  theirs: { backgroundColor: "#EAEAEA", alignSelf: "flex-start" },
  inputRow: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
});