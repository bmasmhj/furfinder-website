import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { PetProvider } from "@/lib/pet-context";
import { SubscriptionProvider } from "@/lib/subscription-context";
import { ConsentProvider } from "@/lib/consent-context";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="consent"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="pet/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="report-form"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="register-pet"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="my-pet/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="matches"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="scan-post"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="safety-tips"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="notifications"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="paywall"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="privacy-policy"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="terms-of-use"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="settings"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConsentProvider>
          <SubscriptionProvider>
            <PetProvider>
              <GestureHandlerRootView>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </PetProvider>
          </SubscriptionProvider>
        </ConsentProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
