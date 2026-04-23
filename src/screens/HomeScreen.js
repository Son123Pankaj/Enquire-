import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import ShimmerCategoryCard from "../component/ShimmerCategoryCard";
import { getCategories } from "../services/category"; // ✅ Attach API here

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");

  const data = showAll ? categories : categories.slice(0, 10);

  const fetchCategories = async (query = "") => {
    try {
      setLoading(true);
      const catData = await getCategories(query); // ✅ API call
      setCategories(catData);
    } catch (err) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    fetchCategories(text);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() =>
        navigation.navigate("MainApp", {
          screen: "HomeTab",
          params: {
            selectedCategory: item.name,
          },
        })
      }
    >
      <LinearGradient
        colors={["#6a11cb", "#2575fc"]}
        style={styles.cardGradient}
      >
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.sub}>Specialized Experts</Text>
        <View style={styles.bottomRow}>
          <View style={styles.circle} />
          <View style={styles.countBox}>
            <Text style={styles.count}>+{item.business_profiles_count || 0}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <TextInput
          placeholder="Search experts..."
          style={styles.search}
          value={search}
          onChangeText={handleSearch}
        />
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          numColumns={2}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <ShimmerCategoryCard />}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search experts..."
        style={styles.search}
        value={search}
        onChangeText={handleSearch}
      />
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item, index) => String(item.id || item.name || index)}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No categories found</Text>
            <Text style={styles.emptySubtitle}>
              Try another search or continue to the main app home.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate("MainApp")}
            >
              <Text style={styles.emptyButtonText}>Open Main App</Text>
            </TouchableOpacity>
          </View>
        }
      />
      {categories.length > 10 && (
        <TouchableOpacity onPress={() => setShowAll((prev) => !prev)}>
          <Text style={styles.viewText}>
            {showAll ? "View Less" : "View More"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f5f5f5" },
  search: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 25,
    marginBottom: 10,
  },
  infoBanner: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  infoText: {
    color: "#9a3412",
    fontSize: 13,
    fontWeight: "600",
  },
  cardContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
  },
  cardGradient: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  title: { fontWeight: "700", color: "#fff", fontSize: 16 },
  sub: { color: "#eee", fontSize: 12, marginBottom: 10 },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  circle: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#fff" },
  countBox: { backgroundColor: "#d4f5ea", padding: 5, borderRadius: 10 },
  count: { color: "green", fontWeight: "bold" },
  viewText: {
    textAlign: "center",
    margin: 15,
    color: "green",
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: "center",
    color: "#64748b",
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: "#f97316",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
