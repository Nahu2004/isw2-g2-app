import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { partidosService } from '@/api/partidosService';
import { eventosService } from '@/api/eventosService';
import { jugadoresService } from '@/api/jugadoresService';
import { Partido, EventoPartido, Jugador, EstadoPartido, TipoEvento } from '@/api/types';
import { Button, EstadoBadge, ConfirmationModal } from '@/components/common';
import { RegistrarEventoModal } from './RegistrarEventoModal';
import { EventosTimeline } from './EventosTimeline';

interface ToastState {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const PartidoEnVivoPage: React.FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const partidoId = params.id ? parseInt(params.id as string, 10) : 1;

  const [partido, setPartido] = useState<Partido | null>(null);
  const [eventos, setEventos] = useState<EventoPartido[]>([]);
  const [jugadoresLocal, setJugadoresLocal] = useState<Jugador[]>([]);
  const [jugadoresVisitante, setJugadoresVisitante] = useState<Jugador[]>([]);

  const [cargando, setCargando] = useState<boolean>(true);
  const [refrescando, setRefrescando] = useState<boolean>(false);
  const [procesandoEstado, setProcesandoEstado] = useState<boolean>(false);
  const [deletingEventoId, setDeletingEventoId] = useState<number | null>(null);

  const [toast, setToast] = useState<ToastState | null>(null);
  const [modalEventoVisible, setModalEventoVisible] = useState<boolean>(false);

