import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Modal,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { getMyBusiness, updateBusiness } from "../services/business";
import {
  createSchedule,
  deleteSchedule,
  getSchedules,
} from "../services/schedule";
import { showToast } from "../utils/toast";

const DAYS = [
  { key: 1, label: "Monday" },
  { key: 2, label: "Tuesday" },
  { key: 3, label: "Wednesday" },
  { key: 4, label: "Thursday" },
  { key: 5, label: "Friday" },
  { key: 6, label: "Saturday" },
  { key: 0, label: "Sunday" },
];

const buildTimeOptions = () => {
  const options = [];

  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += 30) {
      const labelHour = hour % 12 === 0 ? 12 : hour % 12;
      const suffix = hour < 12 ? "AM" : "PM";
      const labelMinute = String(minute).padStart(2, "0");

      options.push({
        value: `${String(hour).padStart(2, "0")}:${labelMinute}`,
        label: `${labelHour}:${labelMinute} ${suffix}`,
      });
    }
  }

  return options;
};

const TIME_OPTIONS = buildTimeOptions();

const toMinutes = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const formatTime = (time) => {
  const [hourValue, minute] = time.split(":");
  const hour = Number(hourValue);
  const labelHour = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour < 12 ? "AM" : "PM";
  return `${labelHour}:${minute} ${suffix}`;
};

const createDayEnabledMap = () =>
  DAYS.reduce((acc, day) => {
    acc[day.key] = false;
    return acc;
  }, {});

