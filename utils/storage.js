import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTES_KEY = "notes";
const FOLDERS_KEY = "folders";

export function generateId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function migrateNote(note, index) {
  if (note.id) return note;
  const ts = note.createdAt
    ? new Date(note.createdAt).getTime()
    : Date.now() - index * 1000;
  return {
    id: generateId(),
    title: "",
    content: note.content || "",
    tags: [],
    folderId: null,
    isPinned: false,
    isArchived: false,
    createdAt: ts,
    updatedAt: ts,
  };
}

export async function loadNotes() {
  const raw = await AsyncStorage.getItem(NOTES_KEY);
  if (!raw) return [];
  const notes = JSON.parse(raw);
  const needsMigration = notes.some((n) => !n.id);
  if (needsMigration) {
    const migrated = notes.map(migrateNote);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(migrated));
    return migrated;
  }
  return notes;
}

export async function saveNotes(notes) {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function loadFolders() {
  const raw = await AsyncStorage.getItem(FOLDERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveFolders(folders) {
  await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function createNote(overrides = {}) {
  const now = Date.now();
  return {
    id: generateId(),
    title: "",
    content: "",
    tags: [],
    folderId: null,
    isPinned: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createFolder(name) {
  return {
    id: generateId(),
    name: name.trim(),
    createdAt: Date.now(),
  };
}

export function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
