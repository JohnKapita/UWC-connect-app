import { ExpoRoot } from "expo-router";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <ExpoRoot />
    </AuthProvider>
  );
}
