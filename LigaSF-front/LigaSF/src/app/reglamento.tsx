// Pantalla principal del Módulo 4: Reglamento
// Las 3 funcionalidades están implementadas:
//   - Horarios:  Validar disponibilidad de cancha y árbitro (RN-01, RN-02) ✅
//   - Sanciones: Lista de jugadores sancionados (RN-03)                     ✅
//   - Bloqueos:  Verificar si un jugador está bloqueado                     ✅

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { ValidarHorarioForm } from '@/components/reglamento/ValidarHorarioForm';
import { SancionesForm } from '@/components/reglamento/SancionesForm';
import { GradientBackground } from '@/components/common';
import { BloqueoForm } from '@/components/reglamento/BloqueoForm';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TabId = 'horarios' | 'sanciones' | 'bloqueos';

interface Tab {
  id: TabId;
  label: string;
  icono: string;
}

const TABS: Tab[] = [
  { id: 'horarios',  label: 'Horarios',  icono: '🕐' },
  { id: 'sanciones', label: 'Sanciones', icono: '🟨' },
  { id: 'bloqueos',  label: 'Bloqueos',  icono: '🚫' },
];

// ─── Pantalla principal ───────────────────────────────────────────────────────

export default function ReglamentoScreen() {
  const [tabActivo, setTabActivo] = useState<TabId>('horarios');

  const renderContenido = () => {
    switch (tabActivo) {
      case 'horarios':
        return <ValidarHorarioForm />;
      case 'sanciones':
        return <SancionesForm />;
      case 'bloqueos':
        return <BloqueoForm />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Encabezado del módulo */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>⚖️ Reglamento</Text>
        <Text style={styles.headerSubtitulo}>
          Validaciones y sanciones de la liga
        </Text>
      </View>

      {/* Tabs de navegación interna */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, tabActivo === tab.id && styles.tabActivo]}
            onPress={() => setTabActivo(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcono}>{tab.icono}</Text>
            <Text style={[styles.tabLabel, tabActivo === tab.id && styles.tabLabelActivo]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenido de la tab activa */}
      <ScrollView
        style={styles.contenido}
        contentContainerStyle={styles.contenidoInner}
        keyboardShouldPersistTaps="handled"
      >
        {renderContenido()}
      </ScrollView>
    </SafeAreaView></GradientBackground>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const AMBER = '#f59e0b';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: AMBER,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSubtitulo: {
    fontSize: 13,
    color: '#fef3c7',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActivo: {
    borderBottomColor: AMBER,
  },
  tabIcono: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
  },
  tabLabelActivo: {
    color: AMBER,
    fontWeight: '700',
  },
  contenido: {
    flex: 1,
  },
  contenidoInner: {
    padding: 16,
    paddingBottom: 40,
  },
});
