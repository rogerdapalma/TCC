import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";

/* Por quê: botão “Início” à esquerda; usar tokens de cor. */
export default function NavBar({ siteName, onHome, onAbout, theme = "dark", toggleTheme }) {
  return (
    <View style={styles.container} data-surface>
      <Pressable onPress={onHome} style={styles.brand}>
        <Text style={styles.brandText}>{siteName || "App"}</Text>
      </Pressable>

      <Pressable onPress={onHome} style={styles.homeLeft}>
        <Text style={styles.homeLeftText}>Início</Text>
      </Pressable>

      <View style={styles.actions}>
        <Pressable onPress={onAbout} style={styles.link}>
          <Text style={styles.linkText}>Sobre</Text>
        </Pressable>
        <Pressable onPress={toggleTheme} style={styles.toggle}>
          <Text style={styles.linkText}>{theme === "light" ? "🌙 Escuro" : "☀️ Claro"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: Platform.OS === "web" ? 1 : StyleSheet.hairlineWidth,
    backgroundColor: "var(--surface)",
    borderBottomColor: "var(--border)",
    paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  brand: { paddingVertical: 10, marginRight: 8 },
  brandText: { fontSize: 18, fontWeight: "800", color: "var(--text)" },
  homeLeft: { padding: 8, borderRadius: 8 },
  homeLeftText: { fontWeight: "700", color: "var(--text)" },
  actions: { flexDirection: "row", gap: 12, alignItems: "center" },
  link: { padding: 8, borderRadius: 8 },
  toggle: { padding: 8, borderRadius: 8 },
  linkText: { color: "var(--text)", fontWeight: "600" },
});
