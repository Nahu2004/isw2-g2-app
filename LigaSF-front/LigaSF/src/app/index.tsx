import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card, Button } from '@/components/common';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logoutUser } = useAuth();

  const modulo2Items = [
    {
      title: 'Partido en Vivo',
      desc: 'Control de ciclo de vida (RN-05), cronómetro y registro de goles y tarjetas (RN-04)',
      route: '/partido-en-vivo?id=1',
      icon: '🔴',
      color: '#dc2626',
    },
  ];

  const modulo3Items = [
    {
      title: 'Equipos',
      desc: 'Alta, edición y baja lógica de clubes por torneo',
      route: '/equipos',
      icon: '🛡️',
      color: '#3b82f6',
    },
    {
      title: 'Jugadores',
      desc: 'Planteles, asignación de dorsales y DNI único',
      route: '/jugadores',
      icon: '🏃',
      color: '#10b981',
    },
    {
      title: 'Catálogos y Torneos',
      desc: 'Gestión de torneos, canchas y árbitros colegiados',
      route: '/catalogos',
      icon: '📋',
      color: '#f59e0b',
    },
    {
      title: 'Programar Partidos',
      desc: 'Fijar fechas con control de solapamiento de 2 horas',
      route: '/partidos',
      icon: '⚽',
      color: '#8b5cf6',
    },
    {
      title: 'Reglamento y Sanciones',
      desc: 'Consulta de suspendidos por fecha y validaciones reglamentarias',
      route: '/reglamento',
      icon: '⚖️',
      color: '#6366f1',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.subtitle}>Panel Oficial</Text>
            <Text style={styles.title}>Liga Amateur Santafesina</Text>
          </View>
          {user ? (
            <TouchableOpacity
              onPress={() => logoutUser()}
              style={styles.logoutBtn}
            >
              <Text style={styles.logoutBtnText}>Salir</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/auth/login' as any)}
              style={styles.loginBtn}
            >
              <Text style={styles.loginBtnText}>Ingresar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.userBadge}>
          <Text style={styles.userText}>
            👤 {user ? `${user.nombreCompleto} (${user.rol})` : 'Invitado (Sin sesión activa)'}
          </Text>
        </View>
      </View>

      {/* Módulo 2 */}
      <Text style={styles.sectionTitle}>Módulo 2: Operación en Vivo</Text>
      {modulo2Items.map((item) => (
        <TouchableOpacity
          key={item.route}
          activeOpacity={0.8}
          onPress={() => router.push(item.route as any)}
        >
          <Card style={styles.menuCard}>
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.arrow}>❯</Text>
          </Card>
        </TouchableOpacity>
      ))}

      {/* Módulo 3 */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
        Módulo 3: Administración de la Liga
      </Text>
      {modulo3Items.map((item) => (
        <TouchableOpacity
          key={item.route}
          activeOpacity={0.8}
          onPress={() => router.push(item.route as any)}
        >
          <Card style={styles.menuCard}>
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.arrow}>❯</Text>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subtitle: {
    fontSize: 13,
    color: '#0284c7',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutBtnText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
  },
  loginBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  userBadge: {
    marginTop: 10,
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  userText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIcon: {
    fontSize: 22,
  },
  menuInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  itemDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  arrow: {
    fontSize: 16,
    color: '#94a3b8',
    marginLeft: 8,
  },
});
