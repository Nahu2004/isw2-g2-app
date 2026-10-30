import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/common';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logoutUser } = useAuth();

  const modulo2Items = [
    {
      title: 'Partido en Vivo',
      desc: 'Control de ciclo de vida (RN-05), cronómetro y registro de incidencias en tiempo real',
      route: '/partido-en-vivo?id=1',
      icon: '🔴',
      tag: 'OPERATIVO',
      color: '#dc2626',
      bgIcon: '#fef2f2',
    },
  ];

  const modulo3Items = [
    {
      title: 'Equipos',
      desc: 'Alta, edición y baja lógica de clubes federados por torneo',
      route: '/equipos',
      icon: '🛡️',
      color: '#2563eb',
      bgIcon: '#eff6ff',
    },
    {
      title: 'Jugadores',
      desc: 'Planteles, asignación de dorsales y control de DNI único',
      route: '/jugadores',
      icon: '🏃',
      color: '#059669',
      bgIcon: '#ecfdf5',
    },
    {
      title: 'Catálogos y Torneos',
      desc: 'Gestión de torneos oficiales, predios/canchas y colegiados arbitrales',
      route: '/catalogos',
      icon: '📋',
      color: '#d97706',
      bgIcon: '#fffbeb',
    },
    {
      title: 'Programar Partidos',
      desc: 'Fijar fixture con validación automática de solapamiento de 2 horas',
      route: '/partidos',
      icon: '⚽',
      color: '#7c3aed',
      bgIcon: '#f5f3ff',
    },
    {
      title: 'Reglamento y Sanciones',
      desc: 'Consulta de suspendidos por fecha, bloqueos y validación de horarios',
      route: '/reglamento',
      icon: '⚖️',
      color: '#4f46e5',
      bgIcon: '#eef2ff',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Banner de Bienvenida y Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brandGroup}>
            <View style={styles.badgeLeague}>
              <Text style={styles.badgeLeagueText}>SANTA FE • ARGENTINA</Text>
            </View>
            <Text style={styles.title}>Liga Amateur Santafesina</Text>
            <Text style={styles.leadText}>
              Sistema Oficial de Gestión Deportiva y Operación de Encuentros
            </Text>
          </View>
          {user ? (
            <TouchableOpacity
              onPress={() => logoutUser()}
              style={styles.logoutBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/auth/login' as any)}
              style={styles.loginBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.userBadge}>
          <View style={[styles.userStatusDot, { backgroundColor: user ? '#10b981' : '#94a3b8' }]} />
          <Text style={styles.userText}>
            {user ? `${user.nombreCompleto} • ${user.rol}` : 'Modo Invitado (Solo Lectura)'}
          </Text>
        </View>
      </View>

      {/* Módulo 2 */}
      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionTitle}>Módulo 2: Operación en Vivo</Text>
        <View style={styles.sectionTag}>
          <Text style={styles.sectionTagText}>PRIORIDAD</Text>
        </View>
      </View>

      {modulo2Items.map((item) => (
        <TouchableOpacity
          key={item.route}
          activeOpacity={0.88}
          onPress={() => router.push(item.route as any)}
        >
          <Card style={[styles.menuCard, styles.menuCardLive]}>
            <View style={[styles.iconContainer, { backgroundColor: item.bgIcon }]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
            </View>
            <View style={styles.menuInfo}>
              <View style={styles.titleWithTag}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.tag && (
                  <View style={styles.livePill}>
                    <Text style={styles.livePillText}>{item.tag}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.itemDesc}>{item.desc}</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </Card>
        </TouchableOpacity>
      ))}

      {/* Módulo 3 */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
        Módulo 3: Administración y Torneos
      </Text>
      {modulo3Items.map((item) => (
        <TouchableOpacity
          key={item.route}
          activeOpacity={0.88}
          onPress={() => router.push(item.route as any)}
        >
          <Card style={styles.menuCard}>
            <View style={[styles.iconContainer, { backgroundColor: item.bgIcon }]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDesc}>{item.desc}</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
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
    padding: 18,
    paddingBottom: 40,
    maxWidth: 860,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03)',
      } as any,
    }),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  brandGroup: {
    flex: 1,
  },
  badgeLeague: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 8,
  },
  badgeLeagueText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.4,
  },
  leadText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
  },
  loginBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  userBadge: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  userText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionTag: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sectionTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#dc2626',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
      } as any,
    }),
  },
  menuCardLive: {
    borderColor: '#fca5a5',
    backgroundColor: '#ffffff',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12, // R_inner
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  menuIcon: {
    fontSize: 22,
  },
  menuInfo: {
    flex: 1,
  },
  titleWithTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  livePill: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  livePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#b91c1c',
  },
  itemDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
    lineHeight: 16,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  arrow: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '700',
  },
});
