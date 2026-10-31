import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colorEstado, colores, etiqueta } from '@/constants/liga-tema';
import type { Partido } from '@/api/liga-tipos';
import { etiquetaCorta, formatearFechaHora, formatearHora } from '@/utils/liga';

type Props = {
  partido: Partido;
  onPress: () => void;
};

export default function TarjetaPartido({ partido, onPress }: Props) {
  const enVivo = partido.estado === 'EN_JUEGO';
  const programado = partido.estado === 'PROGRAMADO';
  return (
    <Pressable style={[styles.fila, enVivo && styles.filaEnVivo]} onPress={onPress}>
      <View style={styles.estado}>
        <Text style={[styles.textoEstado, { color: colorEstado[partido.estado] }]}>
          {programado ? formatearHora(partido.fechaHoraInicio) : etiquetaCorta[partido.estado]}
        </Text>
      </View>
      <View style={styles.cuerpo}>
        <View style={styles.marcador}>
          <Text style={[styles.equipo, styles.local]} numberOfLines={2}>
            {partido.equipoLocalNombre}
          </Text>
          <Text style={styles.goles}>
            {programado ? '-' : `${partido.golesLocal} - ${partido.golesVisitante}`}
          </Text>
          <Text style={[styles.equipo, styles.visitante]} numberOfLines={2}>
            {partido.equipoVisitanteNombre}
          </Text>
        </View>
        <Text style={styles.detalle} numberOfLines={1}>
          {formatearFechaHora(partido.fechaHoraInicio)} · {partido.canchaNombre}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    backgroundColor: colores.superficie,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  filaEnVivo: { backgroundColor: colores.primarioClaro },
  estado: {
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colores.borde,
  },
  textoEstado: { ...etiqueta, fontSize: 10 },
  cuerpo: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, gap: 6 },
  marcador: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  equipo: { flex: 1, fontSize: 14, fontWeight: '700', color: colores.texto },
  local: { textAlign: 'right' },
  visitante: { textAlign: 'left' },
  goles: { minWidth: 44, textAlign: 'center', fontSize: 16, fontWeight: '800', color: colores.texto },
  detalle: { fontSize: 11, color: colores.textoSuave, textAlign: 'center' },
});
