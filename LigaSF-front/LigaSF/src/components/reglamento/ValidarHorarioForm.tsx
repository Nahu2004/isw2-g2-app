// Formulario de validación de horarios — diseño premium oscuro
// RN-01: disponibilidad de cancha / RN-02: disponibilidad de árbitro

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

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
  label,
  opciones,
  seleccionado,
  onSeleccionar,
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
  const [canchas, setCanchas]   = useState<Cancha[]>([]);
  const [arbitros, setArbitros] = useState<Arbitro[]>([]);

  const [canchaId, setCanchaId]   = useState<number | null>(null);
  const [arbitroId, setArbitroId] = useState<number | null>(null);
  const [fechaHora, setFechaHora] = useState<Date>(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);

  const [resultadoCancha,  setResultadoCancha]  = useState<DisponibilidadResponse | null>(null);
  const [resultadoArbitro, setResultadoArbitro] = useState<DisponibilidadResponse | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCanchas(), getArbitros()])
      .then(([c, a]) => { setCanchas(c); setArbitros(a); })
      .catch(() => setError('No se pudieron cargar canchas y árbitros.'));
  }, []);

  const opcionesCanchas  = canchas.map((c) => ({ id: c.id, nombre: c.nombre }));
  const opcionesArbitros = arbitros.map((a) => ({
    id: a.id,
    nombre: `${a.nombre} ${a.apellido}`,
  }));

  const handleFechaChange = (_event: DateTimePickerEvent, date?: Date) => {
    setMostrarPicker(Platform.OS === 'ios');
    if (date) setFechaHora(date);
  };

  const formatearISO = (date: Date): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
      `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
    );
  };

  const handleVerificar = async () => {
    if (!canchaId || !arbitroId) {
      setError('Seleccioná una cancha y un árbitro.');
      return;
    }
    setError(null);
    setCargando(true);
    setResultadoCancha(null);
    setResultadoArbitro(null);

    try {
      const inicio = formatearISO(fechaHora);
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

      {/* Descripción */}
      <Text style={styles.description}>
        Verificá si una cancha y un árbitro están libres antes de programar un partido.
      </Text>

      {/* Cancha */}
      <ChipSelector
        label="CANCHA"
        opciones={opcionesCanchas}
        seleccionado={canchaId}
        onSeleccionar={setCanchaId}
      />

      {/* Árbitro */}
      <ChipSelector
        label="ÁRBITRO"
        opciones={opcionesArbitros}
        seleccionado={arbitroId}
        onSeleccionar={setArbitroId}
      />

      {/* Fecha y hora */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>FECHA Y HORA</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setMostrarPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dateValue}>
            {fechaHora.toLocaleDateString('es-AR', {
              weekday: 'short', day: '2-digit',
              month: '2-digit', year: 'numeric',
            }).toUpperCase()}
          </Text>
          <Text style={styles.dateTime}>
            {fechaHora.toLocaleTimeString('es-AR', {
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </TouchableOpacity>
        {mostrarPicker && (
          <DateTimePicker
            value={fechaHora}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleFechaChange}
            minimumDate={new Date()}
            themeVariant="dark"
          />
        )}
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
          <Text style={styles.resultsLabel}>RESULTADO</Text>
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

  // Fecha
  dateButton: {
    ...cardStyle,
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  dateValue: {
    fontSize:      Theme.font.size.sm,
    fontWeight:    Theme.font.weight.bold,
    color:         Theme.text.primary,
    letterSpacing: Theme.font.letterSpacing.wide,
  },
  dateTime: {
    fontSize:   Theme.font.size.md,
    fontWeight: Theme.font.weight.black,
    color:      Theme.text.accent,
  },

  // Error
  errorText: {
    fontSize: Theme.font.size.sm,
    color:    Theme.text.error,
  },

  // Botón principal
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
  resultsLabel: {
    ...sectionLabelStyle,
  },
});
