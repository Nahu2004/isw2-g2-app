import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/common';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const menuItems = [
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
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Panel de Administración</Text>
        <Text style={styles.title}>Liga Amateur Santafesina</Text>
        <View style={styles.userBadge}>
          <Text style={styles.userText}>
            👤 {user?.nombreCompleto || 'Administrador'} ({user?.rol || 'ADMIN'})
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Módulo 3: Administración de la Liga</Text>

      {menuItems.map((item) => (
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
