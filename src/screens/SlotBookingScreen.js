import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

export default function BookingScreen({ route, navigation }) {
  const { expert } = route.params;

  const [selectedSlot, setSelectedSlot] = useState(null);

  const slots = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "2:00 PM",
    "4:00 PM",
  ];

  // 🔥 Confirm Booking Function
  const confirmBooking = () => {
    if (!selectedSlot) {
      Alert.alert("Error", "Please select a time slot");
      return;
    }

    Alert.alert(
      "Booking Confirmed ✅",
      `You booked ${expert.name} at ${selectedSlot}`,
      [
        {
          text: "OK",
          onPress: () => navigation.goBack(), // 🔙 back after booking
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      
      {/* Title */}
      <Text style={styles.title}>Book with {expert.name}</Text>

      {/* Slots */}
      {slots.map((slot, i) => (
        <TouchableOpacity
          key={i}
          style={[
            styles.slot,
            selectedSlot === slot && styles.selected,
          ]}
          onPress={() => setSelectedSlot(slot)}
        >
          <Text
            style={[
              styles.slotText,
              selectedSlot === slot && styles.selectedText,
            ]}
          >
            {slot}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Confirm Button */}
      <TouchableOpacity style={styles.bookBtn} onPress={confirmBooking}>
        <Text style={styles.bookText}>Confirm Booking</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  slot: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  selected: {
    backgroundColor: "green",
    borderColor: "green",
  },

  slotText: {
    textAlign: "center",
  },

  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },

  bookBtn: {
    marginTop: 20,
    backgroundColor: "#000",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
  },

  bookText: {
    color: "#fff",
    fontWeight: "bold",
  },
});