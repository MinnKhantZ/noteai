import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RichText, Toolbar, useEditorBridge, TenTapStartKit } from "@10play/tentap-editor";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import TagInput from "../components/TagInput";
import AIBottomSheet from "../components/AIBottomSheet";
import { loadNotes, saveNotes, loadFolders, createNote, stripHtml } from "../utils/storage";
import { lightColors, darkColors } from "../theme";

const AI_BACKEND = process.env.EXPO_PUBLIC_API_URL;

export default function EditScreen({ route, navigation }) {
  const { noteId } = route.params;
  const scheme = useColorScheme();
  const colors = scheme === "dark" ? darkColors : lightColors;

  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [folderId, setFolderId] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [folderSheetVisible, setFolderSheetVisible] = useState(false);

  // AI state
  const [aiSheetVisible, setAiSheetVisible] = useState(false);
  const [aiAction, setAiAction] = useState("suggestions");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const isPinnedRef = useRef(isPinned);
  const isArchivedRef = useRef(isArchived);

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: "",
    bridgeExtensions: TenTapStartKit,
    onContentUpdate: async (e) => {
      try {
        const html = await e.getHTML();
        const text = stripHtml(html);
        setCharCount(text.length);
        setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      } catch (_) {}
    },
  });

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
        setTags(note.tags || []);
        setFolderId(note.folderId || null);
        setIsPinned(note.isPinned || false);
        setIsArchived(note.isArchived || false);
        isPinnedRef.current = note.isPinned || false;
        isArchivedRef.current = note.isArchived || false;
        setTimeout(() => {
          editor.setContent(note.content || "");
        }, 150);
      }
    }
  };

  // Keep refs in sync for use inside navigation header callbacks
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

  const showMoreMenu = () => {
    Alert.alert("Note Options", undefined, [
      {
        text: isArchivedRef.current ? "Unarchive" : "Archive",
        onPress: () => setIsArchived((v) => !v),
      },
      { text: "Share", onPress: handleShare },
      { text: "Copy to Clipboard", onPress: handleCopyToClipboard },
      { text: "Export as PDF", onPress: handleExportPDF },
      noteId ? { text: "Delete Note", style: "destructive", onPress: handleDelete } : null,
      { text: "Cancel", style: "cancel" },
    ].filter(Boolean));
  };

  const handleShare = async () => {
    const html = await editor.getHTML();
    const text = title ? `${title}\n\n${stripHtml(html)}` : stripHtml(html);
    if (!text.trim()) return;
    await Share.share({ message: text });
  };

  const handleCopyToClipboard = async () => {
    const html = await editor.getHTML();
    const text = title ? `${title}\n\n${stripHtml(html)}` : stripHtml(html);
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Note content copied to clipboard.");
  };

  const handleExportPDF = async () => {
    const html = await editor.getHTML();
    const pdfHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: -apple-system, Helvetica, sans-serif; padding: 32px; color: #1a1a1a; line-height: 1.6; }
      h1 { font-size: 22px; margin-bottom: 20px; }
      p { font-size: 15px; margin: 0 0 12px; }
    </style>
  </head>
  <body>
    ${title ? `<h1>${title}</h1>` : ""}
    ${html}
  </body>
</html>`;
    try {
      const { uri } = await Print.printToFileAsync({ html: pdfHtml });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
    } catch (err) {
      Alert.alert("Export failed", "Could not generate PDF.");
    }
  };

  const handleSave = async () => {
    const html = await editor.getHTML();
    const isEmptyHtml = stripHtml(html).length === 0;
    if (!title.trim() && isEmptyHtml) {
      navigation.goBack();
      return;
    }

    const now = Date.now();
    let updatedNotes;
    if (noteId) {
      updatedNotes = notes.map((n) =>
        n.id === noteId
          ? { ...n, title, content: html, tags, folderId, isPinned, isArchived, updatedAt: now }
          : n
      );
    } else {
      const newNote = createNote({ title, content: html, tags, folderId, isPinned });
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
    setAiLoading(true);
    setAiSheetVisible(true);
    try {
      const html = await editor.getHTML();
      const content = stripHtml(html) || title;
      if (!content.trim()) {
        setAiResult("Add some content to your note first.");
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
        setAiResult(data.error || "AI service unavailable. Please try again.");
      } else {
        setAiResult(data.result);
      }
    } catch {
      setAiResult("Could not connect to AI service. Check your internet connection.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIApply = async (text, action) => {
    if (action === "suggestions" || action === "continue") {
      const currentHtml = await editor.getHTML();
      editor.setContent(currentHtml + `<p>${text}</p>`);
    } else if (action === "auto-title") {
      setTitle(text);
    } else if (action === "fix-grammar") {
      editor.setContent(`<p>${text}</p>`);
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      {/* Title Input */}
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

      {/* Tags */}
      <TagInput tags={tags} onChange={setTags} colors={colors} />

      {/* Meta row: folder + archived badge */}
      <View
        style={[styles.metaRow, { borderBottomColor: colors.border }]}
      >
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

      {/* Folder picker (inline dropdown) */}
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

      {/* Rich Text Editor */}
      <RichText
        editor={editor}
        style={[styles.editor, { backgroundColor: colors.inputBg }]}
      />

      {/* Bottom bar: stats + save/delete */}
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
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Actions bar */}
      <View
        style={[
          styles.aiBar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        {AI_ACTIONS.map(({ action, icon, label }) => (
          <TouchableOpacity
            key={action}
            style={styles.aiBtn}
            onPress={() => callAI(action)}
          >
            <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
            <Text style={[styles.aiBtnLabel, { color: colors.primary }]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Formatting Toolbar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Toolbar editor={editor} />
      </KeyboardAvoidingView>

      {/* AI Bottom Sheet */}
      <AIBottomSheet
        visible={aiSheetVisible}
        action={aiAction}
        result={aiResult}
        loading={aiLoading}
        onClose={() => setAiSheetVisible(false)}
        onApply={handleAIApply}
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
  editor: {
    flex: 1,
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
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  aiBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  aiBtn: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 2,
  },
  aiBtnLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
});
