import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { stripHtml, formatDate } from "../utils/storage";

export default function NoteCard({ note, onPress, onDelete, colors }) {
  const swipeableRef = useRef(null);

  const displayTitle =
    note.title ||
    stripHtml(note.content).split(/[\n.!?]/)[0].trim() ||
    "Untitled note";

  const preview = stripHtml(note.content);

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete(note);
  };

  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });
    return (
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: colors.swipeDelete }]}
        onPress={handleDelete}
      >
        <Animated.View style={{ transform: [{ scale }], alignItems: "center" }}>
          <MaterialCommunityIcons name="trash-can-outline" size={22} color="#fff" />
          <Text style={styles.deleteText}>Delete</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: note.isPinned ? colors.pinned : colors.cardBg },
        ]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {note.isPinned && (
          <MaterialCommunityIcons
            name="pin"
            size={13}
            color={colors.primary}
            style={styles.pinIcon}
          />
        )}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {displayTitle}
        </Text>
        {preview.length > 0 && note.title ? (
          <Text style={[styles.preview, { color: colors.subtext }]} numberOfLines={2}>
            {preview}
          </Text>
        ) : null}
        {note.tags && note.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {note.tags.slice(0, 4).map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.tag }]}>
                <Text style={[styles.tagText, { color: colors.tagText }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={[styles.date, { color: colors.subtext }]}>
          {formatDate(note.updatedAt)}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  pinIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    paddingRight: 20,
  },
  preview: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
  },
  date: {
    fontSize: 11,
  },
  deleteAction: {
    width: 80,
    marginVertical: 5,
    marginRight: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "#fff",
    fontSize: 11,
    marginTop: 2,
  },
});
