// Muestra si un jugador está bloqueado para jugar en una fecha.
// Verde = puede jugar. Rojo = bloqueado, con el motivo de la suspensión.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { BloqueoResponse } from '@/api/types';

interface BloqueoCardProps {
  nombreJugador: string;
  resultado: BloqueoResponse | null;
  cargando?: boolean;
}

export const BloqueoCard: React.FC<BloqueoCardProps> = ({
  nombreJugador,
  resultado,
  cargando = false,
}) => {
  if (cargando) {
    return (
      <View style={[styles.card, styles.cardNeutro]}>
        <Text style={styles.jugadorNombre}>{nombreJugador}</Text>
        <Text style={styles.estadoTexto}>Verificando...</Text>
      </View>
    );
  }

  if (!resultado) return null;

  const bloqueado = resultado.bloqueado;

  return (
    <View style={[styles.card, bloqueado ? styles.cardBloqueado : styles.cardLibre]}>
      <View style={styles.fila}>
        <Text style={styles.icono}>{bloqueado ? '🚫' : '✅'}</Text>
        <Text style={styles.jugadorNombre}>{nombreJugador}</Text>
      </View>
      <Text style={[styles.estadoTexto, bloqueado ? styles.textoRojo : styles.textoVerde]}>
        {bloqueado ? 'Bloqueado — no puede jugar' : 'Habilitado para jugar'}
      </Text>
      {bloqueado && resultado.motivo ? (
        <Text style={styles.motivo}>{resultado.motivo}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
  },
  cardNeutro: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  cardLibre: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  cardBloqueado: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  icono: {
    fontSize: 18,
  },
  jugadorNombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    flexShrink: 1,
  },
  estadoTexto: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  textoVerde: {
    color: '#16a34a',
  },
  textoRojo: {
    color: '#dc2626',
  },
  motivo: {
    fontSize: 12,
    color: '#b91c1c',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
