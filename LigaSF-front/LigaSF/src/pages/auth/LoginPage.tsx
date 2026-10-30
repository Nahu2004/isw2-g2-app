import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/api/authService';
import { Card, InputField, Button } from '@/components/common';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, user } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin2026!');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setErrorMessage('Por favor ingresa usuario y contraseña');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await authService.login({
        username: username.trim(),
        password,
      });

      loginUser(
        {
          username: data.username,
          nombreCompleto: data.nombreCompleto,
          rol: data.rol,
        },
        data.token
      );

      Alert.alert('Bienvenido', `Sesión iniciada como ${data.nombreCompleto} (${data.rol})`);
      router.replace('/' as any);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.mensaje ||
        err?.message ||
        'Credenciales inválidas o usuario inactivo';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>⚽</Text>
            </View>
            <Text style={styles.title}>Liga Amateur Santafesina</Text>
            <Text style={styles.subtitle}>
              Acceso seguro para Administradores y Delegados de mesa
            </Text>
          </View>

          {/* Banner de error */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Formulario */}
          <View style={styles.form}>
            <InputField
              label="Nombre de Usuario"
              placeholder="Ej: admin o delegado1"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!loading}
            />

            <InputField
              label="Contraseña"
              placeholder="Tu clave de acceso"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={loading}
              style={styles.submitBtn}
            />
          </View>

            {/* Cuentas de prueba rápidas */}
          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>Cuenta precargada en base de datos:</Text>
            <TouchableOpacity
              onPress={() => {
                setUsername('admin');
                setPassword('Admin2026!');
              }}
              style={styles.hintItem}
            >
              <Text style={styles.hintRole}>ADMIN:</Text>
              <Text style={styles.hintCreds}>admin / Admin2026!</Text>
            </TouchableOpacity>
          </View>

          {user && (
            <TouchableOpacity
              onPress={() => router.replace('/' as any)}
              style={styles.backHomeLink}
            >
              <Text style={styles.backHomeText}>← Volver al Menú Principal</Text>
            </TouchableOpacity>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  form: {
    gap: 8,
  },
  submitBtn: {
    marginTop: 8,
  },
  hintBox: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  hintRole: {
    fontWeight: '700',
    fontSize: 12,
    color: '#0284c7',
    width: 90,
  },
  hintCreds: {
    fontSize: 12,
    color: '#475569',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  backHomeLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  backHomeText: {
    color: '#0284c7',
    fontSize: 13,
    fontWeight: '600',
  },
});
