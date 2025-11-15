import React from "react";
import { Platform, View } from "react-native";

export const PageScroll = ({ children }) =>
  Platform.OS === "web"
    ? <div style={{ height: "100vh", overflowY: "auto", overflowX: "hidden" }}>{children}</div>
    : <View style={{ flex: 1 }}>{children}</View>;