import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import TagInput from "../components/TagInput";
import AIBottomSheet from "../components/AIBottomSheet";
import { loadNotes, saveNotes, loadFolders, createNote } from "../utils/storage";
import { useTheme } from "../contexts/ThemeContext";
import { radius, shadows, typography } from "../theme";

const AI_BACKEND = process.env.EXPO_PUBLIC_API_URL;

export default function EditScreen({ route, navigation }) {
  const { noteId } = route.params;
  const { colors } = useTheme();

  const saveScale = useSharedValue(1);
  const saveAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState([]);
  const [folderId, setFolderId] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [folderSheetVisible, setFolderSheetVisible] = useState(false);

  const [aiSheetVisible, setAiSheetVisible] = useState(false);
  const [aiAction, setAiAction] = useState("suggestions");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const isPinnedRef = useRef(isPinned);
  const isArchivedRef = useRef(isArchived);

  useEffect(() => {
    loadData();
  }, [noteId]);

  const loadData = async () => {
    const [loadedNotes, loadedFolders] = await Promise.all([
      loadNotes(),
      loadFolders(),
    ]);
    setNotes(loadedNotes);
    setFolders(loadedFolders);

    if (noteId) {
      const note = loadedNotes.find((n) => n.id === noteId);
      if (note) {
        setTitle(note.title || "");
        setBody(note.content || "");
        setTags(note.tags || []);
        setFolderId(note.folderId || null);
        setIsPinned(note.isPinned || false);
        setIsArchived(note.isArchived || false);
        isPinnedRef.current = note.isPinned || false;
        isArchivedRef.current = note.isArchived || false;
      }
    }
  };

  useEffect(() => {
    isPinnedRef.current = isPinned;
  }, [isPinned]);
  useEffect(() => {
    isArchivedRef.current = isArchived;
  }, [isArchived]);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: colors.headerBg },
      headerTintColor: colors.text,
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 2, marginRight: 8 }}>
          <TouchableOpacity
            onPress={() => setIsPinned((v) => !v)}
            style={styles.headerBtn}
          >
            <MaterialCommunityIcons
              name={isPinned ? "pin" : "pin-outline"}
              size={22}
              color={isPinned ? colors.primary : colors.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={showMoreMenu} style={styles.headerBtn}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={22}
              color={colors.icon}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [isPinned, isArchived, colors]);

  const handleArchiveToggle = async () => {
    const newArchived = !isArchivedRef.current;
    setIsArchived(newArchived);

    const now = Date.now();
    const allNotes = await loadNotes();
    let updatedNotes;
    if (noteId) {
      updatedNotes = allNotes.map((n) =>
        n.id === noteId
          ? { ...n, isArchived: newArchived, updatedAt: now }
          : n
      );
    } else {
      const newNote = createNote({ title, content: body, tags, folderId, isPinned, isArchived: newArchived });
      updatedNotes = [...allNotes, newNote];
    }
    await saveNotes(updatedNotes);
    navigation.goBack();
  };

  const showMoreMenu = () => {
    Alert.alert("Note Options", undefined, [
      {
        text: isArchivedRef.current ? "Unarchive" : "Archive",
        onPress: handleArchiveToggle,
      },
      { text: "Copy to Clipboard", onPress: handleCopyToClipboard },
      { text: "Cancel", style: "cancel" },
    ].filter(Boolean));
  };

  const handleCopyToClipboard = async () => {
    const text = title ? `${title}\n\n${body}` : body;
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Note content copied to clipboard.");
  };

  const handleSave = async () => {
    const isEmpty = !title.trim() && !body.trim();
    if (isEmpty) {
      navigation.goBack();
      return;
    }

    const now = Date.now();
    let updatedNotes;
    if (noteId) {
      updatedNotes = notes.map((n) =>
        n.id === noteId
          ? { ...n, title, content: body, tags, folderId, isPinned, isArchived, updatedAt: now }
          : n
      );
    } else {
      const newNote = createNote({ title, content: body, tags, folderId, isPinned });
      updatedNotes = [...notes, newNote];
    }
    await saveNotes(updatedNotes);
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert("Delete Note", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updated = notes.filter((n) => n.id !== noteId);
          await saveNotes(updated);
          navigation.goBack();
        },
      },
    ]);
  };

  const callAI = async (action) => {
    setAiAction(action);
    setAiResult(null);
    setAiError(null);
    setAiLoading(true);
    setAiSheetVisible(true);
    try {
      const content = body || title;
      if (!content.trim()) {
        setAiError("Add some content to your note first.");
        setAiLoading(false);
        return;
      }
      const response = await fetch(`${AI_BACKEND}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, action }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAiError(data.error || "AI service unavailable. Please try again.");
      } else {
        setAiResult(data.result);
      }
    } catch {
      setAiError("Could not connect to AI service. Check your internet connection.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIApply = (text, action) => {
    if (action === "suggestions") {
      setBody(text);
    } else if (action === "continue") {
      setBody((prev) => prev + "\n" + text);
    } else if (action === "auto-title") {
      setTitle(text);
    } else if (action === "fix-grammar") {
      setBody(text);
    }
    setAiSheetVisible(false);
  };

  const folderName = folderId
    ? folders.find((f) => f.id === folderId)?.name || "Unknown"
    : null;

  const AI_ACTIONS = [
    { action: "suggestions", icon: "lightbulb-outline", label: "Suggest" },
    { action: "summarize", icon: "text-box-check-outline", label: "Summarize" },
    { action: "auto-title", icon: "format-title", label: "Title" },
    { action: "continue", icon: "pencil-plus-outline", label: "Continue" },
    { action: "fix-grammar", icon: "check-circle-outline", label: "Fix" },
  ];

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = body.length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <TextInput
        style={[
          styles.titleInput,
          { color: colors.text, borderBottomColor: colors.border },
        ]}
        placeholder="Title (optional)"
        placeholderTextColor={colors.placeholder}
        value={title}
        onChangeText={setTitle}
      />

      <TagInput tags={tags} onChange={setTags} colors={colors} />

      <View style={[styles.metaRow, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.metaButton}
          onPress={() => setFolderSheetVisible(true)}
        >
          <MaterialCommunityIcons
            name="folder-outline"
            size={15}
            color={colors.subtext}
          />
          <Text style={[styles.metaText, { color: colors.subtext }]}>
            {folderName || "No folder"}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={14}
            color={colors.subtext}
          />
        </TouchableOpacity>
        {isArchived && (
          <View style={styles.archivedBadge}>
            <MaterialCommunityIcons
              name="archive"
              size={14}
              color={colors.subtext}
            />
            <Text style={[styles.metaText, { color: colors.subtext }]}>
              Archived
            </Text>
          </View>
        )}
      </View>

      {folderSheetVisible && (
        <View
          style={[
            styles.folderPicker,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <ScrollView style={{ maxHeight: 220 }}>
            <TouchableOpacity
              style={styles.folderOption}
              onPress={() => {
                setFolderId(null);
                setFolderSheetVisible(false);
              }}
            >
              <Text
                style={[
                  styles.folderOptionText,
                  { color: !folderId ? colors.primary : colors.text },
                ]}
              >
                No folder
              </Text>
              {!folderId && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
            {folders.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={styles.folderOption}
                onPress={() => {
                  setFolderId(f.id);
                  setFolderSheetVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.folderOptionText,
                    { color: folderId === f.id ? colors.primary : colors.text },
                  ]}
                >
                  {f.name}
                </Text>
                {folderId === f.id && (
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[
              styles.folderOption,
              { borderTopWidth: 1, borderTopColor: colors.border },
            ]}
            onPress={() => setFolderSheetVisible(false)}
          >
            <Text style={{ color: colors.subtext, textAlign: "center", flex: 1 }}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        style={[
          styles.bodyInput,
          { color: colors.text, backgroundColor: colors.inputBg },
        ]}
        placeholder="Write something..."
        placeholderTextColor={colors.placeholder}
        value={body}
        onChangeText={setBody}
        multiline
        textAlignVertical="top"
      />

      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <Text style={[styles.countText, { color: colors.subtext }]}>
          {wordCount}w · {charCount}c
        </Text>
        <View style={styles.actionButtons}>
          {noteId && (
            <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color={colors.danger}
              />
            </TouchableOpacity>
          )}
          <Animated.View style={saveAnimStyle}>
            <TouchableOpacity
              onPress={() => {
                saveScale.value = withSpring(0.9, { damping: 8 }, () => {
                  saveScale.value = withSpring(1);
                });
                handleSave();
              }}
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <View
        style={[
          styles.aiBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        {AI_ACTIONS.map(({ action, icon, label }) => (
          <TouchableOpacity
            key={action}
            style={[styles.aiBtn, { backgroundColor: colors.tag }]}
            onPress={() => callAI(action)}
          >
            <MaterialCommunityIcons name={icon} size={17} color={colors.primary} />
            <Text style={[styles.aiBtnLabel, { color: colors.primary }]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <AIBottomSheet
        visible={aiSheetVisible}
        action={aiAction}
        result={aiResult}
        loading={aiLoading}
        error={aiError}
        onClose={() => { setAiSheetVisible(false); setAiError(null); }}
        onApply={handleAIApply}
        colors={colors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBtn: { padding: 6 },
  titleInput: {
    fontSize: 20,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  bodyInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 12,
  },
  metaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
  },
  archivedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  folderPicker: {
    marginHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 100,
  },
  folderOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  folderOptionText: {
    fontSize: 14,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  countText: {
    fontSize: 11,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.md,
    ...shadows.sm,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  aiBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    gap: 6,
  },
  aiBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 7,
    borderRadius: radius.md,
    gap: 2,
  },
  aiBtnLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
});
