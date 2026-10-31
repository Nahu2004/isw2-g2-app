// Formulario de validación de horarios — diseño premium oscuro
// RN-01: disponibilidad de cancha / RN-02: disponibilidad de árbitro
// Fecha y hora ingresadas manualmente (compatible web + nativo)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import { Theme, sectionLabelStyle, cardStyle } from '@/constants/theme';
import { getCanchas, getArbitros } from '@/api/catalogosApi';
import {
  consultarDisponibilidadCancha,
  consultarDisponibilidadArbitro,
} from '@/api/reglamentoApi';
import type { Cancha, Arbitro, DisponibilidadResponse } from '@/api/types';
import { DisponibilidadCard } from './DisponibilidadCard';

// ─── Chip selector horizontal ─────────────────────────────────────────────────

interface ChipSelectorProps {
  label: string;
  opciones: { id: number; nombre: string }[];
  seleccionado: number | null;
  onSeleccionar: (id: number) => void;
}

const ChipSelector: React.FC<ChipSelectorProps> = ({
  label, opciones, seleccionado, onSeleccionar,
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.chipsRow}>
        {opciones.map((op) => {
          const activo = seleccionado === op.id;
          return (
            <TouchableOpacity
              key={op.id}
              style={[styles.chip, activo && styles.chipActivo]}
              onPress={() => onSeleccionar(op.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, activo && styles.chipTextActivo]}>
                {op.nombre}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  </View>
);

// ─── Componente principal ─────────────────────────────────────────────────────

export const ValidarHorarioForm: React.FC = () => {
  const [canchas,   setCanchas]   = useState<Cancha[]>([]);
  const [arbitros,  setArbitros]  = useState<Arbitro[]>([]);
  const [canchaId,  setCanchaId]  = useState<number | null>(null);
  const [arbitroId, setArbitroId] = useState<number | null>(null);

  // Fecha y hora como texto — formato YYYY-MM-DD y HH:MM
  const [fecha, setFecha] = useState<string>('');
  const [hora,  setHora]  = useState<string>('');

  const [resultadoCancha,  setResultadoCancha]  = useState<DisponibilidadResponse | null>(null);
  const [resultadoArbitro, setResultadoArbitro] = useState<DisponibilidadResponse | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCanchas(), getArbitros()])
      .then(([c, a]) => { setCanchas(c); setArbitros(a); })
      .catch(() => setError('No se pudieron cargar canchas y árbitros.'));
  }, []);

  // Formatea "2025-05-10" + "16:00" → "2025-05-10T16:00:00"
  const buildISO = (): string | null => {
    const fechaReg = /^\d{4}-\d{2}-\d{2}$/;
    const horaReg  = /^\d{2}:\d{2}$/;
    if (!fechaReg.test(fecha) || !horaReg.test(hora)) return null;
    return `${fecha}T${hora}:00`;
  };

  const handleVerificar = async () => {
    if (!canchaId || !arbitroId) {
      setError('Seleccioná una cancha y un árbitro.');
      return;
    }
    const inicio = buildISO();
    if (!inicio) {
      setError('Ingresá fecha (AAAA-MM-DD) y hora (HH:MM) válidas.');
      return;
    }
    setError(null);
    setCargando(true);
    setResultadoCancha(null);
    setResultadoArbitro(null);

    try {
      const [resC, resA] = await Promise.all([
        consultarDisponibilidadCancha(canchaId,  inicio),
        consultarDisponibilidadArbitro(arbitroId, inicio),
      ]);
      setResultadoCancha(resC);
      setResultadoArbitro(resA);
    } catch (e: any) {
      setError(e?.message || 'Error al consultar disponibilidad.');
    } finally {
      setCargando(false);
    }
  };

  const canchaSeleccionada  = canchas.find((c) => c.id === canchaId);
  const arbitroSeleccionado = arbitros.find((a) => a.id === arbitroId);

  return (
    <View style={styles.container}>

      <Text style={styles.description}>
        Verificá si una cancha y un árbitro están libres antes de programar un partido.
      </Text>

      {/* Cancha */}
      <ChipSelector
        label="CANCHA"
        opciones={canchas.map((c) => ({ id: c.id, nombre: c.nombre }))}
        seleccionado={canchaId}
        onSeleccionar={setCanchaId}
      />

      {/* Árbitro */}
      <ChipSelector
        label="ÁRBITRO"
        opciones={arbitros.map((a) => ({ id: a.id, nombre: `${a.nombre} ${a.apellido}` }))}
        seleccionado={arbitroId}
        onSeleccionar={setArbitroId}
      />

      {/* Fecha y hora */}
      <View style={styles.fechaRow}>
        <View style={[styles.fieldGroup, { flex: 3 }]}>
          <Text style={styles.fieldLabel}>FECHA</Text>
          <TextInput
            style={styles.input}
            value={fecha}
            onChangeText={setFecha}
            placeholder="2025-05-10"
            placeholderTextColor={Theme.text.secondary}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            returnKeyType="next"
          />
        </View>
        <View style={[styles.fieldGroup, { flex: 2 }]}>
          <Text style={styles.fieldLabel}>HORA</Text>
          <TextInput
            style={styles.input}
            value={hora}
            onChangeText={setHora}
            placeholder="16:00"
            placeholderTextColor={Theme.text.secondary}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            returnKeyType="done"
          />
        </View>
      </View>

      {/* Error */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Botón */}
      <TouchableOpacity
        style={[styles.btn, cargando && styles.btnDisabled]}
        onPress={handleVerificar}
        disabled={cargando}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>
          {cargando ? 'VERIFICANDO...' : 'VERIFICAR DISPONIBILIDAD'}
        </Text>
      </TouchableOpacity>

      {/* Resultados */}
      {(resultadoCancha || resultadoArbitro || cargando) ? (
        <View style={styles.results}>
          <Text style={styles.fieldLabel}>RESULTADO</Text>
          <DisponibilidadCard
            titulo={canchaSeleccionada?.nombre ?? 'Cancha'}
            resultado={resultadoCancha}
            cargando={cargando}
          />
          <DisponibilidadCard
            titulo={
              arbitroSeleccionado
                ? `${arbitroSeleccionado.nombre} ${arbitroSeleccionado.apellido}`
                : 'Árbitro'
            }
            resultado={resultadoArbitro}
            cargando={cargando}
          />
        </View>
      ) : null}

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
  fieldGroup: {
    gap: Theme.spacing.sm,
  },
  fieldLabel: {
    ...sectionLabelStyle,
  },
  chipsRow: {
    flexDirection: 'row',
    gap:           Theme.spacing.sm,
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
  fechaRow: {
    flexDirection: 'row',
    gap:           Theme.spacing.md,
  },
  input: {
    ...cardStyle,
    fontSize:   Theme.font.size.md,
    fontWeight: Theme.font.weight.bold,
    color:      Theme.text.primary,
    height:     48,
  },
  errorText: {
    fontSize: Theme.font.size.sm,
    color:    Theme.text.error,
  },
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
  results: {
    gap: Theme.spacing.sm,
  },
});
