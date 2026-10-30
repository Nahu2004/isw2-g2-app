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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { partidosService } from '@/api/partidosService';
import { eventosService } from '@/api/eventosService';
import { jugadoresService } from '@/api/jugadoresService';
import { Partido, EventoPartido, Jugador, EstadoPartido, TipoEvento } from '@/api/types';
import { Card, Button, EstadoBadge, ConfirmationModal } from '@/components/common';
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

  // ID de partido desde query params (ej: /partido-en-vivo?id=5) o fallback 1
  const partidoId = params.id ? parseInt(params.id as string, 10) : 1;

  // Estado del partido y eventos
  const [partido, setPartido] = useState<Partido | null>(null);
  const [eventos, setEventos] = useState<EventoPartido[]>([]);
  const [jugadoresLocal, setJugadoresLocal] = useState<Jugador[]>([]);
  const [jugadoresVisitante, setJugadoresVisitante] = useState<Jugador[]>([]);

  // Estados de carga
  const [cargando, setCargando] = useState<boolean>(true);
  const [refrescando, setRefrescando] = useState<boolean>(false);
  const [procesandoEstado, setProcesandoEstado] = useState<boolean>(false);
  const [deletingEventoId, setDeletingEventoId] = useState<number | null>(null);

  // Mensaje Toast / Banner informativo
  const [toast, setToast] = useState<ToastState | null>(null);

  // Modal para registrar evento
  const [modalEventoVisible, setModalEventoVisible] = useState<boolean>(false);

  // Modal confirmación para cambio de estado
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

  // Modal confirmación para eliminar incidencia
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

  // Carga inicial y recarga
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

      // Cargar planteles de ambos equipos para el select de incidencias (solo jugadores activos)
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

  // Recalcular goles a partir de la lista de eventos para actualización reactiva en pantalla
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

  // Manejo de cambio de estado (RN-05)
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

  // Registro de nuevo evento
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

  // Eliminación de evento (solo permitido si está EN_JUEGO)
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
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Cargando panel de partido en vivo...</Text>
      </View>
    );
  }

  if (!partido) {
    return (
      <View style={styles.loadingCenter}>
        <Text style={styles.emptyTitle}>Partido no encontrado</Text>
        <Button title="Volver a Partidos" onPress={() => router.push('/partidos' as any)} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={() => cargarDatos(true)} />
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

      {/* Header Info */}
      <View style={styles.topInfoRow}>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => router.push('/partidos' as any)}
        >
          <Text style={styles.backLinkText}>← Lista de Partidos</Text>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.userRoleText}>
            👤 {user?.nombreCompleto || user?.username} ({user?.rol})
          </Text>
        </View>
      </View>

      {/* Tarjeta de Marcador Central */}
      <Card style={styles.scoreCard}>
        <View style={styles.tournamentRow}>
          <Text style={styles.tournamentName}>
            🏆 {partido.nombreTorneo || 'Torneo Oficial'} - Fecha #{partido.numeroFecha}
          </Text>
          <EstadoBadge estado={partido.estado} />
        </View>

        {/* Marcador */}
        <View style={styles.matchupContainer}>
          <View style={styles.teamCol}>
            <Text style={styles.teamBadgeIcon}>🛡️</Text>
            <Text style={styles.teamNameText} numberOfLines={2}>
              {partido.nombreEquipoLocal || `Local #${partido.equipoLocalId}`}
            </Text>
            <Text style={styles.teamSideLabel}>LOCAL</Text>
          </View>

          <View style={styles.scoreCenter}>
            <View style={styles.scoreBoard}>
              <Text style={styles.scoreNumber}>{scoreCalculado.local}</Text>
              <Text style={styles.scoreDivider}>:</Text>
              <Text style={styles.scoreNumber}>{scoreCalculado.visitante}</Text>
            </View>
            <View style={styles.liveClockBadge}>
              <Text style={styles.liveClockDot}>●</Text>
              <Text style={styles.liveClockText}>
                {partido.estado === 'EN_JUEGO'
                  ? 'EN VIVO'
                  : partido.estado === 'FINALIZADO'
                  ? 'FINAL'
                  : partido.estado === 'SUSPENDIDO'
                  ? 'SUSP'
                  : 'PROG'}
              </Text>
            </View>
          </View>

          <View style={styles.teamCol}>
            <Text style={styles.teamBadgeIcon}>🛡️</Text>
            <Text style={styles.teamNameText} numberOfLines={2}>
              {partido.nombreEquipoVisitante || `Visitante #${partido.equipoVisitanteId}`}
            </Text>
            <Text style={styles.teamSideLabel}>VISITANTE</Text>
          </View>
        </View>

        {/* Metadatos: Cancha, Árbitro, Horario */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>🏟️ Cancha</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {partido.canchaNombre || partido.nombreCancha || `Cancha #${partido.canchaId}`}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>🧑‍⚖️ Árbitro</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {partido.arbitroNombre || partido.nombreArbitro || `Árbitro #${partido.arbitroId}`}
            </Text>
          </View>
        </View>
      </Card>

      {/* Controles del Ciclo de Vida del Partido (RN-05) */}
      <Card style={styles.lifecycleCard}>
        <Text style={styles.sectionHeaderTitle}>Control de Ciclo de Vida (RN-05)</Text>
        <Text style={styles.sectionHeaderSubtitle}>
          Flujo permitido: PROGRAMADO ➔ EN JUEGO ➔ FINALIZADO (o SUSPENDIDO)
        </Text>

        <View style={styles.lifecycleButtons}>
          {partido.estado === 'PROGRAMADO' && (
            <>
              <Button
                title="▶️ Iniciar Partido"
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
                🔒 El partido se encuentra en estado{' '}
                <Text style={styles.bold}>{partido.estado}</Text>. Esta condición es irreversible
                según las reglas oficiales (RN-05).
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Sección Registro de Incidencias (RN-04) */}
      <Card style={styles.eventsCard}>
        <View style={styles.eventsHeaderRow}>
          <View>
            <Text style={styles.sectionHeaderTitle}>Incidencias y Cronología</Text>
            <Text style={styles.sectionHeaderSubtitle}>
              {partidoEnJuego
                ? 'El partido está en juego. Puedes registrar goles y tarjetas.'
                : 'La carga y corrección de eventos solo está habilitada cuando el partido está EN JUEGO.'}
            </Text>
          </View>

          <Button
            title="➕ Cargar Incidencia"
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
      </Card>

      {/* Modales de Confirmación y Registro */}
      <RegistrarEventoModal
        visible={modalEventoVisible}
        onClose={() => setModalEventoVisible(false)}
        onSubmit={handleRegistrarEvento}
        jugadoresLocal={jugadoresLocal}
        jugadoresVisitante={jugadoresVisitante}
        nombreEquipoLocal={partido.nombreEquipoLocal || 'Local'}
        nombreEquipoVisitante={partido.nombreEquipoVisitante || 'Visitante'}
      />

      {/* Modal Confirmación Estado */}
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

      {/* Modal Confirmación Eliminar Incidencia */}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 24,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backLink: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#1e293b',
  },
  backLinkText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600',
  },
  userInfo: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  userRoleText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  toastError: {
    backgroundColor: '#dc2626',
  },
  toastSuccess: {
    backgroundColor: '#16a34a',
  },
  toastIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  toastClose: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scoreCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tournamentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 10,
  },
  tournamentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
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
    paddingHorizontal: 8,
  },
  teamBadgeIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  teamNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  teamSideLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 4,
    letterSpacing: 1,
  },
  scoreCenter: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#38bdf8',
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    minWidth: 36,
    textAlign: 'center',
  },
  scoreDivider: {
    fontSize: 32,
    fontWeight: '800',
    color: '#38bdf8',
    marginHorizontal: 4,
  },
  liveClockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0369a1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  liveClockDot: {
    color: '#4ade80',
    fontSize: 8,
  },
  liveClockText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    color: '#f1f5f9',
    fontWeight: '700',
  },
  lifecycleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionHeaderSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 14,
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
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#64748b',
  },
  irreversibleText: {
    fontSize: 13,
    color: '#475569',
  },
  bold: {
    fontWeight: '700',
  },
  eventsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
  },
  eventsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  btnNuevoEvento: {
    alignSelf: 'center',
    minWidth: 150,
  },
});

export default PartidoEnVivoPage;
