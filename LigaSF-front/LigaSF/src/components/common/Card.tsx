import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 16px -2px rgba(2, 132, 199, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
      } as any,
      default: {
        shadowColor: '#0c4a6e',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
});

export default Card;
