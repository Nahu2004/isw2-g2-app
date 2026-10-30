import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Card, Button } from '@/components/common';
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
  return (
    <Card style={[styles.card, !equipo.activo && styles.cardInactivo]}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🛡️</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.nombre} numberOfLines={1}>
            {equipo.nombre}
          </Text>
          <Text style={styles.barrio}>📍 {equipo.barrio || 'Sede Club'}</Text>
        </View>
        <View style={[styles.badge, equipo.activo ? styles.badgeActivo : styles.badgeInactivo]}>
          <View style={[styles.badgeDot, { backgroundColor: equipo.activo ? '#10b981' : '#94a3b8' }]} />
          <Text style={[styles.badgeText, { color: equipo.activo ? '#047857' : '#64748b' }]}>
            {equipo.activo ? 'ACTIVO' : 'INACTIVO'}
          </Text>
        </View>
      </View>

      {equipo.nombreTorneo ? (
        <View style={styles.torneoBadge}>
          <Text style={styles.torneoText}>🏆 {equipo.nombreTorneo}</Text>
        </View>
      ) : null}

      <View style={styles.buttonRow}>
        {onVerJugadores && (
          <Button
            title="Plantel 🏃"
            variant="outline"
            style={styles.smallBtn}
            onPress={() => onVerJugadores(equipo)}
          />
        )}
        <Button
          title="Editar"
          variant="secondary"
          style={styles.smallBtn}
          onPress={() => onEditar(equipo)}
        />
        <Button
          title={equipo.activo ? 'Baja' : 'Reactivar'}
          variant={equipo.activo ? 'danger' : 'success'}
          style={styles.smallBtn}
          onPress={() => onToggleEstado(equipo)}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
  },
  cardInactivo: {
    opacity: 0.65,
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 10, // Concentric
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  avatarText: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  barrio: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeActivo: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  badgeInactivo: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  torneoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  torneoText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  smallBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    minHeight: 34,
    borderRadius: 8,
  },
});

export default EquipoCard;
