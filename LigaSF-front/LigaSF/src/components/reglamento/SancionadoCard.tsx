// Card de jugador sancionado — diseño premium oscuro
// Franja lateral semántica: rojo = tarjeta roja / ámbar = dos amarillas

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme, sectionLabelStyle } from '@/constants/theme';
import type { SancionResponse } from '@/api/types';

interface SancionadoCardProps {
  sancion: SancionResponse;
}

export const SancionadoCard: React.FC<SancionadoCardProps> = ({ sancion }) => {
  const esRoja = sancion.motivo === 'ROJA';

  const franjaColor = esRoja
    ? Theme.status.danger.text    // #EF4444
    : Theme.status.warning.text;  // #FBBF24

  const badgeBg = esRoja
    ? Theme.status.danger.bg      // #2D0A0A
    : Theme.status.warning.bg;    // #2D1A00

  const badgeBorder = esRoja
    ? Theme.status.danger.border  // #7F1D1D
    : Theme.status.warning.border;// #78350F

  const badgeText = esRoja
    ? Theme.status.danger.text
    : Theme.status.warning.text;

  return (
    <View style={styles.card}>
      {/* Franja lateral de color */}
      <View style={[styles.franja, { backgroundColor: franjaColor }]} />

      {/* Contenido */}
      <View style={styles.body}>
        <Text style={styles.nombre}>{sancion.nombreJugador}</Text>
        <Text style={styles.equipo}>{sancion.nombreEquipo.toUpperCase()}</Text>

        {/* Badge de motivo */}
        <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
          <Text style={[styles.badgeText, { color: badgeText }]}>
            {esRoja ? 'TARJETA ROJA' : 'DOS AMARILLAS'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection:   'row',
    backgroundColor: Theme.bg.card,
    borderRadius:    Theme.radius.md,
    borderWidth:     1,
    borderColor:     Theme.border.subtle,
    marginBottom:    Theme.spacing.sm,
    overflow:        'hidden',
  },
  franja: {
    width: 3,
  },
  body: {
    flex:    1,
    padding: Theme.spacing.md,
    gap:     Theme.spacing.xs,
  },
  nombre: {
    fontSize:   Theme.font.size.md,
    fontWeight: Theme.font.weight.bold,
    color:      Theme.text.primary,
  },
  equipo: {
    ...sectionLabelStyle,
    color: Theme.text.secondary,
  },
  badge: {
    alignSelf:         'flex-start',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical:   2,
    borderRadius:      Theme.radius.sm,
    borderWidth:       1,
    marginTop:         Theme.spacing.xs,
  },
  badgeText: {
    fontSize:      Theme.font.size.xs,
    fontWeight:    Theme.font.weight.black,
    letterSpacing: Theme.font.letterSpacing.wide,
  },
});
