// Formulario para verificar si un jugador está bloqueado para jugar en una fecha.
// Flujo en cascada: seleccioná torneo → equipo → jugador → fecha → verificar.
// Evita que un jugador suspendido sea alineado aunque el equipo lo intente.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import { getTorneos } from '@/api/catalogosApi';
import { getEquipos } from '@/api/equiposApi';
import { getJugadores } from '@/api/jugadoresApi';
import { consultarBloqueoJugador } from '@/api/reglamentoApi';
import type { Torneo, Equipo, Jugador, BloqueoResponse } from '@/api/types';
import { BloqueoCard } from './BloqueoCard';
import { Button, LoadingView } from '@/components/common';

const MAX_FECHAS = 20;

// ─── Selector de pills horizontal genérico ────────────────────────────────────

interface PillSelectorProps<T> {
  label: string;
  items: T[];
  seleccionado: number | null;
  getId: (item: T) => number;
  getNombre: (item: T) => string;
  onSeleccionar: (id: number) => void;
  disabled?: boolean;
}

function PillSelector<T>({
  label,
  items,
  seleccionado,
  getId,
  getNombre,
  onSeleccionar,
  disabled = false,
}: PillSelectorProps<T>) {
  return (
    <View style={[styles.selectorContainer, disabled && styles.deshabilitado]}>
      <Text style={styles.label}>{label}</Text>
      {items.length === 0 ? (
        <Text style={styles.sinDatos}>
          {disabled ? 'Seleccioná el paso anterior primero' : 'Sin datos disponibles'}
        </Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(getId(item))}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const id = getId(item);
            const activo = seleccionado === id;
            return (
              <TouchableOpacity
                style={[styles.pill, activo && styles.pillActivo]}
                onPress={() => !disabled && onSeleccionar(id)}
                activeOpacity={disabled ? 1 : 0.7}
              >
                <Text style={[styles.pillText, activo && styles.pillTextActivo]}>
                  {getNombre(item)}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingVertical: 4 }}
        />
      )}
    </View>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export const BloqueoForm: React.FC = () => {
  // Catálogos
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);

  // Selección en cascada
  const [torneoId, setTorneoId] = useState<number | null>(null);
  const [equipoId, setEquipoId] = useState<number | null>(null);
  const [jugadorId, setJugadorId] = useState<number | null>(null);
  const [fecha, setFecha] = useState<number | null>(null);

  // Resultado
  const [resultado, setResultado] = useState<BloqueoResponse | null>(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoEquipos, setCargandoEquipos] = useState(false);
  const [cargandoJugadores, setCargandoJugadores] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial de torneos
  useEffect(() => {
    getTorneos(false)
      .then(setTorneos)
      .catch(() => setError('No se pudieron cargar los torneos.'));
  }, []);

  // Carga equipos al cambiar torneo
  useEffect(() => {
    if (!torneoId) return;
    setCargandoEquipos(true);
    setEquipos([]);
    setEquipoId(null);
    setJugadores([]);
    setJugadorId(null);
    setResultado(null);
    getEquipos(torneoId)
      .then(setEquipos)
      .catch(() => setError('No se pudieron cargar los equipos.'))
      .finally(() => setCargandoEquipos(false));
  }, [torneoId]);

  // Carga jugadores al cambiar equipo
  useEffect(() => {
    if (!equipoId) return;
    setCargandoJugadores(true);
    setJugadores([]);
    setJugadorId(null);
    setResultado(null);
    getJugadores(equipoId)
      .then(setJugadores)
      .catch(() => setError('No se pudieron cargar los jugadores.'))
      .finally(() => setCargandoJugadores(false));
  }, [equipoId]);

  const handleVerificar = async () => {
    if (!jugadorId || !torneoId || !fecha) {
      setError('Completá torneo, equipo, jugador y fecha antes de verificar.');
      return;
    }
    setError(null);
    setCargando(true);
    setResultado(null);
    try {
      const res = await consultarBloqueoJugador(jugadorId, torneoId, fecha);
      setResultado(res);
    } catch (e: any) {
      setError(e?.message || 'Error al verificar el bloqueo.');
    } finally {
      setCargando(false);
    }
  };

  const jugadorSeleccionado = jugadores.find((j) => j.id === jugadorId);

  return (
    <View style={styles.container}>
      <Text style={styles.seccionTitulo}>Verificar bloqueo de jugador</Text>
      <Text style={styles.descripcion}>
        Comprobá si un jugador puede ser alineado en una fecha. Un jugador
        suspendido está bloqueado aunque el equipo lo intente inscribir.
      </Text>

      {/* Paso 1: Torneo */}
      <PillSelector
        label="1. Torneo"
        items={torneos}
        seleccionado={torneoId}
        getId={(t) => t.id}
        getNombre={(t) => `${t.nombre} ${t.anio}`}
        onSeleccionar={(id) => { setTorneoId(id); setError(null); }}
      />

      {/* Paso 2: Equipo */}
      {cargandoEquipos ? (
        <LoadingView message="Cargando equipos..." />
      ) : (
        <PillSelector
          label="2. Equipo"
          items={equipos}
          seleccionado={equipoId}
          getId={(e) => e.id}
          getNombre={(e) => e.nombre}
          onSeleccionar={(id) => { setEquipoId(id); setError(null); }}
          disabled={!torneoId}
        />
      )}

      {/* Paso 3: Jugador */}
      {cargandoJugadores ? (
        <LoadingView message="Cargando jugadores..." />
      ) : (
        <PillSelector
          label="3. Jugador"
          items={jugadores}
          seleccionado={jugadorId}
          getId={(j) => j.id}
          getNombre={(j) => `${j.nombre} ${j.apellido}`}
          onSeleccionar={(id) => { setJugadorId(id); setResultado(null); setError(null); }}
          disabled={!equipoId}
        />
      )}

      {/* Paso 4: Fecha */}
      <View style={[styles.selectorContainer, !jugadorId && styles.deshabilitado]}>
        <Text style={styles.label}>4. Número de fecha</Text>
        <FlatList
          data={Array.from({ length: MAX_FECHAS }, (_, i) => i + 1)}
          keyExtractor={(item) => String(item)}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.pill, fecha === item && styles.pillActivo]}
              onPress={() => { if (jugadorId) { setFecha(item); setResultado(null); } }}
              activeOpacity={jugadorId ? 0.7 : 1}
            >
              <Text style={[styles.pillText, fecha === item && styles.pillTextActivo]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingVertical: 4 }}
        />
      </View>

      {/* Error */}
      {error ? <Text style={styles.errorTexto}>{error}</Text> : null}

      {/* Botón verificar */}
      <Button
        title={cargando ? 'Verificando...' : 'Verificar bloqueo'}
        onPress={handleVerificar}
        variant="primary"
        disabled={cargando || !jugadorId || !fecha}
        style={styles.boton}
      />

      {/* Resultado */}
      <BloqueoCard
        nombreJugador={
          jugadorSeleccionado
            ? `${jugadorSeleccionado.nombre} ${jugadorSeleccionado.apellido}`
            : ''
        }
        resultado={resultado}
        cargando={cargando}
      />
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
  deshabilitado: {
    opacity: 0.4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  sinDatos: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
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
});