export default function Schedule({ navigation, route }) {
  const entryMode = route?.params?.entryMode || "direct";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState(null);
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [alwaysAvailable, setAlwaysAvailable] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [dayEnabled, setDayEnabled] = useState({});
  const [slotsByDay, setSlotsByDay] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [startTime, setStartTime] = useState(TIME_OPTIONS[0].value);
  const [endTime, setEndTime] = useState(TIME_OPTIONS[1].value);

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const [business, schedules] = await Promise.all([
        getMyBusiness(),
        getSchedules(),
      ]);

      setBusinessId(business?.id || null);
      setExistingSchedules(Array.isArray(schedules) ? schedules : []);

      const always = schedules?.some(
        (item) => item.availability_type === "always"
      );
      const unavailableStatus = business?.is_available === false;

      setAlwaysAvailable(Boolean(always));
      setUnavailable(unavailableStatus);

      const nextDayEnabled = createDayEnabledMap();
      const nextSlotsByDay = {};

      (Array.isArray(schedules) ? schedules : []).forEach((slot) => {
        if (slot.availability_type !== "custom") {
          return;
        }

        nextDayEnabled[slot.day_of_week] = true;
        if (!nextSlotsByDay[slot.day_of_week]) {
          nextSlotsByDay[slot.day_of_week] = [];
        }

        nextSlotsByDay[slot.day_of_week].push({
          id: slot.id,
          start_time: slot.start_time,
          end_time: slot.end_time,
        });
      });

      setDayEnabled(nextDayEnabled);
      setSlotsByDay(nextSlotsByDay);
    } catch (error) {
      showToast("Unable to load schedule");
    } finally {
      setLoading(false);
    }
  };

  const openSlotModal = (dayKey) => {
    setSelectedDay(dayKey);
    setStartTime(TIME_OPTIONS[0].value);
    setEndTime(TIME_OPTIONS[1].value);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDay(null);
  };

  const addSlot = () => {
    if (selectedDay === null) {
      return;
    }

    if (toMinutes(endTime) <= toMinutes(startTime)) {
      showToast("End time must be after start time");
      return;
    }

    const currentSlots = slotsByDay[selectedDay] || [];
    const duplicateOrOverlap = currentSlots.some((slot) => {
      const slotStart = toMinutes(slot.start_time);
      const slotEnd = toMinutes(slot.end_time);
      const nextStart = toMinutes(startTime);
      const nextEnd = toMinutes(endTime);

      return nextStart < slotEnd && nextEnd > slotStart;
    });

    if (duplicateOrOverlap) {
      showToast("Duplicate or overlapping slot is not allowed");
      return;
    }

    setSlotsByDay((prev) => ({
      ...prev,
      [selectedDay]: [
        ...(prev[selectedDay] || []),
        {
          start_time: startTime,
          end_time: endTime,
        },
      ],
    }));
    closeModal();
  };

  const removeSlot = (dayKey, index) => {
    setSlotsByDay((prev) => ({
      ...prev,
      [dayKey]: (prev[dayKey] || []).filter((_, slotIndex) => slotIndex !== index),
    }));
  };

  const handleDayToggle = (dayKey, value) => {
    setDayEnabled((prev) => ({
      ...prev,
      [dayKey]: value,
    }));

    if (!value) {
      setSlotsByDay((prev) => ({
        ...prev,
        [dayKey]: [],
      }));
    }
  };

  const handleSave = async () => {
    if (!businessId) {
      showToast("Business profile not found");
      return;
    }

    const customSlots = Object.entries(slotsByDay).flatMap(([dayKey, slots]) =>
      (slots || []).map((slot) => ({
        day_of_week: Number(dayKey),
        start_time: slot.start_time,
        end_time: slot.end_time,
      }))
    );

    if (!alwaysAvailable && !unavailable && customSlots.length === 0) {
      showToast("Add at least one time slot");
      return;
    }

    try {
      setSaving(true);

      await Promise.all(
        existingSchedules.map((slot) => deleteSchedule(slot.id))
      );

      if (unavailable) {
        await updateBusiness(businessId, {
          business_profile: {
            is_available: false,
          },
        });
      } else if (alwaysAvailable) {
        await updateBusiness(businessId, {
          business_profile: {
            is_available: true,
          },
        });
        await createSchedule({
          schedule: {
            availability_type: "always",
          },
        });
      } else {
        await updateBusiness(businessId, {
          business_profile: {
            is_available: true,
          },
        });

        for (const slot of customSlots) {
          await createSchedule({
            schedule: {
              availability_type: "custom",
              day_of_week: slot.day_of_week,
              start_time: slot.start_time,
              end_time: slot.end_time,
            },
          });
        }
      }

      showToast("Schedule updated successfully");
      if (entryMode === "step") {
        navigation.navigate("Approval", { entryMode: "step" });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      const backendMessage =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        "Unable to save schedule";
      showToast(backendMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Schedule</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Availability Status</Text>

          <View style={styles.toggleBlock}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Always Available</Text>
              <Text style={styles.toggleMessage}>
                People can call or connect with you anytime.
              </Text>
            </View>
            <Switch
              value={alwaysAvailable}
              onValueChange={(value) => {
                setAlwaysAvailable(value);
                if (value) {
                  setUnavailable(false);
                }
              }}
              trackColor={{ false: "#cbd5e1", true: "#f97316" }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.toggleBlock}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Set as Unavailable</Text>
              <Text style={styles.toggleMessage}>
                People will not be able to reach you until you enable availability.
              </Text>
            </View>
            <Switch
              value={unavailable}
              onValueChange={(value) => {
                setUnavailable(value);
                if (value) {
                  setAlwaysAvailable(false);
                }
              }}
              trackColor={{ false: "#cbd5e1", true: "#f97316" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {!alwaysAvailable && !unavailable && (
          <View style={styles.card}>
            {DAYS.map((day) => {
              const enabled = Boolean(dayEnabled[day.key]);
              const daySlots = slotsByDay[day.key] || [];

              return (
                <View key={day.key} style={styles.dayBlock}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayTitle}>{day.label}</Text>
                    <Switch
                      value={enabled}
                      onValueChange={(value) => handleDayToggle(day.key, value)}
                      trackColor={{ false: "#cbd5e1", true: "#f97316" }}
                      thumbColor="#fff"
                    />
                  </View>

                  {enabled && (
                    <>
                      <TouchableOpacity
                        style={styles.addSlotButton}
                        onPress={() => openSlotModal(day.key)}
                      >
                        <Icon name="plus-circle" size={16} color="#f97316" />
                        <Text style={styles.addSlotText}>Add time slot</Text>
                      </TouchableOpacity>

                      {daySlots.map((slot, index) => (
                        <View key={`${day.key}-${index}`} style={styles.slotRow}>
                          <Text style={styles.slotText}>
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </Text>
                          <TouchableOpacity onPress={() => removeSlot(day.key, index)}>
                            <Icon name="trash-2" size={16} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit</Text>
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Time Slot</Text>

            <Text style={styles.modalLabel}>Start Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {TIME_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={`start-${option.value}`}
                  style={[
                    styles.timeChip,
                    startTime === option.value && styles.timeChipActive,
                  ]}
                  onPress={() => setStartTime(option.value)}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      startTime === option.value && styles.timeChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>End Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {TIME_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={`end-${option.value}`}
                  style={[
                    styles.timeChip,
                    endTime === option.value && styles.timeChipActive,
                  ]}
                  onPress={() => setEndTime(option.value)}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      endTime === option.value && styles.timeChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={closeModal}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={addSlot}>
                <Text style={styles.primaryButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    padding: 18,
    paddingBottom: 120,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  title: {
    marginLeft: 12,
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
  },

  toggleBlock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  toggleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },

  toggleMessage: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
    paddingRight: 16,
  },

  dayBlock: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dayTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },

  addSlotButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  addSlotText: {
    marginLeft: 8,
    color: "#f97316",
    fontWeight: "700",
  },

  slotRow: {
    marginTop: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  slotText: {
    color: "#334155",
    fontWeight: "600",
  },

  submitButton: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 20,
    backgroundColor: "#f97316",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },

  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    maxHeight: "75%",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
  },

  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    marginTop: 10,
  },

  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: "#f1f5f9",
    marginRight: 10,
  },

  timeChipActive: {
    backgroundColor: "#f97316",
  },

  timeChipText: {
    color: "#334155",
    fontWeight: "600",
  },

  timeChipTextActive: {
    color: "#fff",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  secondaryButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    paddingVertical: 13,
  },

  secondaryButtonText: {
    color: "#334155",
    fontWeight: "700",
  },

  primaryButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 14,
    backgroundColor: "#f97316",
    alignItems: "center",
    paddingVertical: 13,
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
});
