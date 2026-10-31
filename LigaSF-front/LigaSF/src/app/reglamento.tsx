// Pantalla principal — Módulo 4: Reglamento
// Diseño premium oscuro alineado al sistema de diseño global (Theme)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

import { Theme, sectionLabelStyle } from '@/constants/theme';
import { ValidarHorarioForm } from '@/components/reglamento/ValidarHorarioForm';
import { SancionesForm } from '@/components/reglamento/SancionesForm';
import { BloqueoForm } from '@/components/reglamento/BloqueoForm';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TabId = 'horarios' | 'sanciones' | 'bloqueos';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'horarios',  label: 'HORARIOS'  },
  { id: 'sanciones', label: 'SANCIONES' },
  { id: 'bloqueos',  label: 'BLOQUEOS'  },
];

// ─── Pantalla principal ───────────────────────────────────────────────────────

export default function ReglamentoScreen() {
  const router = useRouter();
  const [tabActivo, setTabActivo] = useState<TabId>('horarios');

  const renderContenido = () => {
    switch (tabActivo) {
      case 'horarios':  return <ValidarHorarioForm />;
      case 'sanciones': return <SancionesForm />;
      case 'bloqueos':  return <BloqueoForm />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.bg.base} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reglamento</Text>
      </View>

      {/* Tabs — estilo línea inferior, sin pills */}
      <View style={styles.tabsBar}>
        {TABS.map((tab) => {
          const activo = tabActivo === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => setTabActivo(tab.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, activo && styles.tabLabelActivo]}>
                {tab.label}
              </Text>
              {activo && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Separador */}
      <View style={styles.separator} />

      {/* Contenido */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderContenido()}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.bg.base,
  },

  // Header
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop:        Theme.spacing.lg,
    paddingBottom:     Theme.spacing.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    marginBottom:  Theme.spacing.xs,
    alignSelf:     'flex-start',
  },
  backArrow: {
    fontSize:   22,
    color:      Theme.text.accent,
    lineHeight: 24,
    fontWeight: Theme.font.weight.bold,
  },
  backText: {
    fontSize:   Theme.font.size.sm,
    color:      Theme.text.accent,
    fontWeight: Theme.font.weight.medium,
  },
  headerTitle: {
    fontSize:      Theme.font.size.xxl,
    fontWeight:    Theme.font.weight.black,
    color:         Theme.text.primary,
    letterSpacing: Theme.font.letterSpacing.tight,
  },

  // Tabs
  tabsBar: {
    flexDirection:     'row',
    paddingHorizontal: Theme.spacing.lg,
    gap:               Theme.spacing.xl,
  },
  tabItem: {
    paddingBottom: Theme.spacing.sm,
    alignItems:    'center',
    position:      'relative',
  },
  tabLabel: {
    fontSize:      Theme.font.size.xs,
    fontWeight:    Theme.font.weight.bold,
    letterSpacing: Theme.font.letterSpacing.wide,
    color:         Theme.text.secondary,
  },
  tabLabelActivo: {
    color: Theme.text.accent,
  },
  tabIndicator: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    height:          2,
    backgroundColor: Theme.accent.DEFAULT,
    borderRadius:    1,
  },

  // Layout
  separator: {
    height:          1,
    backgroundColor: Theme.border.subtle,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding:       Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
});
