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
import { Card, InputField, Button, GradientBackground } from '@/components/common';

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
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header Superior con letras blancas */}
          <View style={styles.topBrand}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>⚽</Text>
            </View>
            <Text style={styles.brandTitle}>Liga Amateur Santafesina</Text>
            <Text style={styles.brandSubtitle}>
              Panel Oficial de Delegados y Autoridades de Mesa
            </Text>
          </View>

          <Card style={styles.card}>
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
                label="Usuario"
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
                activeOpacity={0.7}
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
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  topBrand: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20, // R_inner
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 20px rgba(2, 132, 199, 0.35)',
      } as any,
    }),
  },
  logoIcon: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#93c5fd', // Azul claro con alto contraste
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    padding: 26,
    borderRadius: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 10,
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
    gap: 4,
  },
  submitBtn: {
    marginTop: 10,
  },
  hintBox: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  hintTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  hintRole: {
    fontWeight: '800',
    fontSize: 12,
    color: '#0284c7',
    width: 75,
  },
  hintCreds: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  backHomeLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  backHomeText: {
    color: '#0284c7',
    fontSize: 13,
    fontWeight: '700',
  },
});
