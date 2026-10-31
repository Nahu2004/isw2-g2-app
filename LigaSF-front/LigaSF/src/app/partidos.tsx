// Pantalla de Programación y Consulta de Partidos
// Diseño Premium Oscuro alineado a LigaSF (Theme)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getPartidos, programarPartido, eliminarPartido } from '@/api/partidosApi';
import { getTorneos } from '@/api/catalogosApi';
import { Partido, Torneo } from '@/api/types';
import { LoadingView, ErrorView, EmptyView } from '@/components/common';
import { ProgramarPartidoModal } from '@/components/partidos/ProgramarPartidoModal';
import { Theme, sectionLabelStyle } from '@/constants/theme';

export default function PartidosScreen() {
  const router = useRouter();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [torneoId, setTorneoId] = useState<number | undefined>(undefined);
  const [numeroFecha, setNumeroFecha] = useState<number | undefined>(undefined);

  // Estados
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const [listaPartidos, listaTorneos] = await Promise.all([
        getPartidos(torneoId, numeroFecha),
        getTorneos(false),
      ]);
      setPartidos(listaPartidos);
      setTorneos(listaTorneos);
    } catch (e: any) {
      setError(e.message || 'Error al conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  }, [torneoId, numeroFecha]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleProgramar = async (data: any) => {
    try {
      await programarPartido(data);
      if (Platform.OS === 'web') {
        window.alert('Partido programado satisfactoriamente.');
      } else {
        Alert.alert('Éxito', 'Partido programado satisfactoriamente.');
      }
      cargarDatos();
    } catch (e: any) {
      const msg = e.message || 'No se pudo programar el partido';
      if (Platform.OS === 'web') {
        window.alert('Error al programar: ' + msg);
      } else {
        Alert.alert('Error al programar', msg);
      }
      throw e;
    }
  };

  const ejecutarCancelacion = async (partido: Partido) => {
    try {
      await eliminarPartido(partido.id);
      if (Platform.OS === 'web') {
        window.alert('Partido cancelado satisfactoriamente.');
      } else {
        Alert.alert('Éxito', 'Partido cancelado');
      }
      cargarDatos();
    } catch (e: any) {
      const err = e.message || 'No se pudo eliminar el partido';
      if (Platform.OS === 'web') {
        window.alert('Error: ' + err);
      } else {
        Alert.alert('Error', err);
      }
    }
  };

  const handleEliminar = (partido: Partido) => {
    if (partido.estado !== 'PROGRAMADO') {
      const msg = 'Solo se pueden cancelar partidos que estén en estado PROGRAMADO.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Acción no permitida', msg);
      }
      return;
    }

    const mensaje = `¿Deseas desprogramar el encuentro ${(partido.nombreEquipoLocal || 'Local')} vs ${(partido.nombreEquipoVisitante || 'Visitante')}?`;

    if (Platform.OS === 'web') {
      if (window.confirm(mensaje)) {
        ejecutarCancelacion(partido);
      }
    } else {
      Alert.alert(
        'Cancelar Partido',
        mensaje,
        [
          { text: 'Volver', style: 'cancel' },
          {
            text: 'Desprogramar',
            style: 'destructive',
            onPress: () => ejecutarCancelacion(partido),
          },
        ]
      );
    }
  };

  const formatearFechaHora = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return `${d.toLocaleDateString()} - ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs`;
    } catch {
      return isoStr;
    }
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
        <Text style={styles.headerTitle}>Partidos y Fixture</Text>
      </View>

      {/* Panel de Filtros */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>FILTRAR ENCUENTROS</Text>

        {/* Torneos */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: undefined, nombre: 'Todos los Torneos' } as any, ...torneos]}
          keyExtractor={(item) => String(item.id ?? 'todos')}
          contentContainerStyle={styles.torneoFilterList}
          renderItem={({ item }) => {
            const isSel = torneoId === item.id;
            return (
              <TouchableOpacity
                style={[styles.torneoPill, isSel && styles.torneoPillActive]}
                onPress={() => setTorneoId(item.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.torneoPillText, isSel && styles.torneoPillTextActive]}>
                  {item.nombre}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Fechas */}
        <View style={styles.fechasRow}>
          <Text style={styles.fechasLabel}>FECHA:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fechasList}>
            {[undefined, 1, 2, 3, 4, 5, 6].map((f) => {
              const isSel = numeroFecha === f;
              return (
                <TouchableOpacity
                  key={String(f ?? 'todas')}
                  style={[styles.fechaPill, isSel && styles.fechaPillActive]}
                  onPress={() => setNumeroFecha(f)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.fechaPillText, isSel && styles.fechaPillTextActive]}>
                    {f === undefined ? 'Todas' : `F${f}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Botón CTA Nuevo Partido */}
        <TouchableOpacity
          style={styles.nuevoBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.nuevoBtnText}>+ PROGRAMAR PARTIDO</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Partidos */}
      <View style={styles.listContainer}>
        {cargando ? (
          <LoadingView mensaje="Cargando fixture y partidos..." />
        ) : error ? (
          <ErrorView mensaje={error} onRetry={cargarDatos} />
        ) : partidos.length === 0 ? (
          <EmptyView mensaje="No se encontraron partidos programados con los filtros seleccionados." />
        ) : (
          <FlatList
            data={partidos}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const esProgramado = item.estado === 'PROGRAMADO';
              const esEnJuego = item.estado === 'EN_JUEGO';
              const esFinalizado = item.estado === 'FINALIZADO';

              const franjaColor = esEnJuego
                ? Theme.status.success.text
                : esProgramado
                ? Theme.accent.DEFAULT
                : Theme.status.neutral.text;

              const badgeBg = esEnJuego
                ? Theme.status.success.bg
                : esProgramado
                ? Theme.accent.dim
                : Theme.status.neutral.bg;

              const badgeBorder = esEnJuego
                ? Theme.status.success.border
                : esProgramado
                ? Theme.border.active
                : Theme.status.neutral.border;

              const badgeText = esEnJuego
                ? Theme.status.success.text
                : esProgramado
                ? Theme.accent.DEFAULT
                : Theme.status.neutral.text;

              return (
                <View style={styles.matchCard}>
                  {/* Franja de estado */}
                  <View style={[styles.franja, { backgroundColor: franjaColor }]} />

                  <View style={styles.matchBody}>
                    {/* Header de la card */}
                    <View style={styles.matchHeader}>
                      <Text style={styles.fechaBadgeText}>FECHA {item.numeroFecha}</Text>
                      <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                        <Text style={[styles.badgeText, { color: badgeText }]}>{item.estado}</Text>
                      </View>
                    </View>

                    {/* Enfrentamiento y Marcador */}
                    <View style={styles.versusContainer}>
                      <View style={styles.teamCol}>
                        <Text style={styles.teamName} numberOfLines={2}>
                          {item.nombreEquipoLocal || `Equipo #${item.equipoLocalId}`}
                        </Text>
                      </View>

                      <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>
                          {item.golesLocal ?? '-'} : {item.golesVisitante ?? '-'}
                        </Text>
                        <Text style={styles.vsLabel}>VS</Text>
                      </View>

                      <View style={[styles.teamCol, { alignItems: 'flex-end' }]}>
                        <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={2}>
                          {item.nombreEquipoVisitante || `Equipo #${item.equipoVisitanteId}`}
                        </Text>
                      </View>
                    </View>

                    {/* Detalles */}
                    <View style={styles.detailsBox}>
                      <Text style={styles.detailText}>
                        🏟️ Cancha: <Text style={styles.highlight}>{item.nombreCancha || item.canchaId}</Text>
                      </Text>
                      <Text style={styles.detailText}>
                        🧑‍⚖️ Árbitro: <Text style={styles.highlight}>{item.nombreArbitro || item.arbitroId}</Text>
                      </Text>
                      <Text style={styles.detailText}>
                        🕒 Horario: <Text style={styles.highlight}>{formatearFechaHora(item.fechaHoraInicio)}</Text>
                      </Text>
                    </View>

                    {/* Acciones */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.liveBtn}
                        onPress={() => router.push(`/partido-en-vivo?id=${item.id}` as any)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.liveBtnText}>🔴 Ver / Operar en Vivo</Text>
                      </TouchableOpacity>

                      {esProgramado && (
                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => handleEliminar(item)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.cancelBtnText}>Cancelar Encuentro</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Modal Programación */}
      <ProgramarPartidoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleProgramar}
        torneoIdDefault={torneoId}
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
  filterTitle: {
    ...sectionLabelStyle,
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
  fechasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  fechasLabel: {
    ...sectionLabelStyle,
    color: Theme.text.secondary,
  },
  fechasList: {
    gap: Theme.spacing.xs,
  },
  fechaPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.sm,
    backgroundColor: Theme.bg.input,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
  },
  fechaPillActive: {
    backgroundColor: Theme.accent.dim,
    borderColor: Theme.border.active,
  },
  fechaPillText: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
    fontWeight: Theme.font.weight.semibold,
  },
  fechaPillTextActive: {
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
  listPadding: {
    padding: Theme.spacing.md,
  },
  matchCard: {
    flexDirection: 'row',
    backgroundColor: Theme.bg.card,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    marginBottom: Theme.spacing.sm,
    overflow: 'hidden',
  },
  franja: {
    width: 3,
  },
  matchBody: {
    flex: 1,
    padding: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fechaBadgeText: {
    ...sectionLabelStyle,
    color: Theme.text.secondary,
  },
  badge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: Theme.font.size.xs,
    fontWeight: Theme.font.weight.bold,
    letterSpacing: Theme.font.letterSpacing.wide,
  },
  versusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.bg.input,
    borderRadius: Theme.radius.sm,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
  },
  teamCol: {
    flex: 1,
  },
  teamName: {
    fontSize: Theme.font.size.md,
    fontWeight: Theme.font.weight.bold,
    color: Theme.text.primary,
  },
  scoreContainer: {
    paddingHorizontal: Theme.spacing.md,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: Theme.font.size.xl,
    fontWeight: Theme.font.weight.black,
    color: Theme.accent.DEFAULT,
    fontVariant: ['tabular-nums'],
  },
  vsLabel: {
    fontSize: 10,
    color: Theme.text.secondary,
    fontWeight: Theme.font.weight.bold,
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: Theme.bg.input,
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    gap: 3,
  },
  detailText: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
  },
  highlight: {
    color: Theme.text.primary,
    fontWeight: Theme.font.weight.semibold,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    justifyContent: 'flex-end',
    marginTop: Theme.spacing.xs,
  },
  liveBtn: {
    backgroundColor: Theme.bg.input,
    borderWidth: 1,
    borderColor: Theme.border.active,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.sm,
  },
  liveBtnText: {
    color: Theme.accent.DEFAULT,
    fontSize: Theme.font.size.xs,
    fontWeight: Theme.font.weight.bold,
  },
  cancelBtn: {
    backgroundColor: Theme.status.danger.bg,
    borderWidth: 1,
    borderColor: Theme.status.danger.border,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.sm,
  },
  cancelBtnText: {
    color: Theme.status.danger.text,
    fontSize: Theme.font.size.xs,
    fontWeight: Theme.font.weight.bold,
  },
});
