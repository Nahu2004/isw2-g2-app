import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/api/authService';
import { InputField, Button } from '@/components/common';

const LOGO = require('../../../assets/images/logo-liga.jpg');

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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>

          {/* Header Superior — Logo y branding */}
          <View style={styles.topBrand}>
            <View style={styles.logoBadge}>
              <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.brandTitle}>LIGA AMATEUR SANTAFESINA</Text>
            <Text style={styles.brandSubtitle}>
              PANEL OFICIAL · DELEGADOS Y AUTORIDADES DE MESA
            </Text>
          </View>

          {/* Card del formulario */}
          <View style={styles.card}>

            {/* Encabezado de la card */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>ACCESO AL SISTEMA</Text>
              <View style={styles.cardTitleUnderline} />
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
                title="INICIAR SESIÓN"
                onPress={handleLogin}
                loading={loading}
                style={styles.submitBtn}
              />
            </View>

            {/* Cuenta precargada */}
            <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>CUENTA PRECARGADA EN BASE DE DATOS</Text>
              <TouchableOpacity
                onPress={() => {
                  setUsername('admin');
                  setPassword('Admin2026!');
                }}
                style={styles.hintItem}
                activeOpacity={0.7}
              >
                <Text style={styles.hintRole}>ADMIN</Text>
                <View style={styles.hintDivider} />
                <Text style={styles.hintCreds}>admin / Admin2026!</Text>
              </TouchableOpacity>
            </View>

            {user && (
              <TouchableOpacity
                onPress={() => router.replace('/' as any)}
                style={styles.backHomeLink}
              >
                <Text style={styles.backHomeText}>← VOLVER AL MENÚ PRINCIPAL</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>LIGA SF · SISTEMA DE GESTIÓN DEPORTIVA</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 48,
  },

  // ── Branding ──────────────────────────────────────────────────────────────
  topBrand: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 110,
    height: 110,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#262626',
    ...Platform.select({
      web: {
        boxShadow: '0 0 32px rgba(125, 211, 252, 0.12)',
      } as any,
    }),
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#A3A3A3',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ── Card del formulario ───────────────────────────────────────────────────
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#161616',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#262626',
    padding: 28,
    ...Platform.select({
      web: {
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
      } as any,
    }),
  },
  cardHeader: {
    marginBottom: 22,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7DD3FC',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  cardTitleUnderline: {
    width: 32,
    height: 2,
    backgroundColor: '#7DD3FC',
    borderRadius: 1,
  },

  // ── Error ─────────────────────────────────────────────────────────────────
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    borderColor: 'rgba(220, 38, 38, 0.35)',
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
    color: '#f87171',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  // ── Formulario ────────────────────────────────────────────────────────────
  form: {
    gap: 4,
  },
  submitBtn: {
    marginTop: 12,
  },

  // ── Hint box ─────────────────────────────────────────────────────────────
  hintBox: {
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  hintTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A3A3A3',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262626',
    gap: 10,
  },
  hintRole: {
    fontWeight: '800',
    fontSize: 11,
    color: '#7DD3FC',
    letterSpacing: 1,
  },
  hintDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#262626',
  },
  hintCreds: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // ── Volver ────────────────────────────────────────────────────────────────
  backHomeLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  backHomeText: {
    color: '#7DD3FC',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footerText: {
    marginTop: 32,
    fontSize: 10,
    color: '#3a3a3a',
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
