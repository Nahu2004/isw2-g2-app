import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colores, etiqueta } from '@/constants/liga-tema';

type Props = {
  titulo: string;
  children: ReactNode;
};

export default function Pantalla({ titulo, children }: Props) {
  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      <View style={styles.cabecera}>
        <View style={styles.barra} />
        <Text style={styles.titulo}>{titulo}</Text>
      </View>
      <View style={styles.contenido}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  barra: { width: 4, height: 16, backgroundColor: colores.primario },
  titulo: { ...etiqueta, fontSize: 14, color: colores.texto },
  contenido: { flex: 1 },
});
