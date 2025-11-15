import React from "react";
import { Platform } from "react-native";

export default function Hero({ title, subtitle, tableLabel }) {
  if (Platform.OS !== "web") return null;
  return (
    <div style={{ textAlign: "center", paddingTop: 20, paddingBottom: 10 }}>
      <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: 0.2 }}> {title} </div>
      <div style={{ marginTop: 8, fontSize: 18, color: "var(--subtext)" }}>{tableLabel}</div>
      <div style={{ marginTop: 6, color: "var(--subtext)" }}>{subtitle}</div>
    </div>
  );
}