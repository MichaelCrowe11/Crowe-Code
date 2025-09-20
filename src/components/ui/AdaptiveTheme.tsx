"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  glow: string;
}

interface AdaptiveThemeContextType {
  theme: "quantum" | "neural" | "cosmic" | "matrix" | "aurora";
  colors: ThemeColors;
  setTheme: (theme: "quantum" | "neural" | "cosmic" | "matrix" | "aurora") => void;
  isAdaptive: boolean;
  setAdaptive: (adaptive: boolean) => void;
  ambientMode: boolean;
  setAmbientMode: (ambient: boolean) => void;
}

const themes: Record<string, ThemeColors> = {
  quantum: {
    primary: "59, 130, 246", // Blue
    secondary: "168, 85, 247", // Purple
    accent: "236, 72, 153", // Pink
    background: "0, 0, 0",
    surface: "30, 41, 59",
    text: "241, 245, 249",
    glow: "59, 130, 246, 0.5",
  },
  neural: {
    primary: "168, 85, 247", // Purple
    secondary: "217, 70, 239", // Fuchsia
    accent: "99, 102, 241", // Indigo
    background: "17, 24, 39",
    surface: "31, 41, 55",
    text: "243, 244, 246",
    glow: "168, 85, 247, 0.5",
  },
  cosmic: {
    primary: "6, 182, 212", // Cyan
    secondary: "59, 130, 246", // Blue
    accent: "147, 51, 234", // Purple
    background: "4, 7, 29",
    surface: "15, 23, 42",
    text: "226, 232, 240",
    glow: "6, 182, 212, 0.5",
  },
  matrix: {
    primary: "34, 197, 94", // Green
    secondary: "132, 204, 22", // Lime
    accent: "22, 163, 74", // Emerald
    background: "0, 0, 0",
    surface: "20, 20, 20",
    text: "74, 222, 128",
    glow: "34, 197, 94, 0.8",
  },
  aurora: {
    primary: "251, 146, 60", // Orange
    secondary: "239, 68, 68", // Red
    accent: "245, 158, 11", // Amber
    background: "18, 18, 18",
    surface: "38, 38, 38",
    text: "254, 215, 170",
    glow: "251, 146, 60, 0.6",
  },
};

const AdaptiveThemeContext = createContext<AdaptiveThemeContextType | undefined>(undefined);

export function useAdaptiveTheme() {
  const context = useContext(AdaptiveThemeContext);
  if (!context) {
    throw new Error("useAdaptiveTheme must be used within AdaptiveThemeProvider");
  }
  return context;
}

