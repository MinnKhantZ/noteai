import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatDate } from "../utils/storage";
import { shadows, radius } from "../theme";

export default function NoteCard({ note, onPress, onDelete, colors, index = 0 }) {
  const swipeableRef = useRef(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const elevation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = Math.min(index * 40, 300);
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 18,
          tension: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(elevation, {
          toValue: 3,
          duration: 150,
          useNativeDriver: false,
        }).start();
      });
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const animStyle = {
    opacity,
    transform: [{ translateY }],
  };

  const displayTitle =
    note.title ||
    (note.content || "").split(/[\n.!?]/)[0].trim() ||
    "Untitled note";

  const preview = note.content || "";

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete(note);
  };

  const renderRightActions = (progress, dragX) => {
    return (
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: colors.swipeDelete }]}
        onPress={handleDelete}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={22} color="#fff" />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const isPinned = note.isPinned;

  return (
    <Animated.View style={[styles.wrapper, animStyle]}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: isPinned ? colors.pinned : colors.cardBg },
          { elevation },
        ]}
      >
        <Swipeable
          ref={swipeableRef}
          renderRightActions={renderRightActions}
          overshootRight={false}
          friction={2}
        >
          <TouchableOpacity
            style={styles.cardInner}
            onPress={onPress}
            activeOpacity={0.78}
          >
            {/* Left accent bar for pinned notes */}
            {isPinned && (
              <View
                style={[styles.pinnedBar, { backgroundColor: colors.pinnedAccent }]}
              />
            )}
            <View style={styles.cardContent}>
              <View style={styles.titleRow}>
                <Text
                  style={[styles.title, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {displayTitle}
                </Text>
                {isPinned && (
                  <MaterialCommunityIcons
                    name="pin"
                    size={13}
                    color={colors.pinnedAccent}
                  />
                )}
              </View>
              {preview.length > 0 && note.title ? (
                <Text
                  style={[styles.preview, { color: colors.subtext }]}
                  numberOfLines={2}
                >
                  {preview}
                </Text>
              ) : null}
              {note.tags && note.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {note.tags.slice(0, 4).map((tag) => (
                    <View
                      key={tag}
                      style={[styles.tag, { backgroundColor: colors.tag }]}
                    >
                      <Text style={[styles.tagText, { color: colors.tagText }]}>
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={[styles.date, { color: colors.subtext }]}>
                {formatDate(note.updatedAt)}
              </Text>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 14,
    marginVertical: 5,
  },
  card: {
    borderRadius: radius.md,
    ...shadows.md,
  },
  cardInner: {
    borderRadius: radius.md,
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  pinnedBar: {
    width: 4,
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
  },
  cardContent: {
    flex: 1,
    padding: 14,
    paddingLeft: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 6,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
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
    borderRadius: radius.full,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
  },
  date: {
    fontSize: 11,
  },
  deleteAction: {
    width: 76,
    borderRadius: radius.md,
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    ...shadows.sm,
  },
  deleteText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
  },
});

