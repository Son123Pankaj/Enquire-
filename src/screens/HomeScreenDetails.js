import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import ShimmerCard from "../component/ShimmerCard";

export default function HomeScreenDetails() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [notifications, setNotifications] = useState(3);
  const [showSearch, setShowSearch] = useState(false);

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

  const [activeCategory, setActiveCategory] = useState("ALL");

  const handleCategoryPress = (cat) => {
    setActiveCategory(prev => prev === cat ? "ALL" : cat);
  };

  const experts = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    name: i % 2 === 0 ? "CA Shafaly" : "Adv. Manoj",
    role: i % 2 === 0 ? "GST Expert" : "Corporate Lawyer",
    category: categoryPool[i % categoryPool.length],
    price: `₹${(i + 1) * 10}/min`,
    image: "https://randomuser.me/api/portraits/men/1.jpg",
  }));

  const filteredExperts =
    activeCategory === "ALL"
      ? experts
      : activeCategory === "POPULAR"
      ? experts.slice(0, 10)
      : experts.filter((item) => item.category === activeCategory);

  const finalExperts = filteredExperts.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.category.toLowerCase().includes(searchText.toLowerCase())
  );

  // 🔥 LOADING UI
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Enquire</Text>

          <View style={styles.headerIcons}>
            <Icon name="search" size={20} style={styles.iconSpace} />
            <Icon name="message-circle" size={20} style={styles.iconSpace} />
            <Icon name="bell" size={20} />
          </View>
        </View>

        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <ShimmerCard />}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* 🔥 HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>Enquire</Text>

        <View style={styles.headerIcons}>
          
          <TouchableOpacity
            style={styles.iconSpace}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Icon name="search" size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconSpace}
            onPress={() =>
              navigation.navigate("Chat", { expert: { name: "CA Shafaly" } })
            }
          >
            <Icon name="message-circle" size={20} />
          </TouchableOpacity>

          <View>
            <Icon name="bell" size={20} />
            {notifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifications}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 🔍 SEARCH */}
      {showSearch && (
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#777" />

          <TextInput
            placeholder="Search..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
            autoFocus
          />

          <TouchableOpacity onPress={() => {
            setShowSearch(false);
            setSearchText("");
          }}>
            <Icon name="x" size={18} color="#777" />
          </TouchableOpacity>
        </View>
      )}

      {/* 🔥 CATEGORY */}
      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>

          <TouchableOpacity
            onPress={() => setActiveCategory("ALL")}
            style={[styles.catBtn, activeCategory === "ALL" && styles.activeCat]}
          >
            <Icon name="grid" size={14} color={activeCategory === "ALL" ? "#fff" : "#000"} />
            <Text style={[styles.catText, activeCategory === "ALL" && styles.activeText]}>
              {" "}All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveCategory("POPULAR")}
            style={[styles.catBtn, activeCategory === "POPULAR" && styles.activeCat]}
          >
            <Icon name="trending-up" size={14} color={activeCategory === "POPULAR" ? "#fff" : "#000"} />
            <Text style={[styles.catText, activeCategory === "POPULAR" && styles.activeText]}>
              {" "}Popular
            </Text>
          </TouchableOpacity>

          {categoryPool.map((cat, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleCategoryPress(cat)}
              style={[styles.catBtn, activeCategory === cat && styles.activeCat]}
            >
              <Text style={[styles.catText, activeCategory === cat && styles.activeText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}

        </ScrollView>
      </View>

      {/* 🔥 LIST */}
      <FlatList
        data={finalExperts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
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

            {/* 🔥 ACTION BUTTONS */}
            <View style={styles.right}>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  navigation.navigate("Chat", { expert: item })
                }
              >
                <Icon name="message-circle" size={18} color="#4CAF50" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn}>
                <Icon name="phone-call" size={18} color="#2196F3" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn}>
                <Icon name="video" size={18} color="#E91E63" />
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

  headerIcons: {
    flexDirection: "row",
  },

  iconSpace: {
    marginRight: 15,
  },

  logo: {
    fontSize: 18,
    fontWeight: "bold",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 40,
  },

  searchInput: {
    marginLeft: 10,
    flex: 1,
  },

  badge: {
    position: "absolute",
    right: -6,
    top: -4,
    backgroundColor: "red",
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  categoryWrapper: {
    paddingVertical: 10,
  },

  catBtn: {
    flexDirection: "row",
    alignItems: "center",
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

  actionBtn: {
    backgroundColor: "#f1f1f1",
    padding: 8,
    borderRadius: 25,
    marginBottom: 6,
  },

  price: {
    color: "green",
    fontWeight: "bold",
  },
});