// Formulario para verificar disponibilidad de cancha y árbitro en un horario.
// Implementa RN-01 y RN-02 del módulo de reglamento.
// Carga canchas y árbitros del backend y consulta disponibilidad al enviar.

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

import { getCanchas, getArbitros } from '@/api/catalogosApi';
import {
  consultarDisponibilidadCancha,
  consultarDisponibilidadArbitro,
} from '@/api/reglamentoApi';
import type { Cancha, Arbitro, DisponibilidadResponse } from '@/api/types';
import { DisponibilidadCard } from './DisponibilidadCard';
import { Button } from '@/components/common';

// ─── Picker simple (reemplaza al nativo para evitar dependencias extra) ────────

interface SelectorProps {
  label: string;
  opciones: { id: number; nombre: string }[];
  seleccionado: number | null;
  onSeleccionar: (id: number) => void;
}

const SelectorLista: React.FC<SelectorProps> = ({
  label,
  opciones,
  seleccionado,
  onSeleccionar,
}) => (
  <View style={styles.selectorContainer}>
    <Text style={styles.label}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
      {opciones.map((op) => (
        <TouchableOpacity
          key={op.id}
          style={[styles.pill, seleccionado === op.id && styles.pillActivo]}
          onPress={() => onSeleccionar(op.id)}
        >
          <Text style={[styles.pillText, seleccionado === op.id && styles.pillTextActivo]}>
            {op.nombre}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// ─── Componente principal ─────────────────────────────────────────────────────

export const ValidarHorarioForm: React.FC = () => {
  // Catálogos
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [arbitros, setArbitros] = useState<Arbitro[]>([]);

  // Selección del usuario
  const [canchaId, setCanchaId] = useState<number | null>(null);
  const [arbitroId, setArbitroId] = useState<number | null>(null);
  const [fechaHora, setFechaHora] = useState<Date>(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);

  // Resultados
  const [resultadoCancha, setResultadoCancha] = useState<DisponibilidadResponse | null>(null);
  const [resultadoArbitro, setResultadoArbitro] = useState<DisponibilidadResponse | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial de catálogos
  useEffect(() => {
    Promise.all([getCanchas(), getArbitros()])
      .then(([c, a]) => {
        setCanchas(c);
        setArbitros(a);
      })
      .catch(() => setError('No se pudieron cargar canchas y árbitros.'));
  }, []);

  const opcionesArbitros = arbitros.map((a) => ({
    id: a.id,
    nombre: `${a.nombre} ${a.apellido}`,
  }));

  const opcionesCanchas = canchas.map((c) => ({
    id: c.id,
    nombre: c.nombre,
  }));

  const handleFechaChange = (_event: DateTimePickerEvent, date?: Date) => {
    setMostrarPicker(Platform.OS === 'ios'); // En iOS se mantiene abierto
    if (date) setFechaHora(date);
  };

  const formatearFechaHora = (date: Date): string => {
    // Formato ISO 8601 sin zona horaria: "2025-05-10T16:00:00"
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
      `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
    );
  };

  const handleVerificar = async () => {
    if (!canchaId || !arbitroId) {
      setError('Seleccioná una cancha y un árbitro antes de verificar.');
      return;
    }
    setError(null);
    setCargando(true);
    setResultadoCancha(null);
    setResultadoArbitro(null);

    const inicio = formatearFechaHora(fechaHora);

    try {
      const [resCancha, resArbitro] = await Promise.all([
        consultarDisponibilidadCancha(canchaId, inicio),
        consultarDisponibilidadArbitro(arbitroId, inicio),
      ]);
      setResultadoCancha(resCancha);
      setResultadoArbitro(resArbitro);
    } catch (e: any) {
      setError(e?.message || 'Error al consultar disponibilidad.');
    } finally {
      setCargando(false);
    }
  };

  const canchaSeleccionada = canchas.find((c) => c.id === canchaId);
  const arbitroSeleccionado = arbitros.find((a) => a.id === arbitroId);

  return (
    <View style={styles.container}>
      <Text style={styles.seccionTitulo}>Verificar disponibilidad de horario</Text>
      <Text style={styles.descripcion}>
        Consultá si una cancha y un árbitro están libres en el horario elegido antes de programar
        un partido.
      </Text>

      {/* Selector de cancha */}
      <SelectorLista
        label="Cancha"
        opciones={opcionesCanchas}
        seleccionado={canchaId}
        onSeleccionar={setCanchaId}
      />

      {/* Selector de árbitro */}
      <SelectorLista
        label="Árbitro"
        opciones={opcionesArbitros}
        seleccionado={arbitroId}
        onSeleccionar={setArbitroId}
      />

      {/* Selector de fecha y hora */}
      <View style={styles.selectorContainer}>
        <Text style={styles.label}>Fecha y hora del partido</Text>
        <TouchableOpacity
          style={styles.fechaBoton}
          onPress={() => setMostrarPicker(true)}
        >
          <Text style={styles.fechaTexto}>
            📅{' '}
            {fechaHora.toLocaleDateString('es-AR', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}{' '}
            —{' '}
            {fechaHora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        {mostrarPicker && (
          <DateTimePicker
            value={fechaHora}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleFechaChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      {/* Error de validación */}
      {error ? <Text style={styles.errorTexto}>{error}</Text> : null}

      {/* Botón verificar */}
      <Button
        title={cargando ? 'Verificando...' : 'Verificar disponibilidad'}
        onPress={handleVerificar}
        variant="primary"
        disabled={cargando}
        style={styles.boton}
      />

      {/* Resultados */}
      {(resultadoCancha || resultadoArbitro || cargando) ? (
        <View style={styles.resultados}>
          <Text style={styles.resultadosTitulo}>Resultado</Text>
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

const AMBER = '#f59e0b';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  descripcion: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 18,
  },
  selectorContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pillsScroll: {
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  pillActivo: {
    backgroundColor: AMBER,
    borderColor: AMBER,
  },
  pillText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  pillTextActivo: {
    color: '#ffffff',
    fontWeight: '700',
  },
  fechaBoton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
  },
  fechaTexto: {
    fontSize: 14,
    color: '#1e293b',
  },
  errorTexto: {
    color: '#dc2626',
    fontSize: 13,
    marginBottom: 10,
  },
  boton: {
    marginBottom: 16,
    backgroundColor: AMBER,
    borderColor: AMBER,
  },
  resultados: {
    marginTop: 4,
  },
  resultadosTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
});
