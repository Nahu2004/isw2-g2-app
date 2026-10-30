import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
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
        <Stack.Screen
          name="reglamento"
          options={{
            title: 'Reglamento y Sanciones',
          }}
        />
        <Stack.Screen
          name="partido-en-vivo"
          options={{
            title: 'Partido en Vivo',
          }}
        />
        <Stack.Screen
          name="auth/login"
          options={{
            title: 'Iniciar Sesión',
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
