import { StyleSheet, Text, View } from 'react-native';

import { colores } from '@/constants/liga-tema';
import type { EventoPartido, TipoEvento } from '@/api/liga-tipos';

type Props = {
  evento: EventoPartido;
  /** El evento va a la izquierda si es del local y a la derecha si es del visitante. */
  esLocal: boolean;
};

function Icono({ tipo }: { tipo: TipoEvento }) {
  if (tipo === 'GOL') {
    return <Text style={styles.gol}>⚽</Text>;
  }
  return <View style={[styles.tarjeta, { backgroundColor: tipo === 'ROJA' ? colores.roja : colores.amarilla }]} />;
}

export default function FilaEvento({ evento, esLocal }: Props) {
  const contenido = (
    <>
      {esLocal && <Text style={[styles.jugador, styles.textoLocal]}>{evento.jugadorNombreCompleto}</Text>}
      <Icono tipo={evento.tipo} />
      {!esLocal && <Text style={styles.jugador}>{evento.jugadorNombreCompleto}</Text>}
    </>
  );
  return (
    <View style={styles.fila}>
      <View style={[styles.lado, styles.ladoLocal]}>{esLocal && contenido}</View>
      <Text style={styles.minuto}>{evento.minuto}&apos;</Text>
      <View style={[styles.lado, styles.ladoVisitante]}>{!esLocal && contenido}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  lado: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ladoLocal: { justifyContent: 'flex-end' },
  ladoVisitante: { justifyContent: 'flex-start' },
  minuto: { width: 48, textAlign: 'center', fontSize: 12, fontWeight: '800', color: colores.textoSuave },
  jugador: { flexShrink: 1, fontSize: 13, fontWeight: '700', color: colores.texto },
  textoLocal: { textAlign: 'right' },
  gol: { fontSize: 14 },
  tarjeta: { width: 10, height: 14, borderRadius: 1 },
});
