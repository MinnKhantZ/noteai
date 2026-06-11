import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TagInput({ tags, onChange, colors }) {
  const [input, setInput] = useState("");

  const addTag = (value) => {
    const trimmed = value.replace(/[,\s#]+/g, "").toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleChangeText = (text) => {
    if (text.endsWith(",") || text.endsWith(" ")) {
      addTag(text.slice(0, -1));
    } else {
      setInput(text);
    }
  };

  const handleSubmit = () => {
    if (input.trim()) addTag(input);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {tags.map((tag) => (
          <View key={tag} style={[styles.chip, { backgroundColor: colors.tag }]}>
            <Text style={[styles.chipText, { color: colors.tagText }]}>#{tag}</Text>
            <TouchableOpacity
              onPress={() => removeTag(tag)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
            >
              <MaterialCommunityIcons name="close" size={12} color={colors.tagText} />
            </TouchableOpacity>
          </View>
        ))}
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={input}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          placeholder={tags.length === 0 ? "Add tags (comma to confirm)..." : "+tag"}
          placeholderTextColor={colors.placeholder}
          returnKeyType="done"
          blurOnSubmit={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  input: {
    fontSize: 13,
    minWidth: 80,
    paddingVertical: 4,
  },
});
