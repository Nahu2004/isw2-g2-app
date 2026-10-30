// Formulario para listar jugadores sancionados en una fecha de un torneo.
// Implementa RN-03: suspensión automática por tarjetas acumuladas.
// Muestra quién NO puede jugar en la próxima fecha indicada.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import { getTorneos } from '@/api/catalogosApi';
import { listarSancionados } from '@/api/reglamentoApi';
import type { Torneo, SancionResponse } from '@/api/types';
import { SancionadoCard } from './SancionadoCard';
import { Button, LoadingView, ErrorView, EmptyView } from '@/components/common';

// ─── Selector de número de fecha ─────────────────────────────────────────────

const MAX_FECHAS = 20;

interface SelectorFechaProps {
  seleccionada: number | null;
  onSeleccionar: (f: number) => void;
}

const SelectorFecha: React.FC<SelectorFechaProps> = ({ seleccionada, onSeleccionar }) => (
  <View style={styles.selectorContainer}>
    <Text style={styles.label}>Número de fecha</Text>
    <FlatList
      data={Array.from({ length: MAX_FECHAS }, (_, i) => i + 1)}
      keyExtractor={(item) => String(item)}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.pill, seleccionada === item && styles.pillActivo]}
          onPress={() => onSeleccionar(item)}
        >
          <Text style={[styles.pillText, seleccionada === item && styles.pillTextActivo]}>
            {item}
          </Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={{ paddingVertical: 4 }}
    />
  </View>
);

// ─── Componente principal ─────────────────────────────────────────────────────

export const SancionesForm: React.FC = () => {
  // Catálogos
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);

  // Selección
  const [torneoId, setTorneoId] = useState<number | null>(null);
  const [fecha, setFecha] = useState<number | null>(null);

  // Resultados
  const [sancionados, setSancionados] = useState<SancionResponse[]>([]);
  const [consultado, setConsultado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTorneos(false)
      .then(setTorneos)
      .catch(() => setError('No se pudieron cargar los torneos.'))
      .finally(() => setCargandoCatalogos(false));
  }, []);

  const handleConsultar = async () => {
    if (!torneoId || !fecha) {
      setError('Seleccioná un torneo y una fecha.');
      return;
    }
    setError(null);
    setCargando(true);
    setSancionados([]);
    setConsultado(false);

    try {
      const resultado = await listarSancionados(torneoId, fecha);
      setSancionados(resultado);
      setConsultado(true);
    } catch (e: any) {
      setError(e?.message || 'Error al consultar sanciones.');
    } finally {
      setCargando(false);
    }
  };

  if (cargandoCatalogos) return <LoadingView message="Cargando torneos..." />;

  const torneoSeleccionado = torneos.find((t) => t.id === torneoId);

  return (
    <View style={styles.container}>
      <Text style={styles.seccionTitulo}>Jugadores sancionados</Text>
      <Text style={styles.descripcion}>
        Consultá quiénes no pueden jugar en una fecha por acumulación de tarjetas.
      </Text>

      {/* Selector de torneo */}
      <View style={styles.selectorContainer}>
        <Text style={styles.label}>Torneo</Text>
        <FlatList
          data={torneos}
          keyExtractor={(t) => String(t.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.pill, torneoId === item.id && styles.pillActivo]}
              onPress={() => {
                setTorneoId(item.id);
                setSancionados([]);
                setConsultado(false);
              }}
            >
              <Text style={[styles.pillText, torneoId === item.id && styles.pillTextActivo]}>
                {item.nombre} {item.anio}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingVertical: 4 }}
        />
      </View>

      {/* Selector de fecha */}
      <SelectorFecha seleccionada={fecha} onSeleccionar={setFecha} />

      {/* Error */}
      {error ? <Text style={styles.errorTexto}>{error}</Text> : null}

      {/* Botón consultar */}
      <Button
        title={cargando ? 'Consultando...' : 'Ver sancionados'}
        onPress={handleConsultar}
        variant="primary"
        disabled={cargando}
        style={styles.boton}
      />

      {/* Resultados */}
      {cargando && <LoadingView message="Buscando sancionados..." />}

      {consultado && !cargando && (
        <>
          <View style={styles.resultadosHeader}>
            <Text style={styles.resultadosTitulo}>
              {torneoSeleccionado?.nombre} — Fecha {fecha}
            </Text>
            <View style={styles.badgeTotal}>
              <Text style={styles.badgeTotalTexto}>{sancionados.length}</Text>
            </View>
          </View>

          {sancionados.length === 0 ? (
            <EmptyView message="No hay jugadores sancionados para esta fecha. ✅" />
          ) : (
            sancionados.map((s) => (
              <SancionadoCard key={s.jugadorId} sancion={s} />
            ))
          )}
        </>
      )}
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
  resultadosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  resultadosTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  badgeTotal: {
    backgroundColor: AMBER,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  badgeTotalTexto: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});
