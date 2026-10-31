import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, etiqueta } from '@/constants/liga-tema';

type Props = {
  error: string | null;
  onReintentar: () => void;
};

/** Sin error muestra el spinner; con error, el mensaje y un botón para reintentar. */
export default function EstadoCarga({ error, onReintentar }: Props) {
  if (error === null) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }
  return (
    <View style={styles.centro}>
      <Text style={styles.mensaje}>{error}</Text>
      <Pressable style={styles.boton} onPress={onReintentar}>
        <Text style={styles.textoBoton}>Reintentar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16, backgroundColor: colores.fondo },
  mensaje: { fontSize: 15, color: colores.error, textAlign: 'center' },
  boton: { backgroundColor: colores.primario, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 2 },
  textoBoton: { ...etiqueta, color: colores.fondo },
});
