import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Círculos de luz ambiental sutil en el fondo (Glow effect) */}
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07152b', // Deep Sapphire Blue base
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backgroundImage: 'radial-gradient(at 10% 10%, #0369a1 0px, transparent 50%), radial-gradient(at 90% 90%, #0284c7 0px, transparent 55%), linear-gradient(160deg, #07152b 0%, #0b1e36 40%, #0c2a4d 100%)',
        backgroundAttachment: 'fixed',
      } as any,
    }),
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#0284c7',
    opacity: 0.18,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: '#38bdf8',
    opacity: 0.12,
  },
});

export default GradientBackground;
