import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { getPartidos, programarPartido, eliminarPartido } from '@/api/partidosApi';
import { getTorneos } from '@/api/catalogosApi';
import { Partido, Torneo } from '@/api/types';
import { Card, Button, LoadingView, ErrorView, EmptyView } from '@/components/common';
import { ProgramarPartidoModal } from '@/components/partidos/ProgramarPartidoModal';

export default function PartidosScreen() {
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
    await programarPartido(data);
    Alert.alert('Éxito', 'Partido programado satisfactoriamente.');
    cargarDatos();
  };

  const handleEliminar = (partido: Partido) => {
    if (partido.estado !== 'PROGRAMADO') {
      Alert.alert(
        'Acción no permitida',
        'Solo se pueden cancelar partidos que estén en estado PROGRAMADO.'
      );
      return;
    }

    Alert.alert(
      'Cancelar Partido',
      `¿Deseas desprogramar el encuentro ${partido.nombreEquipoLocal || 'Local'} vs ${partido.nombreEquipoVisitante || 'Visitante'}?`,
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Desprogramar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarPartido(partido.id);
              Alert.alert('Éxito', 'Partido cancelado');
              cargarDatos();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'No se pudo eliminar el partido');
            }
          },
        },
      ]
    );
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
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>Filtrar Encuentros</Text>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: undefined, nombre: 'Todos los Torneos' } as any, ...torneos]}
          keyExtractor={(item) => String(item.id ?? 'todos')}
          contentContainerStyle={styles.horizPills}
          renderItem={({ item }) => {
            const isSel = torneoId === item.id;
            return (
              <TouchableOpacity
                style={[styles.pill, isSel && styles.pillActive]}
                onPress={() => setTorneoId(item.id)}
              >
                <Text style={[styles.pillText, isSel && styles.pillTextActive]}>
                  {item.nombre}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Filtro por Fecha */}
        <View style={styles.fechasRow}>
          <Text style={styles.fechaLabel}>Fecha N°:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[undefined, 1, 2, 3, 4, 5, 6].map((f) => {
              const isSel = numeroFecha === f;
              return (
                <TouchableOpacity
                  key={String(f ?? 'todas')}
                  style={[styles.fechaPill, isSel && styles.fechaPillActive]}
                  onPress={() => setNumeroFecha(f)}
                >
                  <Text style={[styles.fechaPillText, isSel && styles.fechaPillTextActive]}>
                    {f === undefined ? 'Todas' : `F${f}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <Button
          title="+ Programar Partido"
          onPress={() => setModalVisible(true)}
          style={styles.nuevoBtn}
        />
      </View>

      {/* Estados Visuales de Cátedra */}
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
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.matchCard}>
              <View style={styles.matchHeader}>
                <Text style={styles.fechaBadge}>FECHA {item.numeroFecha}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    item.estado === 'PROGRAMADO'
                      ? styles.statusProg
                      : item.estado === 'EN_JUEGO'
                      ? styles.statusLive
                      : styles.statusDone,
                  ]}
                >
                  <Text style={styles.statusText}>{item.estado}</Text>
                </View>
              </View>

              {/* Enfrentamiento */}
              <View style={styles.versusContainer}>
                <View style={styles.teamColumn}>
                  <Text style={styles.teamName}>
                    {item.nombreEquipoLocal || `Equipo #${item.equipoLocalId}`}
                  </Text>
                </View>

                <View style={styles.scoreBox}>
                  <Text style={styles.scoreText}>
                    {item.golesLocal ?? '-'} : {item.golesVisitante ?? '-'}
                  </Text>
                  <Text style={styles.vsLabel}>VS</Text>
                </View>

                <View style={styles.teamColumn}>
                  <Text style={styles.teamName}>
                    {item.nombreEquipoVisitante || `Equipo #${item.equipoVisitanteId}`}
                  </Text>
                </View>
              </View>

              {/* Detalles */}
              <View style={styles.detailsBox}>
                <Text style={styles.detailText}>
                  🏟️ Cancha: <Text style={styles.bold}>{item.nombreCancha || item.canchaId}</Text>
                </Text>
                <Text style={styles.detailText}>
                  🧑‍⚖️ Árbitro: <Text style={styles.bold}>{item.nombreArbitro || item.arbitroId}</Text>
                </Text>
                <Text style={styles.detailText}>
                  🕒 Horario: <Text style={styles.bold}>{formatearFechaHora(item.fechaHoraInicio)}</Text>
                </Text>
              </View>

                            <View style={styles.actionRow}>
                <Button
                  title="🔴 Ver / Operar en Vivo"
                  onPress={() => router.push(`/partido-en-vivo?id=${item.id}` as any)}
                  style={styles.liveBtn}
                />
              </View>

              {item.estado === 'PROGRAMADO' && (
                <View style={styles.actionRow}>
                  <Button
                    title="Cancelar Encuentro"
                    variant="danger"
                    style={styles.cancelBtn}
                    onPress={() => handleEliminar(item)}
                  />
                </View>
              )}
            </Card>
          )}
        />
      )}

      {/* Modal Programación */}
      <ProgramarPartidoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleProgramar}
        torneoIdDefault={torneoId}
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
  filterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  horizPills: {
    gap: 8,
    paddingVertical: 4,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 6,
  },
  pillActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  pillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  fechasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  fechaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 8,
  },
  fechaPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fechaPillActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  fechaPillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  fechaPillTextActive: {
    color: '#ffffff',
  },
  nuevoBtn: {
    backgroundColor: '#8b5cf6',
    marginTop: 6,
  },
  list: {
    padding: 16,
  },
  matchCard: {
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fechaBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8b5cf6',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusProg: {
    backgroundColor: '#e0f2fe',
  },
  statusLive: {
    backgroundColor: '#fef3c7',
  },
  statusDone: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  versusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 10,
  },
  teamColumn: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  scoreBox: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  vsLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  detailsBox: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    gap: 3,
  },
  detailText: {
    fontSize: 12,
    color: '#475569',
  },
  bold: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  actionRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
    liveBtn: {
    backgroundColor: '#0284c7',
    marginBottom: 8,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
