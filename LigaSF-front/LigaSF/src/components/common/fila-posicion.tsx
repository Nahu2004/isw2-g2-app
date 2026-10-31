import { StyleSheet, Text, View } from 'react-native';

import { colores, etiqueta } from '@/constants/liga-tema';
import type { Posicion } from '@/api/liga-tipos';

export function EncabezadoTabla() {
  return (
    <View style={[styles.fila, styles.encabezado]}>
      <Text style={[styles.posicion, styles.textoEncabezado]}>#</Text>
      <Text style={[styles.equipo, styles.textoEncabezado]}>Equipo</Text>
      {['PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'DG', 'PTS'].map((titulo) => (
        <Text key={titulo} style={[styles.numero, styles.textoEncabezado]}>
          {titulo}
        </Text>
      ))}
    </View>
  );
}

type Props = {
  posicion: number;
  fila: Posicion;
};

export default function FilaPosicion({ posicion, fila }: Props) {
  const lider = posicion === 1;
  const colorDiferencia = fila.dg > 0 ? colores.primario : fila.dg < 0 ? colores.error : colores.texto;
  return (
    <View style={styles.fila}>
      <View style={[styles.marca, lider && styles.marcaLider]}>
        <Text style={[styles.textoMarca, lider && styles.textoMarcaLider]}>{posicion}</Text>
      </View>
      <Text style={styles.equipo} numberOfLines={1}>
        {fila.equipoNombre}
      </Text>
      <Text style={styles.numero}>{fila.pj}</Text>
      <Text style={styles.numero}>{fila.pg}</Text>
      <Text style={styles.numero}>{fila.pe}</Text>
      <Text style={styles.numero}>{fila.pp}</Text>
      <Text style={styles.numero}>{fila.gf}</Text>
      <Text style={styles.numero}>{fila.gc}</Text>
      <Text style={[styles.numero, { color: colorDiferencia }]}>{fila.dg > 0 ? `+${fila.dg}` : fila.dg}</Text>
      <Text style={[styles.numero, styles.puntos]}>{fila.pts}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  encabezado: { backgroundColor: colores.superficie, paddingVertical: 8 },
  textoEncabezado: { ...etiqueta, fontSize: 10, color: colores.textoSuave },
  posicion: { width: 28 },
  marca: { width: 22, height: 22, marginRight: 6, alignItems: 'center', justifyContent: 'center' },
  marcaLider: { backgroundColor: colores.primario },
  textoMarca: { fontSize: 11, fontWeight: '800', color: colores.textoSuave },
  textoMarcaLider: { color: colores.fondo },
  equipo: { flex: 1, fontSize: 14, fontWeight: '700', color: colores.texto },
  numero: { width: 27, fontSize: 12, textAlign: 'center', color: colores.textoSuave },
  puntos: { fontWeight: '800', color: colores.texto },
});
