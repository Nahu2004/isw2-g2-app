// Card de resultado de bloqueo de jugador — diseño premium oscuro
// Verde = habilitado / Rojo = bloqueado con motivo

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme, sectionLabelStyle } from '@/constants/theme';
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
      <View style={[styles.card, styles.cardNeutral]}>
        <Text style={styles.cardLabel}>{nombreJugador.toUpperCase()}</Text>
        <Text style={styles.neutralText}>Verificando...</Text>
      </View>
    );
  }

  if (!resultado) return null;

  const bloqueado   = resultado.bloqueado;
  const statusTheme = bloqueado ? Theme.status.danger : Theme.status.success;

  return (
    <View style={[
      styles.card,
      { backgroundColor: statusTheme.bg, borderColor: statusTheme.border },
    ]}>
      <View style={styles.row}>
        <Text style={styles.cardLabel}>{nombreJugador.toUpperCase()}</Text>
      </View>
      <Text style={[styles.statusValue, { color: statusTheme.text }]}>
        {bloqueado ? 'BLOQUEADO' : 'HABILITADO'}
      </Text>
      {bloqueado && resultado.motivo ? (
        <Text style={styles.motivoText}>{resultado.motivo}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Theme.radius.md,
    borderWidth:  1,
    padding:      Theme.spacing.md,
    gap:          Theme.spacing.xs,
  },
  cardNeutral: {
    backgroundColor: Theme.bg.card,
    borderColor:     Theme.border.subtle,
  },
  row: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  cardLabel: {
    ...sectionLabelStyle,
  },
  neutralText: {
    fontSize:  Theme.font.size.sm,
    color:     Theme.text.secondary,
    fontStyle: 'italic',
  },
  statusValue: {
    fontSize:      Theme.font.size.md,
    fontWeight:    Theme.font.weight.black,
    letterSpacing: Theme.font.letterSpacing.wide,
  },
  motivoText: {
    fontSize:  Theme.font.size.sm,
    color:     Theme.status.danger.text,
    opacity:   0.8,
    marginTop: 2,
  },
});
