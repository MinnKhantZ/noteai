import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useColorScheme,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { FAB, Snackbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import NoteCard from "../components/NoteCard";
import { loadNotes, saveNotes, loadFolders } from "../utils/storage";
import { lightColors, darkColors } from "../theme";

const SORT_OPTIONS = [
  { key: "updatedAt", label: "Last Modified" },
  { key: "createdAt", label: "Date Created" },
  { key: "title", label: "Alphabetical" },
];

export default function HomeScreen({ navigation }) {
  const scheme = useColorScheme();
  const colors = scheme === "dark" ? darkColors : lightColors;

  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [sortKey, setSortKey] = useState("updatedAt");
  const [showArchived, setShowArchived] = useState(false);
  const [deletedNote, setDeletedNote] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
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
      notes.filter((n) => !n.isArchived).flatMap((n) => n.tags)
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
            style={styles.headerIconBtn}
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
            <MaterialCommunityIcons name="close" size={16} color={colors.placeholder} />
          </TouchableOpacity>
        )}
      </View>

      {/* Folder filter chips */}
      {folders.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          <TouchableOpacity
            onPress={() => setSelectedFolder(null)}
            style={[
              styles.chip,
              { backgroundColor: !selectedFolder ? colors.primary : colors.tag },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: !selectedFolder ? "#fff" : colors.tagText },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {folders.map((folder) => (
            <TouchableOpacity
              key={folder.id}
              onPress={() =>
                setSelectedFolder(folder.id === selectedFolder ? null : folder.id)
              }
              style={[
                styles.chip,
                {
                  backgroundColor:
                    selectedFolder === folder.id ? colors.primary : colors.tag,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: selectedFolder === folder.id ? "#fff" : colors.tagText,
                  },
                ]}
              >
                {folder.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {allTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => toggleTag(tag)}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedTags.includes(tag)
                    ? colors.primary
                    : colors.tag,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: selectedTags.includes(tag) ? "#fff" : colors.tagText,
                  },
                ]}
              >
                #{tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Notes List */}
      <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
        {sortedNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="note-outline"
              size={52}
              color={colors.subtext}
            />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              {showArchived
                ? "No archived notes"
                : searchQuery || selectedTags.length > 0
                ? "No notes match your search"
                : "No notes yet. Tap + to create one."}
            </Text>
          </View>
        ) : (
          sortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              colors={colors}
              onPress={() => navigation.navigate("Edit", { noteId: note.id })}
              onDelete={handleDeleteNote}
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {!showArchived && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: colors.primary }]}
          color="#fff"
          onPress={() => navigation.navigate("Edit", { noteId: null })}
        />
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
    fontSize: 22,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    gap: 2,
  },
  headerIconBtn: {
    padding: 6,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  chipsScroll: {
    maxHeight: 38,
    marginBottom: 4,
  },
  chipsContent: {
    paddingHorizontal: 12,
    gap: 6,
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  list: { flex: 1 },
  emptyState: {
    alignItems: "center",
    marginTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
  },
});
