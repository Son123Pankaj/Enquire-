import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
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

  // 🔹 Fetch categories from backend
  const fetchCategories = async (query = "") => {
    try {
      setLoading(true);
      const catData = await getCategories(query); // ✅ API call
      setCategories(catData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  const fetchData = async () => {
    try {
      const catData = await getCategories();
      console.log("Categories fetched:", catData);
      setCategories(catData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
  const handleSearch = (text) => {
    setSearch(text);
    fetchCategories(text); // fetch filtered data from backend
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() =>
        navigation.navigate("HomeScreenDetails", { selectedCategory: item.name })
      }
    >
      <LinearGradient
        colors={["#6a11cb", "#2575fc"]}
        style={styles.cardGradient}
      >
        {/* <Image
          source={{ uri: item.image }}
          style={styles.categoryImage}
        /> */}
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.sub}>Specialized Experts</Text>
        <View style={styles.bottomRow}>
          <View style={styles.circle} />
          <View style={styles.countBox}>
          <Text style={styles.count}>+{item.business_profiles_count}</Text>
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
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      {categories.length > 10 && (
        <TouchableOpacity onPress={() => setShowAll(!showAll)}>
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
  categoryImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  title: { fontWeight: "700", color: "#fff", fontSize: 16 },
  sub: { color: "#eee", fontSize: 12, marginBottom: 10 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  circle: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#fff" },
  countBox: { backgroundColor: "#d4f5ea", padding: 5, borderRadius: 10 },
  count: { color: "green", fontWeight: "bold" },
  viewText: { textAlign: "center", margin: 15, color: "green", fontWeight: "bold" },
});