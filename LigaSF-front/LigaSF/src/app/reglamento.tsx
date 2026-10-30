// Pantalla principal del Módulo 4: Reglamento
// Contiene 3 secciones accesibles por tabs internos:
//   - Horarios:  Validar disponibilidad de cancha y árbitro (RN-01, RN-02) ✅
//   - Sanciones: Lista de jugadores sancionados (RN-03)                     ✅ rama actual
//   - Bloqueos:  Verificar si un jugador está bloqueado                     — próxima rama

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

// ─── Placeholder para funcionalidades no implementadas aún ───────────────────

const ProximamenteView: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.proximamente}>
    <Text style={styles.proximamenteIcono}>🚧</Text>
    <Text style={styles.proximamenteTitulo}>{label}</Text>
    <Text style={styles.proximamenteTexto}>
      Esta funcionalidad está en desarrollo.{'\n'}Se implementará en la siguiente rama.
    </Text>
  </View>
);

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
        return <ProximamenteView label="Bloqueo de jugadores" />;
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
    </SafeAreaView>
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
  // Placeholder
  proximamente: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  proximamenteIcono: {
    fontSize: 48,
    marginBottom: 12,
  },
  proximamenteTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  proximamenteTexto: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
});
