// Card de equipo — diseño premium oscuro alineado al Theme de LigaSF
// Paleta Dark Premium: Slate/Zinc oscuro, acentos en celeste #7DD3FC y franja de estado

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme, sectionLabelStyle } from '@/constants/theme';
import { Equipo } from '@/api/types';

interface EquipoCardProps {
  equipo: Equipo;
  onEditar: (equipo: Equipo) => void;
  onToggleEstado: (equipo: Equipo) => void;
  onVerJugadores?: (equipo: Equipo) => void;
}

export const EquipoCard: React.FC<EquipoCardProps> = ({
  equipo,
  onEditar,
  onToggleEstado,
  onVerJugadores,
}) => {
  const activo = equipo.activo;

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
        {/* Encabezado: Avatar + Título + Badge de estado */}
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>🛡️</Text>
          </View>
          <View style={styles.titleCol}>
            <Text style={styles.nombre} numberOfLines={1}>
              {equipo.nombre}
            </Text>
            <Text style={styles.barrio}>
              📍 {equipo.barrio || 'Sede Central'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
            <View style={[styles.badgeDot, { backgroundColor: badgeText }]} />
            <Text style={[styles.badgeText, { color: badgeText }]}>
              {activo ? 'ACTIVO' : 'INACTIVO'}
            </Text>
          </View>
        </View>

        {/* Torneo asignado */}
        {equipo.nombreTorneo ? (
          <View style={styles.torneoRow}>
            <Text style={styles.torneoLabel}>TORNEO</Text>
            <Text style={styles.torneoValue}>🏆 {equipo.nombreTorneo}</Text>
          </View>
        ) : null}

        {/* Fila de Acciones */}
        <View style={styles.actionsRow}>
          {onVerJugadores && (
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline]}
              onPress={() => onVerJugadores(equipo)}
              activeOpacity={0.7}
            >
              <Text style={styles.btnOutlineText}>Plantel 🏃</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => onEditar(equipo)}
            activeOpacity={0.7}
          >
            <Text style={styles.btnSecondaryText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btn,
              activo ? styles.btnDanger : styles.btnSuccess,
            ]}
            onPress={() => onToggleEstado(equipo)}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Theme.radius.sm,
    backgroundColor: Theme.bg.input,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 18,
  },
  titleCol: {
    flex: 1,
  },
  nombre: {
    fontSize: Theme.font.size.md,
    fontWeight: Theme.font.weight.bold,
    color: Theme.text.primary,
  },
  barrio: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.secondary,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    gap: 5,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: Theme.font.size.xs,
    fontWeight: Theme.font.weight.bold,
    letterSpacing: Theme.font.letterSpacing.wide,
  },
  torneoRow: {
    backgroundColor: Theme.bg.input,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: Theme.border.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  torneoLabel: {
    ...sectionLabelStyle,
    color: Theme.text.secondary,
  },
  torneoValue: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.accent,
    fontWeight: Theme.font.weight.semibold,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginTop: Theme.spacing.xs,
  },
  btn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Theme.border.subtle,
  },
  btnOutlineText: {
    fontSize: Theme.font.size.xs,
    color: Theme.text.primary,
    fontWeight: Theme.font.weight.semibold,
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