export function AdaptiveThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"quantum" | "neural" | "cosmic" | "matrix" | "aurora">("quantum");
  const [isAdaptive, setAdaptive] = useState(true);
  const [ambientMode, setAmbientMode] = useState(true);
  const [colors, setColors] = useState(themes.quantum);

  // Adaptive theme based on time of day
  useEffect(() => {
    if (!isAdaptive) return;

    const updateThemeByTime = () => {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 9) {
        // Morning - Aurora theme
        setTheme("aurora");
      } else if (hour >= 9 && hour < 17) {
        // Day - Quantum theme
        setTheme("quantum");
      } else if (hour >= 17 && hour < 20) {
        // Evening - Cosmic theme
        setTheme("cosmic");
      } else if (hour >= 20 && hour < 23) {
        // Night - Neural theme
        setTheme("neural");
      } else {
        // Late night - Matrix theme
        setTheme("matrix");
      }
    };

    updateThemeByTime();
    const interval = setInterval(updateThemeByTime, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAdaptive]);

  // Update colors when theme changes
  useEffect(() => {
    setColors(themes[theme]);

    // Apply CSS variables
    const root = document.documentElement;
    const themeColors = themes[theme];

    root.style.setProperty("--color-primary", `rgb(${themeColors.primary})`);
    root.style.setProperty("--color-secondary", `rgb(${themeColors.secondary})`);
    root.style.setProperty("--color-accent", `rgb(${themeColors.accent})`);
    root.style.setProperty("--color-background", `rgb(${themeColors.background})`);
    root.style.setProperty("--color-surface", `rgb(${themeColors.surface})`);
    root.style.setProperty("--color-text", `rgb(${themeColors.text})`);
    root.style.setProperty("--color-glow", `rgba(${themeColors.glow})`);
  }, [theme]);

  return (
    <AdaptiveThemeContext.Provider
      value={{
        theme,
        colors,
        setTheme,
        isAdaptive,
        setAdaptive,
        ambientMode,
        setAmbientMode,
      }}
    >
      {children}

      {/* Ambient lighting effect */}
      {ambientMode && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <AnimatePresence>
            <motion.div
              key={theme}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0"
            >
              {/* Top ambient light */}
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-96"
                style={{
                  background: `radial-gradient(ellipse at center, rgba(${colors.primary}, 0.15) 0%, transparent 70%)`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Left ambient light */}
              <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-[200%]"
                style={{
                  background: `radial-gradient(ellipse at center, rgba(${colors.secondary}, 0.1) 0%, transparent 70%)`,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
              />

              {/* Right ambient light */}
              <motion.div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-[200%]"
                style={{
                  background: `radial-gradient(ellipse at center, rgba(${colors.accent}, 0.1) 0%, transparent 70%)`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 4,
                }}
              />

              {/* Floating orbs */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-64 h-64 rounded-full"
                  style={{
                    background: `radial-gradient(circle, rgba(${colors.primary}, ${0.1 - i * 0.02}) 0%, transparent 70%)`,
                    left: `${20 + i * 15}%`,
                    top: `${10 + i * 20}%`,
                  }}
                  animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -50, 100, 0],
                    scale: [1, 1.2, 0.8, 1],
                  }}
                  transition={{
                    duration: 15 + i * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 2,
                  }}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </AdaptiveThemeContext.Provider>
  );
}

// Theme switcher component
export function ThemeSwitcher() {
  const { theme, setTheme, isAdaptive, setAdaptive, ambientMode, setAmbientMode } = useAdaptiveTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25 flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          🎨
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-4 w-64"
          >
            <h3 className="text-sm font-bold mb-3 text-white">Theme Settings</h3>

            {/* Adaptive mode toggle */}
            <label className="flex items-center justify-between mb-3 cursor-pointer">
              <span className="text-xs text-gray-400">Adaptive Mode</span>
              <button
                onClick={() => setAdaptive(!isAdaptive)}
                className={`w-10 h-5 rounded-full transition-colors ${
                  isAdaptive ? "bg-blue-500" : "bg-gray-600"
                }`}
              >
                <motion.div
                  animate={{ x: isAdaptive ? 20 : 0 }}
                  className="w-4 h-4 bg-white rounded-full mt-0.5 ml-0.5"
                />
              </button>
            </label>

            {/* Ambient mode toggle */}
            <label className="flex items-center justify-between mb-3 cursor-pointer">
              <span className="text-xs text-gray-400">Ambient Lighting</span>
              <button
                onClick={() => setAmbientMode(!ambientMode)}
                className={`w-10 h-5 rounded-full transition-colors ${
                  ambientMode ? "bg-purple-500" : "bg-gray-600"
                }`}
              >
                <motion.div
                  animate={{ x: ambientMode ? 20 : 0 }}
                  className="w-4 h-4 bg-white rounded-full mt-0.5 ml-0.5"
                />
              </button>
            </label>

            {/* Theme selection */}
            {!isAdaptive && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 mb-2">Select Theme</p>
                {Object.keys(themes).map((themeName) => (
                  <button
                    key={themeName}
                    onClick={() => setTheme(themeName as any)}
                    className={`w-full px-3 py-2 rounded-lg text-xs text-left transition-all ${
                      theme === themeName
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    <span className="capitalize">{themeName}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Current theme info */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-gray-400">
                Current: <span className="text-white capitalize">{theme}</span>
              </p>
              {isAdaptive && (
                <p className="text-xs text-gray-500 mt-1">
                  Theme adapts to time of day
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}