import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AuthProvider } from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0284c7',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Liga Amateur Santafesina',
            }}
          />
          <Stack.Screen
            name="equipos"
            options={{
              title: 'Gestión de Equipos',
            }}
          />
          <Stack.Screen
            name="jugadores"
            options={{
              title: 'Gestión de Jugadores',
            }}
          />
          <Stack.Screen
            name="catalogos"
            options={{
              title: 'Torneos, Canchas y Árbitros',
            }}
          />
          <Stack.Screen
            name="partidos"
            options={{
              title: 'Programación de Partidos',
            }}
          />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
