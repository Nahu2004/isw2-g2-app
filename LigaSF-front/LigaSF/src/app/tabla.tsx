import { FlatList, StyleSheet, Text } from 'react-native';

import EstadoCarga from '@/components/common/estado-carga';
import FilaPosicion, { EncabezadoTabla } from '@/components/common/fila-posicion';
import Pantalla from '@/components/common/pantalla';
import { TORNEO_ID } from '@/constants/api';
import { colores } from '@/constants/liga-tema';
import { useFetch } from '@/hooks/use-fetch';
import type { Posicion } from '@/api/liga-tipos';

export default function TablaScreen() {
  const { data, cargando, error, recargar } = useFetch<Posicion[]>(`/tabla?torneoId=${TORNEO_ID}`);

  return (
    <Pantalla titulo="Tabla de posiciones">
      {!data ? (
        <EstadoCarga error={error} onReintentar={recargar} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(fila) => String(fila.equipoId)}
          ListHeaderComponent={<EncabezadoTabla />}
          renderItem={({ item, index }) => <FilaPosicion posicion={index + 1} fila={item} />}
          ListEmptyComponent={<Text style={styles.vacio}>Todavía no hay equipos en el torneo.</Text>}
          refreshing={cargando}
          onRefresh={recargar}
        />
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  vacio: { padding: 24, textAlign: 'center', color: colores.textoSuave },
});
