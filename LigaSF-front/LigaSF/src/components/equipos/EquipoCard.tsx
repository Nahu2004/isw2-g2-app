import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
        <View style={styles.titleContainer}>
          <Text style={styles.nombre}>{equipo.nombre}</Text>
          <Text style={styles.barrio}>📍 {equipo.barrio}</Text>
        </View>
        <View style={[styles.badge, equipo.activo ? styles.badgeActivo : styles.badgeInactivo]}>
          <Text style={styles.badgeText}>{equipo.activo ? 'ACTIVO' : 'INACTIVO'}</Text>
        </View>
      </View>

      {equipo.nombreTorneo ? (
        <Text style={styles.torneoText}>🏆 {equipo.nombreTorneo}</Text>
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
          title={equipo.activo ? 'Desactivar' : 'Reactivar'}
          variant={equipo.activo ? 'danger' : 'primary'}
          style={styles.smallBtn}
          onPress={() => onToggleEstado(equipo)}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
  },
  cardInactivo: {
    opacity: 0.7,
    borderLeftColor: '#94a3b8',
    backgroundColor: '#f8fafc',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  nombre: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  barrio: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeActivo: {
    backgroundColor: '#dcfce7',
  },
  badgeInactivo: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  torneoText: {
    fontSize: 13,
    color: '#0284c7',
    fontWeight: '500',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  smallBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
});
