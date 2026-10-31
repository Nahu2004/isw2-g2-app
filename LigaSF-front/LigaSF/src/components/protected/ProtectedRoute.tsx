import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { useRouter } from 'expo-router';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'DELEGADO')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ['ADMIN', 'DELEGADO'],
}) => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.icon}>🔒</Text>
          <Text style={styles.title}>Sesión Requerida</Text>
          <Text style={styles.message}>
            Debes iniciar sesión con una cuenta de Delegado o Administrador para operar en este módulo.
          </Text>
          <Button
            title="Ir al Login"
            onPress={() => router.replace('/auth/login' as any)}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  const hasPermission = allowedRoles.includes(user.rol);
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.icon}>⛔</Text>
          <Text style={styles.title}>Acceso Denegado</Text>
          <Text style={styles.message}>
            Tu rol actual ({user.rol}) no tiene autorización para realizar operaciones en esta sección.
          </Text>
          <Button
            title="Volver al Inicio"
            variant="secondary"
            onPress={() => router.replace('/' as any)}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    width: '100%',
  },
});

export default ProtectedRoute;
