import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../src/i18n'; // Initialize i18n
import { LocationProvider } from '../src/context/LocationContext';
import { LanguageProvider } from '../src/context/LanguageContext';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <LocationProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </LocationProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
