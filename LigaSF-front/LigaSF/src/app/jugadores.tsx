// Pantalla de Jugadores — diseño premium oscuro alineado a LigaSF
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  getJugadores,
  crearJugador,
  actualizarJugador,
  desactivarJugador,
  reactivarJugador,
} from '@/api/jugadoresApi';
import { getEquipos } from '@/api/equiposApi';
import { Jugador, Equipo } from '@/api/types';
import { LoadingView, ErrorView, EmptyView } from '@/components/common';
import { JugadorCard } from '@/components/jugadores/JugadorCard';
import { JugadorFormModal } from '@/components/jugadores/JugadorFormModal';
import { Theme, sectionLabelStyle } from '@/constants/theme';

export default function JugadoresScreen() {
  const router = useRouter();
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

  const abrirModalCrear = () => {
    setJugadorEditar(null);
    setModalVisible(true);
  };

  const abrirModalEditar = (jugador: Jugador) => {
    setJugadorEditar(jugador);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.bg.base} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {params.nombreEquipo ? `Plantel: ${params.nombreEquipo}` : 'Jugadores'}
        </Text>
      </View>

      {/* Panel de Filtros y Acción */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>FILTROS POR CLUB</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Solo activos</Text>
            <Switch
              value={soloActivos}
              onValueChange={setSoloActivos}
              trackColor={{ false: Theme.border.subtle, true: Theme.accent.dim }}
              thumbColor={soloActivos ? Theme.accent.DEFAULT : Theme.text.secondary}
            />
          </View>
        </View>

        {/* Selector horizontal de equipos */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: undefined, nombre: 'Todos' } as any, ...equipos]}
          keyExtractor={(item) => String(item.id ?? 'todos')}
          contentContainerStyle={styles.equipoFilterList}
          renderItem={({ item }) => {
            const isSelected = equipoSeleccionado === item.id;
            return (
              <TouchableOpacity
                style={[styles.equipoPill, isSelected && styles.equipoPillActive]}
                onPress={() => setEquipoSeleccionado(item.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.equipoPillText,
                    isSelected && styles.equipoPillTextActive,
                  ]}
                >
                  {item.nombre}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Botón de creación */}
        <TouchableOpacity
          style={styles.nuevoBtn}
          onPress={abrirModalCrear}
          activeOpacity={0.8}
        >
          <Text style={styles.nuevoBtnText}>+ REGISTRAR JUGADOR</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Jugadores */}
      <View style={styles.listContainer}>
        {cargando ? (
          <LoadingView mensaje="Cargando jugadores..." />
        ) : error ? (
          <ErrorView mensaje={error} onRetry={cargarDatos} />
        ) : jugadores.length === 0 ? (
          <EmptyView mensaje="No hay jugadores registrados con los filtros seleccionados." />
        ) : (
          <FlatList
            data={jugadores}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <JugadorCard
                jugador={item}
                onEditar={abrirModalEditar}
                onToggleEstado={handleToggleEstado}
              />
            )}
          />
        )}
      </View>

      {/* Modal Reutilizable de Alta y Edición */}
      <JugadorFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCrearOEditar}
        jugadorEditar={jugadorEditar}
        equipoIdDefault={equipoSeleccionado}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.bg.base,
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border.subtle,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  backArrow: {
    color: Theme.accent.DEFAULT,
    fontSize: 22,
    lineHeight: 22,
    marginRight: 4,
    fontWeight: '300',
  },
  backText: {
    color: Theme.accent.DEFAULT,
    fontSize: Theme.font.size.sm,
    fontWeight: Theme.font.weight.semibold,
  },
  headerTitle: {
    fontSize: Theme.font.size.xxl,
    fontWeight: Theme.font.weight.bold,
    color: Theme.text.primary,
    letterSpacing: Theme.font.letterSpacing.tight,
  },
  filterSection: {
    backgroundColor: Theme.bg.card,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border.subtle,
    gap: Theme.spacing.sm,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTitle: {
    ...sectionLabelStyle,
    color: Theme.text.secondary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  switchLabel: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
  },
  equipoFilterList: {
    gap: Theme.spacing.xs,
    paddingVertical: 2,
  },
  equipoPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radius.sm,
    backgroundColor: Theme.bg.input,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
  },
  equipoPillActive: {
    backgroundColor: Theme.accent.dim,
    borderColor: Theme.border.active,
  },
  equipoPillText: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
    fontWeight: Theme.font.weight.semibold,
  },
  equipoPillTextActive: {
    color: Theme.accent.DEFAULT,
  },
  nuevoBtn: {
    backgroundColor: Theme.accent.DEFAULT,
    paddingVertical: 10,
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Theme.spacing.xs,
  },
  nuevoBtnText: {
    color: '#0A0A0A',
    fontWeight: Theme.font.weight.black,
    fontSize: Theme.font.size.xs,
    letterSpacing: Theme.font.letterSpacing.wide,
  },
  listContainer: {
    flex: 1,
    backgroundColor: Theme.bg.base,
  },
  list: {
    padding: Theme.spacing.md,
  },
});
