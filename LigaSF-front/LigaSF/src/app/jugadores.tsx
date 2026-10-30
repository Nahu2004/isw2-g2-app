import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  getJugadores,
  crearJugador,
  actualizarJugador,
  desactivarJugador,
  reactivarJugador,
} from '@/api/jugadoresApi';
import { getEquipos } from '@/api/equiposApi';
import { Jugador, Equipo } from '@/api/types';
import { LoadingView, ErrorView, EmptyView, Button } from '@/components/common';
import { JugadorCard } from '@/components/jugadores/JugadorCard';
import { JugadorFormModal } from '@/components/jugadores/JugadorFormModal';

export default function JugadoresScreen() {
  const params = useLocalSearchParams<{ equipoId?: string; nombreEquipo?: string }>();

  // Estados de datos
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<number | undefined>(
    params.equipoId ? parseInt(params.equipoId, 10) : undefined
  );
  const [soloActivos, setSoloActivos] = useState(false);

  // Estados de carga / error
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [jugadorEditar, setJugadorEditar] = useState<Jugador | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const [listaJugadores, listaEquipos] = await Promise.all([
        getJugadores(equipoSeleccionado, soloActivos),
        getEquipos(undefined, false),
      ]);
      setJugadores(listaJugadores);
      setEquipos(listaEquipos);
    } catch (e: any) {
      setError(e.message || 'Error al conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  }, [equipoSeleccionado, soloActivos]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCrearOEditar = async (data: {
    equipoId: number;
    nombre: string;
    apellido: string;
    dni: string;
    numeroCamiseta: number;
  }) => {
    if (jugadorEditar) {
      await actualizarJugador(jugadorEditar.id, data);
      Alert.alert('Éxito', 'Jugador actualizado correctamente');
    } else {
      await crearJugador(data);
      Alert.alert('Éxito', 'Jugador registrado en el plantel');
    }
    cargarDatos();
  };

  const handleToggleEstado = (jugador: Jugador) => {
    const accion = jugador.activo ? 'desactivar' : 'reactivar';
    Alert.alert(
      `Confirmar ${accion}`,
      `¿Deseas ${accion} al jugador ${jugador.apellido}, ${jugador.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: jugador.activo ? 'destructive' : 'default',
          onPress: async () => {
            try {
              if (jugador.activo) {
                await desactivarJugador(jugador.id);
              } else {
                await reactivarJugador(jugador.id);
              }
              cargarDatos();
            } catch (e: any) {
              Alert.alert('Error', e.message || `No se pudo ${accion} al jugador`);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filterCard}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Filtrar Planteles</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Solo activos</Text>
            <Switch
              value={soloActivos}
              onValueChange={setSoloActivos}
              trackColor={{ false: '#cbd5e1', true: '#a7f3d0' }}
              thumbColor={soloActivos ? '#10b981' : '#f1f5f9'}
            />
          </View>
        </View>

        {/* Scroll Horizontal de Filtro por Equipo */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: undefined, nombre: 'Todos los Equipos' } as any, ...equipos]}
          keyExtractor={(item) => String(item.id ?? 'todos')}
          contentContainerStyle={styles.equipoFilterList}
          renderItem={({ item }) => {
            const isSelected = equipoSeleccionado === item.id;
            return (
              <TouchableOpacity
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => setEquipoSeleccionado(item.id)}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                  {item.nombre}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        <Button
          title="+ Registrar Jugador"
          onPress={() => {
            setJugadorEditar(null);
            setModalVisible(true);
          }}
          style={styles.nuevoBtn}
        />
      </View>

      {/* Estados Visuales de Carga/Error/Datos */}
      {cargando ? (
        <LoadingView mensaje="Cargando jugadores del plantel..." />
      ) : error ? (
        <ErrorView mensaje={error} onRetry={cargarDatos} />
      ) : jugadores.length === 0 ? (
        <EmptyView mensaje="No hay jugadores registrados con los filtros seleccionados." />
      ) : (
        <FlatList
          data={jugadores}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <JugadorCard
              jugador={item}
              onEditar={(j) => {
                setJugadorEditar(j);
                setModalVisible(true);
              }}
              onToggleEstado={handleToggleEstado}
            />
          )}
        />
      )}

      {/* Modal Alta / Edición */}
      <JugadorFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCrearOEditar}
        jugadorEditar={jugadorEditar}
        equipoIdDefault={equipoSeleccionado}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  filterCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  equipoFilterList: {
    paddingVertical: 6,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pillActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  pillText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  nuevoBtn: {
    marginTop: 10,
    backgroundColor: '#10b981',
  },
  list: {
    padding: 16,
  },
});
