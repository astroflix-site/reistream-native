import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';
import { UpdateModal } from '../components/UpdateModal';
import { AuthProvider } from '../src/context/AuthContext';
import { useUpdateCheck } from '../src/hooks/useUpdateCheck';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isUpdateAvailable, latestRelease } = useUpdateCheck();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (isUpdateAvailable) {
      setModalVisible(true);
    }
  }, [isUpdateAvailable]);

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="details/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="watch/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
        <UpdateModal
          visible={modalVisible}
          releaseData={latestRelease}
          onClose={() => setModalVisible(false)}
        />
      </ThemeProvider>
    </AuthProvider>
  );
}
