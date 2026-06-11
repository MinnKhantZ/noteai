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
import { useTheme } from "../contexts/ThemeContext";
import { radius, shadows, typography } from "../theme";

const ACTION_CONFIG = {
  suggestions: {
    title: "Improved Versions",
    icon: "lightbulb-outline",
    applyLabel: "Replace",
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
  error,
  onClose,
  onApply,
}) {
  const { colors } = useTheme();
  const config = ACTION_CONFIG[action] || ACTION_CONFIG.suggestions;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[styles.handle, { backgroundColor: colors.border }]}
        />
        <View
          style={[
            styles.header,
            { borderBottomColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: colors.tag },
            ]}
          >
            <MaterialCommunityIcons
              name={config.icon}
              size={18}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {config.title}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.subtext }]}>
              Thinking…
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {error ? (
              <View style={styles.singleResult}>
                <Text
                  style={[styles.itemText, { color: colors.danger }]}
                  selectable
                >
                  {error}
                </Text>
              </View>
            ) : config.isList && Array.isArray(result) ? (
              result.map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.suggestionItem,
                    { borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[styles.itemText, { color: colors.text }]}
                    selectable
                  >
                    {i + 1}. {item}
                  </Text>
                  {config.applyLabel && (
                    <TouchableOpacity
                      style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                      onPress={() => onApply(item, action)}
                    >
                      <Text style={[styles.applyBtnText, { color: "#fff" }]}>
                        {config.applyLabel}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.singleResult}>
                <Text
                  style={[styles.itemText, { color: colors.text }]}
                  selectable
                >
                  {typeof result === "string" ? result : ""}
                </Text>
                {config.applyLabel &&
                  typeof result === "string" &&
                  result ? (
                  <TouchableOpacity
                    style={[
                      styles.applyBtnFull,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => onApply(result, action)}
                  >
                    <Text style={styles.applyBtnFullText}>
                      {config.applyLabel}
                    </Text>
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
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: "60%",
    paddingBottom: 32,
    ...shadows.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    ...typography.h2,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 14,
  },
  loadingText: {
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  suggestionItem: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  singleResult: {
    paddingBottom: 8,
  },
  itemText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  applyBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  applyBtnFull: {
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  applyBtnFullText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