  const [confirmEstadoModal, setConfirmEstadoModal] = useState<{
    visible: boolean;
    nuevoEstado: EstadoPartido | null;
    titulo: string;
    mensaje: string;
    esDestructivo: boolean;
  }>({
    visible: false,
    nuevoEstado: null,
    titulo: '',
    mensaje: '',
    esDestructivo: false,
  });

  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    visible: boolean;
    evento: EventoPartido | null;
  }>({
    visible: false,
    evento: null,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const cargarDatos = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefrescando(true);
      else setCargando(true);

      const [partidoData, eventosData] = await Promise.all([
        partidosService.getPartidoById(partidoId),
        eventosService.getEventosByPartido(partidoId),
      ]);

      setPartido(partidoData);
      setEventos(eventosData);

      if (partidoData?.equipoLocalId && partidoData?.equipoVisitanteId) {
        const [plantelLocal, plantelVisitante] = await Promise.all([
          jugadoresService.getJugadores(partidoData.equipoLocalId, true),
          jugadoresService.getJugadores(partidoData.equipoVisitanteId, true),
        ]);
        setJugadoresLocal(plantelLocal);
        setJugadoresVisitante(plantelVisitante);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.mensaje ||
        err?.message ||
        'Error al cargar el partido';
      showToast(msg, 'error');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [partidoId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const scoreCalculado = useMemo(() => {
    if (!partido) return { local: 0, visitante: 0 };
    let local = 0;
    let visitante = 0;
    eventos.forEach((ev) => {
      if (ev.tipo === 'GOL') {
        if (ev.equipoId === partido.equipoLocalId) {
          local++;
        } else if (ev.equipoId === partido.equipoVisitanteId) {
          visitante++;
        }
      }
    });
    return {
      local: local > 0 || eventos.length > 0 ? local : (partido.golesLocal ?? 0),
      visitante: visitante > 0 || eventos.length > 0 ? visitante : (partido.golesVisitante ?? 0),
    };
  }, [partido, eventos]);

  const partidoEnJuego = partido?.estado === 'EN_JUEGO';
  const partidoFinalizadoOSuspendido =
    partido?.estado === 'FINALIZADO' || partido?.estado === 'SUSPENDIDO';

  const solicitarCambioEstado = (nuevoEstado: EstadoPartido) => {
    if (!partido) return;

    if (nuevoEstado === 'EN_JUEGO') {
      setConfirmEstadoModal({
        visible: true,
        nuevoEstado: 'EN_JUEGO',
        titulo: 'Iniciar Encuentro',
        mensaje: '¿Deseas dar inicio al partido? Se habilitará la carga de incidencias en vivo.',
        esDestructivo: false,
      });
    } else if (nuevoEstado === 'FINALIZADO') {
      setConfirmEstadoModal({
        visible: true,
        nuevoEstado: 'FINALIZADO',
        titulo: 'Finalizar Partido (Irreversible)',
        mensaje:
          '¿Confirmas la finalización del partido? Una vez finalizado no se podrán agregar ni modificar más incidencias.',
        esDestructivo: true,
      });
    } else if (nuevoEstado === 'SUSPENDIDO') {
      setConfirmEstadoModal({
        visible: true,
        nuevoEstado: 'SUSPENDIDO',
        titulo: 'Suspender Partido (Irreversible)',
        mensaje:
          '¿Estás seguro de suspender este partido? Este estado es definitivo y bloqueará futuras modificaciones.',
        esDestructivo: true,
      });
    }
  };

  const ejecutarCambioEstado = async () => {
    if (!partido || !confirmEstadoModal.nuevoEstado) return;
    const nuevoEstado = confirmEstadoModal.nuevoEstado;

    try {
      setProcesandoEstado(true);
      const partidoActualizado = await partidosService.cambiarEstadoPartido(
        partido.id,
        nuevoEstado
      );
      setPartido(partidoActualizado);
      setConfirmEstadoModal((prev) => ({ ...prev, visible: false }));
      showToast(`Estado del partido actualizado a ${nuevoEstado}`, 'success');
      cargarDatos(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.mensaje ||
        err?.message ||
        'Error al cambiar el estado del partido';
      showToast(msg, 'error');
    } finally {
      setProcesandoEstado(false);
    }
  };

  const handleRegistrarEvento = async (datos: {
    jugadorId: number;
    tipo: TipoEvento;
    minuto: number;
  }) => {
    if (!partido) return;
    const nuevoEvento = await eventosService.registrarEvento(partido.id, datos);
    setEventos((prev) => [...prev, nuevoEvento]);
    showToast(`${nuevoEvento.tipo} registrado en el minuto ${nuevoEvento.minuto}'`, 'success');
    cargarDatos(true);
  };

  const solicitarEliminarEvento = (evento: EventoPartido) => {
    if (!partidoEnJuego) {
      Alert.alert(
        'Operación no permitida',
        'Solo se pueden corregir o eliminar eventos mientras el partido está EN_JUEGO.'
      );
      return;
    }
    setConfirmDeleteModal({
      visible: true,
      evento,
    });
  };

  const ejecutarEliminarEvento = async () => {
    const evento = confirmDeleteModal.evento;
    if (!evento) return;

    try {
      setDeletingEventoId(evento.id);
      await eventosService.eliminarEvento(evento.id);
      setEventos((prev) => prev.filter((e) => e.id !== evento.id));
      setConfirmDeleteModal({ visible: false, evento: null });
      showToast('Incidencia eliminada correctamente', 'success');
      cargarDatos(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.mensaje ||
        err?.message ||
        'Error al eliminar el evento';
      showToast(msg, 'error');
    } finally {
      setDeletingEventoId(null);
    }
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#7DD3FC" />
          <Text style={styles.loadingText}>Conectando con la mesa de control en vivo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!partido) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingCenter}>
          <Text style={styles.emptyTitle}>Partido no encontrado</Text>
          <Button title="Volver a Partidos" onPress={() => router.push('/partidos' as any)} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={() => cargarDatos(true)} tintColor="#7DD3FC" />
        }
      >
        {/* Toast Alert */}
        {toast && (
          <View
            style={[
              styles.toast,
              toast.type === 'error' && styles.toastError,
              toast.type === 'success' && styles.toastSuccess,
            ]}
          >
            <Text style={styles.toastIcon}>
              {toast.type === 'error' ? '⚠️' : toast.type === 'success' ? '✅' : 'ℹ️'}
            </Text>
            <Text style={styles.toastText}>{toast.message}</Text>
            <TouchableOpacity onPress={() => setToast(null)}>
              <Text style={styles.toastClose}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Barra superior de navegación */}
        <View style={styles.topInfoRow}>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.push('/partidos' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.backLinkText}>← Lista de Partidos</Text>
          </TouchableOpacity>
          <View style={styles.userInfoBadge}>
            <Text style={styles.userRoleText}>
              👤 {user?.nombreCompleto || user?.username} ({user?.rol})
            </Text>
          </View>
        </View>

        {/* Tarjeta de Marcador Central */}
        <View style={styles.scoreCard}>
          <View style={styles.tournamentRow}>
            <Text style={styles.tournamentName}>
              🏆 {partido.nombreTorneo || 'Torneo Oficial'} • Fecha #{partido.numeroFecha}
            </Text>
            <EstadoBadge estado={partido.estado} />
          </View>

          {/* Enfrentamiento */}
          <View style={styles.matchupContainer}>
            <View style={styles.teamCol}>
              <View style={styles.teamBadgeCircle}>
                <Text style={styles.teamBadgeIcon}>🛡️</Text>
              </View>
              <Text style={styles.teamNameText} numberOfLines={2}>
                {partido.nombreEquipoLocal || `Local #${partido.equipoLocalId}`}
              </Text>
              <View style={styles.sidePill}>
                <Text style={styles.teamSideLabel}>LOCAL</Text>
              </View>
            </View>

            <View style={styles.scoreCenter}>
              <View style={styles.scoreBoard}>
                <Text style={styles.scoreNumber}>{scoreCalculado.local}</Text>
                <Text style={styles.scoreDivider}>:</Text>
                <Text style={styles.scoreNumber}>{scoreCalculado.visitante}</Text>
              </View>
              <View style={[styles.liveClockBadge, partidoEnJuego && styles.liveClockBadgeActive]}>
                <View style={[styles.liveClockDot, partidoEnJuego && styles.liveClockDotPulse]} />
                <Text style={styles.liveClockText}>
                  {partido.estado === 'EN_JUEGO'
                    ? 'EN VIVO'
                    : partido.estado === 'FINALIZADO'
                    ? 'FINAL'
                    : partido.estado === 'SUSPENDIDO'
                    ? 'SUSP'
                    : 'PROGRAMADO'}
                </Text>
              </View>
            </View>

            <View style={styles.teamCol}>
              <View style={styles.teamBadgeCircle}>
                <Text style={styles.teamBadgeIcon}>🛡️</Text>
              </View>
              <Text style={styles.teamNameText} numberOfLines={2}>
                {partido.nombreEquipoVisitante || `Visitante #${partido.equipoVisitanteId}`}
              </Text>
              <View style={styles.sidePill}>
                <Text style={styles.teamSideLabel}>VISITANTE</Text>
              </View>
            </View>
          </View>

          {/* Metadatos: Cancha, Árbitro, Horario */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>🏟️ CANCHA</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {partido.canchaNombre || partido.nombreCancha || `Cancha #${partido.canchaId}`}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>🧑‍⚖️ ÁRBITRO PRINCIPAL</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {partido.arbitroNombre || partido.nombreArbitro || `Árbitro #${partido.arbitroId}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Controles del Ciclo de Vida del Partido (RN-05) */}
        <View style={styles.lifecycleCard}>
          <View style={styles.cardHeaderSmall}>
            <Text style={styles.sectionHeaderTitle}>Control de Ciclo de Vida (RN-05)</Text>
            <Text style={styles.sectionHeaderSubtitle}>
              PROGRAMADO ➔ EN JUEGO ➔ FINALIZADO (o SUSPENDIDO)
            </Text>
          </View>

          <View style={styles.lifecycleButtons}>
            {partido.estado === 'PROGRAMADO' && (
              <>
                <Button
                  title="▶️ Iniciar Partido"
                  variant="success"
                  onPress={() => solicitarCambioEstado('EN_JUEGO')}
                  loading={procesandoEstado}
                  style={styles.actionButton}
                />
                <Button
                  title="⚠️ Suspender"
                  variant="danger"
                  onPress={() => solicitarCambioEstado('SUSPENDIDO')}
                  loading={procesandoEstado}
                  style={styles.actionButton}
                />
              </>
            )}

            {partido.estado === 'EN_JUEGO' && (
              <>
                <Button
                  title="🏁 Finalizar Partido"
                  variant="primary"
                  onPress={() => solicitarCambioEstado('FINALIZADO')}
                  loading={procesandoEstado}
                  style={styles.actionButton}
                />
                <Button
                  title="⚠️ Suspender"
                  variant="danger"
                  onPress={() => solicitarCambioEstado('SUSPENDIDO')}
                  loading={procesandoEstado}
                  style={styles.actionButton}
                />
              </>
            )}

            {partidoFinalizadoOSuspendido && (
              <View style={styles.irreversibleBanner}>
                <Text style={styles.irreversibleText}>
                  🔒 El encuentro se encuentra en estado{' '}
                  <Text style={styles.bold}>{partido.estado}</Text>. Esta condición es definitiva
                  e irreversible según el reglamento oficial (RN-05).
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Sección Registro de Incidencias (RN-04) */}
        <View style={styles.eventsCard}>
          <View style={styles.eventsHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeaderTitle}>Incidencias y Cronología</Text>
              <Text style={styles.sectionHeaderSubtitle}>
                {partidoEnJuego
                  ? 'Partido en curso. Puedes registrar goles, tarjetas amarillas y rojas.'
                  : 'La carga y corrección de incidencias solo se admite con el partido EN JUEGO.'}
              </Text>
            </View>

            <Button
              title="➕ Cargar Incidencia"
              variant={partidoEnJuego ? 'primary' : 'secondary'}
              disabled={!partidoEnJuego}
              onPress={() => setModalEventoVisible(true)}
              style={styles.btnNuevoEvento}
            />
          </View>

          {/* Línea de tiempo */}
          <EventosTimeline
            eventos={eventos}
            partidoEnJuego={partidoEnJuego}
            onEliminarEvento={solicitarEliminarEvento}
            deletingId={deletingEventoId}
          />
        </View>

        {/* Modales */}
        <RegistrarEventoModal
          visible={modalEventoVisible}
          onClose={() => setModalEventoVisible(false)}
          onSubmit={handleRegistrarEvento}
          jugadoresLocal={jugadoresLocal}
          jugadoresVisitante={jugadoresVisitante}
          nombreEquipoLocal={partido.nombreEquipoLocal || 'Local'}
          nombreEquipoVisitante={partido.nombreEquipoVisitante || 'Visitante'}
        />

        <ConfirmationModal
          visible={confirmEstadoModal.visible}
          title={confirmEstadoModal.titulo}
          message={confirmEstadoModal.mensaje}
          isDestructive={confirmEstadoModal.esDestructivo}
          isLoading={procesandoEstado}
          onConfirm={ejecutarCambioEstado}
          onCancel={() =>
            setConfirmEstadoModal((prev) => ({ ...prev, visible: false, nuevoEstado: null }))
          }
        />

        <ConfirmationModal
          visible={confirmDeleteModal.visible}
          title="Corregir Incidencia"
          message={`¿Deseas anular el registro de ${confirmDeleteModal.evento?.tipo} al jugador ${
            confirmDeleteModal.evento?.jugadorNombreCompleto ||
            `#${confirmDeleteModal.evento?.jugadorId}`
          } en el minuto ${confirmDeleteModal.evento?.minuto}'?`}
          confirmText="Eliminar Incidencia"
          isDestructive={true}
          isLoading={deletingEventoId !== null}
          onConfirm={ejecutarEliminarEvento}
          onCancel={() => setConfirmDeleteModal({ visible: false, evento: null })}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 860,
    alignSelf: 'center',
    width: '100%',
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#7DD3FC',
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
  },
  backLinkText: {
    color: '#7DD3FC',
    fontSize: 13,
    fontWeight: '700',
  },
  userInfoBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
  },
  userRoleText: {
    color: '#A3A3A3',
    fontSize: 12,
    fontWeight: '600',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A4A',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#7DD3FC',
  },
  toastError: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderColor: 'rgba(220, 38, 38, 0.4)',
  },
  toastSuccess: {
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderColor: 'rgba(22, 163, 74, 0.4)',
  },
  toastIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  toastClose: {
    color: '#A3A3A3',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scoreCard: {
    backgroundColor: '#161616',
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#262626',
    ...Platform.select({
      web: {
        boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.5)',
      } as any,
    }),
  },
  tournamentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    paddingBottom: 12,
  },
  tournamentName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  matchupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  teamBadgeCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  teamBadgeIcon: {
    fontSize: 26,
  },
  teamNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  sidePill: {
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#262626',
  },
  teamSideLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#A3A3A3',
    letterSpacing: 0.8,
  },
  scoreCenter: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#7DD3FC',
    ...Platform.select({
      web: {
        boxShadow: '0 0 25px rgba(125, 211, 252, 0.15)',
      } as any,
    }),
  },
  scoreNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    minWidth: 44,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  scoreDivider: {
    fontSize: 34,
    fontWeight: '800',
    color: '#7DD3FC',
    marginHorizontal: 4,
  },
  liveClockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    gap: 6,
  },
  liveClockBadgeActive: {
    backgroundColor: 'rgba(4, 120, 87, 0.3)',
    borderColor: '#059669',
  },
  liveClockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A3A3A3',
  },
  liveClockDotPulse: {
    backgroundColor: '#4ade80',
  },
  liveClockText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#262626',
    gap: 12,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: '#7DD3FC',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  lifecycleCard: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  cardHeaderSmall: {
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  sectionHeaderSubtitle: {
    fontSize: 12,
    color: '#A3A3A3',
    marginTop: 3,
  },
  lifecycleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  irreversibleBanner: {
    flex: 1,
    backgroundColor: 'rgba(125, 211, 252, 0.05)',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#7DD3FC',
    borderWidth: 1,
    borderColor: '#262626',
  },
  irreversibleText: {
    fontSize: 13,
    color: '#A3A3A3',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  eventsCard: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#262626',
  },
  eventsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  btnNuevoEvento: {
    minWidth: 160,
  },
});

export default PartidoEnVivoPage;
