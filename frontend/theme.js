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

export const typography = {
  appTitle: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  h1:       { fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  h2:       { fontSize: 17, fontWeight: "600" },
  body:     { fontSize: 15, lineHeight: 22 },
  small:    { fontSize: 13, lineHeight: 18 },
  caption:  { fontSize: 11, letterSpacing: 0.2 },
  label:    { fontSize: 12, fontWeight: "500" },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
};

export const lightColors = {
  background: "#f2f4f8",
  surface: "#ffffff",
  text: "#1a1a1a",
  subtext: "#666666",
  border: "#e2e6ee",
  primary: "#1a73e8",
  danger: "#d32f2f",
  tag: "#e8f0fe",
  tagText: "#1a73e8",
  pinned: "#fffbf0",
  pinnedAccent: "#f5a623",
  placeholder: "#aaaaaa",
  inputBg: "#ffffff",
  headerBg: "#ffffff",
  cardBg: "#ffffff",
  swipeDelete: "#d32f2f",
  icon: "#555555",
};

export const darkColors = {
  background: "#0f1117",
  surface: "#1c1c23",
  text: "#e8e8e8",
  subtext: "#8a8a9a",
  border: "#272733",
  primary: "#4a9eff",
  danger: "#ef5350",
  tag: "#1a2f50",
  tagText: "#5aabff",
  pinned: "#251e0a",
  pinnedAccent: "#f5a623",
  placeholder: "#555568",
  inputBg: "#22222e",
  headerBg: "#1c1c23",
  cardBg: "#1c1c23",
  swipeDelete: "#ef5350",
  icon: "#9090a8",
};
