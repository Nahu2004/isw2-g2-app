// Formulario de sanciones por tarjetas — diseño premium oscuro
// RN-03: lista de jugadores suspendidos para una fecha de torneo

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import { Theme, sectionLabelStyle, cardStyle } from '@/constants/theme';
import { getTorneos } from '@/api/catalogosApi';
import { listarSancionados } from '@/api/reglamentoApi';
import type { Torneo, SancionResponse } from '@/api/types';
import { SancionadoCard } from './SancionadoCard';

// ─── Componente principal ─────────────────────────────────────────────────────

export const SancionesForm: React.FC = () => {
  const [torneos,  setTorneos]  = useState<Torneo[]>([]);
  const [torneoId, setTorneoId] = useState<number | null>(null);
  const [fecha,    setFecha]    = useState<string>('');

  const [sancionados, setSancionados] = useState<SancionResponse[]>([]);
  const [consultado,  setConsultado]  = useState(false);
  const [cargando,    setCargando]    = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    getTorneos(false)
      .then(setTorneos)
      .catch(() => setError('No se pudieron cargar los torneos.'));
  }, []);

  const handleConsultar = async () => {
    const numFecha = parseInt(fecha, 10);
    if (!torneoId || !fecha || isNaN(numFecha) || numFecha < 1) {
      setError('Seleccioná un torneo e ingresá un número de fecha válido.');
      return;
    }
    setError(null);
    setCargando(true);
    setSancionados([]);
    setConsultado(false);

    try {
      const resultado = await listarSancionados(torneoId, numFecha);
      setSancionados(resultado);
      setConsultado(true);
    } catch (e: any) {
      setError(e?.message || 'Error al consultar sanciones.');
    } finally {
      setCargando(false);
    }
  };

  const torneoSeleccionado = torneos.find((t) => t.id === torneoId);

  return (
    <View style={styles.container}>

      <Text style={styles.description}>
        Consultá los jugadores que no pueden jugar en una fecha por acumulación de tarjetas.
      </Text>

      {/* Selector de torneo */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>TORNEO</Text>
        <FlatList
          data={torneos}
          keyExtractor={(t) => String(t.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const activo = torneoId === item.id;
            return (
              <TouchableOpacity
                style={[styles.chip, activo && styles.chipActivo]}
                onPress={() => {
                  setTorneoId(item.id);
                  setSancionados([]);
                  setConsultado(false);
                  setError(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, activo && styles.chipTextActivo]}>
                  {item.nombre} {item.anio}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.chipsRow}
        />
      </View>

      {/* Input de fecha */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>NÚMERO DE FECHA</Text>
        <TextInput
          style={styles.input}
          value={fecha}
          onChangeText={(v) => {
            setFecha(v.replace(/[^0-9]/g, ''));
            setConsultado(false);
            setSancionados([]);
          }}
          placeholder="Ej: 5"
          placeholderTextColor={Theme.text.secondary}
          keyboardType="number-pad"
          maxLength={3}
          returnKeyType="done"
        />
      </View>

      {/* Error */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Botón */}
      <TouchableOpacity
        style={[styles.btn, cargando && styles.btnDisabled]}
        onPress={handleConsultar}
        disabled={cargando}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>
          {cargando ? 'CONSULTANDO...' : 'VER SANCIONADOS'}
        </Text>
      </TouchableOpacity>

      {/* Resultados */}
      {consultado && !cargando && (
        <View style={styles.results}>

          {/* Header de resultados */}
          <View style={styles.resultsHeader}>
            <Text style={styles.fieldLabel}>
              {torneoSeleccionado
                ? `${torneoSeleccionado.nombre.toUpperCase()} — FECHA ${fecha}`
                : 'RESULTADOS'}
            </Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{sancionados.length}</Text>
            </View>
          </View>

          {sancionados.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Sin suspendidos para esta fecha
              </Text>
              <Text style={styles.emptySubtext}>
                Todos los jugadores están habilitados ✓
              </Text>
            </View>
          ) : (
            sancionados.map((s) => (
              <SancionadoCard key={s.jugadorId} sancion={s} />
            ))
          )}

        </View>
      )}

    </View>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.lg,
  },
  description: {
    fontSize:   Theme.font.size.sm,
    color:      Theme.text.secondary,
    lineHeight: 20,
  },

  // Grupos de campo
  fieldGroup: {
    gap: Theme.spacing.sm,
  },
  fieldLabel: {
    ...sectionLabelStyle,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    gap:           Theme.spacing.sm,
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical:   Theme.spacing.xs + 2,
    borderRadius:      Theme.radius.pill,
    backgroundColor:   Theme.bg.card,
    borderWidth:       1,
    borderColor:       Theme.border.subtle,
  },
  chipActivo: {
    backgroundColor: Theme.accent.dim,
    borderColor:     Theme.accent.DEFAULT,
  },
  chipText: {
    fontSize:   Theme.font.size.sm,
    fontWeight: Theme.font.weight.medium,
    color:      Theme.text.secondary,
  },
  chipTextActivo: {
    color:      Theme.text.accent,
    fontWeight: Theme.font.weight.bold,
  },

  // Input
  input: {
    ...cardStyle,
    fontSize:    Theme.font.size.md,
    fontWeight:  Theme.font.weight.bold,
    color:       Theme.text.primary,
    height:      48,
  },

  // Error
  errorText: {
    fontSize: Theme.font.size.sm,
    color:    Theme.text.error,
  },

  // Botón
  btn: {
    backgroundColor: Theme.accent.DEFAULT,
    borderRadius:    Theme.radius.md,
    paddingVertical: Theme.spacing.md,
    alignItems:      'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    fontSize:      Theme.font.size.sm,
    fontWeight:    Theme.font.weight.black,
    color:         '#0A0A0A',
    letterSpacing: Theme.font.letterSpacing.wide,
  },

  // Resultados
  results: {
    gap: Theme.spacing.sm,
  },
  resultsHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  countBadge: {
    backgroundColor: Theme.accent.dim,
    borderWidth:     1,
    borderColor:     Theme.accent.DEFAULT,
    borderRadius:    Theme.radius.pill,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical:   2,
    minWidth:          28,
    alignItems:        'center',
  },
  countText: {
    fontSize:   Theme.font.size.xs,
    fontWeight: Theme.font.weight.black,
    color:      Theme.text.accent,
  },

  // Empty state
  emptyCard: {
    ...cardStyle,
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
    gap: Theme.spacing.xs,
  },
  emptyText: {
    fontSize:   Theme.font.size.md,
    fontWeight: Theme.font.weight.bold,
    color:      Theme.text.primary,
  },
  emptySubtext: {
    fontSize: Theme.font.size.sm,
    color:    Theme.status.success.text,
  },
});
