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
import { useRouter } from 'expo-router';
import {
  getEquipos,
  crearEquipo,
  actualizarEquipo,
  desactivarEquipo,
  reactivarEquipo,
} from '@/api/equiposApi';
import { getTorneos } from '@/api/catalogosApi';
import { Equipo, Torneo } from '@/api/types';
import { LoadingView, ErrorView, EmptyView, Button } from '@/components/common';
import { EquipoCard } from '@/components/equipos/EquipoCard';
import { EquipoFormModal } from '@/components/equipos/EquipoFormModal';

export default function EquiposScreen() {
  const router = useRouter();

  // Estados de datos
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<number | undefined>(undefined);
  const [soloActivos, setSoloActivos] = useState(false);

  // Estados de interfaz y feedback (3 estados de cátedra)
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de formulario
  const [modalVisible, setModalVisible] = useState(false);
  const [equipoEditar, setEquipoEditar] = useState<Equipo | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const [listaEquipos, listaTorneos] = await Promise.all([
        getEquipos(torneoSeleccionado, soloActivos),
        getTorneos(false),
      ]);
      setEquipos(listaEquipos);
      setTorneos(listaTorneos);
    } catch (e: any) {
      setError(e.message || 'Error al conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  }, [torneoSeleccionado, soloActivos]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCrearOEditar = async (data: {
    torneoId: number;
    nombre: string;
    barrio: string;
  }) => {
    if (equipoEditar) {
      await actualizarEquipo(equipoEditar.id, data);
      Alert.alert('Éxito', 'Equipo actualizado correctamente');
    } else {
      await crearEquipo(data);
      Alert.alert('Éxito', 'Equipo creado correctamente');
    }
    cargarDatos();
  };

  const handleToggleEstado = (equipo: Equipo) => {
    const accion = equipo.activo ? 'desactivar' : 'reactivar';
    Alert.alert(
      `Confirmar ${accion}`,
      `¿Seguro que deseas ${accion} el equipo "${equipo.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: equipo.activo ? 'destructive' : 'default',
          onPress: async () => {
            try {
              if (equipo.activo) {
                await desactivarEquipo(equipo.id);
              } else {
                await reactivarEquipo(equipo.id);
              }
              cargarDatos();
            } catch (e: any) {
              Alert.alert('Error', e.message || `No se pudo ${accion} el equipo`);
            }
          },
        },
      ]
    );
  };

  const abrirModalCrear = () => {
    setEquipoEditar(null);
    setModalVisible(true);
  };

  const abrirModalEditar = (equipo: Equipo) => {
    setEquipoEditar(equipo);
    setModalVisible(true);
  };

  const irAPlantel = (equipo: Equipo) => {
    router.push({
      pathname: '/jugadores',
      params: { equipoId: equipo.id, nombreEquipo: equipo.nombre },
    });
  };

  return (
    <View style={styles.container}>
      {/* Barra de Filtros y Acción */}
      <View style={styles.filterCard}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Filtros de Búsqueda</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Solo activos</Text>
            <Switch
              value={soloActivos}
              onValueChange={setSoloActivos}
              trackColor={{ false: '#cbd5e1', true: '#bae6fd' }}
              thumbColor={soloActivos ? '#0284c7' : '#f1f5f9'}
            />
          </View>
        </View>

        {/* Selector de Torneos en Horizontal */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: undefined, nombre: 'Todos los Torneos' } as any, ...torneos]}
          keyExtractor={(item) => String(item.id ?? 'todos')}
          contentContainerStyle={styles.torneoFilterList}
          renderItem={({ item }) => {
            const isSelected = torneoSeleccionado === item.id;
            return (
              <TouchableOpacity
                style={[styles.torneoPill, isSelected && styles.torneoPillActive]}
                onPress={() => setTorneoSeleccionado(item.id)}
              >
                <Text
                  style={[
                    styles.torneoPillText,
                    isSelected && styles.torneoPillTextActive,
                  ]}
                >
                  {item.nombre}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        <Button
          title="+ Nuevo Equipo"
          onPress={abrirModalCrear}
          style={styles.nuevoBtn}
        />
      </View>

      {/* Renderizado condicional de los 3 Estados */}
      {cargando ? (
        <LoadingView mensaje="Cargando clubes y equipos..." />
      ) : error ? (
        <ErrorView mensaje={error} onRetry={cargarDatos} />
      ) : equipos.length === 0 ? (
        <EmptyView mensaje="No se encontraron equipos registrados con los filtros seleccionados." />
      ) : (
        <FlatList
          data={equipos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <EquipoCard
              equipo={item}
              onEditar={abrirModalEditar}
              onToggleEstado={handleToggleEstado}
              onVerJugadores={irAPlantel}
            />
          )}
        />
      )}

      {/* Modal Reutilizable de Alta y Edición */}
      <EquipoFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCrearOEditar}
        equipoEditar={equipoEditar}
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
    marginBottom: 10,
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
  torneoFilterList: {
    paddingVertical: 6,
    gap: 8,
  },
  torneoPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  torneoPillActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  torneoPillText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  torneoPillTextActive: {
    color: '#ffffff',
  },
  nuevoBtn: {
    marginTop: 10,
  },
  list: {
    padding: 16,
  },
});
