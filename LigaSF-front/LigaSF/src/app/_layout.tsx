import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import '../global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#07152b',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 17,
            letterSpacing: -0.3,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#07152b',
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
          name="tabla"
          options={{
            title: 'Tabla de Posiciones',
          }}
        />
        <Stack.Screen
          name="fixture"
          options={{
            title: 'Fixture y Partidos',
          }}
        />
        <Stack.Screen
          name="partido/[id]"
          options={{
            title: 'Detalle del Partido',
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
            title: 'Planteles y Jugadores',
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
            title: 'Acceso Oficial',
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
