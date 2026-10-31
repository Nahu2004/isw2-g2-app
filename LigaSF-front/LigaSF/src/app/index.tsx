import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import EstadoCarga from '@/components/common/estado-carga';
import FilaEvento from '@/components/common/fila-evento';
import { colorEstado, colores, etiqueta } from '@/constants/liga-tema';
import { useFetch } from '@/hooks/use-fetch';
import type { EventoPartido, Partido } from '@/api/liga-tipos';
import { etiquetaEstado, formatearFechaHora } from '@/utils/liga';

export default function DetallePartidoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const partido = useFetch<Partido>(`/partidos/${id}`);
  const eventos = useFetch<EventoPartido[]>(`/partidos/${id}/eventos`);

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
      <Stack.Screen options={{ title: `Fecha ${p.numeroFecha}` }} />

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
        eventosOrdenados.map((evento) => (
          <FilaEvento key={evento.id} evento={evento} esLocal={evento.equipoId === p.equipoLocalId} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  cabecera: {
    padding: 16,
    gap: 6,
    backgroundColor: colores.superficie,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  marcador: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12 },
  equipo: { flex: 1, ...etiqueta, fontSize: 13, color: colores.texto },
  local: { textAlign: 'right' },
  visitante: { textAlign: 'left' },
  goles: { fontSize: 34, fontWeight: '800', color: colores.texto },
  estado: { ...etiqueta, textAlign: 'center' },
  dato: { fontSize: 12, textAlign: 'center', color: colores.textoSuave },
  seccion: {
    ...etiqueta,
    textAlign: 'center',
    color: colores.textoSuave,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  vacio: { padding: 24, textAlign: 'center', color: colores.textoSuave },
});
