import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";
import { lightColors, darkColors } from "../theme";

const ThemeContext = createContext({ colors: lightColors, isDark: false });

export function ThemeProvider({ children }) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
