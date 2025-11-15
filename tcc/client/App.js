import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import SinglePage from "./src/screens/SinglePage";


class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("ErrorBoundary:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#b91c1c" }}>Falha na UI</Text>
            <Text style={{ marginTop: 6 }}>{String(this.state.error?.message || this.state.error)}</Text>
          </View>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f7fb" }}>
        <SinglePage />
      </SafeAreaView>
    </ErrorBoundary>
  );
}