// Pantalla de Equipos — diseño premium oscuro alineado a LigaSF
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
import { LoadingView, ErrorView, EmptyView } from '@/components/common';
import { EquipoCard } from '@/components/equipos/EquipoCard';
import { EquipoFormModal } from '@/components/equipos/EquipoFormModal';
import { Theme, sectionLabelStyle } from '@/constants/theme';

export default function EquiposScreen() {
  const router = useRouter();

  // Estados de datos
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<number | undefined>(undefined);
  const [soloActivos, setSoloActivos] = useState(false);

  // Estados de feedback
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
        <Text style={styles.headerTitle}>Equipos</Text>
      </View>

      {/* Panel de Filtros y Acción */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>FILTROS Y TORNEO</Text>
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

        {/* Selector de Torneos */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: undefined, nombre: 'Todos' } as any, ...torneos]}
          keyExtractor={(item) => String(item.id ?? 'todos')}
          contentContainerStyle={styles.torneoFilterList}
          renderItem={({ item }) => {
            const isSelected = torneoSeleccionado === item.id;
            return (
              <TouchableOpacity
                style={[styles.torneoPill, isSelected && styles.torneoPillActive]}
                onPress={() => setTorneoSeleccionado(item.id)}
                activeOpacity={0.7}
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

        {/* Botón de creación */}
        <TouchableOpacity
          style={styles.nuevoBtn}
          onPress={abrirModalCrear}
          activeOpacity={0.8}
        >
          <Text style={styles.nuevoBtnText}>+ NUEVO EQUIPO</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Equipos con estados de carga */}
      <View style={styles.listContainer}>
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
            showsVerticalScrollIndicator={false}
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
      </View>

      {/* Modal Reutilizable de Alta y Edición */}
      <EquipoFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCrearOEditar}
        equipoEditar={equipoEditar}
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
  torneoFilterList: {
    gap: Theme.spacing.xs,
    paddingVertical: 2,
  },
  torneoPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radius.sm,
    backgroundColor: Theme.bg.input,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
  },
  torneoPillActive: {
    backgroundColor: Theme.accent.dim,
    borderColor: Theme.border.active,
  },
  torneoPillText: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
    fontWeight: Theme.font.weight.semibold,
  },
  torneoPillTextActive: {
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
