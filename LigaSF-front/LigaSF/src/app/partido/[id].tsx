import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import EstadoCarga from '@/components/common/estado-carga';
import FilaEvento from '@/components/common/fila-evento';
import { colorEstado, colores } from '@/constants/liga-tema';
import { useFetch } from '@/hooks/use-fetch';
import type { EventoPartido, Partido } from '@/api/liga-tipos';
import { etiquetaEstado, formatearFechaHora } from '@/utils/liga';

export default function DetallePartidoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Si id no está disponible todavía, pasar null para evitar peticiones con undefined
  const rutaPartido = id ? `/partidos/${id}` : null;
  const rutaEventos = id ? `/partidos/${id}/eventos` : null;

  const partido = useFetch<Partido>(rutaPartido);
  const eventos = useFetch<EventoPartido[]>(rutaEventos);

  const eventosOrdenados = useMemo(
    () => [...(eventos.data ?? [])].sort((a, b) => a.minuto - b.minuto),
    [eventos.data],
  );

  if (!partido.data) {
    return <EstadoCarga error={partido.error} onReintentar={partido.recargar} />;
  }
  const p = partido.data;

  return (
    <ScrollView style={styles.contenedor}>
      <Stack.Screen options={{ title: `Fecha ${p.numeroFecha} · Partido` }} />

      <View style={styles.cabecera}>
        <View style={styles.marcador}>
          <Text style={[styles.equipo, styles.local]}>{p.equipoLocalNombre}</Text>
          <Text style={styles.goles}>
            {p.golesLocal} - {p.golesVisitante}
          </Text>
          <Text style={[styles.equipo, styles.visitante]}>{p.equipoVisitanteNombre}</Text>
        </View>
        <Text style={[styles.estado, { color: colorEstado[p.estado] }]}>{etiquetaEstado[p.estado]}</Text>
        <Text style={styles.dato}>{formatearFechaHora(p.fechaHoraInicio)}</Text>
        <Text style={styles.dato}>
          {p.canchaNombre} · Árbitro: {p.arbitroNombre}
        </Text>
      </View>

      <Text style={styles.seccion}>Minuto a minuto</Text>
      {eventos.error !== null && eventos.data === null ? (
        <Text style={styles.vacio}>{eventos.error}</Text>
      ) : eventosOrdenados.length === 0 ? (
        <Text style={styles.vacio}>Todavía no hay eventos en este partido.</Text>
      ) : (
        <View style={styles.eventos}>
          {eventosOrdenados.map((ev) => (
            <FilaEvento key={ev.id} evento={ev} esLocal={ev.equipoId === p.equipoLocalId} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  cabecera: {
    padding: 20,
    backgroundColor: colores.superficie,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    alignItems: 'center',
    gap: 8,
  },
  marcador: { flexDirection: 'row', alignItems: 'center', gap: 16, width: '100%' },
  equipo: { flex: 1, fontSize: 16, fontWeight: '800', color: colores.texto },
  local: { textAlign: 'right' },
  visitante: { textAlign: 'left' },
  goles: { minWidth: 60, textAlign: 'center', fontSize: 28, fontWeight: '800', color: colores.texto },
  estado: { fontSize: 12, fontWeight: '800' },
  dato: { fontSize: 12, color: colores.textoSuave },
  seccion: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontSize: 12,
    fontWeight: '800',
    color: colores.textoSuave,
    textTransform: 'uppercase',
  },
  eventos: { backgroundColor: colores.superficie, borderTopWidth: 1, borderTopColor: colores.borde },
  vacio: { padding: 24, textAlign: 'center', color: colores.textoSuave },
});
