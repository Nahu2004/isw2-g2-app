import React, { useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import EstadoCarga from '@/components/common/estado-carga';
import Pantalla from '@/components/common/pantalla';
import SelectorFecha from '@/components/common/selector-fecha';
import TarjetaPartido from '@/components/common/tarjeta-partido';
import { TORNEO_ID } from '@/constants/api';
import { colores } from '@/constants/liga-tema';
import { useFetch } from '@/hooks/use-fetch';
import type { Partido } from '@/api/liga-tipos';

const FECHAS_DISPONIBLES = [1, 2, 3, 4, 5, 6, 7];

export default function FixtureScreen() {
  const router = useRouter();
  const [fechaSeleccionada, setFechaSeleccionada] = useState<number>(1);

  const { data, cargando, error, recargar } = useFetch<Partido[]>(
    `/partidos?torneoId=${TORNEO_ID}&numeroFecha=${fechaSeleccionada}`
  );

  return (
    <Pantalla titulo="Fixture y Partidos">
      <SelectorFecha
        fechas={FECHAS_DISPONIBLES}
        seleccionada={fechaSeleccionada}
        onSeleccionar={setFechaSeleccionada}
      />
      {!data ? (
        <EstadoCarga error={error} onReintentar={recargar} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(partido) => String(partido.id)}
          renderItem={({ item }) => (
            <TarjetaPartido
              partido={item}
              onPress={() => router.push(`/partido/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.vacio}>No hay partidos programados para la Fecha {fechaSeleccionada}.</Text>
          }
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
