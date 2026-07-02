import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, createElement, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

const lightColors = {
  background: "#f1f4f8", surface: "#ffffff", surfaceAlt: "#f5f7fb", surfaceRaised: "#ffffff",
  ink: "#101828", muted: "#667085", line: "#e2e7ef", primary: "#1769e8",
  primaryDark: "#0b4fbd", onPrimary: "#ffffff", secondary: "#12b76a", danger: "#e03131",
  info: "#0ea5e9", navy: "#092f73", silver: "#98a2b3", glow: "rgba(23, 105, 232, 0.16)",
  live: "#e03131", overlay: "rgba(16, 24, 40, 0.06)"
};

const darkColors: typeof lightColors = {
  background: "#0b0d10", surface: "#12151b", surfaceAlt: "#1a1e25", surfaceRaised: "#171b21",
  ink: "#f3f5f7", muted: "#a5ad9f", line: "#2b3038", primary: "#65ff4b",
  primaryDark: "#b9f7ad", onPrimary: "#071006", secondary: "#65ff4b", danger: "#ff7b7b",
  info: "#78e7ff", navy: "#0e1116", silver: "#727b70", glow: "rgba(101, 255, 75, 0.2)",
  live: "#ff6b6b", overlay: "rgba(0, 0, 0, 0.22)"
};

export type ThemeMode = "light" | "dark";
export type ThemeColors = typeof lightColors;

const ThemeContext = createContext<{
  colors: ThemeColors;
  mode: ThemeMode;
  toggleTheme: () => void;
}>({
  colors: lightColors,
  mode: "light" as ThemeMode,
  toggleTheme: () => undefined
});

const STORAGE_KEY = "betvision:theme";

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "light" || saved === "dark") setMode(saved);
    });
  }, []);

  const value = useMemo(() => ({
    colors: mode === "dark" ? darkColors : lightColors,
    mode,
    toggleTheme: () => setMode((current) => {
      const next = current === "dark" ? "light" : "dark";
      AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    })
  }), [mode]);

  return createElement(ThemeContext.Provider, { value }, children);
}

export const useTheme = () => useContext(ThemeContext);
export const colors = lightColors;
export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 };
export const radii = { sm: 10, md: 16 };
export const shadow = {
  shadowColor: "#101828", shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.08, shadowRadius: 14, elevation: 3
};
