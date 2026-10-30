import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { EstadoPartido } from '@/api/types';

interface EstadoBadgeProps {
  estado: EstadoPartido | string;
  style?: ViewStyle;
}

export const EstadoBadge: React.FC<EstadoBadgeProps> = ({ estado, style }) => {
  const getBadgeConfig = () => {
    switch (estado) {
      case 'EN_JUEGO':
        return {
          label: 'EN JUEGO',
          bgColor: '#dcfce7',
          textColor: '#15803d',
          borderColor: '#86efac',
          icon: '🟢',
        };
      case 'PROGRAMADO':
        return {
          label: 'PROGRAMADO',
          bgColor: '#e0f2fe',
          textColor: '#0369a1',
          borderColor: '#7dd3fc',
          icon: '📅',
        };
      case 'FINALIZADO':
        return {
          label: 'FINALIZADO',
          bgColor: '#f1f5f9',
          textColor: '#475569',
          borderColor: '#cbd5e1',
          icon: '🏁',
        };
      case 'SUSPENDIDO':
        return {
          label: 'SUSPENDIDO',
          bgColor: '#fee2e2',
          textColor: '#b91c1c',
          borderColor: '#fca5a5',
          icon: '⚠️',
        };
      default:
        return {
          label: estado || 'DESCONOCIDO',
          bgColor: '#f1f5f9',
          textColor: '#64748b',
          borderColor: '#e2e8f0',
          icon: 'ℹ️',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
        style,
      ]}
    >
      <Text style={styles.badgeIcon}>{config.icon}</Text>
      <Text style={[styles.badgeText, { color: config.textColor }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    fontSize: 10,
    marginRight: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default EstadoBadge;
