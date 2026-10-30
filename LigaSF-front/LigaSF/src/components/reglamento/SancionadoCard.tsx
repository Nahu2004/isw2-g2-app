// Muestra un jugador sancionado con su equipo y motivo de suspensión.
// Usado en la lista de sancionados de la tab "Sanciones" del módulo de reglamento.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SancionResponse } from '@/api/types';

interface SancionadoCardProps {
  sancion: SancionResponse;
}

export const SancionadoCard: React.FC<SancionadoCardProps> = ({ sancion }) => {
  const esRoja = sancion.motivo === 'ROJA';

  return (
    <View style={styles.card}>
      {/* Franja lateral de color según motivo */}
      <View style={[styles.franja, esRoja ? styles.franjaRoja : styles.franjaAmarilla]} />

      <View style={styles.contenido}>
        {/* Nombre del jugador */}
        <Text style={styles.nombre}>{sancion.nombreJugador}</Text>

        {/* Equipo */}
        <Text style={styles.equipo}>🏟 {sancion.nombreEquipo}</Text>

        {/* Motivo */}
        <View style={[styles.badge, esRoja ? styles.badgeRojo : styles.badgeAmarillo]}>
          <Text style={[styles.badgeTexto, esRoja ? styles.badgeTextoRojo : styles.badgeTextoAmarillo]}>
            {esRoja ? '🟥 Tarjeta roja' : '🟨🟨 Dos amarillas'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  franja: {
    width: 5,
  },
  franjaRoja: {
    backgroundColor: '#ef4444',
  },
  franjaAmarilla: {
    backgroundColor: '#f59e0b',
  },
  contenido: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  equipo: {
    fontSize: 13,
    color: '#64748b',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
  },
  badgeRojo: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  badgeAmarillo: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  badgeTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextoRojo: {
    color: '#dc2626',
  },
  badgeTextoAmarillo: {
    color: '#b45309',
  },
});
