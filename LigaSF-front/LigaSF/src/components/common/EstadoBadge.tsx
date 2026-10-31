import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
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
          bgColor: '#ecfdf5',
          textColor: '#047857',
          borderColor: '#a7f3d0',
          dotColor: '#10b981',
          hasPulse: true,
        };
      case 'PROGRAMADO':
        return {
          label: 'PROGRAMADO',
          bgColor: '#f0f9ff',
          textColor: '#0369a1',
          borderColor: '#bae6fd',
          dotColor: '#0ea5e9',
          hasPulse: false,
        };
      case 'FINALIZADO':
        return {
          label: 'FINALIZADO',
          bgColor: '#f8fafc',
          textColor: '#475569',
          borderColor: '#e2e8f0',
          dotColor: '#94a3b8',
          hasPulse: false,
        };
      case 'SUSPENDIDO':
        return {
          label: 'SUSPENDIDO',
          bgColor: '#fef2f2',
          textColor: '#b91c1c',
          borderColor: '#fecaca',
          dotColor: '#ef4444',
          hasPulse: false,
        };
      default:
        return {
          label: estado || 'DESCONOCIDO',
          bgColor: '#f8fafc',
          textColor: '#64748b',
          borderColor: '#e2e8f0',
          dotColor: '#94a3b8',
          hasPulse: false,
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
      <View style={[styles.dot, { backgroundColor: config.dotColor }]} />
      <Text style={[styles.badgeText, { color: config.textColor }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999, // Pill concéntrico
    borderWidth: 1,
    alignSelf: 'flex-start',
    ...Platform.select({
      web: {
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      } as any,
    }),
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});

export default EstadoBadge;
