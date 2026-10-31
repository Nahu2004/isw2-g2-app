import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colores, etiqueta } from '@/constants/liga-tema';

type Props = {
  fechas: number[];
  seleccionada: number;
  onSeleccionar: (fecha: number) => void;
};

export default function SelectorFecha({ fechas, seleccionada, onSeleccionar }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.barra}
      contentContainerStyle={styles.contenido}
    >
      {fechas.map((fecha) => {
        const activa = fecha === seleccionada;
        return (
          <Pressable
            key={fecha}
            style={[styles.chip, activa && styles.chipActivo]}
            onPress={() => onSeleccionar(fecha)}
          >
            <Text style={[styles.texto, activa && styles.textoActivo]}>Fecha {fecha}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  barra: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: colores.borde },
  contenido: { padding: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 2,
  },
  chipActivo: { backgroundColor: colores.primarioClaro, borderColor: colores.primario },
  texto: { ...etiqueta, color: colores.textoSuave },
  textoActivo: { color: colores.primario },
});
