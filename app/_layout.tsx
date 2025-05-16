import { Stack } from "expo-router";
import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { initializeDatabase } from './database';

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="about" options={{ title: "About" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}
