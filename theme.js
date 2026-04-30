import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1a73e8",
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#4a9eff",
  },
};

export const lightColors = {
  background: "#f5f5f5",
  surface: "#ffffff",
  text: "#1a1a1a",
  subtext: "#666666",
  border: "#e0e0e0",
  primary: "#1a73e8",
  danger: "#d32f2f",
  tag: "#e8f0fe",
  tagText: "#1a73e8",
  pinned: "#fff8e1",
  placeholder: "#999999",
  inputBg: "#ffffff",
  headerBg: "#ffffff",
  cardBg: "#ffffff",
  swipeDelete: "#d32f2f",
  icon: "#555555",
};

export const darkColors = {
  background: "#121212",
  surface: "#1e1e1e",
  text: "#e0e0e0",
  subtext: "#999999",
  border: "#2e2e2e",
  primary: "#4a9eff",
  danger: "#ef5350",
  tag: "#1e3a5f",
  tagText: "#4a9eff",
  pinned: "#2a2510",
  placeholder: "#666666",
  inputBg: "#2a2a2a",
  headerBg: "#1e1e1e",
  cardBg: "#1e1e1e",
  swipeDelete: "#ef5350",
  icon: "#aaaaaa",
};
