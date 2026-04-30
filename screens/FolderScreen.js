import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  useColorScheme,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  loadFolders,
  saveFolders,
  createFolder,
  loadNotes,
} from "../utils/storage";
import { lightColors, darkColors } from "../theme";

export default function FolderScreen() {
  const scheme = useColorScheme();
  const colors = scheme === "dark" ? darkColors : lightColors;

  const [folders, setFolders] = useState([]);
  const [noteCounts, setNoteCounts] = useState({});
  const [newFolderName, setNewFolderName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const [loadedFolders, notes] = await Promise.all([
      loadFolders(),
      loadNotes(),
    ]);
    setFolders(loadedFolders);
    const counts = {};
    notes
      .filter((n) => !n.isArchived)
      .forEach((n) => {
        if (n.folderId) counts[n.folderId] = (counts[n.folderId] || 0) + 1;
      });
    setNoteCounts(counts);
  };

  const handleAddFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    if (
      folders.some((f) => f.name.toLowerCase() === name.toLowerCase())
    ) {
      Alert.alert("Folder exists", "A folder with this name already exists.");
      return;
    }
    const updated = [...folders, createFolder(name)];
    await saveFolders(updated);
    setFolders(updated);
    setNewFolderName("");
  };

  const handleRenameFolder = async (id) => {
    const name = editingName.trim();
    if (!name) {
      setEditingId(null);
      return;
    }
    const updated = folders.map((f) => (f.id === id ? { ...f, name } : f));
    await saveFolders(updated);
    setFolders(updated);
    setEditingId(null);
    setEditingName("");
  };

  const handleDeleteFolder = (folder) => {
    Alert.alert(
      "Delete Folder",
      `Delete "${folder.name}"? Notes inside will remain but lose their folder assignment.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = folders.filter((f) => f.id !== folder.id);
            await saveFolders(updated);
            setFolders(updated);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      <MaterialCommunityIcons
        name="folder"
        size={22}
        color={colors.primary}
      />
      {editingId === item.id ? (
        <TextInput
          style={[
            styles.editInput,
            { color: colors.text, borderColor: colors.border },
          ]}
          value={editingName}
          onChangeText={setEditingName}
          onSubmitEditing={() => handleRenameFolder(item.id)}
          autoFocus
          returnKeyType="done"
        />
      ) : (
        <TouchableOpacity
          style={styles.folderInfo}
          onLongPress={() => {
            setEditingId(item.id);
            setEditingName(item.name);
          }}
        >
          <Text style={[styles.folderName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.noteCount, { color: colors.subtext }]}>
            {noteCounts[item.id] || 0}{" "}
            {noteCounts[item.id] === 1 ? "note" : "notes"}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.rowActions}>
        {editingId === item.id ? (
          <>
            <TouchableOpacity
              onPress={() => handleRenameFolder(item.id)}
              style={styles.iconBtn}
            >
              <MaterialCommunityIcons
                name="check"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setEditingId(null)}
              style={styles.iconBtn}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={colors.subtext}
              />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={() => handleDeleteFolder(item)}
            style={styles.iconBtn}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color={colors.danger}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <FlatList
        data={folders}
        keyExtractor={(f) => f.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>
            {folders.length} {folders.length === 1 ? "FOLDER" : "FOLDERS"} ·
            LONG-PRESS TO RENAME
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="folder-open-outline"
              size={52}
              color={colors.subtext}
            />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              No folders yet.
            </Text>
          </View>
        }
      />

      {/* Add folder row */}
      <View
        style={[
          styles.addRow,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <TextInput
          style={[
            styles.addInput,
            {
              color: colors.text,
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
            },
          ]}
          value={newFolderName}
          onChangeText={setNewFolderName}
          placeholder="New folder name..."
          placeholderTextColor={colors.placeholder}
          onSubmitEditing={handleAddFolder}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={handleAddFolder}
        >
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: "500",
  },
  noteCount: {
    fontSize: 12,
    marginTop: 2,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
  rowActions: {
    flexDirection: "row",
    gap: 4,
  },
  iconBtn: {
    padding: 4,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
  addRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  addInput: {
    flex: 1,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
