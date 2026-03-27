import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import ShimmerCard from "../component/ShimmerCard";

export default function HomeScreenDetails() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const categoryPool = [
    "Income Tax Litigation","Import Export Code","TDS / TCS Compliance","Finance",
    "Financial Planning","FSSAI","Company Law","ROC Filings","GST Litigation",
    "Accounting","GST Registration","Income Tax Return","GST Returns",
    "Capital Gains","Business Closure","Tax Refunds","Child Custody",
    "Data Privacy","Hindu Marriage","Court Marriage","ROC Litigation",
    "Startup","Trademark","Patent","MSME","Audit","Payroll","Labour Law",
    "Import Duty","Export Compliance","NGO","Trust","Legal Notice",
    "Property Law","Divorce","Cyber Crime","Banking Law","Insurance",
    "Loan Settlement","Investment","Wealth","Tax Planning",
    "Business Setup","Franchise","CA Help","Legal Help"
  ];

  const [activeCategory, setActiveCategory] = useState(null);

  const handleCategoryPress = (cat) => {
    setActiveCategory(prev => prev === cat ? null : cat);
  };

  const experts = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    name: i % 2 === 0 ? "CA Shafaly" : "Adv. Manoj",
    role: i % 2 === 0 ? "GST Expert" : "Corporate Lawyer",
    category: categoryPool[i % categoryPool.length],
    price: `₹${(i + 1) * 10}/min`,
    image: "https://randomuser.me/api/portraits/men/1.jpg",
  }));

  const filteredExperts = activeCategory
    ? experts.filter((item) => item.category === activeCategory)
    : experts;

  // 🔥 SHIMMER LOADING UI
  if (loading) {
    return (
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>Enquire</Text>
          <Icon name="search" size={20} />
        </View>

        {/* CATEGORY SHIMMER */}
        <View style={styles.categoryWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1,2,3,4,5,6].map((item) => (
              <View
                key={item}
                style={{
                  width: 60 + Math.random() * 40,
                  height: 30,
                  borderRadius: 20,
                  backgroundColor: "#e0e0e0",
                  marginHorizontal: 5,
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* SHIMMER LIST */}
        <FlatList
          data={[1,2,3,4,5]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <ShimmerCard />}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>Enquire</Text>
        <Icon name="search" size={20} />
      </View>

      {/* CATEGORY */}
      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categoryPool.map((cat, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleCategoryPress(cat)}
              style={[
                styles.catBtn,
                activeCategory === cat && styles.activeCat,
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  activeCategory === cat && styles.activeText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* EXPERT LIST */}
      <FlatList
        data={filteredExperts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("ExpertDetailsScreen", { expert: item })
            }
          >
            <View style={styles.left}>
              <Image source={{ uri: item.image }} style={styles.avatar} />

              <View style={{ marginLeft: 10 }}>
                <Text style={styles.name}>{item.name} ✔</Text>
                <Text style={styles.role}>{item.role}</Text>

                <Text style={styles.rating}>
                  Category: {item.category}
                </Text>
              </View>
            </View>

            <View style={styles.right}>
              <TouchableOpacity style={styles.callBtn}>
                <Icon name="phone" size={18} color="#aaa" />
              </TouchableOpacity>

              <Text style={styles.price}>{item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    alignItems: "center",
  },

  logo: {
    fontSize: 18,
    fontWeight: "bold",
  },

  categoryWrapper: {
    paddingVertical: 10,
  },

  catBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  activeCat: {
    backgroundColor: "green",
  },

  catText: {
    fontSize: 13,
    color: "#000",
  },

  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 10,
    padding: 12,
    borderRadius: 12,
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flexDirection: "row",
    flex: 1,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  name: {
    fontWeight: "bold",
  },

  role: {
    fontSize: 12,
    color: "#666",
  },

  rating: {
    fontSize: 12,
    color: "#666",
  },

  right: {
    alignItems: "center",
  },

  callBtn: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 30,
    marginBottom: 5,
  },

  price: {
    color: "green",
    fontWeight: "bold",
  },
});