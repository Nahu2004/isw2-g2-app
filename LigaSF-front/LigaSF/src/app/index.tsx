// Dashboard Principal — Liga Amateur Santafesina
// Diseño Premium Oscuro alineado a Theme (paleta de Reglamento, Equipos, Jugadores, Partidos)
// Sin etiquetas internas ("Módulo 1, 2...", "Público", "Operativo")

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Theme, sectionLabelStyle } from '@/constants/theme';

interface DashboardItem {
  title: string;
  desc: string;
  route: string;
  icon: string;
  accentColor?: string;
  highlight?: boolean;
}

interface DashboardSection {
  title: string;
  items: DashboardItem[];
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, logoutUser } = useAuth();

  const sections: DashboardSection[] = [
    {
      title: 'Torneo y Competencia',
      items: [
        {
          title: 'Tabla de Posiciones',
          desc: 'Clasificación oficial calculada desde resultados, puntos y diferencia de goles',
          route: '/tabla',
          icon: '🏆',
          accentColor: Theme.accent.DEFAULT,
        },
        {
          title: 'Fixture y Partidos',
          desc: 'Encuentros por fecha, tanteador y cronología de incidencias',
          route: '/fixture',
          icon: '⚽',
          accentColor: '#38BDF8',
        },
      ],
    },
    {
      title: 'Operación en Directo',
      items: [
        {
          title: 'Partido en Vivo',
          desc: 'Panel de control de incidencias, cronómetro y cambio de etapas del partido',
          route: '/partido-en-vivo?id=1',
          icon: '🔴',
          accentColor: Theme.status.danger.text,
          highlight: true,
        },
      ],
    },
    {
      title: 'Gestión y Administración',
      items: [
        {
          title: 'Equipos',
          desc: 'Registro, edición y control de clubes federados por torneo',
          route: '/equipos',
          icon: '🛡️',
          accentColor: '#60A5FA',
        },
        {
          title: 'Jugadores',
          desc: 'Planteles oficiales, números de camiseta y control de DNI único',
          route: '/jugadores',
          icon: '🏃',
          accentColor: Theme.status.success.text,
        },
        {
          title: 'Catálogos Oficiales',
          desc: 'Torneos vigentes, predios/canchas habilitadas y cuerpo de árbitros',
          route: '/catalogos',
          icon: '📋',
          accentColor: Theme.status.warning.text,
        },
        {
          title: 'Programar Partidos',
          desc: 'Asignación de fixture con control estricto de solapamientos horarios',
          route: '/partidos',
          icon: '🗓️',
          accentColor: '#C084FC',
        },
        {
          title: 'Reglamento y Sanciones',
          desc: 'Control de suspendidos por fecha, bloqueos y disponibilidad de canchas y árbitros',
          route: '/reglamento',
          icon: '⚖️',
          accentColor: Theme.accent.DEFAULT,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.bg.base} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner de Bienvenida y Header */}
        <View style={styles.headerCard}>
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

          {/* Estado de sesión */}
          <View style={styles.userBadge}>
            <View
              style={[
                styles.userStatusDot,
                { backgroundColor: user ? Theme.status.success.text : Theme.text.secondary },
              ]}
            />
            <Text style={styles.userText}>
              {user ? `${user.nombreCompleto} • ${user.rol}` : 'Modo Invitado (Solo Lectura)'}
            </Text>
          </View>
        </View>

        {/* Secciones del Dashboard */}
        {sections.map((section, sIdx) => (
          <View key={section.title} style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            <View style={styles.grid}>
              {section.items.map((item) => {
                const borderActiveColor = item.highlight
                  ? Theme.status.danger.border
                  : Theme.border.subtle;
                const franjaColor = item.accentColor || Theme.accent.DEFAULT;

                return (
                  <TouchableOpacity
                    key={item.route}
                    style={[
                      styles.card,
                      item.highlight && styles.cardHighlight,
                      { borderColor: borderActiveColor },
                    ]}
                    activeOpacity={0.82}
                    onPress={() => router.push(item.route as any)}
                  >
                    {/* Franja lateral indicadora */}
                    <View style={[styles.franja, { backgroundColor: franjaColor }]} />

                    <View style={styles.cardContent}>
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.iconBox}>
                          <Text style={styles.menuIcon}>{item.icon}</Text>
                        </View>
                        <Text style={styles.arrowIcon}>›</Text>
                      </View>

                      <View style={styles.textContainer}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemDesc} numberOfLines={2}>
                          {item.desc}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.bg.base,
  },
  container: {
    flex: 1,
    backgroundColor: Theme.bg.base,
  },
  content: {
    padding: Theme.spacing.lg,
    paddingBottom: 48,
    maxWidth: 920,
    alignSelf: 'center',
    width: '100%',
    gap: Theme.spacing.xl,
  },
  headerCard: {
    backgroundColor: Theme.bg.card,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
  },
  brandGroup: {
    flex: 1,
  },
  badgeLeague: {
    alignSelf: 'flex-start',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.radius.sm,
    backgroundColor: Theme.accent.dim,
    borderWidth: 1,
    borderColor: Theme.border.active,
    marginBottom: Theme.spacing.xs,
  },
  badgeLeagueText: {
    fontSize: 10,
    fontWeight: Theme.font.weight.black,
    color: Theme.accent.DEFAULT,
    letterSpacing: Theme.font.letterSpacing.wide,
  },
  title: {
    fontSize: Theme.font.size.xxl,
    fontWeight: Theme.font.weight.bold,
    color: Theme.text.primary,
    letterSpacing: Theme.font.letterSpacing.tight,
  },
  leadText: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
    marginTop: 4,
    lineHeight: 18,
  },
  logoutBtn: {
    backgroundColor: Theme.status.danger.bg,
    borderWidth: 1,
    borderColor: Theme.status.danger.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.radius.sm,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: {
    color: Theme.status.danger.text,
    fontSize: Theme.font.size.xs,
    fontWeight: Theme.font.weight.bold,
  },
  loginBtn: {
    backgroundColor: Theme.accent.DEFAULT,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.radius.sm,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#0A0A0A',
    fontSize: Theme.font.size.xs,
    fontWeight: Theme.font.weight.bold,
  },
  userBadge: {
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.border.subtle,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 8,
  },
  userText: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
    fontWeight: Theme.font.weight.semibold,
  },
  sectionBlock: {
    gap: Theme.spacing.sm,
  },
  sectionTitle: {
    ...sectionLabelStyle,
    color: Theme.text.secondary,
    fontSize: Theme.font.size.xs,
    paddingLeft: 2,
  },
  grid: {
    gap: Theme.spacing.sm,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Theme.bg.card,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.16s ease, border-color 0.16s ease, background-color 0.16s ease',
      } as any,
    }),
  },
  cardHighlight: {
    backgroundColor: '#140c0c',
  },
  franja: {
    width: 3.5,
  },
  cardContent: {
    flex: 1,
    padding: Theme.spacing.md,
    gap: Theme.spacing.xs,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Theme.radius.sm,
    backgroundColor: Theme.bg.input,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 18,
  },
  arrowIcon: {
    fontSize: 22,
    color: Theme.text.secondary,
    lineHeight: 22,
    fontWeight: '300',
  },
  textContainer: {
    gap: 2,
    marginTop: 2,
  },
  itemTitle: {
    fontSize: Theme.font.size.md,
    fontWeight: Theme.font.weight.bold,
    color: Theme.text.primary,
  },
  itemDesc: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
    lineHeight: 16,
  },
});
