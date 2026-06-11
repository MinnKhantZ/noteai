import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { FAB, Snackbar } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import NoteCard from "../components/NoteCard";
import { loadNotes, saveNotes, loadFolders } from "../utils/storage";
import { useTheme } from "../contexts/ThemeContext";
import { radius, shadows, typography } from "../theme";

const SORT_OPTIONS = [
  { key: "updatedAt", label: "Last Modified" },
  { key: "createdAt", label: "Date Created" },
  { key: "title", label: "Alphabetical" },
];

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [sortKey, setSortKey] = useState("updatedAt");
  const [showArchived, setShowArchived] = useState(false);
  const [deletedNote, setDeletedNote] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // FAB spring entrance
  const fabScale = useSharedValue(0);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  useFocusEffect(
    useCallback(() => {
      loadData();
      fabScale.value = withSpring(1, { damping: 12, stiffness: 200 });
      return () => {
        fabScale.value = 0;
      };
    }, [])
  );

  const loadData = async () => {
    const [loadedNotes, loadedFolders] = await Promise.all([
      loadNotes(),
      loadFolders(),
    ]);
    setNotes(loadedNotes);
    setFolders(loadedFolders);
  };

  const handleDeleteNote = (note) => {
    const updated = notes.filter((n) => n.id !== note.id);
    setNotes(updated);
    saveNotes(updated);
    setDeletedNote(note);
    setSnackbarVisible(true);
  };

  const handleUndoDelete = () => {
    if (!deletedNote) return;
    const restored = [...notes, deletedNote];
    setNotes(restored);
    saveNotes(restored);
    setDeletedNote(null);
    setSnackbarVisible(false);
  };

  const handleSortPress = () => {
    Alert.alert(
      "Sort Notes",
      undefined,
      SORT_OPTIONS.map((opt) => ({
        text: sortKey === opt.key ? `✓  ${opt.label}` : opt.label,
        onPress: () => setSortKey(opt.key),
      })).concat([{ text: "Cancel", style: "cancel" }])
    );
  };

  const allTags = [
    ...new Set(
      notes.filter((n) => (showArchived ? n.isArchived : !n.isArchived)).flatMap((n) => n.tags)
    ),
  ];

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredNotes = notes
    .filter((n) => (showArchived ? n.isArchived : !n.isArchived))
    .filter((n) => !selectedFolder || n.folderId === selectedFolder)
    .filter((n) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (n.title || "").toLowerCase().includes(q) ||
        (n.content || "").toLowerCase().includes(q)
      );
    })
    .filter((n) => {
      if (selectedTags.length === 0) return true;
      return selectedTags.some((t) => n.tags.includes(t));
    })
    .sort((a, b) => {
      if (sortKey === "title") {
        return (a.title || a.content || "").localeCompare(b.title || b.content || "");
      }
      return b[sortKey] - a[sortKey];
    });

  const pinned = filteredNotes.filter((n) => n.isPinned);
  const unpinned = filteredNotes.filter((n) => !n.isPinned);
  const sortedNotes = showArchived ? filteredNotes : [...pinned, ...unpinned];

  const visibleFolders = folders.filter((f) =>
    notes.some((n) => (showArchived ? n.isArchived : !n.isArchived) && n.folderId === f.id)
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.headerBg, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.appTitle, { color: colors.text }]}>NoteAI</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowArchived((v) => !v)}
            style={[
              styles.headerIconBtn,
              showArchived && { backgroundColor: colors.tag, borderRadius: radius.sm },
            ]}
          >
            <MaterialCommunityIcons
              name={showArchived ? "archive" : "archive-outline"}
              size={22}
              color={showArchived ? colors.primary : colors.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSortPress} style={styles.headerIconBtn}>
            <MaterialCommunityIcons name="sort-variant" size={22} color={colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Folders")}
            style={styles.headerIconBtn}
          >
            <MaterialCommunityIcons name="folder-outline" size={22} color={colors.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.inputBg, borderColor: colors.border },
          shadows.sm,
        ]}
      >
        <MaterialCommunityIcons name="magnify" size={18} color={colors.placeholder} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search notes..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialCommunityIcons name="close-circle" size={17} color={colors.placeholder} />
          </TouchableOpacity>
        )}
      </View>

      {/* Folder + Tag filter chips */}
      {(visibleFolders.length > 0 || allTags.length > 0) && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { id: "__all__", name: "All", isAll: true },
            ...visibleFolders.map((f) => ({ ...f, isFolder: true })),
            ...allTags.map((t) => ({ id: `__tag__${t}`, name: `#${t}`, isTag: true, tagValue: t })),
          ]}
          keyExtractor={(item) => item.id}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
          renderItem={({ item }) => {
            let isActive = false;
            if (item.isAll) isActive = !selectedFolder && selectedTags.length === 0;
            else if (item.isFolder) isActive = selectedFolder === item.id;
            else if (item.isTag) isActive = selectedTags.includes(item.tagValue);

            return (
              <TouchableOpacity
                onPress={() => {
                  if (item.isAll) {
                    setSelectedFolder(null);
                    setSelectedTags([]);
                  } else if (item.isFolder) {
                    setSelectedFolder(item.id === selectedFolder ? null : item.id);
                  } else if (item.isTag) {
                    toggleTag(item.tagValue);
                  }
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.tag,
                    borderColor: isActive ? colors.primary : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isActive ? "#fff" : colors.tagText },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Notes List */}
      <FlatList
        data={sortedNotes}
        keyExtractor={(note) => note.id}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={sortedNotes.length === 0 ? styles.emptyContainer : { paddingBottom: 100 }}
        renderItem={({ item, index }) => (
          <NoteCard
            note={item}
            index={index}
            colors={colors}
            onPress={() => navigation.navigate("Edit", { noteId: item.id })}
            onDelete={handleDeleteNote}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="note-text-outline"
              size={60}
              color={colors.border}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {showArchived ? "No archived notes" : "No notes yet"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              {showArchived
                ? "Archived notes will appear here"
                : searchQuery || selectedTags.length > 0
                ? "No notes match your search"
                : "Tap + to create your first note"}
            </Text>
          </View>
        }
      />

      {!showArchived && (
        <Animated.View style={[styles.fabWrapper, { bottom: 28 + insets.bottom }, fabStyle]}>
          <FAB
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="plus" size={size} color={color} />
            )}
            style={[styles.fab, { backgroundColor: colors.primary }]}
            color="#fff"
            onPress={() => navigation.navigate("Edit", { noteId: null })}
          />
        </Animated.View>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
          setDeletedNote(null);
        }}
        duration={4000}
        action={{ label: "Undo", onPress: handleUndoDelete }}
      >
        Note deleted
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  appTitle: {
    flex: 1,
    ...typography.appTitle,
  },
  headerActions: {
    flexDirection: "row",
    gap: 2,
  },
  headerIconBtn: {
    padding: 7,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  chipsScroll: {
    maxHeight: 42,
    marginBottom: 2,
  },
  chipsContent: {
    paddingHorizontal: 14,
    gap: 7,
    alignItems: "center",
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  list: { flex: 1 },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  fabWrapper: {
    position: "absolute",
    right: 20,
    bottom: 28,
  },
  fab: {
    ...shadows.lg,
  },
});
