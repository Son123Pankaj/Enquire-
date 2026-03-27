import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import call from "react-native-phone-call";
import CustomShimmer from "../component/CustomerShimmer";

export default function ExpertDetailsScreen({ route }) {
  const navigation = useNavigation();

  const expert = route?.params?.expert;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const makeCall = () => {
    call({
      number: "+91 70892 87907",
      prompt: true,
    });
  };

  // 🔥 Safety check (avoid crash)
  if (!expert) return null;

  // 🔥 SHIMMER UI
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          
          <View style={styles.header}>
            <CustomShimmer style={styles.image} />
            <CustomShimmer style={{ width: 120, height: 15, marginTop: 10 }} />
            <CustomShimmer style={{ width: 80, height: 12, marginTop: 5 }} />
            <CustomShimmer style={{ width: 100, height: 12, marginTop: 5 }} />
          </View>

          <View style={styles.buttonRow}>
            <CustomShimmer style={styles.btnShimmer} />
            <CustomShimmer style={styles.btnShimmer} />
          </View>

          <View style={styles.section}>
            <CustomShimmer style={{ width: 100, height: 14 }} />
            <CustomShimmer style={{ width: "100%", height: 10, marginTop: 10 }} />
            <CustomShimmer style={{ width: "90%", height: 10, marginTop: 5 }} />
            <CustomShimmer style={{ width: "80%", height: 10, marginTop: 5 }} />
          </View>

          <View style={styles.section}>
            <CustomShimmer style={{ width: 100, height: 14 }} />
            {[1, 2, 3, 4].map((i) => (
              <CustomShimmer
                key={i}
                style={{ width: "60%", height: 10, marginTop: 8 }}
              />
            ))}
          </View>

          <View style={{ margin: 20 }}>
            <CustomShimmer style={styles.bookShimmer} />
          </View>

        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        
        {/* PROFILE */}
        <View style={styles.header}>
          <Image source={{ uri: expert.image }} style={styles.image} />

          <Text style={styles.name}>{expert.name}</Text>
          <Text style={styles.role}>{expert.role}</Text>

          <View style={styles.row}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}> 4.5 (120 reviews)</Text>
          </View>

          <Text style={styles.exp}>5+ Years Experience</Text>
          <Text style={styles.price}>{expert.price}</Text>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.callBtn} onPress={makeCall}>
            <Icon name="phone-call" size={18} color="#fff" />
            <Text style={styles.btnText}> Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => navigation.navigate("Chat", { expert })}
          >
            <Icon name="message-circle" size={18} color="#fff" />
            <Text style={styles.btnText}> Chat</Text>
          </TouchableOpacity>
        </View>

        {/* ABOUT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.desc}>
            Experienced professional specializing in {expert.category}.
            Helping clients with accurate consultation, legal guidance, and business solutions.
          </Text>
        </View>

        {/* SERVICES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <Text>✔ Consultation</Text>
          <Text>✔ Legal Advice</Text>
          <Text>✔ Documentation</Text>
          <Text>✔ Business Support</Text>
        </View>

        {/* BOOK */}
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate("Booking", { expert })}
        >
          <Text style={styles.bookText}>Book Appointment</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
  },

  role: { color: "gray" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  rating: { fontSize: 14 },

  exp: { marginTop: 5, color: "#555" },

  price: {
    marginTop: 5,
    fontWeight: "bold",
    color: "#4CAF50",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },

  callBtn: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
  },

  chatBtn: {
    backgroundColor: "#2196F3",
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  btnShimmer: {
    width: 140,
    height: 40,
    borderRadius: 10,
  },

  section: {
    backgroundColor: "#fff",
    marginTop: 10,
    padding: 15,
  },

  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },

  desc: { color: "#555" },

  bookBtn: {
    margin: 20,
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  bookText: {
    color: "#fff",
    fontWeight: "bold",
  },

  bookShimmer: {
    width: "100%",
    height: 50,
    borderRadius: 10,
  },
});