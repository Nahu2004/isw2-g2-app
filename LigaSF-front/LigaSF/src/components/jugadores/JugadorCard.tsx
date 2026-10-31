// Card de Jugador — diseño premium oscuro alineado a la paleta de LigaSF
// Dorsal con tabular-nums concéntrico, badge semántico y acciones

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme, sectionLabelStyle } from '@/constants/theme';
import { Jugador } from '@/api/types';

interface JugadorCardProps {
  jugador: Jugador;
  onEditar: (jugador: Jugador) => void;
  onToggleEstado: (jugador: Jugador) => void;
}

export const JugadorCard: React.FC<JugadorCardProps> = ({
  jugador,
  onEditar,
  onToggleEstado,
}) => {
  const activo = jugador.activo;

  const franjaColor = activo
    ? Theme.status.success.text
    : Theme.status.neutral.text;

  const badgeBg = activo
    ? Theme.status.success.bg
    : Theme.status.neutral.bg;

  const badgeBorder = activo
    ? Theme.status.success.border
    : Theme.status.neutral.border;

  const badgeText = activo
    ? Theme.status.success.text
    : Theme.status.neutral.text;

  return (
    <View style={[styles.card, !activo && styles.cardInactivo]}>
      {/* Franja lateral de estado */}
      <View style={[styles.franja, { backgroundColor: franjaColor }]} />

      <View style={styles.body}>
        {/* Contenido principal: Dorsal + Nombre + Badge */}
        <View style={styles.contentRow}>
          {/* Dorsal numérico */}
          <View style={styles.dorsalBox}>
            <Text style={styles.dorsalText}>#{jugador.numeroCamiseta}</Text>
          </View>

          {/* Información */}
          <View style={styles.infoCol}>
            <View style={styles.nombreRow}>
              <Text style={styles.nombre} numberOfLines={1}>
                {jugador.apellido}, {jugador.nombre}
              </Text>
              <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                <View style={[styles.badgeDot, { backgroundColor: badgeText }]} />
                <Text style={[styles.badgeText, { color: badgeText }]}>
                  {activo ? 'ACTIVO' : 'INACTIVO'}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.dniText}>🪪 DNI {jugador.dni}</Text>
              {jugador.nombreEquipo ? (
                <Text style={styles.equipoText}>🛡️ {jugador.nombreEquipo}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => onEditar(jugador)}
            activeOpacity={0.7}
          >
            <Text style={styles.btnSecondaryText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btn,
              activo ? styles.btnDanger : styles.btnSuccess,
            ]}
            onPress={() => onToggleEstado(jugador)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.btnTextBold,
                activo ? styles.btnDangerText : styles.btnSuccessText,
              ]}
            >
              {activo ? 'Baja' : 'Reactivar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Theme.bg.card,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    marginBottom: Theme.spacing.sm,
    overflow: 'hidden',
  },
  cardInactivo: {
    opacity: 0.65,
  },
  franja: {
    width: 3,
  },
  body: {
    flex: 1,
    padding: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  dorsalBox: {
    width: 44,
    height: 44,
    borderRadius: Theme.radius.sm,
    backgroundColor: Theme.accent.dim,
    borderWidth: 1,
    borderColor: Theme.border.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dorsalText: {
    color: Theme.accent.DEFAULT,
    fontSize: Theme.font.size.md,
    fontWeight: Theme.font.weight.black,
    fontVariant: ['tabular-nums'],
  },
  infoCol: {
    flex: 1,
    gap: 3,
  },
  nombreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nombre: {
    fontSize: Theme.font.size.md,
    fontWeight: Theme.font.weight.bold,
    color: Theme.text.primary,
    flex: 1,
    marginRight: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    gap: 4,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  badgeText: {
    fontSize: Theme.font.size.xs,
    fontWeight: Theme.font.weight.bold,
    letterSpacing: Theme.font.letterSpacing.wide,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  dniText: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  equipoText: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.accent,
    fontWeight: Theme.font.weight.semibold,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginTop: 2,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  btnSecondary: {
    backgroundColor: Theme.bg.input,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
  },
  btnSecondaryText: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
    fontWeight: Theme.font.weight.semibold,
  },
  btnDanger: {
    backgroundColor: Theme.status.danger.bg,
    borderWidth: 1,
    borderColor: Theme.status.danger.border,
  },
  btnDangerText: {
    color: Theme.status.danger.text,
  },
  btnSuccess: {
    backgroundColor: Theme.status.success.bg,
    borderWidth: 1,
    borderColor: Theme.status.success.border,
  },
  btnSuccessText: {
    color: Theme.status.success.text,
  },
  btnTextBold: {
    fontSize: Theme.font.size.xs,
    fontWeight: Theme.font.weight.bold,
  },
});
