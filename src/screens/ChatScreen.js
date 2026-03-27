import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
export default function ChatScreen({ route }) {
    const navigation=useNavigation()
  const { expert } = route.params;

  const [messages, setMessages] = useState([
    { id: 1, text: "Hello 👋", sender: "expert" },
    { id: 2, text: "How can I help you?", sender: "expert" },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now(),
      text: input,
      sender: "user",
    };

    setMessages([...messages, newMsg]);
    setInput("");
  };

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{expert.name}</Text>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.msg,
              item.sender === "user" ? styles.userMsg : styles.expertMsg,
            ]}
          >
            <Text>{item.text}</Text>
          </View>
        )}
      />

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type message..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage}>
          <Icon name="send" size={22} color="green" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    padding: 15,
    backgroundColor: "#eee",
  },

  name: {
    fontWeight: "bold",
  },

  msg: {
    padding: 10,
    margin: 5,
    borderRadius: 10,
    maxWidth: "70%",
  },

  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },

  expertMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
  },

  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
});