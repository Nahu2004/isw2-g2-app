// Dashboard Principal — Liga Amateur Santafesina
// Modo Público por defecto:
// - Los visitantes no logueados acceden a la información pública: Tabla de Posiciones y Fixture / Resultados.
// - La sección de Operación y Administración (Partido en Vivo, Equipos, Jugadores, etc.)
//   se desbloquea al iniciar sesión con rol ADMIN o DELEGADO, o invita a autenticarse.

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
  accent: string;
  badge?: string;
  isHero?: boolean;
  requiereAuth?: boolean;
}

interface DashboardSection {
  title: string;
  requiereAuth?: boolean;
  items: DashboardItem[];
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, logoutUser } = useAuth();
  const estaAutenticado = !!user;

  const handleNavegar = (item: DashboardItem) => {
    if (item.requiereAuth && !estaAutenticado) {
      router.push('/auth/login' as any);
      return;
    }
    router.push(item.route as any);
  };

  const sections: DashboardSection[] = [
    {
      title: 'Torneo y Competencia',
      items: [
        {
          title: 'Tabla de Posiciones',
          desc: 'Clasificación oficial calculada desde resultados, puntos y diferencia de goles',
          route: '/tabla',
          icon: '🏆',
          accent: '#7DD3FC',
        },
        {
          title: 'Fixture y Partidos',
          desc: 'Encuentros por fecha, tanteador oficial y cronología de incidencias',
          route: '/fixture',
          icon: '⚽',
          accent: '#38BDF8',
        },
      ],
    },
    {
      title: 'Operación en Directo',
      requiereAuth: true,
      items: [
        {
          title: 'Partido en Vivo',
          desc: 'Panel de control de incidencias, cronómetro y cambio de etapas del partido',
          route: '/partido-en-vivo?id=1',
          icon: '⚡',
          accent: '#EF4444',
          badge: 'TIEMPO REAL',
          isHero: true,
          requiereAuth: true,
        },
      ],
    },
    {
      title: 'Gestión y Administración',
      requiereAuth: true,
      items: [
        {
          title: 'Equipos',
          desc: 'Registro, edición y control de clubes federados por torneo',
          route: '/equipos',
          icon: '🛡️',
          accent: '#60A5FA',
          requiereAuth: true,
        },
        {
          title: 'Jugadores',
          desc: 'Planteles oficiales, números de camiseta y control de DNI único',
          route: '/jugadores',
          icon: '🏃',
          accent: '#4ADE80',
          requiereAuth: true,
        },
        {
          title: 'Catálogos Oficiales',
          desc: 'Torneos vigentes, predios/canchas habilitadas y cuerpo de árbitros',
          route: '/catalogos',
          icon: '📋',
          accent: '#FBBF24',
          requiereAuth: true,
        },
        {
          title: 'Programar Partidos',
          desc: 'Asignación de fixture con control estricto de solapamientos horarios',
          route: '/partidos',
          icon: '🗓️',
          accent: '#C084FC',
          requiereAuth: true,
        },
        {
          title: 'Reglamento y Sanciones',
          desc: 'Control de suspendidos por fecha, bloqueos y disponibilidad horaria',
          route: '/reglamento',
          icon: '⚖️',
          accent: '#7DD3FC',
          requiereAuth: true,
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
        {/* Hero Banner Header */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} pointerEvents="none" />

          <View style={styles.headerTop}>
            <View style={styles.brandGroup}>
              <View style={styles.leagueTag}>
                <View style={styles.leagueDot} />
                <Text style={styles.leagueTagText}>SANTA FE • ARGENTINA</Text>
              </View>
              <Text style={styles.title}>Liga Amateur Santafesina</Text>
              <Text style={styles.subtitle}>
                Portal oficial del torneo. Consulta posiciones, resultados y fixture de la temporada.
              </Text>
            </View>

            {estaAutenticado ? (
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
                <Text style={styles.loginBtnText}>Acceso Oficial</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* User Status Bar */}
          <View style={styles.userBar}>
            <View style={styles.userStatus}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: estaAutenticado ? Theme.status.success.text : Theme.text.secondary },
                ]}
              />
              <Text style={styles.userText}>
                {estaAutenticado
                  ? `${user.nombreCompleto} • ${user.rol}`
                  : 'Vista Pública • Acceso libre'}
              </Text>
            </View>

            {!estaAutenticado && (
              <TouchableOpacity
                onPress={() => router.push('/auth/login' as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.loginHintLink}>¿Eres árbitro o delegado? Iniciar sesión ›</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Secciones con Bento Cards Deportivas */}
        {sections.map((section) => {
          const seccionBloqueada = section.requiereAuth && !estaAutenticado;

          return (
            <View key={section.title} style={styles.sectionWrap}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionBullet, seccionBloqueada && { backgroundColor: Theme.text.secondary }]} />
                <Text style={styles.sectionHeading}>{section.title}</Text>
                {seccionBloqueada && (
                  <View style={styles.lockPill}>
                    <Text style={styles.lockPillText}>🔒 Requiere Acceso</Text>
                  </View>
                )}
              </View>

              <View style={styles.bentoGrid}>
                {section.items.map((item) => {
                  const isHero = item.isHero;
                  const bloqueado = item.requiereAuth && !estaAutenticado;

                  return (
                    <TouchableOpacity
                      key={item.route}
                      style={[
                        styles.bentoCard,
                        isHero && styles.heroBentoCard,
                        bloqueado && styles.bentoCardBloqueado,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => handleNavegar(item)}
                    >
                      {/* Glow sutil en la esquina */}
                      {!bloqueado && (
                        <View
                          style={[
                            styles.cornerGlow,
                            { backgroundColor: item.accent },
                            isHero && { opacity: 0.22, width: 90, height: 90 },
                          ]}
                          pointerEvents="none"
                        />
                      )}

                      <View style={styles.bentoBody}>
                        {/* Fila superior: Ícono circular + Badge o Flecha */}
                        <View style={styles.bentoTop}>
                          <View
                            style={[
                              styles.iconCircle,
                              { borderColor: bloqueado ? '#2a2a30' : `${item.accent}33` },
                            ]}
                          >
                            <Text style={styles.bentoIcon}>{item.icon}</Text>
                          </View>

                          {bloqueado ? (
                            <View style={styles.lockBox}>
                              <Text style={styles.lockIcon}>🔒</Text>
                            </View>
                          ) : item.badge ? (
                            <View style={[styles.badgePill, { borderColor: `${item.accent}66` }]}>
                              <View style={[styles.pulseDot, { backgroundColor: item.accent }]} />
                              <Text style={[styles.badgePillText, { color: item.accent }]}>
                                {item.badge}
                              </Text>
                            </View>
                          ) : (
                            <View style={styles.chevronBox}>
                              <Text style={styles.chevron}>↗</Text>
                            </View>
                          )}
                        </View>

                        {/* Textos */}
                        <View style={styles.bentoInfo}>
                          <Text
                            style={[
                              styles.bentoTitle,
                              isHero && styles.heroBentoTitle,
                              bloqueado && styles.bentoTitleBloqueado,
                            ]}
                          >
                            {item.title}
                          </Text>
                          <Text style={styles.bentoDesc} numberOfLines={2}>
                            {bloqueado
                              ? 'Inicia sesión con tu cuenta oficial para acceder a este módulo.'
                              : item.desc}
                          </Text>
                        </View>

                        {/* Barra de progreso / acento al pie */}
                        <View style={styles.bottomBarTrack}>
                          <View
                            style={[
                              styles.bottomBarFill,
                              { backgroundColor: bloqueado ? '#2a2a30' : item.accent },
                              isHero && { width: '100%' },
                            ]}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
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
    paddingBottom: 56,
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
    gap: 28,
  },
  // Hero Card
  heroCard: {
    backgroundColor: '#121214',
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#26262b',
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Theme.accent.DEFAULT,
    opacity: 0.08,
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
  leagueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(125, 211, 252, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.25)',
    gap: 6,
    marginBottom: 10,
  },
  leagueDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Theme.accent.DEFAULT,
  },
  leagueTagText: {
    fontSize: 10,
    fontWeight: Theme.font.weight.black,
    color: Theme.accent.DEFAULT,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 26,
    fontWeight: Theme.font.weight.black,
    color: Theme.text.primary,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: Theme.font.size.sm,
    color: Theme.text.secondary,
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 580,
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.radius.sm,
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
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#0A0A0A',
    fontSize: Theme.font.size.xs,
    fontWeight: Theme.font.weight.black,
    letterSpacing: 0.5,
  },
  userBar: {
    marginTop: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#202024',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  userStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  userText: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
    fontWeight: Theme.font.weight.semibold,
  },
  loginHintLink: {
    fontSize: Theme.font.size.xs,
    color: Theme.accent.DEFAULT,
    fontWeight: Theme.font.weight.semibold,
  },

  // Secciones
  sectionWrap: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 2,
  },
  sectionBullet: {
    width: 3,
    height: 12,
    borderRadius: 1.5,
    backgroundColor: Theme.accent.DEFAULT,
  },
  sectionHeading: {
    ...sectionLabelStyle,
    color: Theme.text.secondary,
    fontSize: Theme.font.size.xs,
  },
  lockPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#1c1c22',
    borderWidth: 1,
    borderColor: '#2e2e38',
  },
  lockPillText: {
    fontSize: 10,
    color: Theme.text.secondary,
    fontWeight: '600',
  },
  bentoGrid: {
    gap: 12,
  },

  // Bento Card
  bentoCard: {
    backgroundColor: '#151518',
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: '#242429',
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.16s ease, border-color 0.16s ease, background-color 0.16s ease',
      } as any,
    }),
  },
  bentoCardBloqueado: {
    opacity: 0.72,
    backgroundColor: '#111114',
    borderColor: '#1e1e24',
  },
  heroBentoCard: {
    backgroundColor: '#1a1012',
    borderColor: '#3f1a1e',
  },
  cornerGlow: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 70,
    height: 70,
    borderRadius: 35,
    opacity: 0.12,
  },
  bentoBody: {
    padding: 16,
    gap: 12,
  },
  bentoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1b1b20',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoIcon: {
    fontSize: 20,
  },
  lockBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#19191e',
    borderWidth: 1,
    borderColor: '#272730',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 12,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1b1b20',
    borderWidth: 1,
    borderColor: '#2a2a30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    color: Theme.text.secondary,
    fontSize: 14,
    fontWeight: '700',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: Theme.font.weight.black,
    letterSpacing: 0.8,
  },
  bentoInfo: {
    gap: 4,
  },
  bentoTitle: {
    fontSize: Theme.font.size.md,
    fontWeight: Theme.font.weight.bold,
    color: Theme.text.primary,
    letterSpacing: -0.2,
  },
  bentoTitleBloqueado: {
    color: '#d4d4d8',
  },
  heroBentoTitle: {
    fontSize: Theme.font.size.lg,
    color: '#FCA5A5',
  },
  bentoDesc: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
    lineHeight: 17,
  },
  bottomBarTrack: {
    height: 2,
    backgroundColor: '#1f1f26',
    borderRadius: 1,
    overflow: 'hidden',
    marginTop: 2,
  },
  bottomBarFill: {
    width: 24,
    height: '100%',
    borderRadius: 1,
  },
});
