import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ACTION_CONFIG = {
  suggestions: {
    title: "AI Suggestions",
    icon: "lightbulb-outline",
    applyLabel: "Apply",
    isList: true,
  },
  summarize: {
    title: "Summary",
    icon: "text-box-check-outline",
    applyLabel: null,
    isList: false,
  },
  "auto-title": {
    title: "Suggested Title",
    icon: "format-title",
    applyLabel: "Use as Title",
    isList: false,
  },
  continue: {
    title: "Continue Writing",
    icon: "pencil-plus-outline",
    applyLabel: "Insert",
    isList: false,
  },
  "fix-grammar": {
    title: "Fixed Text",
    icon: "check-circle-outline",
    applyLabel: "Replace Content",
    isList: false,
  },
};

export default function AIBottomSheet({
  visible,
  action,
  result,
  loading,
  onClose,
  onApply,
}) {
  const config = ACTION_CONFIG[action] || ACTION_CONFIG.suggestions;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <MaterialCommunityIcons name={config.icon} size={20} color="#1a73e8" />
          <Text style={styles.title}>{config.title}</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1a73e8" />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {config.isList && Array.isArray(result) ? (
              result.map((item, i) => (
                <View key={i} style={styles.suggestionItem}>
                  <Text style={styles.itemText}>
                    {i + 1}. {item}
                  </Text>
                  {config.applyLabel && (
                    <TouchableOpacity
                      style={styles.applyBtn}
                      onPress={() => onApply(item, action)}
                    >
                      <Text style={styles.applyBtnText}>{config.applyLabel}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.singleResult}>
                <Text style={styles.itemText}>
                  {typeof result === "string" ? result : ""}
                </Text>
                {config.applyLabel && typeof result === "string" && result ? (
                  <TouchableOpacity
                    style={styles.applyBtnFull}
                    onPress={() => onApply(result, action)}
                  >
                    <Text style={styles.applyBtnFullText}>{config.applyLabel}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
            <View style={{ height: 16 }} />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
    paddingBottom: 32,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  suggestionItem: {
    marginBottom: 16,
  },
  singleResult: {
    paddingBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: "#1a1a1a",
    lineHeight: 21,
    marginBottom: 10,
  },
  applyBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#e8f0fe",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  applyBtnText: {
    color: "#1a73e8",
    fontSize: 13,
    fontWeight: "500",
  },
  applyBtnFull: {
    backgroundColor: "#1a73e8",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  applyBtnFullText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
