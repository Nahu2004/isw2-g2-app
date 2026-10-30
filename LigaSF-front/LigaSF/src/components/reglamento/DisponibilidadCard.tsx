// Muestra el resultado de una consulta de disponibilidad (cancha o árbitro).
// Estado verde = disponible, rojo = ocupado con motivo del conflicto.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { DisponibilidadResponse } from '@/api/types';

interface DisponibilidadCardProps {
  titulo: string;           // Ej: "Cancha Municipal" o "Árbitro Pérez"
  resultado: DisponibilidadResponse | null;
  cargando?: boolean;
}

export const DisponibilidadCard: React.FC<DisponibilidadCardProps> = ({
  titulo,
  resultado,
  cargando = false,
}) => {
  if (cargando) {
    return (
      <View style={[styles.card, styles.cardNeutro]}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.estadoTexto}>Consultando...</Text>
      </View>
    );
  }

  if (!resultado) {
    return (
      <View style={[styles.card, styles.cardNeutro]}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.estadoTexto}>Sin consultar</Text>
      </View>
    );
  }

  const disponible = resultado.disponible;

  return (
    <View style={[styles.card, disponible ? styles.cardDisponible : styles.cardOcupado]}>
      <View style={styles.fila}>
        <Text style={styles.icono}>{disponible ? '✅' : '❌'}</Text>
        <Text style={styles.titulo}>{titulo}</Text>
      </View>
      <Text style={[styles.estadoTexto, disponible ? styles.textoVerde : styles.textoRojo]}>
        {disponible ? 'Disponible' : 'No disponible'}
      </Text>
      {!disponible && resultado.motivo ? (
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
  cardDisponible: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  cardOcupado: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  icono: {
    fontSize: 16,
  },
  titulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flexShrink: 1,
  },
  estadoTexto: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
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
    marginTop: 4,
    fontStyle: 'italic',
  },
});
