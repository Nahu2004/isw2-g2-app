// Card de resultado de disponibilidad — diseño premium oscuro
// Estados: neutral (sin consultar) / cargando / disponible / no disponible

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme, sectionLabelStyle } from '@/constants/theme';
import type { DisponibilidadResponse } from '@/api/types';

interface DisponibilidadCardProps {
  titulo: string;
  resultado: DisponibilidadResponse | null;
  cargando?: boolean;
}

export const DisponibilidadCard: React.FC<DisponibilidadCardProps> = ({
  titulo,
  resultado,
  cargando = false,
}) => {
  // ── Estado: cargando ──────────────────────────────────────────────────────
  if (cargando) {
    return (
      <View style={[styles.card, styles.cardNeutral]}>
        <Text style={styles.cardLabel}>{titulo.toUpperCase()}</Text>
        <Text style={styles.statusText}>Verificando...</Text>
      </View>
    );
  }

  // ── Estado: sin consultar ─────────────────────────────────────────────────
  if (!resultado) {
    return (
      <View style={[styles.card, styles.cardNeutral]}>
        <Text style={styles.cardLabel}>{titulo.toUpperCase()}</Text>
        <Text style={styles.statusTextNeutral}>Sin consultar</Text>
      </View>
    );
  }

  // ── Estado: con resultado ─────────────────────────────────────────────────
  const disponible = resultado.disponible;
  const statusTheme = disponible ? Theme.status.success : Theme.status.danger;

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: statusTheme.bg,
        borderColor:     statusTheme.border,
      },
    ]}>
      {/* Label + icono en fila */}
      <View style={styles.row}>
        <Text style={styles.cardLabel}>{titulo.toUpperCase()}</Text>
        <Text style={styles.icon}>{disponible ? '●' : '●'}</Text>
      </View>

      {/* Estado principal */}
      <Text style={[styles.statusValue, { color: statusTheme.text }]}>
        {disponible ? 'DISPONIBLE' : 'NO DISPONIBLE'}
      </Text>

      {/* Motivo si está ocupado */}
      {!disponible && resultado.motivo ? (
        <Text style={styles.motivoText}>{resultado.motivo}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    gap: Theme.spacing.xs,
  },
  cardNeutral: {
    backgroundColor: Theme.bg.card,
    borderColor:     Theme.border.subtle,
  },
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    ...sectionLabelStyle,
  },
  icon: {
    fontSize: 8,
    color: Theme.text.secondary,
  },
  statusText: {
    fontSize:   Theme.font.size.sm,
    fontWeight: Theme.font.weight.medium,
    color:      Theme.text.secondary,
  },
  statusTextNeutral: {
    fontSize:   Theme.font.size.sm,
    color:      Theme.text.secondary,
    fontStyle:  'italic',
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
